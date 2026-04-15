let disconnectTimer;
let settings;

function getVarFromBody(name) {
  return window.getComputedStyle(document.body).getPropertyValue(name);
}

function getSettings() {
  return {
    fade_on_stop: getVarFromBody('--fade-on-stop') === '0.1',
    fade_on_disconnect: getVarFromBody('--fade-on-disconnect') === '0.1',
    fade_delay: parseInt(getVarFromBody('--fade-delay')) || 2000,
    fade_disconnect_delay: parseInt(getVarFromBody('--fade-disconnect-delay')) || parseInt(getVarFromBody('--fade-delay')) || 2000,
    hide_on_idle_connect: getVarFromBody('--hide-on-idle-connect') === '0.1'
  };
}

function startWebSocket() {
  try {
    setTimeout(() => {
      settings = getSettings();
    }, 100);

    console.debug('[DEBUG] [Init] Configuring websocket connection...');
    const CiderApp = io("http://localhost:10767/", {
      transports: ['websocket']
    });

    CiderApp.on("connect", () => {
      console.debug('[DEBUG] [Init] Socket.io connection established!');
      document.getElementById("title").innerText = "CiderMusic_Player Connector | Connection established!";
      document.getElementById("artist").innerText = "Start playing something!";
      document.getElementById("album").innerText = "-/-";

      if (settings && settings.hide_on_idle_connect) {
        document.getElementById("content").style.opacity = 0;
      }

      if (disconnectTimer) {
        clearTimeout(disconnectTimer);
        disconnectTimer = undefined;
        document.getElementById("content").style.opacity = 1;
      }
    });

    CiderApp.on("API:Playback", ({ data, type }) => {
      if (type === "playbackStatus.playbackStateDidChange") {
        if (data.state === "paused") {
          document.getElementById("content").style.opacity = 0;
        } else if (data.state === "playing") {
          document.getElementById("content").style.opacity = 1;
        }
        updateComponents(data.attributes);
      } else if (type === "playbackStatus.nowPlayingItemDidChange") {
        document.getElementById("content").style.opacity = 0;
        setTimeout(() => {
          updateComponents(data);
          document.getElementById("content").style.opacity = 1;
        }, 600);
      } else if (type === "playbackStatus.playbackTimeDidChange") {
        if (document.getElementById("artist").innerText === "Start playing something!") {
          document.getElementById("artist").innerText = "Please pause and unpause the track to update track info!";
          document.getElementById("title").innerText = "CiderMusic_Player | Connection established, but incomplete data!";
          document.getElementById("content").style.opacity = 1;
        }

        const progress = (data.currentPlaybackTime / data.currentPlaybackDuration) * 100;
        document.getElementById("progressBar").style.width = `${progress}%`;

        if (document.getElementById("progressTime")) {
          document.getElementById("progressTime").innerText = formatTime(data.currentPlaybackTime);
        }
        if (document.getElementById("duration")) {
          const timeLeft = Math.max(0, data.currentPlaybackDuration - data.currentPlaybackTime);
          document.getElementById("duration").innerText = `-${formatTime(timeLeft)}`;
        }
      } else {
        console.debug(type, data);
      }
    });

    CiderApp.on("disconnect", () => {
      document.getElementById("title").innerText = "CiderMusic_Player Connector | Disconnected! Retrying...";
      document.getElementById("artist").innerText = "-/-";
      document.getElementById("album").innerText = "-/-";
      document.getElementById("albumimg").src = "placeholder.webp";
      console.debug('[DEBUG] [Init] Socket.io connection closed!');

      if (!disconnectTimer && settings && settings.fade_on_disconnect) {
        disconnectTimer = setTimeout(() => {
          document.getElementById("content").style.opacity = 0;
        }, settings.fade_disconnect_delay);
      }
    });

    CiderApp.on("connect_error", (error) => {
      document.getElementById("albumimg").src = "placeholder.webp";
      console.debug("[DEBUG] [Init] Connect Error: " + error);
    });

  } catch (error) {
    console.debug('[DEBUG] [Init] Code error:', error);
  }
}

function updateComponents(data) {
  if (!data) return;
  const titleEl = document.getElementById("title");
  const artistEl = document.getElementById("artist");
  
  titleEl.innerText = data.name || "Unknown Title";
  artistEl.innerText = data.artistName || "Unknown Artist";
  document.getElementById("album").innerText = data.albumName || "Unknown Album";

  // Reset animations before calculating
  titleEl.classList.remove('scrolling');
  artistEl.classList.remove('scrolling');
  titleEl.style.transform = '';
  artistEl.style.transform = '';

  // Small delay to allow layout update
  setTimeout(() => {
    updateScrolling(titleEl);
    updateScrolling(artistEl);
  }, 100);

  if (data.artwork && data.artwork.url) {
    let tmp = data.artwork.url.replace("{w}", data.artwork.width).replace("{h}", data.artwork.height);
    document.getElementById("albumimg").src = tmp;
    document.getElementById("player-bg-img").src = tmp;
  }
}

function formatTime(seconds) {
  if (isNaN(seconds) || seconds === null || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function updateScrolling(el) {
  const container = el.parentElement;
  if (!container) return;

  const overflow = el.offsetWidth - container.offsetWidth;
  if (overflow > 0) {
    // We add a bit of padding to the scroll distance so it's not cut off
    const scrollDistance = -(overflow + 20); 
    el.style.setProperty('--scroll-distance', `${scrollDistance}px`);
    
    // Calculate duration based on distance (roughly 30px per second)
    const duration = Math.max(10, Math.abs(scrollDistance) / 30);
    el.style.setProperty('--scroll-duration', `${duration}s`);
    
    el.classList.add('scrolling');
    // Ensure the container aligns to the left when scrolling
    container.style.justifyContent = 'flex-start';
  } else {
    container.style.justifyContent = 'center';
  }
}

window.addEventListener('DOMContentLoaded', startWebSocket);
