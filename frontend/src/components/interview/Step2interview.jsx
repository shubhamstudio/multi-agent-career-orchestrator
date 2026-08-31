/* eslint-disable react-hooks/set-state-in-effect */
import { useCallback, useEffect, useRef, useState } from 'react'
import femaleVideo from "../../assets/female-ai.mp4"
import { AnimatePresence, motion } from "motion/react"
import { FiArrowRight, FiCamera, FiCameraOff, FiClock, FiCode, FiLogOut, FiMessageSquare, FiMic, FiMicOff } from 'react-icons/fi'
import CodeEditor from './CodeEditor'
import Timer from './Timer'
import { getInterviewVoiceConnection, submitAnswer, transcribeInterviewAudio } from '../../apis/interview.api'
import { useNavigate } from 'react-router-dom'
import { DeepgramFluxTtsPlayer } from '../../utils/deepgramFluxTts'
function Step2interview({ interviewData, user }) {
const navigate = useNavigate()
  // ── State ──
  const [question, setQuestion] = useState(interviewData.question);
  const [currentIndex, setCurrentIndex] = useState(interviewData.currentQuestion || 0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(interviewData.question.timer || 60);
  const [timerActive, setTimerActive] = useState(true); // paused once the answer is submitted

  // UI toggles
  const [micOn, setMicOn] = useState(true); // user's manual preference — only changed by the mic button
  const [cameraOn, setCameraOn] = useState(false);
  const [codeOpen, setCodeOpen] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // Speech
  const [isAIPlaying, setIsAIPlaying] = useState(false);
  const [subtitle, setSubtitle] = useState("");
  const [voiceReady, setVoiceReady] = useState(false);
  const [introSpoken, setIntroSpoken] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [micMessage, setMicMessage] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");

  // Refs
  const aiVideoRef = useRef(null);
  const userVideoRef = useRef(null);
  const streamRef = useRef(null);
  const answerRef = useRef("");
  const interimTranscriptRef = useRef("");
  const micOnRef = useRef(micOn);
  const aiPlayingRef = useRef(isAIPlaying);
  const pageVisibleRef = useRef(document.visibilityState === "visible");
  const speechSessionRef = useRef(0);
  const voicePlayerRef = useRef(null);
  const lastSpokenQuestionRef = useRef(null);
  const recordingStartingRef = useRef(false);
  const recorderRef = useRef(null);
  const microphoneStreamRef = useRef(null);
  const recordingChunkTimerRef = useRef(null);
  const microphoneAudioContextRef = useRef(null);
  const microphoneAnalyserTimerRef = useRef(null);
  const detectedSpeechRef = useRef(true);
  const audioChunksRef = useRef([]);
  const discardRecordingRef = useRef(false);
  const stopRecordingResolversRef = useRef([]);
  const startRecordedMicRef = useRef(null);
  const stopRecordedMicRef = useRef(null);
  const transcriptionQueueRef = useRef(Promise.resolve());
  const transcriptionSessionRef = useRef(0);
  const submissionInProgressRef = useRef(false);

  const videoSource = femaleVideo
  const progress = ((currentIndex + 1)/(interviewData.totalQuestions))*100
  const showMicon = micOn && !isAIPlaying
  const answerWithInterim = `${answer}${interimTranscript ? `${answer.trim() ? " " : ""}${interimTranscript}` : ""}`

  const appendToAnswer = useCallback((transcript) => {
    const cleanedTranscript = transcript.trim();
    if (!cleanedTranscript) return;

    const previousAnswer = answerRef.current;
    const nextAnswer = `${previousAnswer}${previousAnswer.trim() ? " " : ""}${cleanedTranscript}`;
    answerRef.current = nextAnswer;
    setAnswer(nextAnswer);
  }, []);

  const clearAnswer = useCallback(() => {
    transcriptionSessionRef.current += 1;
    answerRef.current = "";
    interimTranscriptRef.current = "";
    setAnswer("");
    setInterimTranscript("");
  }, []);

  const queueAudioTranscription = useCallback((audioBlob, sessionId) => {
    setIsTranscribing(true)

    const job = transcriptionQueueRef.current.then(async () => {
      const result = await transcribeInterviewAudio(audioBlob)
      if (sessionId === transcriptionSessionRef.current && result?.text) {
        appendToAnswer(result.text)
      }
    })

    const settledJob = job.catch(() => {
      if (sessionId === transcriptionSessionRef.current) {
        setMicMessage("Couldn't convert that audio. Keep speaking or tap the mic to retry.")
      }
    })

    transcriptionQueueRef.current = settledJob
    settledJob.finally(() => {
      if (transcriptionQueueRef.current === settledJob) setIsTranscribing(false)
    })

    return settledJob
  }, [appendToAnswer])

  const stopRecordedMic = useCallback(({ discard = false } = {}) => {
    if (recordingChunkTimerRef.current) {
      window.clearTimeout(recordingChunkTimerRef.current)
      recordingChunkTimerRef.current = null
    }

    discardRecordingRef.current = discard
    const recorder = recorderRef.current

    if (!recorder) {
      if (microphoneAnalyserTimerRef.current) {
        window.clearInterval(microphoneAnalyserTimerRef.current)
        microphoneAnalyserTimerRef.current = null
      }
      microphoneAudioContextRef.current?.close().catch(() => {})
      microphoneAudioContextRef.current = null
      microphoneStreamRef.current?.getTracks().forEach((track) => track.stop())
      microphoneStreamRef.current = null
      return transcriptionQueueRef.current
    }

    if (recorder.state === "inactive") return transcriptionQueueRef.current

    return new Promise((resolve) => {
      stopRecordingResolversRef.current.push(resolve)
      recorder.stop()
    })
  }, [])

  const startRecordedMic = useCallback(async () => {
    if (
      !micOnRef.current ||
      aiPlayingRef.current ||
      submissionInProgressRef.current ||
      !pageVisibleRef.current ||
      recordingStartingRef.current ||
      (recorderRef.current && recorderRef.current.state !== "inactive")
    ) return

    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      micOnRef.current = false
      setMicOn(false)
      setIsListening(false)
      setMicMessage("Audio recording requires HTTPS and a supported browser.")
      return
    }

    recordingStartingRef.current = true

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      })

      if (!micOnRef.current || aiPlayingRef.current || submissionInProgressRef.current) {
        stream.getTracks().forEach((track) => track.stop())
        return
      }

      const preferredType = [
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/ogg;codecs=opus",
      ].find((type) => MediaRecorder.isTypeSupported(type))
      const recorder = preferredType
        ? new MediaRecorder(stream, { mimeType: preferredType })
        : new MediaRecorder(stream)

      microphoneStreamRef.current = stream
      recorderRef.current = recorder
      audioChunksRef.current = []
      discardRecordingRef.current = false
      detectedSpeechRef.current = true

      const AudioContext = window.AudioContext || window.webkitAudioContext
      if (AudioContext) {
        try {
          const audioContext = new AudioContext()
          const source = audioContext.createMediaStreamSource(stream)
          const analyser = audioContext.createAnalyser()
          analyser.fftSize = 512
          source.connect(analyser)
          const levels = new Uint8Array(analyser.fftSize)
          microphoneAudioContextRef.current = audioContext
          detectedSpeechRef.current = false

          audioContext.resume().catch(() => {
            // If analysis is blocked, send the chunk rather than losing speech.
            detectedSpeechRef.current = true
          })

          microphoneAnalyserTimerRef.current = window.setInterval(() => {
            analyser.getByteTimeDomainData(levels)
            let energy = 0
            for (const level of levels) {
              const amplitude = (level - 128) / 128
              energy += amplitude * amplitude
            }
            const rms = Math.sqrt(energy / levels.length)
            if (rms > 0.018) detectedSpeechRef.current = true
          }, 120)
        } catch {
          detectedSpeechRef.current = true
        }
      }

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data)
      }

      recorder.onstart = () => {
        setIsListening(true)
        setMicMessage("")
      }

      recorder.onerror = () => {
        micOnRef.current = false
        setMicOn(false)
        setIsListening(false)
        setMicMessage("The microphone recording stopped. Tap the mic to retry.")
      }

      recorder.onstop = () => {
        if (recordingChunkTimerRef.current) {
          window.clearTimeout(recordingChunkTimerRef.current)
          recordingChunkTimerRef.current = null
        }
        if (microphoneAnalyserTimerRef.current) {
          window.clearInterval(microphoneAnalyserTimerRef.current)
          microphoneAnalyserTimerRef.current = null
        }
        microphoneAudioContextRef.current?.close().catch(() => {})
        microphoneAudioContextRef.current = null

        const chunks = audioChunksRef.current
        const discardChunk = discardRecordingRef.current
        const detectedSpeech = detectedSpeechRef.current
        const mimeType = recorder.mimeType || "audio/webm"
        const audioBlob = new Blob(chunks, { type: mimeType })
        audioChunksRef.current = []
        recorderRef.current = null
        stream.getTracks().forEach((track) => track.stop())
        if (microphoneStreamRef.current === stream) microphoneStreamRef.current = null

        const transcription = !discardChunk && detectedSpeech && audioBlob.size > 1000
          ? queueAudioTranscription(audioBlob, transcriptionSessionRef.current)
          : transcriptionQueueRef.current

        const resolvers = stopRecordingResolversRef.current.splice(0)
        Promise.resolve(transcription).finally(() => {
          resolvers.forEach((resolve) => resolve())
        })

        if (
          micOnRef.current &&
          !aiPlayingRef.current &&
          !submissionInProgressRef.current &&
          pageVisibleRef.current
        ) {
          window.setTimeout(() => startRecordedMicRef.current?.(), 100)
        } else {
          setIsListening(false)
        }
      }

      recorder.start()
      recordingChunkTimerRef.current = window.setTimeout(() => {
        if (recorder.state === "recording") recorder.stop()
      }, 7000)
    } catch (error) {
      micOnRef.current = false
      setMicOn(false)
      setIsListening(false)
      setMicMessage(error?.name === "NotAllowedError"
        ? "Microphone access is blocked. Allow it in your browser and try again."
        : "Couldn't start microphone recording. Tap the mic to retry.")
    } finally {
      recordingStartingRef.current = false
    }
  }, [queueAudioTranscription])

  useEffect(() => {
    startRecordedMicRef.current = startRecordedMic
    stopRecordedMicRef.current = stopRecordedMic
  }, [startRecordedMic, stopRecordedMic])

  useEffect(() => {
    micOnRef.current = micOn;
  }, [micOn]);

  useEffect(() => {
    aiPlayingRef.current = isAIPlaying;
  }, [isAIPlaying]);

  const startMic = useCallback(() => {
    if (
      !micOnRef.current ||
      aiPlayingRef.current ||
      submissionInProgressRef.current ||
      !pageVisibleRef.current
    ) return;
    startRecordedMicRef.current?.()
  }, []);

  const stopMic = useCallback((discard = false) =>
    stopRecordedMicRef.current?.({ discard }) || transcriptionQueueRef.current
  , []);

  // Deepgram receives short MediaRecorder chunks through our authenticated backend.
  useEffect(() => {
    if (!window.isSecureContext) {
      micOnRef.current = false;
      setMicOn(false);
      setMicMessage("Voice input requires a secure HTTPS connection.");
      return undefined;
    }

    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      micOnRef.current = false;
      setMicOn(false);
      setMicMessage("Audio recording isn't supported in this browser.");
      return undefined;
    }

    const startTimer = window.setTimeout(startMic, 250);

    const handleVisibilityChange = () => {
      pageVisibleRef.current = document.visibilityState === "visible";
      if (pageVisibleRef.current) {
        if (micOnRef.current && !aiPlayingRef.current) startMic();
      } else {
        stopMic(true);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.clearTimeout(startTimer);
      micOnRef.current = false;
      stopMic(true);
    };
  }, [startMic, stopMic]);

  const toggleMic = ()=>{
    if(micOn){
      micOnRef.current = false;
      setMicOn(false);
      setIsListening(false);
      setMicMessage("");
      stopMic()
    }else{
      micOnRef.current = true;
      setMicOn(true);
      setMicMessage("");
      startMic()
    }
  }

  const toggleCamera =async ()=>{
    if(cameraOn){
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      setCameraOn(false);

    }else{
      try {
        const stream = await navigator.mediaDevices.getUserMedia({video:true})
        streamRef.current = stream
        setCameraOn(true)
        setTimeout(()=>{
          if(userVideoRef.current) userVideoRef.current.srcObject = stream

        },100)
      } catch {
        setCameraOn(false)
      }
    }
  }

  const handleSubmitCode= (code) => {
   setAnswer((prev)=>{
    const separator = prev.trim() ? "\n\n--- Code ---\n" : "--- Code ---\n";
    const nextAnswer = prev + separator + code
    answerRef.current = nextAnswer
    return nextAnswer
   });
   setCodeOpen(false)
    
  }

  useEffect(()=>{
    if (timeLeft <= 0 || !timerActive) return;
    const t = setInterval(() => setTimeLeft((p) => p - 1), 1000);
    return () => clearInterval(t);

  },[timeLeft , timerActive])


  useEffect(() => {
    const player = new DeepgramFluxTtsPlayer(getInterviewVoiceConnection)
    voicePlayerRef.current = player
    setVoiceReady(true)

    const unlockVoice = () => player.unlock().catch(() => {})
    window.addEventListener("pointerdown", unlockVoice)
    window.addEventListener("keydown", unlockVoice)

    return () => {
      window.removeEventListener("pointerdown", unlockVoice)
      window.removeEventListener("keydown", unlockVoice)
      speechSessionRef.current += 1
      player.destroy()
      if (voicePlayerRef.current === player) voicePlayerRef.current = null
    }
  }, [])

  const speakText = useCallback(async (text) => {
    const player = voicePlayerRef.current
    if (!player || !text?.trim()) return

    const speechSession = ++speechSessionRef.current
    player.cancel()
    setSubtitle(text)
    stopMic(true)

    let playbackError
    try {
      const result = await player.speak(text, {
        onStart: () => {
          if (speechSession !== speechSessionRef.current) return
          aiPlayingRef.current = true
          setIsAIPlaying(true)
          aiVideoRef.current?.play().catch(() => {})
        },
      })
      playbackError = result?.error
    } catch (error) {
      playbackError = error
    }

    if (speechSession !== speechSessionRef.current) return

    aiVideoRef.current?.pause()
    aiPlayingRef.current = false
    setIsAIPlaying(false)
    if (playbackError) {
      console.error("Interview voice playback failed", playbackError)
      setMicMessage("The interviewer voice is temporarily unavailable. You can continue with the displayed question.")
    }
    if (micOnRef.current) startMic()
    window.setTimeout(() => {
      if (speechSession === speechSessionRef.current) setSubtitle("")
    }, 300)
  }, [startMic, stopMic])

  useEffect(()=>{
    if(!voiceReady || introSpoken)return;
    const runIntro=async () => {
      setIntroSpoken(true)
      lastSpokenQuestionRef.current = interviewData.question.question
      await new Promise((r) => setTimeout(r, 1200));
      await speakText(`Welcome ${user?.name.split(" ")[0]}! Let's begin your interview.`);
      await new Promise((r) => setTimeout(r, 900));
      await speakText(interviewData.question.question);
    }
    runIntro()

  },[voiceReady])



  useEffect(()=>{
    setQuestion(interviewData.question);
    setCurrentIndex(interviewData.currentQuestion);
    setTimeLeft(interviewData.question.timer || 60);

  },[interviewData])

  
  useEffect(()=>{
    if(!voiceReady || !introSpoken || lastSpokenQuestionRef.current === question.question)return;
    lastSpokenQuestionRef.current = question.question
    const speakQuestion = async () => {
      await new Promise((r) => setTimeout(r, 900));
      await speakText(question.question);
    }
    speakQuestion()

  },[question, voiceReady, introSpoken])

  useEffect(()=>{
     setTimeLeft(question.timer || 60);
    setTimerActive(true);

  },[question])



  useEffect(()=>{
    if(timeLeft !== 0)return;
    const autoSubmit = async () => {
      submissionInProgressRef.current = true;
      setTimerActive(false)
      await stopRecordedMicRef.current?.()
      await speakText("Time is up. Submitting your answer now.");
      const finalAnswer = `${answerRef.current}${interimTranscriptRef.current ? `${answerRef.current.trim() ? " " : ""}${interimTranscriptRef.current}` : ""}`.trim()
        || "No answer provided. Time over.";

      setLoading(true)

    const res = await submitAnswer({ interviewId: interviewData.interviewId, answer:finalAnswer})

    if(res.completed){
       setFeedback(res.feedback);
        await new Promise((r) => setTimeout(r, 700));
        await speakText(
          res.feedback?.feedback ||
          "Great job! Your interview is complete. Preparing your report now."
        );
        setLoading(false);
        navigate(`/interview/${interviewData.interviewId}/report`);
        return;
    }

     setFeedback(res.feedback);
      await new Promise((r) => setTimeout(r, 700));
      await speakText(
        res.feedback?.feedback ||
        "Noted your answer. Let's move to the next question."
      );
      setLoading(false);
      setQuestion(res.question);
      setCurrentIndex(res.currentQuestion);
      clearAnswer();
      setFeedback(null);
      submissionInProgressRef.current = false;


    }


    autoSubmit()
   

  },[timeLeft])


  const submit =async ()=>{
    submissionInProgressRef.current = true
    setTimerActive(false)
    setLoading(true)

    await stopRecordedMicRef.current?.()

    const finalAnswer = `${answerRef.current}${interimTranscriptRef.current ? `${answerRef.current.trim() ? " " : ""}${interimTranscriptRef.current}` : ""}`.trim()

    if(!finalAnswer){
      submissionInProgressRef.current = false
      setTimerActive(true)
      setLoading(false)
      startMic()
      return;
    }

    answerRef.current = finalAnswer
    interimTranscriptRef.current = ""
    setAnswer(finalAnswer)
    setInterimTranscript("")

    const res = await submitAnswer({ interviewId: interviewData.interviewId, answer: finalAnswer})

    if(res.completed){
       setFeedback(res.feedback);
        await new Promise((r) => setTimeout(r, 700));
        await speakText(
          res.feedback?.feedback ||
          "Great job! Your interview is complete. Preparing your report now."
        );
        setLoading(false);
        navigate(`/interview/${interviewData.interviewId}/report`);
        return;
    }

     setFeedback(res.feedback);
      await new Promise((r) => setTimeout(r, 700));
      await speakText(
        res.feedback?.feedback ||
        "Noted your answer. Let's move to the next question."
      );
      setLoading(false);
      setQuestion(res.question);
      setCurrentIndex(res.currentQuestion);
      clearAnswer();
      setFeedback(null);
      submissionInProgressRef.current = false;

  }

  const leaveInterview = () => {
    submissionInProgressRef.current = true;
    micOnRef.current = false;
    stopMic(true);
    speechSessionRef.current += 1;
    voicePlayerRef.current?.cancel();
    aiVideoRef.current?.pause();
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    navigate("/dashboard");
  }

  


  return (
    <div className='theme-page flex min-h-screen items-center justify-center p-2.5 sm:p-4'>


      {codeOpen && <CodeEditor onClose={()=>setCodeOpen(false)} onSubmitCode={handleSubmitCode} />}

      <AnimatePresence>
        {showExitConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="leave-interview-title"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#202127] p-5 shadow-2xl"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/15 text-red-300">
                <FiLogOut size={18} />
              </div>
              <h3 id="leave-interview-title" className="text-lg font-semibold text-white">Leave this interview?</h3>
              <p className="mt-2 text-sm leading-6 text-white/60">
                Your current answer will not be submitted. You can return to your dashboard and start a new interview later.
              </p>
              <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  onClick={() => setShowExitConfirm(false)}
                  className="h-10 rounded-xl border border-white/15 px-4 text-sm font-medium text-white/80 transition hover:bg-white/10"
                >
                  Keep interviewing
                </button>
                <button
                  onClick={leaveInterview}
                  className="h-10 rounded-xl bg-[#d2ff00] px-4 text-sm font-semibold text-[#171514] transition hover:bg-[#e0ff47]"
                >
                  Yes, leave interview
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className='grid w-full max-w-[1080px] overflow-hidden theme-dark-surface lg:max-h-[calc(100dvh-2rem)] lg:grid-cols-[32%_68%]'>
        {/* left */}

        <div className='flex flex-col gap-2.5 border-b border-white/10 p-3.5 sm:p-4 lg:overflow-y-auto lg:border-b-0 lg:border-r'>

          {/* Ai Video */}
          <div className='interview-dark-panel relative aspect-video overflow-hidden rounded-xl bg-black lg:aspect-[16/8]'>
            <video
              src={videoSource}
              ref={aiVideoRef}
              muted
              playsInline
              preload="auto"
              loop
              className="w-full h-full object-cover"
            />
            {isAIPlaying && (
              <div className='absolute bottom-2 left-2 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm rounded-full px-2.5 py-1'>
                <div className='flex gap-0.5 items-end h-3'>
                  {[1, 2, 3].map(i => (
                    <motion.div
                      key={i}
                      className="w-0.5 bg-white rounded-full"
                      animate={{ height: ["4px", "12px", "4px"] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                    />
                  ))}
                </div>
                <span className='text-[10px] text-white/80'>AI Speaking</span>
              </div>
            )}
          </div>

          <div className='flex min-h-10 items-center'>
            <AnimatePresence>
              {subtitle &&
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className='w-full rounded-xl bg-white/5 border border-white/8 px-3 py-2'>
                  <p className="text-xs text-white/65 leading-relaxed text-center">{subtitle}</p>

                </motion.div>}

             
            </AnimatePresence>

            
          </div>


          <div className='interview-dark-panel relative flex aspect-video items-center justify-center overflow-hidden rounded-xl border border-white/8 bg-[#17181E] lg:aspect-[16/7]'>
            {cameraOn ?
              <>
                <video
                  ref={userVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover scale-x-[-1]"
                />
                <div className='absolute top-2 left-2 bg-black/60 backdrop-blur-sm rounded-full px-2 py-0.5'>
                <span className="text-[10px] text-white/70">You</span>
                </div>
              </>
              :
              <div className='flex flex-col items-center gap-2'>
                <div className='w-14 h-14 rounded-full bg-white/10 border border-white/15 flex items-center justify-center'>
                <span className='text-2xl font-bold text-white'>{user?.name.charAt(0).toUpperCase()}</span>
                </div>
                <span className='text-xs text-white/35'>{user?.name.split(" ")[0]}</span>
                </div>}     
          </div>


          <div className='flex flex-col items-center gap-1 pt-0.5'>
            <div className='flex items-center justify-center gap-3'>
              <motion.button
              onClick={toggleMic} 
              aria-label={micOn ? "Turn off microphone" : "Turn on microphone"}
              aria-pressed={micOn}
              whileHover={{ scale: 1.08 }} 
              whileTap={{ scale: 0.93 }}
              className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all ${
                  showMicon ? "bg-white/10 border-white/15 text-white" : "bg-red-500/20 border-red-500/30 text-red-400"
                }`}>
                  {showMicon ? <FiMic size={15}/> : <FiMicOff size={15}/>}

              </motion.button>

              <motion.button 
              whileHover={{ scale: 1.08 }} 
              whileTap={{ scale: 0.93 }}
              onClick={toggleCamera}
              className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all ${
                  cameraOn ? "bg-white/10 border-white/15 text-white" : "bg-white/5 border-white/10 text-white/45 hover:text-white/70"
                }`}>
                  {cameraOn ? <FiCamera size={15}/> : <FiCameraOff size={15}/>}
                

              </motion.button>

              <motion.button 
              whileHover={{ scale: 1.08 }} 
              whileTap={{ scale: 0.93 }}
              onClick={()=>setCodeOpen(true)}
              className="w-9 h-9 rounded-xl flex items-center justify-center border bg-white/5 border-white/10 text-white/45 hover:text-white/70 hover:border-white/20 transition-all">

                <FiCode size={15}/>
                
              </motion.button>


            </div>

            <div className='min-h-[14px] flex items-center justify-center'>
              {micOn && isAIPlaying && (
                <span className="text-[10px] text-red-400/80">Mic paused — AI is speaking</span>)}
              {!isAIPlaying && micOn && isListening && (
                <span className="text-[10px] text-[#d2ff00]">
                  Listening…{isTranscribing ? " · adding speech to your answer" : ""}
                </span>)}
              {!isAIPlaying && !isListening && micMessage && (
                <span className="max-w-[220px] text-center text-[10px] text-red-300/90">{micMessage}</span>)}
            </div>

            <span className="text-[10px] text-white/35 text-center">
              Coding question? Use <FiCode size={9} className="inline -mt-0.5" /> to write &amp; add code
            </span>

          </div>

        </div>
        {/* right */}

        <div className='flex flex-col p-3.5 sm:p-5 lg:overflow-y-auto'>


          <div className='mb-3 flex items-start justify-between gap-3'>

            <div> 
              <h2 className='text-base sm:text-lg font-semibold text-white'>
                AI Interview
              </h2>
              <div className='flex items-center gap-2 text-zinc-500 text-xs mt-0.5'>
                <FiClock size={11}/>
                <span>{question.difficulty}</span>

              </div>
            </div>

            <div className='flex flex-col items-end gap-1.5 min-w-[110px]'>
              <button
                onClick={() => setShowExitConfirm(true)}
                className="flex h-8 items-center gap-1.5 rounded-lg border border-white/12 bg-white/5 px-2.5 text-xs font-medium text-white/70 transition hover:border-red-400/45 hover:bg-red-500/10 hover:text-red-200"
              >
                <FiLogOut size={13} />
                Leave
              </button>
              <Timer timeLeft={timeLeft} totalTime={question.timer || 60}/>

            </div>
          </div>


          <motion.div 
          initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          className='interview-dark-panel relative mb-3 overflow-hidden rounded-xl border border-white/8 bg-[#17181E] p-3.5 sm:p-4'>
            <div className='absolute inset-0 bg-gradient-to-br from-white/[0.04] via-transparent to-transparent pointer-events-none'/>
            <div className='relative mb-2 flex items-center gap-2.5'>
              <div className='w-8 h-8 rounded-lg bg-white text-black flex items-center justify-center shrink-0'>
                <FiMessageSquare size={14}/>
              </div>
              <p className='text-xs text-zinc-500'>Question {currentIndex + 1}</p>
            </div>
            <p className='relative text-sm leading-6 text-white sm:text-[15px]'>
              {question.question}</p>

          </motion.div>

          <div className='mb-3'>
            <div className='flex justify-between text-[10px] text-white/35 mb-1'>
            <span>Progress</span>
            <span>{currentIndex+1}/{interviewData.totalQuestions}</span>
            </div>
            <div className='w-full h-1 rounded-full bg-white/10 overflow-hidden'>
            <div className='h-full bg-white rounded-full transition-all duration-500' style={{width: `${progress}%`}} /></div>
          </div>

          <div className='flex min-h-0 flex-1 flex-col'>
            <label className='text-xs font-medium text-zinc-400 mb-1.5'>Your Answer</label>
            <textarea
            onChange={(e) => {
              const typedAnswer = e.target.value;
              const committedAnswer = interimTranscript && typedAnswer.endsWith(interimTranscript)
                ? typedAnswer.slice(0, -interimTranscript.length).trimEnd()
                : typedAnswer;
              interimTranscriptRef.current = "";
              setInterimTranscript("");
              answerRef.current = committedAnswer;
              setAnswer(committedAnswer);
            }}
            value={answerWithInterim}
            rows={4}
            onKeyDown={(e)=>{if(e.ctrlKey && e.key === "Enter") submit()}}
            placeholder='Write your answer here… or speak if mic is on'
             className='min-h-[120px] w-full flex-1 resize-none rounded-xl border border-[#d8d1cb] bg-[#fffdfb] p-3.5 text-sm text-[#171514] outline-none transition placeholder:text-[#aaa29c] focus:border-[#d2ff00] lg:max-h-[170px]'/>
          </div>

          <div className='mt-3 min-h-[0px]'>
            <AnimatePresence>
              {feedback && (
                <motion.div 
                initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 ,y:6}}
                className='rounded-xl border border-green-500/20 bg-green-500/5 p-4 max-h-40 overflow-y-auto'>
                  <p className='text-xs uppercase tracking-widest text-green-400 mb-2'>AI Feedback</p>
                  <p className='text-sm text-zinc-300 leading-6'>{feedback.feedback}</p>

                </motion.div>)}
            </AnimatePresence>
          </div>


          <div className='mt-3 flex items-center justify-between border-t border-white/10 pt-3'>
          <span className='text-xs text-zinc-600 hidden sm:block'>
            Press{" "}
            <span className='mx-1 rounded bg-white/10 px-1.5 py-0.5 text-white text-[10px]'>
             Ctrl+Enter
            </span>to Submit
          </span>

          <motion.button 
          whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={submit}
              disabled={loading || (!answerWithInterim.trim() && !isListening)}
              className='primary-action ml-auto h-10 min-w-[150px] justify-center px-5 rounded-xl text-sm font-semibold flex items-center gap-2 disabled:opacity-40 transition'

              
              >
                 {loading ? (
                <>
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-black border-t-transparent animate-spin" />
                  Submitting…
                </>
              ) : (
                <>Submit Answer <FiArrowRight size={15} /></>
              )}

          </motion.button>
          
          </div>


        </div>


      </motion.div>



    </div>
  )
}

export default Step2interview
