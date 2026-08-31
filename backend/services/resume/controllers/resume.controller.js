// pdf  ---->  pdf Storage  ---> text ---> llm ---> agent ---> promt ---> data ---> save mongoDb ---> redis -->pdf delete ---> resume data ( score , missing skills , recommen.)

import redis from "../../../shared/redis/redis.js";
import { resumeAgent } from "../agents/resume.agent.js";
import extractText from "../config/pdf.js";
import Resume from "../models/resume.model.js";
import fs from "fs"

const asText = (value) => Array.isArray(value) ? value.join("\n") : String(value || "");

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


export const uploadResume = async (req,res) => {
    let file;
    let stage = "receiving the PDF";
    try {
        file = req.file;
        if(!file){
            return res.status(400).json({
                success:false,
                message:"Resume PDF is required"
            })
        }
        const userId = req.headers["x-user-id"];

          if(!userId){
            return res.status(400).json({
                success:false,
                message:"UserId is required"
            })
        }

        stage = "extracting text from the PDF";
        const resumeText = await extractText(file.path)

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

        stage = "saving the resume";
        let resume = await Resume.findOne({userId})

        if(resume){
            resume.scoreHistory.push({ score: Number(resumeData.score) || 0, analyzedAt: new Date() })
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
                scoreHistory: [{ score: Number(resumeData.score) || 0, analyzedAt: new Date() }]
            })
        }

        stage = "caching the resume";
        await redis.set(`resume:${userId}`,JSON.stringify(resume));

        fs.unlinkSync(file.path);

        return res.status(200).json({
            success:true,
            message:"Resume analyzed successfully",
            data:resume
        })

        
    } catch (error) {
        console.log(error)

        if (file?.path && fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
        }
        return res.status(500).json({
            success:false,
            message:`Resume processing failed while ${stage}: ${error.message}`,
        })
        
    }
}


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
