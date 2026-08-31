import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import llm from "../configs/llm.js";
import personalizationPrompt from "../configs/roadmap.prompt.js";

const parseJson = (content = "") => JSON.parse(content.replace(/```json/gi, "").replace(/```/g, "").trim());

const personalizeRoadmap = async ({ curriculum, role, targetPackage, useResume, resume }) => {
  if (!useResume || !resume) return { estimatedWeeks: curriculum.defaultWeeks };

  try {
    const response = await llm.invoke([
      new SystemMessage(personalizationPrompt),
      new HumanMessage(JSON.stringify({
        requestedRole: role,
        targetPackage,
        resume: {
          skills: resume.skills || [],
          missingSkills: resume.missingSkills || [],
          projects: resume.projects || [],
          experience: resume.experience || [],
          score: resume.score,
          suggestedRole: resume.suggestedRole,
          recommendations: resume.recommendations || [],
        },
        availableTopics: curriculum.nodes.map(({ id, title, section, type, prerequisites }) => ({ id, title, section, type, prerequisites })),
      })),
    ]);
    return parseJson(response.content);
  } catch (error) {
    console.error("Roadmap personalization failed; using the complete curriculum.", error.message);
    return { estimatedWeeks: curriculum.defaultWeeks };
  }
};

export default personalizeRoadmap;
