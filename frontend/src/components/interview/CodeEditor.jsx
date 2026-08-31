import { useState } from 'react'
import { AnimatePresence, motion } from "motion/react"
import { FiTerminal, FiX } from 'react-icons/fi'
import Editor from '@monaco-editor/react'
const LANG_OPTIONS = ["javascript", "python", "java", "cpp"];

const DEFAULT_CODE = {
  javascript: `// Write your solution here
function solution() {
  // your code
}`,
  python: `# Write your solution here
def solution():
    pass`,
  java: `// Write your solution here
public class Solution {
    public static void main(String[] args) {
        // your code
    }
}`,
  cpp: `// Write your solution here
#include <iostream>
using namespace std;

int main() {
    // your code
    return 0;
}`,
};
function CodeEditor({ onClose, onSubmitCode }) {
   const [lang ,setLang] = useState("javascript")
   const [code, setCode] = useState(DEFAULT_CODE["javascript"]);
  return (
    
      <>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className='fixed inset-0 z-50 bg-black/50 backdrop-blur-sm' />

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 20 }}
          transition={{ duration: 0.25 }}
          className='fixed inset-x-3 top-4 bottom-4 sm:inset-x-6 sm:top-6 sm:bottom-6 md:inset-x-10 md:top-8 md:bottom-8 z-50 flex flex-col overflow-hidden rounded-2xl bg-[#0E1016] border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.5)]'>

            <div className='absolute inset-0 bg-gradient-to-br from-white/[0.04] via-transparent to-transparent pointer-events-none'/>

            <div className='relative flex items-center justify-between px-4 sm:px-5 py-3 border-b border-white/8'>
            <div className='flex items-center gap-3'>
              <FiTerminal className='text-white/50' size={15} />
              <span className='text-sm font-semibold text-white'>Code Editor</span>

            
            </div>

            <div className='flex items-center gap-1.5 mx-auto'>
              {LANG_OPTIONS.map((l)=>(
                <button key={l} onClick={()=>{
                  setLang(l);
                  setCode(DEFAULT_CODE[l])}}
                 className={`text-xs px-2.5 py-1 rounded-lg capitalize transition-all ${
                      lang === l
                        ? "bg-white text-[#0A0A0A] font-semibold"
                        : "text-white/40 hover:text-white/70 hover:bg-white/8"
                    }`}>
                      {l}

                </button>
              ))}

            </div>

            <button onClick={onClose} className='text-white/35 hover:text-white transition-colors'>
            <FiX size={18}/>
            </button>
            </div>

            <div className='relative flex-1 min-h-0'>
              <Editor
               height="100%"
                language={lang}
                value={code}
                onChange={(v) => setCode(v || "")}
                theme="vs-dark"
                options={{
                  fontSize: 13,
                  minimap: { enabled: false },
                  lineNumbers: "on",
                  scrollBeyondLastLine: false,
                  wordWrap: "on",
                  padding: { top: 12 },
                  fontFamily: "'Fira Code', 'Cascadia Code', monospace",
                  fontLigatures: true,
                  renderLineHighlight: "line",
                  cursorBlinking: "smooth" }}/>

            </div>

            <div className='relative border-t border-white/8 px-4 py-3 flex justify-end'>
            <button onClick={()=>onSubmitCode?.(code)} className='flex items-center gap-1.5 text-xs px-4 py-2 rounded-lg bg-white text-[#0A0A0A] font-semibold hover:bg-white/90 transition-all'>Add To Answer</button>
            </div>

        </motion.div>




</AnimatePresence>
      </>


  )
}

export default CodeEditor
