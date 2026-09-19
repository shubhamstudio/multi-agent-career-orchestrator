import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import llm from "../configs/llm.js";
import curriculumPrompt from "../configs/curriculum.prompt.js";
import { validateCurriculum } from "../services/roadmap-builder.service.js";

const RESOURCE_TYPES = new Set(["official-docs", "article", "course", "project"]);
const DIFFICULTIES = new Set(["Easy", "Medium", "Hard"]);
const TOPIC_TYPES = new Set(["required", "optional"]);

const text = (value, fallback = "") => typeof value === "string" ? value.trim() || fallback : fallback;

const slugify = (value) => text(value)
  .normalize("NFKD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-+|-+$/g, "")
  .slice(0, 64);

const parseJson = (content) => {
  const raw = Array.isArray(content)
    ? content.map((part) => typeof part === "string" ? part : part?.text || "").join("")
    : String(content || "");
  return JSON.parse(raw.replace(/```json/gi, "").replace(/```/g, "").trim());
};

const normalizeResources = (resources) => (Array.isArray(resources) ? resources : [])
  .slice(0, 3)
  .map((resource) => {
    const url = text(resource?.url);
    const type = text(resource?.type).toLowerCase();
    if (!RESOURCE_TYPES.has(type) || !/^https:\/\//i.test(url)) return null;
    return { type, title: text(resource?.title, "Learning resource").slice(0, 120), url };
  })
  .filter(Boolean);

export const normalizeGeneratedCurriculum = (raw, role) => {
  const roleTitle = text(role);
  if (roleTitle.length < 2 || roleTitle.length > 80) {
    throw new Error("Enter a technical role between 2 and 80 characters.");
  }

  const rawNodes = Array.isArray(raw?.nodes) ? raw.nodes : [];
  if (rawNodes.length < 9 || rawNodes.length > 12) {
    throw new Error("The generated curriculum did not contain the required number of topics.");
  }

  const nodes = rawNodes.map((node, index) => {
    const title = text(node?.title, `Topic ${index + 1}`).slice(0, 120);
    const id = slugify(node?.id || title);
    const difficulty = text(node?.difficulty, "Medium");
    const type = text(node?.type, "required").toLowerCase();
    if (!id || !DIFFICULTIES.has(difficulty) || !TOPIC_TYPES.has(type)) {
      throw new Error("The generated curriculum contains an invalid topic.");
    }

    return {
      id,
      title,
      section: text(node?.section, "Learning Path").slice(0, 80),
      difficulty,
      duration: text(node?.duration, "1 week").slice(0, 40),
      description: text(node?.description, `Learn ${title}.`).slice(0, 360),
      prerequisites: [...new Set((Array.isArray(node?.prerequisites) ? node.prerequisites : [])
        .map(slugify)
        .filter(Boolean))],
      resources: normalizeResources(node?.resources),
      type,
    };
  });

  const curriculum = {
    slug: `custom-${slugify(roleTitle)}`,
    title: `${roleTitle} Roadmap`,
    version: 1,
    defaultWeeks: Math.max(4, Math.min(52, Number.parseInt(raw?.defaultWeeks, 10) || 16)),
    nodes,
  };

  return validateCurriculum(curriculum);
};

const generateCurriculumForRole = async ({ role, targetPackage }) => {
  let lastError;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const response = await llm.invoke([
        new SystemMessage(curriculumPrompt),
        new HumanMessage(JSON.stringify({
          requestedRole: role,
          targetPackage,
          instruction: "Generate the technical learning curriculum now.",
        })),
      ]);
      return normalizeGeneratedCurriculum(parseJson(response.content), role);
    } catch (error) {
      lastError = error;
      console.error(`Custom curriculum generation attempt ${attempt + 1} failed.`, error.message);
    }
  }

  throw new Error("We could not create a valid roadmap for that role. Please try again.");
};

export default generateCurriculumForRole;
