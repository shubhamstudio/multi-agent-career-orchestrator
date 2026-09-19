import { createContext, useContext, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { FiAlertCircle, FiCheck, FiX, FiZap } from 'react-icons/fi';

const CreditConfirmationContext = createContext(null);

const serviceNames = {
  'resume-scorer': 'Resume Score',
  'roadmap-builder': 'Roadmap Generation',
  'start-interview': 'AI Interview',
  'download-pdf': 'Resume PDF Download',
};

export function CreditConfirmationProvider({ children }) {
  const [request, setRequest] = useState(null);
  const resolveRequest = useRef(null);

  const confirmCreditSpend = ({ coins, action, serviceName }) => new Promise((resolve) => {
    resolveRequest.current = resolve;
    setRequest({ coins, serviceName: serviceName || serviceNames[action] || 'This service' });
  });

  const close = (approved) => {
    resolveRequest.current?.(approved);
    resolveRequest.current = null;
    setRequest(null);
  };

  return (
    <CreditConfirmationContext.Provider value={{ confirmCreditSpend }}>
      {children}
      <AnimatePresence>
        {request && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className='fixed inset-0 z-[100] grid place-items-center bg-black/40 p-4 backdrop-blur-sm' role='dialog' aria-modal='true' aria-labelledby='credit-confirmation-title'>
            <motion.div initial={{ opacity: 0, y: 14, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.97 }} className='w-full max-w-sm rounded-2xl border border-[#e6e1db] bg-white p-5 shadow-[0_24px_70px_rgba(23,21,20,.25)]'>
              <div className='flex items-start justify-between gap-4'>
                <div className='grid h-10 w-10 place-items-center rounded-xl bg-[#f6ffd9] text-[#718b00]'><FiZap size={19} /></div>
                <button onClick={() => close(false)} aria-label='Cancel' className='rounded-lg p-1 text-black/40 transition hover:bg-black/5 hover:text-black'><FiX size={18} /></button>
              </div>
              <h2 id='credit-confirmation-title' className='mt-4 text-lg font-bold text-[#171514]'>Use GLAN Credits?</h2>
              <p className='mt-2 text-sm leading-6 text-black/55'><strong className='font-semibold text-[#171514]'>{request.serviceName}</strong> will deduct <strong className='font-semibold text-[#718b00]'>{request.coins} GLAN Credits</strong> from your balance.</p>
              <div className='mt-4 flex items-start gap-2 rounded-xl border border-[#eee7e1] bg-[#fbffed] px-3 py-2.5 text-xs leading-5 text-[#625f5c]'><FiAlertCircle className='mt-0.5 shrink-0 text-[#819e00]' size={14} /> Your credits are deducted only after you confirm.</div>
              <div className='mt-5 flex gap-2.5'>
                <button onClick={() => close(false)} className='flex-1 rounded-xl border border-[#ded7d1] px-3 py-2.5 text-sm font-semibold text-[#625f5c] transition hover:border-[#bdb5ae]'>Cancel</button>
                <button onClick={() => close(true)} className='flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#171514] px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-black'><FiCheck size={15} /> Confirm</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </CreditConfirmationContext.Provider>
  );
}

export function useCreditConfirmation() {
  const context = useContext(CreditConfirmationContext);
  if (!context) throw new Error('useCreditConfirmation must be used within CreditConfirmationProvider.');
  return context;
}
