//global obj
const loadedAudio = {};
const loadedImages = {};

let progress = 0;
let intervalId;

function preLoading(status) {
    const preloaderContainer = document.getElementById('preloader-container');
    const progressBar = document.getElementById('preloader-status-bar');
   
    if (status) {
      preloaderContainer.style.display = 'flex';
      progress = 0;
      
      clearInterval(intervalId); // Hentikan interval sebelumnya jika ada
      intervalId = setInterval(() => {
        progressBar.style.width = `${progress}%`;
       
        if (progress >= 100) {
          clearInterval(intervalId);
          setTimeout(() => {
            preLoading(false);
          }, 2000); 
        }
      }, 1000); 
    } else {
      preloaderContainer.style.display = 'none';
      document.getElementById('home').style.display = 'flex';
      clearInterval(intervalId); // hentikan interval
    }
}



async function loadAudioAssets(audioUrls) {
  const promises = [];
  for (const key in audioUrls) {
    const audioUrl = audioUrls[key];
    const promise = new Promise((resolve, reject) => {
      const audio = new Audio();
      audio.addEventListener('canplaythrough', () => {
        loadedAudio[key] = audio; // Simpan ke objek loadedAudio global
        resolve();
      });
      audio.addEventListener('error', () => {
        reject(new Error(`Gagal memuat audio: ${audioUrl}`));
      });
      audio.src = audioUrl;
    });
    promises.push(promise);
  }
  return Promise.all(promises);
}

const audiosToLoad = {
  correct: '/assets/audios/sound/correct.mp3',
};



async function loadImagesAssets(imageUrls) {
  const promises = [];

  for (const key in imageUrls) {
    const imageUrl = imageUrls[key];
    const promise = new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        loadedImages[key] = img; // Simpan gambar ke objek global
        resolve();
      };
      img.onerror = () => {
        reject(new Error(`Gagal memuat gambar: ${imageUrl}`));
      };
      img.src = imageUrl;
    });
    promises.push(promise);
  }

  return Promise.all(promises);
}

const imagesToLoad = {
  background: 'assets/img/pemandangan-malam2.jpg',
};



function bindHomeEvent() {
    Home.play_button.addEventListener('click', () => {
        initGame();
    });
}

function unbindHomeEvent() {}

async function initMiniApp(){
    try {
        preLoading(true);
        const musicLoaded = await loadAudioAssets(audiosToLoad);
        progress += 50;
        const imgLoaded = await loadImagesAssets(imagesToLoad);
        progress += 40;
        document.body.style.backgroundImage = `url('${loadedImages.background.src}')`;
        progress += 10;
        bindHomeEvent();
    } catch (error) {
        console.error('Gagal memuat beberapa atau semua gambar:', error.message);
    }
    
}

document.addEventListener('DOMContentLoaded', initMiniApp);
