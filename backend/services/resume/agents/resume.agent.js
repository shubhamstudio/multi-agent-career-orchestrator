import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import llm from "../config/llm.js";

export const resumeAgent = async (resumeText) => {
  const response = await llm.invoke([
    new SystemMessage(`
You are an Expert ATS Resume Analyzer.

Analyze the given resume and return only valid JSON. Do not use Markdown or add explanatory text.

Every field must exist:
{
  "name":"",
  "email":"",
  "phone":"",
  "summary":"",
  "skills":[],
  "projects":[{"name":"","techStack":"","github":"","description":""}],
  "education":[{"college":"","degree":"","branch":"","cgpa":"","year":""}],
  "experience":[{"company":"","role":"","duration":"","description":""}],
  "strengths":[],
  "weaknesses":[],
  "missingSkills":[],
  "suggestedRole":"",
  "score":0,
  "recommendations":[]
}`),
    new HumanMessage(resumeText),
  ]);

  return response.content;
};

export const generateResumeDraft = async (details) => {
  const response = await llm.invoke([
    new SystemMessage(`
You are an expert technical resume writer. Create a concise, ATS-friendly resume draft tailored to the requested job description.

Hard rules:
- Use only facts provided by the candidate. Never invent employers, degrees, certifications, metrics, technologies, dates, links, or achievements.
- If a fact is not supplied, omit it or return an empty value. Do not use placeholders such as "TBD".
- Write a role-specific professional summary and strong, truthful bullet points from the supplied facts.
- Keep bullets concise, action-led, and optimized for the provided job description without keyword stuffing.
- Return only valid JSON. Do not use Markdown or code fences.

Return exactly this JSON shape:
{
  "name":"",
  "email":"",
  "phone":"",
  "location":"",
  "linkedin":"",
  "github":"",
  "summary":"",
  "skills":[""],
  "experience":[{"company":"","role":"","duration":"","description":"bullet one\\nbullet two"}],
  "projects":[{"name":"","techStack":"","github":"","description":"bullet one\\nbullet two"}],
  "education":[{"college":"","degree":"","branch":"","cgpa":"","year":""}]
}

Extract every field only from the candidate's supplied background. Leave it empty when it was not supplied.`),
    new HumanMessage(JSON.stringify(details)),
  ]);

  return response.content;
};
