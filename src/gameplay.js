let trialMode;
let level;
let coin; 
let warnaGaris;
let rows;
let column;
let letters;
let positions = {};
let solved = [];
let points = [];
let path = [];
let drawing = false;
let shuffledAnimation = false;

const correctAnswer = "GOGOGOG"


const ctx = Game.canvas.getContext('2d');

function setGameColor() {
    const colors = ['green', 'black', 'orange', 'blue'];
    const index = Math.floor(Math.random() * colors.length);
    warnaGaris = colors[index];
    document.documentElement.style.setProperty('--selected-color', warnaGaris);
}

function resizeCanvas() {
    Game.canvas.width = window.innerWidth;
    Game.canvas.height = window.innerHeight;
}

function createGrid(positions, jumlahBoxX, jumlahBoxY, terjawab) {
    const gridElement = document.getElementById('crossword-grid');
    gridElement.innerHTML = '';

    const grid = Array.from({ length: jumlahBoxY }, () =>
        Array.from({ length: jumlahBoxX }, () => '')
    );

    for (const [word, coords] of Object.entries(positions)) {
        for (let i = 0; i < coords.length; i++) {
            const y = parseInt(coords[i][0]);
            const x = parseInt(coords[i][1]);
            if (!grid[y][x]) grid[y][x] = { letter: '', shown: false };
            grid[y][x].letter = word[i];
        }
    }

    for (const word of solved) {
        const coords = positions[word] || [];
        for (let i = 0; i < coords.length; i++) {
            const y = parseInt(coords[i][0]);
            const x = parseInt(coords[i][1]);
            if (grid[y][x]) grid[y][x].shown = true;
            
        }
    }

    const boxes = [];

    grid.forEach((rowData, y) => {
        const row = document.createElement('div');
        row.className = 'crossword-row';

        rowData.forEach((cell, x) => {
            const box = document.createElement('div');
            box.className = 'cw-box';
            box.id = `box-${y}${x}`;
            

            if (!cell || !cell.letter) {
                box.classList.add('hide');
            } else {
                if (cell.shown) {
                    box.textContent = cell.letter;
                    box.classList.add('solved');
                }
            }

            row.appendChild(box);
            boxes.push({ el: box, delay: Math.random() * 600 });
        });

        gridElement.appendChild(row);
    });

    boxes.forEach(({ el, delay }) => {
        el.classList.add('opening')
    
    });
    
    setTimeout(() => {
        boxes.forEach(({ el, delay }) => {
            el.classList.remove('opening')
    });     
        
    }, 900);
}

function placeLetters(text) {
    const existingLetters = document.querySelectorAll('.letter');
    const circleRect = Game.circle.getBoundingClientRect();
    const centerX = circleRect.left + circleRect.width / 2;
    const centerY = circleRect.top + circleRect.height / 2;
    const radius = circleRect.width / 2 - 40;
    const total = text.length;
    const angleStep = 360 / total;
    
    points = [];
    
    for (let i = 0; i < total; i++) {
        const angleDeg = i * angleStep - 90;
        const angleRad = angleDeg * Math.PI / 180;
        const x = centerX + radius * Math.cos(angleRad);
        const y = centerY + radius * Math.sin(angleRad);
        const span = document.createElement('span');
        
        span.className = 'letter';
        span.textContent = text[i];
        span.id = "ltr-" + i;
        Game.game.appendChild(span);
       
        span.style.left = `${x}px`;
        span.style.top = `${y}px`;
        span.style.position = 'absolute';
        
        points.push({ x, y, id: i, used: false });
    }
    
    Game.shuffle_button.style.left = `${centerX}px`;
    Game.shuffle_button.style.top = `${centerY}px`;
    Game.shuffle_button.style.transform = 'translate(-50%, -50%)';
    
}


function getTouchPos(e) {
    const t = e.touches ? e.touches[0] : e;
    return { x: t.clientX, y: t.clientY };
}



// --- Fungsi getNearestPoint (tetap sama seperti modifikasi sebelumnya) ---
function getNearestPoint(pos) {
    const radius = 25; // Radius untuk deteksi sentuhan/mouse
    for (let p of points) {
        if (Math.hypot(p.x - pos.x, p.y - pos.y) < radius) {
            return p;
        }
    }
    return null;
}

// --- Fungsi startDraw (tetap sama seperti modifikasi sebelumnya) ---
function startDraw(e) {
    document.querySelectorAll('.letter').forEach(el => el.classList.remove('selected'));
    Game.hint_area.innerHTML = ''; // Membersihkan area hint
    e.preventDefault();
    ctx.clearRect(0, 0, Game.canvas.width, Game.canvas.height);
    for (let p of points) p.used = false;
    path = [];
    drawing = true;
    moveDraw(e); // Panggil moveDraw untuk memulai menggambar dari titik awal
}

// --- Fungsi moveDraw (Ada Perubahan di Sini) ---
function moveDraw(e) {
    if (!drawing) return;

    const pos = getTouchPos(e);
    const p = getNearestPoint(pos); // Dapatkan titik terdekat berdasarkan posisi saat ini

    // Dapatkan huruf terakhir dan kedua terakhir di jalur
    const lastPointInPath = path[path.length - 1];
    const secondLastPointInPath = path[path.length - 2];

    if (p) { // Jika ada huruf yang terdeteksi di bawah kursor/sentuhan
        // Logika UNTUK MENGHAPUS (UNDO):
        // Jika path memiliki setidaknya 2 elemen, DAN
        // Titik yang sedang di-hover/sentuh (p) adalah titik KEDUA TERAKHIR di path
        if (path.length >= 2 && p.id === secondLastPointInPath.id) {
            // Hapus huruf terakhir dari path
            const removedPoint = path.pop();
            // Tandai huruf yang dihapus sebagai tidak digunakan lagi
            points[removedPoint.id].used = false;

            // Hapus kelas 'selected' dari huruf yang dibatalkan (huruf yang baru saja dihapus)
            document.querySelectorAll('.letter')[removedPoint.id].classList.remove('selected');

            // Hapus hintLetter terakhir dari hint_area
            const lastHintLetter = Game.hint_area.lastElementChild;
            if (lastHintLetter) {
                lastHintLetter.remove();
            }

        }
        // Logika UNTUK MENAMBAH:
        // Jika titik terdekat belum digunakan (belum ada di path ini) DAN
        // Bukan titik yang sama dengan huruf terakhir di path (untuk mencegah duplikasi jika kursor diam di atas huruf terakhir)
        else if (!p.used && (!lastPointInPath || p.id !== lastPointInPath.id)) {
            p.used = true; // Tandai huruf sebagai sudah digunakan
            path.push(p);

            document.querySelectorAll('.letter')[p.id].classList.add('selected');
            Game.hint_area.classList.add('show');
            Game.shuffle_button.style.display = 'none';

            // Tambahkan hintLetter baru ke hint_area
            const hintLetter = document.createElement('span');
            hintLetter.id = "hint-" + path.length;
            hintLetter.textContent = letters[p.id];
            Game.hint_area.appendChild(hintLetter);
            
        }
    }

    // --- Menggambar ulang garis ---
    ctx.clearRect(0, 0, Game.canvas.width, Game.canvas.height);
    ctx.lineWidth = 10;
    ctx.strokeStyle = warnaGaris;
    ctx.beginPath();
    for (let i = 0; i < path.length; i++) {
        const pt = path[i];
        if (i === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
    }
    // Gambar garis ke posisi kursor saat ini HANYA jika path tidak kosong
    if (path.length > 0) {
        ctx.lineTo(pos.x, pos.y);
    }
    ctx.stroke();
}



function endDraw(e) {
    if (!drawing) return;
    drawing = false;

    // Pastikan path tidak kosong sebelum memproses
    if (path.length === 0) {
        // Jika tidak ada huruf yang dipilih, kosongkan tampilan dan reset
        ctx.clearRect(0, 0, Game.canvas.width, Game.canvas.height); // Gunakan Game.canvas
        document.querySelectorAll('.letter').forEach(el => el.classList.remove('selected'));
        Game.shuffle_button.style.display = 'flex'; // Tampilkan kembali shuffle button
        Game.hint_area.innerHTML = ''; // Bersihkan area hint
        Game.hint_area.classList.remove('show'); // Sembunyikan hint area
        path = [];
        for (let p of points) p.used = false; // Reset status used
        return; // Hentikan eksekusi selanjutnya
    }

    const result = path.map(p => letters[p.id]).join('');
    // Tidak perlu .trim() jika Anda sudah memastikan path tidak kosong

    const isCorrect = result === correctAnswer;
    ctx.clearRect(0, 0, Game.canvas.width, Game.canvas.height); // Gunakan Game.canvas
    ctx.lineWidth = 10;
    ctx.strokeStyle = isCorrect ? 'lime' : 'red';
    ctx.beginPath();
    for (let i = 0; i < path.length; i++) {
        const pt = path[i];
        if (i === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
    }
    ctx.stroke();

    // Fungsi ini harus ada dan menangani hasil jawaban
    processResultAnswer(result);

    setTimeout(() => {
        document.querySelectorAll('.letter').forEach(el => el.classList.remove('selected'));
        Game.hint_area.innerHTML = ''; // Bersihkan area hint
        Game.hint_area.classList.remove('show'); // Sembunyikan hint area
        ctx.clearRect(0, 0, Game.canvas.width, Game.canvas.height); // Gunakan Game.canvas
        Game.shuffle_button.style.display = 'flex'; // Tampilkan kembali shuffle button
        path = [];
        for (let p of points) p.used = false; // Reset status used untuk semua huruf
    }, isCorrect ? 200 : 500); // Mungkin durasi sedikit lebih lama jika salah
}


function processResultAnswer(result) {
    let isCorrect = false;
    //jawaban sudah ada
    if (solved.includes(result)) {
        const data = positions[result];
        for ( const item of data) {
            document.getElementById(`box-${item}`).classList.add('filled')
            setTimeout(() => {
                document.getElementById(`box-${item}`).classList.remove('filled')
            }, 500);
        
        
        }
        Game.hint_area.innerHTML = '';
        return;
    }
    
    //jawaban benar dan belum ada
    if (Object.keys(positions).includes(result) && !solved.includes(result) ) {
        const data = positions[result];
        
        AnimationCorrectAnswer(data, result);
        solved.push(result);
        
        if (Object.keys(positions).length === solved.length) {
            terjawab = [];
            setTimeout(() => {
            Game.game.style.display = 'none';
            Home.home.style.display = 'flex';
            clearPageGame();
            alert("kamu sudah selesai bro")
            }, 2000);
            
        }
        return;
        
    }
    Game.hint_area.classList.add('wrong')
    setTimeout(() => {
        Game.hint_area.classList.remove('wrong')
        Game.hint_area.classList.remove('show');
        Game.hint_area.innerHTML = '';
    }, 200);
    
}

function shuffleString(str) {
  // 1. Ubah string menjadi array karakter
  const arr = str.split('');

  arr.sort(() => 0.5 - Math.random());

  // 3. Gabungkan kembali array menjadi string
  return arr.join('');
}

function animateShuffle2(text) {
    const spans = document.querySelectorAll('.letter');
    const circleRect = circle.getBoundingClientRect();
    const centerX = circleRect.left + circleRect.width / 2;
    const centerY = circleRect.top + circleRect.height / 2;
    const radius = circleRect.width / 2 - 40;
    const total = text.length;
    const angleStep = 360 / total;

    points = [];
    
    const newLetters = text.split('')
    const oldLetters = letters.split('')
    

    for (let i = 0; i < text.length; i++) {
        const angleDeg = i * angleStep - 90;
        const angleRad = angleDeg * Math.PI / 180;
        const x = centerX + radius * Math.cos(angleRad);
        const y = centerY + radius * Math.sin(angleRad);
        const oldIndex = oldLetters.indexOf(newLetters[i])
        const span = document.getElementById(`ltr-${oldIndex}`)
        
        span.style.transition = 'all 0.3s ease';
        span.style.left = `${x}px`;
        span.style.top = `${y}px`;
        span.style.position = 'absolute'
        points.push({ x, y, id: oldIndex, used: false });
    };

    
    shuffledAnimation = false;
    console.log(letters)
}


function clearPageGame() {
    // Menghapus elemen dengan class 'letter'
    const lettersToRemove = document.querySelectorAll('.letter');
    lettersToRemove.forEach(letterElement => {
        letterElement.remove(); // Menghapus setiap elemen letter dari DOM
    });

    // Menghapus konten dari grid_element (jika ada elemen lain di sana)
    Game.grid_element.innerHTML = '';

    // Membersihkan area hint
    Game.hint_area.innerHTML = '';
    Game.hint_area.classList.remove('show'); // Pastikan juga menyembunyikan area hint

    // Mengembalikan shuffle button ke tampilan semula (jika disembunyikan sebelumnya)
    Game.shuffle_button.style.display = 'flex'; // Atau 'block', tergantung kebutuhan layout Anda

    // Mereset canvas (jika ada gambar garis yang tersisa)
    if (ctx && Game.canvas) { // Pastikan ctx dan Game.canvas sudah terdefinisi
        ctx.clearRect(0, 0, Game.canvas.width, Game.canvas.height);
    }

    // Mereset state game jika diperlukan
    // Misalnya, jika ada variabel global seperti 'path', 'drawing', 'points'
    if (typeof path !== 'undefined') path = [];
    if (typeof drawing !== 'undefined') drawing = false;
    // Jika 'points' juga perlu di-reset state 'used' nya, Anda bisa melakukannya di sini
    if (typeof points !== 'undefined') {
        points.forEach(p => p.used = false);
    }
}


function getDataGameFromCloud() {
    //disini nanti logika sikronisasi data dari telegram
    rows = 7;
    column = 7;
    positions = {"ALI":["04","05","06"],"GILA":["32","33","34","35"],"GULA":["50","51","52","53"],"IGA":["40","50","60"],"GALI":["32","42","52","62"],"LIGA":["05","15","25","35"]};
    solved = ["IGA", "LIGA"];
    letters = "GALIU";

}


function initGame() {
    getDataGameFromCloud();
    Home.home.style.display = 'none';
    Game.game.style.display = 'flex';
    setGameColor();
    createGrid(positions, rows, column, solved);
    placeLetters(letters);
    resizeCanvas();
    bindGameEvent();
    Game.hint_button.style.right = '5vw';
    Game.word_button.style.left = '5vw';
}

function requestHint() {
    Game.hint_button.style.zIndex = '1000';
    Game.overlay.style.display = 'flex';
}

function startGame() {}
function stopGame() {}
function processGameResult() {}

function bindGameEvent() {
    Game.canvas.addEventListener('touchstart', startDraw, { passive: false });
    Game.canvas.addEventListener('touchmove', moveDraw, { passive: false });
    Game.canvas.addEventListener('touchend', endDraw);
    window.addEventListener('resize', resizeCanvas);
    Game.shuffle_button.addEventListener('click', () => {
        if (shuffledAnimation) return;
        shuffledAnimation = true;
        const newLetter = shuffleString(letters);
        animateShuffle2(newLetter);
        
        
    });

}

