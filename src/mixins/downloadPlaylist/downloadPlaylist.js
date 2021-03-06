import formatPlaylist from "./scripts/formatPlaylist";
import savePlaylist from "./scripts/savePlaylist";
import downloadSong from "./scripts/downloadSong";

export default {
  methods: {
    async playlistDownloader(arr) {
      let [url, playlistName] = arr;

      this.$store.dispatch("setUpdatingPlaylist", {
        updatingPlaylist: false,
        link: "",
        name: "",
      });

      this.$store.dispatch("setCurrentDownloadProp", {
        prop: "downloadNow",
        data: false,
      });

      playlistName = playlistName.replace(/[/\\?%*:|"<>.]/g, "");

      if (url === "") {
        this.$store.dispatch("setCurrentDownloadProp", {
          prop: "currentProcess",
          data: "Please enter a playlist link.",
        });
        return;
      }

      /* dependencies */
      const fs = require("fs");
      const ytpl = require("ytpl");
      const path = require("path");

      /* system paths */
      const documentsPath = this.$store.state.documentsPath;
      const songsPath = path.join(documentsPath, "/mustap/songs/");

      this.$store.dispatch("setCurrentDownloadProp", {
        prop: "playlistPath",
        data: path.join(
          documentsPath,
          "/mustap/playlists/",
          playlistName,
          ".json"
        ),
      });

      // console.log("Fetching metadata...");
      this.$store.dispatch("setCurrentDownloadProp", {
        prop: "currentProcess",
        data: "Fetching metadata...",
      });

      // Get playlist metadata
      let metadataSuccess = true;
      const metadata = await ytpl(url, { limit: Infinity }).catch(() => metadataSuccess = false);

      if (!metadataSuccess) {
        this.resetCurrentDownload({ currentProcess: "Failed to fetch metadata." });
        return;
      }

      const playlist = formatPlaylist(metadata, url);

      this.$store.dispatch("setCurrentDownloadProp", {
        prop: "currentProcess",
        data: "Saving metadata...",
      });

      // saving playlist to documents as json file
      await savePlaylist(playlist, documentsPath, playlistName);

      // refresh playlist list
      this.clearData();
      this.getPlaylists().then(() => {
        this.formatDataPlaylists();
      });

      // remove all songs already installed
      this.$store.dispatch("setCurrentDownloadProp", {
        prop: "currentProcess",
        data: "Removing previously downloaded songs...",
      });

      let files = await fs.promises
        .readdir(songsPath)
        .catch((err) => console.log(err));

      if (!files) {
        this.$store.dispatch("setCurrentDownloadProp", {
          prop: "currentProcess",
          data: "No songs to remove.",
        });
      } else {
        for (let i = playlist.length - 1; i >= 0; i--) {
          const songFilename = playlist[i].filename;

          for (let index = 0; index < files.length; index++) {
            const file = files[index];

            if (file === songFilename) {
              playlist.splice(i, 1);
            }
          }
        }
      }

      if (playlist === []) {
        this.$store.dispatch("setCurrentDownloadMultiple", {
          currentProcess: "No songs to download.",
          currentlyDownloading: false,
          currentDownloadTitle: "N / A",
          index: 0,
          stream: null,
          playlistPath: "",
        });
      } else {
        this.$store.dispatch("setCurrentDownloadMultiple", {
          currentProcess: "Starting download...",
          totalQueueSize: playlist.length,
        });

        this.downloadSongs(songsPath, playlist);
      }
    },
    async downloadSongs(songsPath, playlist) {
      for (let i = 0; i < playlist.length; i++) {
        const song = playlist[i];

        this.$store.dispatch("setCurrentDownloadMultiple", {
          currentlyDownloading: true,
          currentDownloadTitle: song.title,
          index: i + 1,
          currentProcess: "Downloading...",
          path: songsPath + song.filename,
          progress: 0,
        });

        const download = await downloadSong(song, songsPath)
          .then((stop) => {
            if (stop) {
              return "stop";
            }
          })
          .catch(() => {
            this.$store.dispatch("setCurrentDownloadProp", {
              prop: "currentProcess",
              data: "This song could not be downloaded.",
            });
          });

        if (download === "stop") {
          this.resetCurrentDownload({ currentProcess: "Stopped downloading songs." });

          return;
        }
      }

      this.resetCurrentDownload({ index: playlist.length, currentProcess: "Finished downloading playlist." });
    },
    resetCurrentDownload(extra = {}) {
      this.$store.dispatch("setCurrentDownloadMultiple", {
        currentlyDownloading: false,
        currentDownloadTitle: "N / A",
        stream: null,
        playlistPath: "",
        path: "",
        progress: 0,
        playlistLink: "",
        playlistName: "",
        downloadNow: false,
        ...extra,
      });
    },
  },
};