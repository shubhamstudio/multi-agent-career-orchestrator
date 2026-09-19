import { FiDownload } from 'react-icons/fi'
import { useReactToPrint } from "react-to-print";
import { spendCoins } from '../../apis/user.api';
import { useCreditConfirmation } from '../../contexts/CreditConfirmationContext';
function DownloadBtn({ docRef, setUser }) {
    const { confirmCreditSpend } = useCreditConfirmation()

    const handlePdf = useReactToPrint({
        contentRef: docRef,
        documentTitle: "GLANGEN-resume"
    })

    const handleDownload = async () => {
        try {
            const approved = await confirmCreditSpend({ coins: 10, action: 'download-pdf' })
            if (!approved) return

            const coinResponse = await spendCoins({ coins: 10, action: "download-pdf" })

            await handlePdf()
            setUser((prev) => ({
                ...prev, interviewCoin: coinResponse?.interviewCoin,
            }))



        } catch (error) {
            if (error.response?.status === 403) {
                return alert("Not enough GLAN Credits.");
            }
            alert(
                error.response?.data?.message ||
                "Something went wrong."
            );



        }


    }
    return (
        <button onClick={handleDownload} className='flex items-center gap-2 rounded-lg bg-black px-3 py-2 text-xs text-white'>
            <FiDownload />
            Download PDF

        </button>
    )
}

export default DownloadBtn
