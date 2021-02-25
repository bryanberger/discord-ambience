// const Speaker = require('speaker')
const path = require('path')
// const fs = require('fs-extra')
const wae = require('@descript/web-audio-js')
const AudioContext = wae.StreamAudioContext
// const { v4: uuidv4 } = require('uuid')
const { Track } = require('./Track')

class AudioManager {
  constructor() {
    // this._cache = {}
    this._tracks = []
    this._context = null
    this._sourceTracks = [
      path.join(__dirname + '/audio/BARMAN_WORKING.wav'),
      path.join(__dirname + '/audio/FULL_ROOM.wav'),
      path.join(__dirname + '/audio/NIGHT_AMBIENCE.wav'),
      path.join(__dirname + '/audio/PEOPLE_TALKING.wav'),
      path.join(__dirname + '/audio/RAIN_ON_WINDOW.wav'),
      path.join(__dirname + '/audio/SERVING_DRINKS.wav'),
      path.join(__dirname + '/audio/STREET_AMBIENCE.wav'),
    ]
  }

  start() {
    // ensure cache exists
    // fs.ensureDirSync(path.join(__dirname, '/audioCache'))

    // Master context
    this._context = new AudioContext({ sampleRate: 48000 })

    // Master gain
    const gain = this._context.createGain()
    gain.connect(this._context.destination)
    gain.gain.value = 0.3

    // Add tracks at random volumes
    this._sourceTracks.forEach((path) => {
      const track = new Track(this._context, path, Math.random(0.1, 0.6))
      track.load()
      track.connect(gain)

      this._tracks.push(track)
    })

    // Simulate remixing volume every 20s
    // setInterval(() => this.remix, 20000)

    // Pipe output
    // this._context.pipe(new Speaker())
    // this._context.resume()

    return this._context
  }

  setOutputStream(stream) {
    this._context.suspend()
    this._context.pipe(stream)
    this._context.resume()

    console.log('Audio output stream changed')
  }

  remix() {
    if (this._tracks.length > 0) {
      this._tracks.forEach((track) => {
        track.volume = Math.random(0.1, 0.6)
      })
    }
  }

  get tracks() {
    return this._tracks
  }
}

module.exports = AudioManager
