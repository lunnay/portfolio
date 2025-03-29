const audio = document.getElementById('audio-source');
const playPauseBtn = document.getElementById('play-pause');
const nextBtn = document.getElementById('next-track');
const prevBtn = document.getElementById('previous-track');
const progressBar = document.getElementById('progress-bar');
const volumeBar = document.getElementById('progress-bar-volume');
const artistName = document.getElementById('artist-name');
const songTitle = document.getElementById('artist-song');
const currentTimeDisplay = document.getElementById('songlength-current');
const totalTimeDisplay = document.getElementById('songlength');
const timelineContainer = document.querySelector('.audio_timeline > div');
const draggable = document.getElementById('draggable');
const volumeBtn = document.getElementById('volume');
const volumePopout = document.getElementById('volume-popout');
const volumeContainer = document.querySelector('#volume-popout > div');
const draggableVolume = document.getElementById('draggable-volume');

const playlist = [
    { title: "", artist: "", source: "" },
];

let currentTrackIndex = 0;
let isPlaying = false;
let isShuffle = false;
let shuffledPlaylist = [];
let isRepeat = false;
let isTimelineDragging = false;
let isPlayPending = false;
let isVolumeDragging = false;
let currentVolume = 1;
let wasPlayingBeforeDrag = false;
let audioReady = false;

async function loadTrack(index) {
    if (isPlayPending) await new Promise(resolve => setTimeout(resolve, 100));
    
    currentTrackIndex = index;
    const track = playlist[index];
    
    audio.src = track.source;
    artistName.textContent = track.artist;
    songTitle.textContent = track.title;
    
    await new Promise(resolve => {
        audio.addEventListener('loadedmetadata', resolve, { once: true });
    });
    
    audioReady = true;
    totalTimeDisplay.textContent = formatTime(audio.duration);
    currentTimeDisplay.textContent = '0:00';
}

async function togglePlayPause() {
    if (!audioReady) return;
    
    try {
        if (isPlaying) {
            audio.pause();
            playPauseBtn.style.backgroundPosition = '-92px 0px';
            isPlaying = false;
        } else {
            isPlayPending = true;
            await audio.play();
            playPauseBtn.style.backgroundPosition = '-46px 0px';
            isPlaying = true;
        }
    } catch (error) {
        console.log('Playback error:', error);
    } finally {
        isPlayPending = false;
    }
}

async function nextTrack() {
    if (isShuffle && shuffledPlaylist.length > 0) {
        const currentShuffleIndex = shuffledPlaylist.indexOf(currentTrackIndex);
        currentTrackIndex = shuffledPlaylist[(currentShuffleIndex + 1) % shuffledPlaylist.length];
    } else {
        currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
    }
    
    await loadTrack(currentTrackIndex);
    
    if (isPlaying) {
        try {
            await audio.play();
            playPauseBtn.style.backgroundPosition = '-46px 0px';
        } catch (error) {
            console.log('Autoplay error:', error);
            isPlaying = false;
        }
    }
}

function previousTrack() {
    if (isShuffle && shuffledPlaylist.length > 0) {
        const currentShuffleIndex = shuffledPlaylist.indexOf(currentTrackIndex);
        currentTrackIndex = shuffledPlaylist[(currentShuffleIndex - 1 + shuffledPlaylist.length) % shuffledPlaylist.length];
    } else {
        currentTrackIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
    }
    
    loadTrack(currentTrackIndex);
    if (isPlaying) audio.play();
}

function updateTimelinePosition(e) {
    const rect = timelineContainer.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const ratio = x / rect.width;
    
    progressBar.style.width = `${ratio * 100}%`;
    currentTimeDisplay.textContent = formatTime(ratio * audio.duration);
}

function createShuffledPlaylist() {
    shuffledPlaylist = [...Array(playlist.length).keys()];
    const currentIndex = shuffledPlaylist.indexOf(currentTrackIndex);
    
    if (currentIndex > -1) shuffledPlaylist.splice(currentIndex, 1);
    
    for (let i = shuffledPlaylist.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledPlaylist[i], shuffledPlaylist[j]] = [shuffledPlaylist[j], shuffledPlaylist[i]];
    }
    
    shuffledPlaylist.unshift(currentTrackIndex);
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    seconds = Math.floor(seconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function updateVolumePosition(e) {
    const rect = volumeContainer.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const ratio = x / rect.width;
    
    volumeBar.style.width = `${ratio * 100}%`;
    audio.volume = ratio;
    currentVolume = ratio;
}

draggable.addEventListener('mousedown', e => {
    if (!audioReady) return;
    
    isTimelineDragging = true;
    wasPlayingBeforeDrag = isPlaying;
    if (isPlaying) audio.pause();
    
    updateTimelinePosition(e);
    timelineContainer.classList.add('is-dragging');
    e.preventDefault();
});

document.addEventListener('mousemove', e => {
    if (isTimelineDragging && audioReady) updateTimelinePosition(e);
});

document.addEventListener('mouseup', async e => {
    if (!isTimelineDragging) return;
    
    timelineContainer.classList.remove('is-dragging');
    isTimelineDragging = false;
    
    if (audioReady) {
        const rect = timelineContainer.getBoundingClientRect();
        audio.currentTime = ((e.clientX - rect.left) / rect.width) * audio.duration;
        
        if (wasPlayingBeforeDrag) {
            try {
                await audio.play();
                playPauseBtn.style.backgroundPosition = '-46px 0px';
                isPlaying = true;
            } catch (error) {
                console.log('Playback restart error:', error);
            }
        }
    }
});

document.getElementById('shuffle').addEventListener('click', function() {
    isShuffle = !isShuffle;
    this.style.backgroundColor = isShuffle ? '#00FF00' : '';
    if (isShuffle) createShuffledPlaylist();
});

document.getElementById('repeat').addEventListener('click', function() {
    isRepeat = !isRepeat;
    this.style.backgroundColor = isRepeat ? '#00FF00' : '';
});

audio.addEventListener('loadedmetadata', () => {
    audioReady = true;
    totalTimeDisplay.textContent = formatTime(audio.duration);
});

audio.addEventListener('timeupdate', () => {
    if (!isTimelineDragging && audioReady) {
        const progress = (audio.currentTime / audio.duration) * 100;
        progressBar.style.width = `${progress}%`;
        currentTimeDisplay.textContent = formatTime(audio.currentTime);
    }
});

audio.addEventListener('ended', () => {
    if (isRepeat) {
        audio.currentTime = 0;
        audio.play();
    } else {
        nextTrack();
    }
});

playPauseBtn.addEventListener('click', togglePlayPause);
nextBtn.addEventListener('click', nextTrack);
prevBtn.addEventListener('click', previousTrack);

draggableVolume.addEventListener('mousedown', e => {
    isVolumeDragging = true;
    updateVolumePosition(e);
    e.preventDefault();
});

document.addEventListener('mousemove', e => {
    if (isVolumeDragging) updateVolumePosition(e);
});

document.addEventListener('mouseup', () => isVolumeDragging = false);

volumeBtn.addEventListener('click', e => {
    volumePopout.style.display = volumePopout.style.display === 'none' ? 'flex' : 'none';
    e.stopPropagation();
});

document.addEventListener('click', e => {
    if (!volumePopout.contains(e.target) && e.target !== volumeBtn) {
        volumePopout.style.display = 'none';
    }
});

audio.volume = currentVolume;
volumeBar.style.width = `${currentVolume * 100}%`;
loadTrack(currentTrackIndex);