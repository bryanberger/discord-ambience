// const ffmpeg = require('easy-ffmpeg')
const fs = require('fs-extra')
const path = require('path')

const ResourceStatus = {
  INIT: 'Initializing',
  FETCH: 'Connecting',
  TRANS: 'Transcoding',
  BUFFER: 'Buffering',
  READY: 'Ready',
  ERROR: 'Error',
}

class Track {
  constructor(context, locator, humanName, volume = 0.5, buffer = null, opts = {}) {
    // this._id = id
    this._status = ResourceStatus.INIT
    this._locator = locator
    this._name = path.basename(this._locator)
    // this._name = this._id

    // extras
    this._opts = opts

    // available callback hooks
    this._onProgress = null
    this._onReady = null
    this._onError = null
    this._onStatusChange = null

    // internals
    // this._audioData = Buffer.alloc(0)
    this._audioBuffer = buffer
    this._outNode = context.createGain()
    this._outNode.gain.value = volume
    this._context = context
    this._loop = true
    this._srcNode = null

    // this.setReadableName()

    if (buffer) {
      this._status = ResourceStatus.READY
    }

    // console.log(`tmp file location: ${this._tmpFileLocation}`)
    console.log(`Added Track: ${this._locator}`)
  }

  // setReadableName() {
  //   // use the filename
  //   this._name = path.basename(this._locator)
  // }

  get volume() {
    return this._outNode.gain.value
  }

  set volume(val) {
    if (this._srcNode) {
      const now = this._context.currentTime
      this._outNode.gain.setValueAtTime(this._outNode.gain.value, now)
      this._outNode.gain.exponentialRampToValueAtTime(val, now + 4) // fade to vol after 4s
    } else {
      this._outNode.gain.value = val
    }
  }

  get name() {
    return this._name
  }

  connect(dest) {
    this._outNode.connect(dest)
  }

  disconnect() {
    this._outNode.disconnect()
  }

  setStatus(status) {
    this._status = status

    if (this._onStatusChange) {
      this._onStatusChange(this._id, status)
    }
  }

  load() {
    if (this._audioBuffer !== null) {
      this.setStatus(ResourceStatus.READY)
      console.log('Source already has a buffer, is ready')
      return
    }

    this.buffer(false)

    // starts the loading process
    // if (this._locator in this._cache) {
    //   // skip to loading file if in cache
    //   this._tmpFileLocation = this._cache[this._locator]

    //   console.log(
    //     `Loading ${this._locator} from cache ${this._tmpFileLocation}`,
    //   )
    //   this.onTranscodeComplete(false)
    // } else {
    //   console.log(`Loading media from ${this._locator}...`)
    //   const self = this
    //   self.transcode(this._locator)
    // }
  }

  // transcode(locator) {
  //   // assumes file for now
  //   this.setStatus(ResourceStatus.TRANS)
  //   const self = this

  //   ffmpeg(locator)
  //     .toFormat('wav')
  //     .outputOptions(['-ac 2', '-ar 48000', '-reconnect 1'])
  //     .save(this._tmpFileLocation)
  //     .on('error', (err) => {
  //       console.log(err)
  //       self.setStatus(ResourceStatus.ERROR)

  //       if (self._onError) self._onError(self._id, err)
  //     })
  //     // .on('progress', console.log)
  //     .on('end', () => self.onTranscodeComplete(true))
  // }

  buffer() {
    this.setStatus(ResourceStatus.BUFFER)

    // if (cache) {
    //   // if it's already in here, we just replace it
    //   this._cache[this._locator] = this._tmpFileLocation
    // }

    try {
      fs.readFile(this._locator, (err, data) => {
        // this._context.decodeAudioData(data).then((audioBuffer) => {
        this._context.decodeAudioData(data, (audioBuffer) => {
          this._audioBuffer = audioBuffer
          this.setStatus(ResourceStatus.READY)
          this.play()
          // don't delete, we caching now
          // setTimeout(() => fs.unlink(this._tmpFileLocation), 1000);
        })
      })
    } catch (err) {
      console.error(err)
    }
  }

  play() {
    if (this._status !== ResourceStatus.READY) {
      console.log(`Source ${this._name} is not ready to play`)
      return
    }

    if (this._srcNode) {
      this._srcNode.stop()
      this._srcNode.disconnect()
    }

    this._srcNode = this._context.createBufferSource()
    this._srcNode.buffer = this._audioBuffer
    this._srcNode.connect(this._outNode)
    this._srcNode.loop = this._loop
    this._srcNode.volume = this._outNode.gain.value
    this._srcNode.start()

    console.log(`Audio node ${this._name} playing...`)
  }

  stop() {
    if (this._srcNode) this._srcNode.stop()
  }
}

module.exports = {
  Track,
  ResourceStatus,
}
