import { FiDownload, FiLoader } from 'react-icons/fi'
import { useState } from 'react'
import { useReactToPrint } from "react-to-print";
import { spendCoins } from '../../apis/user.api';
import { useCreditConfirmation } from '../../contexts/CreditConfirmationContext';
import { useFeedback } from '../../contexts/FeedbackContext';
function DownloadBtn({ docRef, setUser }) {
    const { confirmCreditSpend } = useCreditConfirmation()
    const { notify } = useFeedback()
    const [downloading, setDownloading] = useState(false)

    const handlePdf = useReactToPrint({
        contentRef: docRef,
        documentTitle: "GLANGEN-resume"
    })

    const handleDownload = async () => {
        if (downloading) return
        try {
            const approved = await confirmCreditSpend({ coins: 10, action: 'download-pdf' })
            if (!approved) return

            setDownloading(true)
            const coinResponse = await spendCoins({ coins: 10, action: "download-pdf" })

            await handlePdf()
            setUser((prev) => ({
                ...prev, interviewCoin: coinResponse?.interviewCoin,
            }))
            notify("Your résumé PDF is being prepared for download.", { type: 'success', title: 'Download started' })



        } catch (error) {
            if (error.response?.status === 403) {
                notify("You need more GLAN Credits to download this PDF.", { type: 'error', title: 'Not enough credits' })
                return
            }
            notify(error.response?.data?.message || "We could not prepare the PDF. Please try again.", { type: 'error', title: 'Download failed' })
        } finally {
            setDownloading(false)



        }


    }
    return (
        <button onClick={handleDownload} disabled={downloading} className='flex items-center gap-2 rounded-lg bg-black px-3 py-2 text-xs text-white disabled:cursor-not-allowed disabled:opacity-60'>
            {downloading ? <FiLoader className='animate-spin' /> : <FiDownload />}
            {downloading ? 'Preparing PDF…' : 'Download PDF'}

        </button>
    )
}

export default DownloadBtn
