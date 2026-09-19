import fs from "fs"
import crypto from "crypto"
import os from "os"
import path from "path"
import multer from "multer"
// Function filesystems are ephemeral. Uploads are only needed while pdf-parse
// runs, so use the writable temporary directory and delete them after.
const uploadPath = path.join(os.tmpdir(), "glangen-resume-uploads")

if(!fs.existsSync(uploadPath)){
fs.mkdirSync(uploadPath)
}

const storage = multer.diskStorage({
    destination:(req,file,cb)=>{
      cb(null , uploadPath)
    },
    filename:(req,file,cb)=>{
        cb(null, `${crypto.randomUUID()}${path.extname(file.originalname).toLowerCase()}`)
    }
})


const fileFilter = (req,file,cb)=>{
    if(file.mimetype === "application/pdf"){
        cb(null , true)
    }else{
        cb(new Error("Only PDF files are allowed") , false)
    }
}

export const upload = multer({
    storage,
    fileFilter,
    limits:{
        fileSize: 20 *1024 * 1024 
    }
})
