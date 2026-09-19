// pdf  ---->  pdf Storage  ---> text ---> llm ---> agent ---> promt ---> data ---> save mongoDb ---> redis -->pdf delete ---> resume data ( score , missing skills , recommen.)

import redis from "../config/redis.js";
import { generateResumeDraft, resumeAgent } from "../agents/resume.agent.js";
import extractText from "../config/pdf.js";
import Resume from "../models/resume.model.js";
import { get } from "@vercel/blob"

const asText = (value) => Array.isArray(value) ? value.join("\n") : String(value || "");

const parseAiJson = (content) => {
    const raw = Array.isArray(content)
        ? content.map((part) => typeof part === "string" ? part : part?.text || "").join("")
        : String(content || "");
    return JSON.parse(raw.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/, "").trim());
};

const trimText = (value, maxLength = 4000) => String(value || "").trim().slice(0, maxLength);

const normalizeBuilderData = (generated, input) => ({
    name: trimText(generated.name, 120),
    email: trimText(generated.email, 180),
    phone: trimText(generated.phone, 60),
    location: trimText(generated.location, 120),
    linkedin: trimText(generated.linkedin, 240),
    github: trimText(generated.github, 240),
    summary: trimText(generated.summary, 900),
    skills: Array.isArray(generated.skills)
        ? generated.skills.map((skill) => trimText(skill, 80)).filter(Boolean).join(", ")
        : trimText(generated.skills, 1000),
    experience: (Array.isArray(generated.experience) ? generated.experience : []).slice(0, 6).map((item) => ({
        company: trimText(item.company, 160),
        role: trimText(item.role, 160),
        duration: trimText(item.duration, 100),
        description: trimText(item.description, 1800),
    })).filter((item) => item.company || item.role || item.description),
    projects: (Array.isArray(generated.projects) ? generated.projects : []).slice(0, 6).map((item) => ({
        name: trimText(item.name, 180),
        techStack: trimText(item.techStack, 400),
        github: trimText(item.github, 240),
        description: trimText(item.description, 1800),
    })).filter((item) => item.name || item.description),
    education: (Array.isArray(generated.education) ? generated.education : []).slice(0, 4).map((item) => ({
        college: trimText(item.college, 180),
        degree: trimText(item.degree, 160),
        branch: trimText(item.branch, 160),
        cgpa: trimText(item.cgpa, 40),
        year: trimText(item.year, 100),
    })).filter((item) => item.college || item.degree),
});

const normalizeResumeData = (data) => ({
    ...data,
    education: (data.education || []).map((item) => ({
        college: asText(item.college || item.institution),
        degree: asText(item.degree),
        branch: asText(item.branch),
        cgpa: asText(item.cgpa),
        year: asText(item.year || item.duration),
    })),
    projects: (data.projects || []).map((item) => ({
        name: asText(item.name),
        techStack: asText(item.techStack || item.technologies),
        github: asText(item.github),
        description: asText(item.description),
    })),
    experience: (data.experience || []).map((item) => ({
        company: asText(item.company),
        role: asText(item.role),
        duration: asText(item.duration),
        description: asText(item.description || item.responsibilities),
    })),
});


export const processResume = async (req,res) => {
    let stage = "receiving the uploaded PDF reference";
    try {
        const { blobUrl, filename = "resume.pdf" } = req.body
        if (!blobUrl || typeof blobUrl !== "string") {
            return res.status(400).json({
                success:false,
                message:"A resume Blob URL is required"
            })
        }
        const userId = req.headers["x-user-id"];

          if(!userId){
            return res.status(400).json({
                success:false,
                message:"UserId is required"
            })
        }

        const blobResult = await get(blobUrl, { access: "private" })
        const expectedPathPrefix = `resumes/${userId}/`
        if (!blobResult || !blobResult.blob.pathname.startsWith(expectedPathPrefix)) {
            return res.status(400).json({
                success: false,
                message: "The resume file is not available for this user",
            })
        }

        if (blobResult.blob.contentType !== "application/pdf") {
            return res.status(400).json({
                success: false,
                message: "Only PDF files are allowed",
            })
        }

        stage = "extracting text from the PDF";
        const pdfBuffer = Buffer.from(await new Response(blobResult.stream).arrayBuffer())
        const resumeText = await extractText(pdfBuffer)

        if (!resumeText?.trim()) {
            throw new Error("No readable text was found in this PDF.");
        }

        stage = "analyzing the resume with AI";
        const aiResponse = await resumeAgent(resumeText)

        stage = "reading the AI analysis";
        const normalizedResponse = String(aiResponse)
            .replace(/^```json\s*/i, "")
            .replace(/^```\s*/i, "")
            .replace(/\s*```$/, "")
            .trim();
        const resumeData = normalizeResumeData(JSON.parse(normalizedResponse))
        const sourceFile = {
            url: blobResult.blob.url,
            pathname: blobResult.blob.pathname,
            filename: String(filename).slice(0, 255),
            contentType: blobResult.blob.contentType,
            uploadedAt: new Date(),
            processedAt: new Date(),
            extractedText: resumeText,
            analysis: resumeData,
        }

        stage = "saving the resume";
        let resume = await Resume.findOne({userId})

        if(resume){
            resume.scoreHistory.push({ score: Number(resumeData.score) || 0, analyzedAt: new Date() })
            resume.sourceFile = sourceFile
            resume.sourceFiles.push(sourceFile)
            Object.assign(resume,{
                ...resumeData,
                extractedText:resumeText

            }    
            )
            await resume.save()
        }else{
            resume = await Resume.create({
                userId,
                extractedText:resumeText,
                ...resumeData,
                sourceFile,
                sourceFiles: [sourceFile],
                scoreHistory: [{ score: Number(resumeData.score) || 0, analyzedAt: new Date() }]
            })
        }

        stage = "caching the resume";
        await redis.set(`resume:${userId}`,JSON.stringify(resume));

        return res.status(200).json({
            success:true,
            message:"Resume analyzed successfully",
            data:resume
        })

        
    } catch (error) {
        console.log(error)

        return res.status(500).json({
            success:false,
            message:`Resume processing failed while ${stage}: ${error.message}`,
        })
        
    }
}

export const generateResume = async (req, res) => {
    try {
        const userId = req.headers["x-user-id"];
        const requiredFields = ["aboutYou", "targetRole", "yearsExperience", "jobDescription"];
        const missingField = requiredFields.find((field) => !trimText(req.body?.[field]));
        if (!userId) return res.status(401).json({ success: false, message: "Sign in to generate a resume." });
        if (missingField) return res.status(400).json({ success: false, message: `${missingField} is required.` });

        const jobDescription = trimText(req.body.jobDescription, 8000);
        if (jobDescription.length < 20) {
            return res.status(400).json({ success: false, message: "Provide a more detailed job description (at least 20 characters)." });
        }

        const safeDetails = {
            targetRole: trimText(req.body.targetRole, 160),
            yearsExperience: trimText(req.body.yearsExperience, 80),
            jobDescription,
            aboutYou: trimText(req.body.aboutYou, 14000),
        };

        const generated = parseAiJson(await generateResumeDraft(safeDetails));
        const data = normalizeBuilderData(generated, safeDetails);
        return res.status(200).json({ success: true, message: "Resume draft generated.", data });
    } catch (error) {
        console.error("AI resume generation failed.", error.message);
        return res.status(502).json({ success: false, message: "Could not generate a resume draft. Please try again." });
    }
};


export const getResume = async (req,res) => {
    try {
        const userId = req.headers["x-user-id"];

    const cache = await redis.get(`resume:${userId}`)

    if(cache){
        return res.status(200).json({
            success:true,
            source:"redis",
            data:JSON.parse(cache)
        })
    }
    const resume = await Resume.findOne({userId})

    if(!resume){
        return res.status(404).json({
            success:false,
            message:"resume not found"
        })
    }

    await redis.set(`resume:${userId}`,JSON.stringify(resume));
   

     return res.status(200).json({
            success:true,
            source:"mongoDb",
            data:resume
        })
        
    } catch (error) {
        console.log(error)
         return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
    


}
