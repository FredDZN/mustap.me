import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    currentDownload: {
      currentProcess: 'N / A',
      currentDownloadTitle: 'N / A',
      progress: 0,
      index: 0,
      totalQueueSize: 0,
      currentlyDownloading: false
    },
    currentPlaying: {
      sound: new Audio(),
      title: 'N / A',
      artist: 'N / A',
      thumbnail: 'N / A',
      duration: '0:00',
      currentTime: '0:00',
      currentTimeSeconds: 0,
      progress: '0%',
      lengthSeconds: 0,
      filename: '',
      playing: false,
      index: 0,
      volume: 1,
      missing: false
    },
    playlists: [],
    currentPlaylist: -1,
    currentPlaylistViewing: -1,
    repeatPlaylist: true,
    shufflePlaylist: false,
    mountedTrackControlsCount: 0,
    updatingPlaylist: { 
      updatePlaylist: false,
      name: '',
      link: ''
    },
    missingSongsCount: 0,
    documentsPath: ''
  },
  mutations: {
  },
  actions: {
  },
  modules: {
  },
  getters: {
    getCurrentPlaying: state => () => {
      return state.currentPlaying
    }
  }
})
