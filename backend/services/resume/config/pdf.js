import { DOMMatrix, ImageData, Path2D } from "@napi-rs/canvas"

// pdfjs-dist expects browser geometry globals even when it is only extracting
// text. Define Node-compatible implementations before loading pdf-parse.
globalThis.DOMMatrix ??= DOMMatrix
globalThis.ImageData ??= ImageData
globalThis.Path2D ??= Path2D

const extractText = async (pdfData) => {
    const buffer = Buffer.isBuffer(pdfData) ? pdfData : Buffer.from(pdfData)

    // Static ESM imports are evaluated before the globals above, so defer this
    // import until Vercel's Node runtime has the required canvas primitives.
    const { PDFParse } = await import("pdf-parse")

    const pdf = new PDFParse({
        data:buffer
    })

    const result = await pdf.getText()


    return result.text
}

export default extractText



