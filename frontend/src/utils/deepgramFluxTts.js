const DEFAULT_SAMPLE_RATE = 24000
let sharedAudioContext = null

const getSharedAudioContext = () => {
  if (!sharedAudioContext || sharedAudioContext.state === "closed") {
    const AudioContext = window.AudioContext || window.webkitAudioContext
    if (!AudioContext) throw new Error("Streaming audio isn't supported in this browser")
    sharedAudioContext = new AudioContext()
  }
  return sharedAudioContext
}

export const primeDeepgramAudio = async () => {
  const audioContext = getSharedAudioContext()
  if (audioContext.state === "suspended") await audioContext.resume()
}

const decodeLinear16 = (buffer) => {
  const view = new DataView(buffer)
  const samples = new Float32Array(Math.floor(view.byteLength / 2))

  for (let index = 0; index < samples.length; index += 1) {
    samples[index] = view.getInt16(index * 2, true) / 32768
  }

  return samples
}

export class DeepgramFluxTtsPlayer {
  constructor(getConnectionConfig) {
    this.getConnectionConfig = getConnectionConfig
    this.audioContext = null
    this.socket = null
    this.connectionPromise = null
    this.currentTurn = null
    this.sources = new Set()
    this.scheduledUntil = 0
    this.finishTimer = null
    this.sampleRate = DEFAULT_SAMPLE_RATE
    this.destroyed = false
  }

  getAudioContext() {
    if (!this.audioContext || this.audioContext.state === "closed") {
      this.audioContext = getSharedAudioContext()
    }
    return this.audioContext
  }

  async unlock() {
    const audioContext = this.getAudioContext()
    if (audioContext.state === "suspended") {
      let timeout
      await Promise.race([
        audioContext.resume(),
        new Promise((_, reject) => {
          timeout = window.setTimeout(() => reject(new Error("Click the page to enable interview audio")), 1500)
        }),
      ]).finally(() => window.clearTimeout(timeout))
    }
    if (audioContext.state !== "running") throw new Error("Click the page to enable interview audio")
  }

  async connect() {
    if (this.destroyed) throw new Error("The voice player has been closed")
    if (this.socket?.readyState === WebSocket.OPEN) return this.socket
    if (this.connectionPromise) return this.connectionPromise

    this.connectionPromise = (async () => {
      const config = await this.getConnectionConfig()
      const websocketUrl = new URL(config.websocketUrl)
      websocketUrl.searchParams.set("model", config.model)
      websocketUrl.searchParams.set("encoding", "linear16")
      websocketUrl.searchParams.set("sample_rate", String(config.sampleRate || DEFAULT_SAMPLE_RATE))
      this.sampleRate = Number(config.sampleRate) || DEFAULT_SAMPLE_RATE

      const socket = new WebSocket(websocketUrl, ["bearer", config.accessToken])
      socket.binaryType = "arraybuffer"

      await new Promise((resolve, reject) => {
        const timeout = window.setTimeout(() => {
          socket.close()
          reject(new Error("Deepgram voice connection timed out"))
        }, 10000)

        socket.onopen = () => {
          window.clearTimeout(timeout)
          resolve()
        }
        socket.onerror = () => {
          window.clearTimeout(timeout)
          reject(new Error("Unable to connect to Deepgram voice"))
        }
      })

      if (this.destroyed) {
        socket.close()
        throw new Error("The voice player has been closed")
      }

      this.socket = socket
      socket.onmessage = (event) => this.handleMessage(event)
      socket.onerror = () => this.finishCurrentTurn(new Error("Deepgram voice playback failed"))
      socket.onclose = () => {
        if (this.socket === socket) this.socket = null
        this.finishCurrentTurn(new Error("Deepgram voice connection closed"))
      }

      return socket
    })().finally(() => {
      this.connectionPromise = null
    })

    return this.connectionPromise
  }

  async handleMessage(event) {
    if (typeof event.data === "string") {
      let message
      try {
        message = JSON.parse(event.data)
      } catch {
        return
      }

      if (message.type === "SpeechMetadata") {
        if (this.currentTurn) {
          this.currentTurn.serverComplete = true
          this.scheduleTurnFinish()
        }
      } else if (message.type === "Error") {
        this.finishCurrentTurn(new Error(message.description || "Deepgram voice playback failed"))
      }
      return
    }

    const buffer = event.data instanceof Blob ? await event.data.arrayBuffer() : event.data
    if (!(buffer instanceof ArrayBuffer) || !this.currentTurn) return

    const samples = decodeLinear16(buffer)
    if (!samples.length) return

    const audioContext = this.getAudioContext()
    if (audioContext.state === "suspended") await audioContext.resume()

    if (!this.currentTurn.started) {
      this.currentTurn.started = true
      this.currentTurn.onStart?.()
    }

    const audioBuffer = audioContext.createBuffer(1, samples.length, this.sampleRate)
    audioBuffer.copyToChannel(samples, 0)

    const source = audioContext.createBufferSource()
    source.buffer = audioBuffer
    source.connect(audioContext.destination)
    source.onended = () => this.sources.delete(source)

    const startAt = Math.max(audioContext.currentTime + 0.025, this.scheduledUntil)
    source.start(startAt)
    this.scheduledUntil = startAt + audioBuffer.duration
    this.sources.add(source)

    if (this.currentTurn.serverComplete) this.scheduleTurnFinish()
  }

  scheduleTurnFinish() {
    if (!this.currentTurn?.serverComplete) return
    window.clearTimeout(this.finishTimer)

    const audioContext = this.getAudioContext()
    const remainingMs = Math.max(0, (this.scheduledUntil - audioContext.currentTime) * 1000)
    this.finishTimer = window.setTimeout(() => this.finishCurrentTurn(), remainingMs + 40)
  }

  finishCurrentTurn(error) {
    if (!this.currentTurn) return
    window.clearTimeout(this.finishTimer)
    this.finishTimer = null
    const turn = this.currentTurn
    this.currentTurn = null
    this.scheduledUntil = this.audioContext?.currentTime || 0
    turn.resolve({ error })
  }

  async speak(text, { onStart } = {}) {
    const cleanedText = text?.trim()
    if (!cleanedText) return { error: null }

    this.cancel()
    await this.unlock()
    const socket = await this.connect()

    return new Promise((resolve) => {
      this.currentTurn = {
        resolve,
        onStart,
        started: false,
        serverComplete: false,
      }
      socket.send(JSON.stringify({ type: "Speak", text: cleanedText }))
      socket.send(JSON.stringify({ type: "Flush" }))
    })
  }

  cancel() {
    window.clearTimeout(this.finishTimer)
    this.finishTimer = null

    if (this.currentTurn && this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type: "Interrupt" }))
    }

    for (const source of this.sources) {
      try {
        source.stop()
      } catch {
        // The source may already have ended.
      }
    }
    this.sources.clear()
    this.finishCurrentTurn()
  }

  destroy() {
    this.destroyed = true
    this.cancel()
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type: "Close" }))
    } else {
      this.socket?.close()
    }
    this.socket = null
    this.audioContext?.close().catch(() => {})
    if (sharedAudioContext === this.audioContext) sharedAudioContext = null
    this.audioContext = null
  }
}
