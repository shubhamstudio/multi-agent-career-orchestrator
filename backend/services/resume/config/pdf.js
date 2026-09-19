import {PDFParse} from "pdf-parse"
const extractText = async (pdfData) => {
    const buffer = Buffer.isBuffer(pdfData) ? pdfData : Buffer.from(pdfData)

    const pdf = new PDFParse({
        data:buffer
    })

    const result = await pdf.getText()


    return result.text
}

export default extractText



