import multer from "multer"

const supportedAudioTypes = new Set([
  "audio/flac",
  "audio/mp4",
  "audio/mpeg",
  "audio/ogg",
  "audio/wav",
  "audio/webm",
  "video/webm",
])

export const audioUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: (_req, file, callback) => {
    const mimeType = file.mimetype.split(";")[0]
    if (supportedAudioTypes.has(mimeType)) {
      callback(null, true)
      return
    }

    callback(new Error("Unsupported audio format"), false)
  },
})
