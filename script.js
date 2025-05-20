$(document).ready(() => {
  // Global variables
  let songs = []
  let albums = []
  let currentSongIndex = 0
  let isPlaying = false
  let isShuffle = false
  let isRepeat = false
  let volume = 0.7
  const audioPlayer = document.getElementById("audio-player")
  const videoPlayer = document.getElementById("video-player")
  let isVideoMode = false

  // Initialize audio player
  audioPlayer.volume = volume

  // Load songs and albums from JSON
  $.ajax({
    url: "songs.json",
    dataType: "json",
    success: (data) => {
      songs = data.songs
      albums = data.albums

      // Initialize the player with the first song
      loadSong(currentSongIndex)

      // Render albums
      renderAlbums()

      // Render tracks
      renderTracks()

      // Add animation class to elements
      $(".current-playing").addClass("animate-fadeIn")
      $(".seasons-section").addClass("animate-slideIn")
      $(".tracks-section").addClass("animate-slideIn")
    },
    error: (xhr, status, error) => {
      console.error("Error loading songs:", error)
      // Fallback to hardcoded data if AJAX fails
      initializeFallbackData()
    },
  })

  // Fallback data initialization in case AJAX fails
  function initializeFallbackData() {
    songs = [
      {
        id: 1,
        title: "Die With A Smile",
        artist: "Lady Gaga and Bruno Mars",
        album: "Die With A Smile - Single",
        duration: "3:45",
        cover: "assets/Die With A Smile.png",
        audio: "assets/song/Lady Gaga Bruno Mars - Die With A Smile (Official Music Video).mp3",
        video: "assets/video/Lady Gaga Bruno Mars - Die With A Smile (Official Music Video).mp4",
        likes: 1025492,
        liked: false
      },
      {
        id: 2,
        title: "Blinding Lights",
        artist: "The Weeknd", 
        album: "After Hours",
        duration: "3:20",
        cover: "assets/Blinding Light.png",
        audio: "assets/song/The Weeknd - Blinding Lights (Official Video).mp3",
        video: "assets/video/The Weeknd - Blinding Lights (Official Video).mp4",
        likes: 987654,
        liked: false
      },
    ]

    albums = [
      {
        id: 1,
        title: "Lone",
        artist: "Lady Gaga and Bruno Mars, The Weeknd, Harry Styles",
        cover: "assets/playlist1.jpg",
        songs: [1, 2, 3],
      },
      {
        id: 2,
        title: "Reason",
        artist: "Stephen Sanchez, Justin Bieber, Dhruv",
        cover: "assets/reason.jpg",
        songs: [4, 5, 6]
      },
    ]

    // Initialize the player with the first song
    loadSong(currentSongIndex)

    // Render albums
    renderAlbums()

    // Render tracks
    renderTracks()
  }

  // Render albums
  function renderAlbums() {
    let albumsHTML = ""

    albums.forEach((album) => {
      albumsHTML += `
                <div class="season-card relative cursor-pointer transition-transform duration-300 hover:-translate-y-1.5 overflow-hidden group" data-id="${album.id}">
                    <img src="${album.cover}" alt="${album.title}" class="w-full aspect-square object-cover rounded mb-2.5 transition-all duration-300 group-hover:brightness-[0.7]">
                    <div class="play-icon absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 scale-0 w-10 h-10 bg-whimsi-green rounded-full flex items-center justify-center opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:scale-100">
                        <i class="fas fa-play"></i>
                    </div>
                    <h3 class="text-sm mb-1.5">${album.title}</h3>
                    <p class="text-xs text-whimsi-gray-text">${album.artist}</p>
                </div>
            `
    })

    $("#albums-container").html(albumsHTML)

    // Add click event to album cards
    $(".season-card").click(function () {
      const albumId = $(this).data("id")
      const album = albums.find((a) => a.id === albumId)

      if (album && album.songs.length > 0) {
        // Find the index of the first song in the album
        const songId = album.songs[0]
        const songIndex = songs.findIndex((s) => s.id === songId)

        if (songIndex !== -1) {
          currentSongIndex = songIndex
          loadSong(currentSongIndex)
          playSong()
          $(this).find(".play-icon").addClass("animate-pulse-custom")
          setTimeout(() => {
            $(this).find(".play-icon").removeClass("animate-pulse-custom")
          }, 500)
        }
      }
    })
  }

  // Render tracks
  function renderTracks() {
    let tracksHTML = ""

    songs.forEach((song, index) => {
      tracksHTML += `
            <div class="track-item flex items-center py-2.5 px-2.5 rounded transition-colors duration-300 hover:bg-white/10 cursor-pointer ${index === currentSongIndex ? "bg-whimsi-green/10" : ""}" data-index="${index}">
                <div class="track-number w-[30px] text-center text-sm ${index === currentSongIndex ? "text-whimsi-green" : "text-whimsi-gray-text"} relative">
                    <span class="number-text inline-block">${index + 1}</span>
                    <span class="play-icon-mini hidden absolute top-0 left-0 w-full text-center">
                        <i class="fas ${index === currentSongIndex && isPlaying ? "fa-pause" : "fa-play"}"></i>
                    </span>
                </div>
                <img src="${song.cover}" alt="${song.title}" class="track-cover w-10 h-10 rounded mx-4">
                <div class="track-info flex-1">
                    <div class="track-title text-sm mb-1.5">${song.title}</div>
                    <div class="track-artist text-xs text-whimsi-gray-text">${song.artist}</div>
                </div>
                <div class="track-duration text-sm text-whimsi-gray-text mr-2.5">${song.duration}</div>
                <div class="track-actions flex items-center">
                    <i class="far fa-heart track-like ${song.liked ? "text-whimsi-red" : "text-whimsi-gray-text"} mr-4 cursor-pointer transition-all duration-300 hover:scale-[1.2]" data-index="${index}"></i>
                    <i class="fas fa-ellipsis-h track-more text-whimsi-gray-text hover:text-white cursor-pointer"></i>
                </div>
            </div>
        `
    })

    $("#tracks-container").html(tracksHTML)

    // Add click event to track items
    $(".track-item").click(function (e) {
      if (!$(e.target).hasClass("track-like") && !$(e.target).hasClass("track-more")) {
        const index = $(this).data("index")

        if (currentSongIndex === index && isPlaying) {
          // If clicking on the currently playing song, pause it
          pauseSong()
        } else {
          // Otherwise, play the selected song
          currentSongIndex = index
          loadSong(currentSongIndex)
          playSong()
        }

        // Update active track
        $(".track-item").removeClass("bg-whimsi-green/10 playing")
        $(this).addClass("bg-whimsi-green/10 playing")
        $(this).addClass("animate-pulse-custom")
        setTimeout(() => {
          $(this).removeClass("animate-pulse-custom")
        }, 500)
      }
    })

    // Add click event to like buttons
    $(".track-like").click(function (e) {
      e.stopPropagation()
      const index = $(this).data("index")
      toggleLike(index)

      // Toggle like icon
      $(this).toggleClass("text-whimsi-red")
      $(this).addClass("animate-pulse-custom")
      setTimeout(() => {
        $(this).removeClass("animate-pulse-custom")
      }, 500)
    })
  }

  // Load song
  function loadSong(index) {
    const song = songs[index]

    // Update audio source
    audioPlayer.src = song.audio

    // Update video source
    videoPlayer.src = song.video
    videoPlayer.poster = song.cover

    // Reset video mode
    resetVideoMode()

    // Update current song info
    $("#current-song-title").text(song.title)
    $("#current-song-artist").text("By " + song.artist)
    $("#current-song-cover").attr("src", song.cover)
    $("#like-count").text(formatNumber(song.likes))

    // Update like button
    if (song.liked) {
      $("#like-button").addClass("text-whimsi-red")
    } else {
      $("#like-button").removeClass("text-whimsi-red")
    }

    // Update mini player
    $("#mini-song-title").text(song.title)
    $("#mini-song-artist").text("By " + song.artist)
    $("#mini-song-cover").attr("src", song.cover)

    if (song.liked) {
      $("#mini-like-btn").addClass("text-whimsi-red")
      $("#mini-like-btn i").removeClass("far").addClass("fas")
    } else {
      $("#mini-like-btn").removeClass("text-whimsi-red")
      $("#mini-like-btn i").removeClass("fas").addClass("far")
    }

    // Update track list
    $(".track-item").removeClass("bg-whimsi-green/10 playing")
    $(`.track-item[data-index="${index}"]`).addClass("bg-whimsi-green/10")

    // Reset all play icons
    $(".track-item .number-text").show()
    $(".track-item .play-icon-mini").hide()
    $(".track-item .play-icon-mini i").removeClass("fa-pause").addClass("fa-play")

    // Reset progress
    updateProgress()
  }

  // Play song
  function playSong() {
    audioPlayer.play()
    isPlaying = true
    $("#play-btn i").removeClass("fa-play").addClass("fa-pause")
    $("#big-play-btn i").removeClass("fa-play").addClass("fa-pause")
    $(`.track-item[data-index="${currentSongIndex}"]`).addClass("playing")

    // Update the play icon in the track list
    $(".track-item .play-icon-mini i").removeClass("fa-pause").addClass("fa-play")
    $(`.track-item[data-index="${currentSongIndex}"] .play-icon-mini i`).removeClass("fa-play").addClass("fa-pause")

    // Hide number and show play icon for the playing track
    $(`.track-item[data-index="${currentSongIndex}"] .number-text`).hide()
    $(`.track-item[data-index="${currentSongIndex}"] .play-icon-mini`).show()

    // Play video if in video mode
    if (isVideoMode) {
      videoPlayer.play()
    }
  }

  // Pause song
  function pauseSong() {
    audioPlayer.pause()
    isPlaying = false
    $("#play-btn i").removeClass("fa-pause").addClass("fa-play")
    $("#big-play-btn i").removeClass("fa-pause").addClass("fa-play")
    $(".track-item").removeClass("playing")

    // Update the play icon in the track list
    $(`.track-item[data-index="${currentSongIndex}"] .play-icon-mini i`).removeClass("fa-pause").addClass("fa-play")

    // Show number again for the paused track
    $(`.track-item[data-index="${currentSongIndex}"] .number-text`).show()
    $(`.track-item[data-index="${currentSongIndex}"] .play-icon-mini`).hide()

    // Pause video if in video mode
    if (isVideoMode) {
      videoPlayer.pause()
    }
  }

  // Next song
  function nextSong() {
    if (isShuffle) {
      let randomIndex
      do {
        randomIndex = Math.floor(Math.random() * songs.length)
      } while (randomIndex === currentSongIndex)

      currentSongIndex = randomIndex
    } else {
      currentSongIndex = (currentSongIndex + 1) % songs.length
    }

    loadSong(currentSongIndex)
    playSong()
  }

  // Previous song
  function prevSong() {
    if (audioPlayer.currentTime > 3) {
      // If more than 3 seconds have passed, restart the song
      audioPlayer.currentTime = 0
    } else {
      // Go to previous song
      currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length
      loadSong(currentSongIndex)
      playSong()
    }
  }

  // Toggle like
  function toggleLike(index) {
    songs[index].liked = !songs[index].liked

    if (songs[index].liked) {
      songs[index].likes++
    } else {
      songs[index].likes--
    }

    // Update UI if it's the current song
    if (index === currentSongIndex) {
      $("#like-count").text(formatNumber(songs[index].likes))

      if (songs[index].liked) {
        $("#like-button").addClass("text-whimsi-red")
        $("#mini-like-btn").addClass("text-whimsi-red")
        $("#mini-like-btn i").removeClass("far").addClass("fas")
      } else {
        $("#like-button").removeClass("text-whimsi-red")
        $("#mini-like-btn").removeClass("text-whimsi-red")
        $("#mini-like-btn i").removeClass("fas").addClass("far")
      }
    }
  }

  // Format number with commas
  function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  }

  // Update progress bar
  function updateProgress() {
    const duration = audioPlayer.duration || 0
    const currentTime = audioPlayer.currentTime || 0
    const progressPercent = (currentTime / duration) * 100

    $("#progress").css("width", `${progressPercent}%`)

    // Update time displays
    $("#current-time").text(formatTime(currentTime))
    $("#total-time").text(formatTime(duration))
  }

  // Format time in MM:SS
  function formatTime(seconds) {
    if (isNaN(seconds)) return "0:00"

    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  // Set progress when clicking on progress bar
  $(".progress-bar").click(function (e) {
    const width = this.clientWidth
    const clickX = e.offsetX
    const duration = audioPlayer.duration
    audioPlayer.currentTime = (clickX / width) * duration

    // Sync video with audio
    if (isVideoMode) {
      videoPlayer.currentTime = audioPlayer.currentTime
    }
  })

  // Set volume when clicking on volume bar
  $(".volume-slider").click(function (e) {
    const width = this.clientWidth
    const clickX = e.offsetX
    volume = clickX / width
    audioPlayer.volume = volume
    $("#volume-progress").css("width", `${volume * 100}%`)

    // Update volume icon
    updateVolumeIcon()
  })

  // Update volume icon based on volume level
  function updateVolumeIcon() {
    const volumeBtn = $("#volume-btn i")

    if (volume === 0) {
      volumeBtn.removeClass("fa-volume-up fa-volume-down").addClass("fa-volume-mute")
    } else if (volume < 0.5) {
      volumeBtn.removeClass("fa-volume-up fa-volume-mute").addClass("fa-volume-down")
    } else {
      volumeBtn.removeClass("fa-volume-down fa-volume-mute").addClass("fa-volume-up")
    }
  }

  // Toggle mute
  $("#volume-btn").click(() => {
    if (audioPlayer.volume > 0) {
      // Store the current volume and mute
      volume = audioPlayer.volume
      audioPlayer.volume = 0
      $("#volume-progress").css("width", "0%")
      $("#volume-btn i").removeClass("fa-volume-up fa-volume-down").addClass("fa-volume-mute")
    } else {
      // Restore the volume
      audioPlayer.volume = volume
      $("#volume-progress").css("width", `${volume * 100}%`)
      updateVolumeIcon()
    }
  })

  // Toggle video mode
  function toggleVideoMode() {
    isVideoMode = !isVideoMode

    if (isVideoMode) {
      // Switch to video mode
      $(".video-container").removeClass("hidden").addClass("block")
      $(".song-cover").addClass("opacity-0")
      $("#video-toggle i").removeClass("fa-video").addClass("fa-image")

      // Sync video with audio
      videoPlayer.currentTime = audioPlayer.currentTime
      if (isPlaying) {
        videoPlayer.play()
      }
    } else {
      // Switch to image mode
      $(".video-container").removeClass("block").addClass("hidden")
      $(".song-cover").removeClass("opacity-0")
      $("#video-toggle i").removeClass("fa-image").addClass("fa-video")
      videoPlayer.pause()
    }
  }

  // Reset video mode
  function resetVideoMode() {
    isVideoMode = false
    $(".video-container").removeClass("block").addClass("hidden")
    $(".song-cover").removeClass("opacity-0")
    $("#video-toggle i").removeClass("fa-image").addClass("fa-video")
  }

  // Add event listener for video toggle button
  $("#video-toggle").click(function (e) {
    e.stopPropagation()
    toggleVideoMode()
    $(this).addClass("animate-pulse-custom")
    setTimeout(() => {
      $(this).removeClass("animate-pulse-custom")
    }, 500)
  })

  // Event Listeners

  // Play/Pause button
  $("#play-btn").click(function () {
    if (isPlaying) {
      pauseSong()
    } else {
      playSong()
    }

    $(this).addClass("animate-pulse-custom")
    setTimeout(() => {
      $(this).removeClass("animate-pulse-custom")
    }, 500)
  })

  // Big play button in current playing section
  $("#big-play-btn").click(function (e) {
    e.stopPropagation()

    if (isPlaying) {
      pauseSong()
    } else {
      playSong()
    }

    $(this).addClass("animate-pulse-custom")
    setTimeout(() => {
      $(this).removeClass("animate-pulse-custom")
    }, 500)
  })

  // Next button
  $("#next-btn").click(function () {
    nextSong()
    $(this).addClass("animate-pulse-custom")
    setTimeout(() => {
      $(this).removeClass("animate-pulse-custom")
    }, 500)
  })

  // Previous button
  $("#prev-btn").click(function () {
    prevSong()
    $(this).addClass("animate-pulse-custom")
    setTimeout(() => {
      $(this).removeClass("animate-pulse-custom")
    }, 500)
  })

  // Shuffle button
  // $("#shuffle-btn").click(function () {
  //   isShuffle = !isShuffle
  //   $(this).toggleClass("text-whimsi-green")
  //   $(this).addClass("animate-pulse-custom")
  //   setTimeout(() => {
  //     $(this).removeClass("animate-pulse-custom")
  //   }, 500)
  // })

  // Repeat button
  // $("#repeat-btn").click(function () {
  //   isRepeat = !isRepeat
  //   audioPlayer.loop = isRepeat
  //   $(this).toggleClass("text-whimsi-green")
  //   $(this).addClass("animate-pulse-custom")
  //   setTimeout(() => {
  //     $(this).removeClass("animate-pulse-custom")
  //   }, 500)
  // })

  // Like button in current playing
  $("#like-button").click(function () {
    toggleLike(currentSongIndex)
    $(this).addClass("animate-pulse-custom")
    setTimeout(() => {
      $(this).removeClass("animate-pulse-custom")
    }, 500)
  })

  // Mini like button
  $("#mini-like-btn").click(function () {
    toggleLike(currentSongIndex)
    $(this).addClass("animate-pulse-custom")
    setTimeout(() => {
      $(this).removeClass("animate-pulse-custom")
    }, 500)
  })

  // Current playing section click
  $(".current-playing").click((e) => {
    if (
      !$(e.target).hasClass("big-play-btn") &&
      !$(e.target).hasClass("fa-play") &&
      !$(e.target).hasClass("fa-pause") &&
      !$(e.target).hasClass("video-toggle") &&
      !$(e.target).closest(".video-toggle").length
    ) {
      if (isPlaying) {
        pauseSong()
      } else {
        playSong()
      }
    }
  })

  // Audio player events

  // Time update
  audioPlayer.addEventListener("timeupdate", updateProgress)

  // Song ended
  audioPlayer.addEventListener("ended", () => {
    if (isRepeat) {
      // Song will loop automatically due to audioPlayer.loop = true
    } else {
      nextSong()
    }
  })

  // Sync video with audio when seeking
  audioPlayer.addEventListener("seeked", () => {
    if (isVideoMode) {
      videoPlayer.currentTime = audioPlayer.currentTime
    }
  })

  // Search functionality
  $("#search-input").on("keyup", function () {
    const searchTerm = $(this).val().toLowerCase()

    if (searchTerm.length > 0) {
      // Filter tracks
      $(".track-item").each(function () {
        const title = $(this).find(".track-title").text().toLowerCase()
        const artist = $(this).find(".track-artist").text().toLowerCase()

        if (title.includes(searchTerm) || artist.includes(searchTerm)) {
          $(this).show()
        } else {
          $(this).hide()
        }
      })
    } else {
      // Show all tracks
      $(".track-item").show()
    }
  })

  // Add animation to nav menu items
  $(".nav-menu li, .library-menu li").click(function () {
    $(".nav-menu li, .library-menu li").removeClass("text-whimsi-green bg-whimsi-green/10")
    $(this).addClass("text-whimsi-green bg-whimsi-green/10")
    $(this).addClass("animate-pulse-custom")
    setTimeout(() => {
      $(this).removeClass("animate-pulse-custom")
    }, 500)
  })
})
