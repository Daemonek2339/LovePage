// main.js — wersja zoptymalizowana (te same funkcje, mniej pracy dla przeglądarki)
document.addEventListener('DOMContentLoaded', () => {

    // Telefon / ekran dotykowy → lżejsze efekty
    const isTouch = window.matchMedia('(hover: none)').matches;
    const isLowPower = window.matchMedia('(max-width: 768px), (pointer: coarse)').matches;

    // 0. Poświata napisów używa atrybutu data-text (kopia tekstu rysowana przez CSS)
    document.querySelectorAll('.neon-text-mega, .neon-text-sub, .hero-subtitle').forEach(el => {
        if (!el.dataset.text) el.dataset.text = el.textContent.trim();
    });

    // 1. Nawigacja zakładek SPA
    const navLinks = document.querySelectorAll('.nav-links a');
    const navList = document.querySelector('.nav-links');
    const sections = document.querySelectorAll('section');
    let currentSection = document.querySelector('section.active-section');
    let showTimer = null;
    let hideTimer = null;

    function switchSection(target) {
        clearTimeout(showTimer);
        clearTimeout(hideTimer);
        currentSection = target;
        sections.forEach(sec => sec.classList.remove('active-section'));

        showTimer = setTimeout(() => {
            target.style.display = 'flex';
            target.scrollTop = 0;
            void target.offsetWidth; // wymusza reflow, żeby animacja wejścia ruszyła
            target.classList.add('active-section');
        }, 300);

        hideTimer = setTimeout(() => {
            sections.forEach(sec => { if (sec !== target) sec.style.display = 'none'; });
        }, 400);
    }

    // Na telefonie pasek zakładek się przewija — wyśrodkuj klikniętą zakładkę
    function centerNavLink(link) {
        if (!navList || navList.scrollWidth <= navList.clientWidth) return;
        const l = link.getBoundingClientRect();
        const n = navList.getBoundingClientRect();
        navList.scrollBy({ left: (l.left + l.width / 2) - (n.left + n.width / 2), behavior: 'smooth' });
    }

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.getElementById(link.getAttribute('href').substring(1));
            if (!target) return;

            navLinks.forEach(nav => nav.classList.remove('active-nav'));
            link.classList.add('active-nav');
            centerNavLink(link);

            if (target !== currentSection) switchSection(target);
        });
    });

    // 2. Licznik czasu (aktualizuje tylko to, co się zmieniło, i tylko gdy karta jest widoczna)
    const startDate = new Date("2026-11-20T00:00:00").getTime();
    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minsEl = document.getElementById('minutes');
    const secsEl = document.getElementById('seconds');

    function setText(el, value) {
        if (el && el.textContent !== value) el.textContent = value;
    }

    function updateCounter() {
        const diff = Date.now() - startDate;
        if (diff <= 0) return;
        const total = Math.floor(diff / 1000);
        setText(daysEl, String(Math.floor(total / 86400)));
        setText(hoursEl, String(Math.floor((total % 86400) / 3600)).padStart(2, '0'));
        setText(minsEl, String(Math.floor((total % 3600) / 60)).padStart(2, '0'));
        setText(secsEl, String(total % 60).padStart(2, '0'));
    }

    function counterTick() {
        if (!document.hidden) updateCounter();
        setTimeout(counterTick, 1000 - (Date.now() % 1000) + 5); // równo z zegarem
    }
    counterTick();

    // 3. Lewitujące serca (limit liczby, pauza gdy karta w tle, mniej na telefonie)
    const heartsContainer = document.getElementById('hearts-container');
    const MAX_HEARTS = isLowPower ? 8 : 16;
    const HEART_INTERVAL = isLowPower ? 1100 : 650;
    let heartCount = 0;

    function createHeart() {
        if (!heartsContainer || document.hidden || heartCount >= MAX_HEARTS) return;

        const heart = document.createElement('div');
        heart.className = 'floating-heart ' + (Math.random() > 0.5 ? 'heart-pink' : 'heart-purple');
        heart.textContent = '❤';

        const size = Math.random() * 0.8 + 0.3;
        const sway = (Math.random() * 200 - 100);
        const rot = (Math.random() * 90 - 45);
        const duration = (Math.random() * 6 + 6);
        const opacity = Math.random() * 0.4 + 0.1;

        heart.style.cssText =
            `left:${Math.random() * 100}vw;--s:${size};--sway:${sway}px;--rot:${rot}deg;--op:${opacity};--duration:${duration}s`;

        heart.addEventListener('animationend', () => { heart.remove(); heartCount--; }, { once: true });
        heartsContainer.appendChild(heart);
        heartCount++;
    }
    setInterval(createHeart, HEART_INTERVAL);

    // 4. Odtwarzacz muzyczny
    const songs = ['Bedoes & Lanek - 1998 (mam to we krwi).mp3', 'Bedoes - VOGUE.mp3'];
    let songIndex = 0;
    let isPlaying = false;
    const audio = new Audio();
    audio.preload = 'metadata'; // nie pobieraj całych plików mp3 zaraz po wejściu na stronę

    const playBtn = document.getElementById('play-btn');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const trackName = document.getElementById('track-name');
    const progress = document.getElementById('progress');
    const progressContainer = document.getElementById('progress-container');
    const vinyl = document.getElementById('vinyl');
    const currentTimeEl = document.getElementById('current-time');
    const totalTimeEl = document.getElementById('total-time');

    function formatTime(seconds) {
        if (isNaN(seconds)) return "0:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }

    function setPlayingUI(playing) {
        isPlaying = playing;
        if (playBtn) playBtn.textContent = playing ? '⏸' : '▶';
        if (vinyl) vinyl.classList.toggle('playing', playing);
    }

    function updateProgress() {
        if (document.hidden || !audio.duration) return;
        if (progress) progress.style.transform = `scaleX(${audio.currentTime / audio.duration})`;
        if (currentTimeEl) currentTimeEl.textContent = formatTime(audio.currentTime);
    }

    function loadSong(song) {
        if (trackName) trackName.textContent = song.replace('.mp3', '');
        audio.src = song;
        if (progress) progress.style.transform = 'scaleX(0)';
        if (currentTimeEl) currentTimeEl.textContent = '0:00';
        if (totalTimeEl) totalTimeEl.textContent = '0:00';
    }

    function playAudio() {
        const result = audio.play();
        setPlayingUI(true);
        if (result && result.catch) {
            result.catch((err) => {
                if (err && err.name === 'AbortError') return; // przerwane zmianą utworu — to normalne
                setPlayingUI(false); // np. brak pliku mp3 albo blokada autoodtwarzania
            });
        }
    }

    function togglePlay() {
        if (audio.paused) {
            playAudio();
        } else {
            audio.pause();
            setPlayingUI(false);
        }
    }

    function changeSong(step) {
        songIndex = (songIndex + step + songs.length) % songs.length;
        loadSong(songs[songIndex]);
        if (isPlaying) playAudio();
    }

    loadSong(songs[songIndex]);

    audio.addEventListener('loadedmetadata', () => {
        if (totalTimeEl) totalTimeEl.textContent = formatTime(audio.duration);
    });
    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', () => changeSong(1));
    document.addEventListener('visibilitychange', updateProgress);

    if (playBtn) playBtn.addEventListener('click', togglePlay);
    if (prevBtn) prevBtn.addEventListener('click', () => changeSong(-1));
    if (nextBtn) nextBtn.addEventListener('click', () => changeSong(1));

    // Przewijanie: kliknięcie/dotknięcie paska oraz przeciąganie palcem lub myszką
    if (progressContainer) {
        let seeking = false;

        function seekFromEvent(e) {
            if (!audio.duration) return;
            const rect = progressContainer.getBoundingClientRect();
            const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
            audio.currentTime = ratio * audio.duration;
            updateProgress();
        }

        progressContainer.addEventListener('pointerdown', (e) => {
            seeking = true;
            progressContainer.setPointerCapture(e.pointerId);
            seekFromEvent(e);
        });
        progressContainer.addEventListener('pointermove', (e) => { if (seeking) seekFromEvent(e); });
        progressContainer.addEventListener('pointerup', () => { seeking = false; });
        progressContainer.addEventListener('pointercancel', () => { seeking = false; });
    }

    // 5. Powiększanie Zdjęć (Lightbox)
    const photos = document.querySelectorAll('.photo-placeholder');
    const lightbox = document.getElementById('lightbox');
    const closeLightbox = document.getElementById('close-lightbox');
    const lightboxTitle = document.getElementById('lightbox-title');
    const lightboxImgPlaceholder = document.getElementById('lightbox-img-placeholder');

    photos.forEach(photo => {
        photo.addEventListener('click', () => {
            const title = photo.getAttribute('data-title');
            if (lightboxTitle) lightboxTitle.textContent = title;
            if (lightboxImgPlaceholder) lightboxImgPlaceholder.textContent = "Podgląd: " + title;
            if (lightbox) lightbox.classList.remove('hidden');
        });
    });

    if (closeLightbox && lightbox) {
        closeLightbox.addEventListener('click', () => { lightbox.classList.add('hidden'); });
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) lightbox.classList.add('hidden');
        });
    }

    // 6. Obsługa Listu
    const letterOverlay = document.getElementById('letter-overlay');
    const openLetterBtn = document.getElementById('open-letter-btn');
    const closeLetterBtn = document.getElementById('close-letter-btn');
    let letterCloseTimer = null;

    function openLetter() {
        clearTimeout(letterCloseTimer);
        letterOverlay.classList.remove('hidden');
        void letterOverlay.offsetWidth; // reflow — dzięki temu animacja 3D zawsze startuje od stanu początkowego
        letterOverlay.classList.add('is-open');
    }

    // Zamykanie czeka, aż animacja zniknięcia (1.5s) się skończy
    function closeLetter() {
        letterOverlay.classList.remove('is-open');
        clearTimeout(letterCloseTimer);
        letterCloseTimer = setTimeout(() => {
            if (!letterOverlay.classList.contains('is-open')) letterOverlay.classList.add('hidden');
        }, 1500);
    }

    if (openLetterBtn && letterOverlay) openLetterBtn.addEventListener('click', openLetter);

    if (closeLetterBtn && letterOverlay) {
        closeLetterBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            closeLetter();
        });
    }

    if (letterOverlay) {
        letterOverlay.addEventListener('click', (e) => {
            // Zamykaj tylko jeśli kliknięto w samo tło, a nie w treść listu
            if (e.target === letterOverlay) closeLetter();
        });
    }

    // Klawisz Esc zamyka list lub podgląd zdjęcia
    document.addEventListener('keydown', (e) => {
        if (e.key !== 'Escape') return;
        if (letterOverlay && letterOverlay.classList.contains('is-open')) closeLetter();
        else if (lightbox && !lightbox.classList.contains('hidden')) lightbox.classList.add('hidden');
    });

    // 7. Eksplozja Iskier na kliknięcie
    const SPARKLE_COUNT = isLowPower ? 6 : 10;
    document.addEventListener('click', (e) => {
        const target = e.target;
        if (!(target instanceof Element)) return;
        const tag = target.tagName.toLowerCase();
        if (['button', 'input', 'a', 'label'].includes(tag) ||
            target.closest('.bucket-list, #lightbox, .player-btn, #close-letter-btn')) return;

        const fragment = document.createDocumentFragment();
        for (let i = 0; i < SPARKLE_COUNT; i++) {
            const particle = document.createElement('div');
            particle.className = 'sparkle-burst ' + (Math.random() > 0.5 ? 'sparkle-pink' : 'sparkle-purple');

            const size = Math.random() * 6 + 4;
            const angle = Math.random() * Math.PI * 2;
            const velocity = Math.random() * 80 + 30;
            particle.style.cssText =
                `width:${size}px;height:${size}px;left:${e.clientX}px;top:${e.clientY}px;` +
                `--tx:${Math.cos(angle) * velocity}px;--ty:${Math.sin(angle) * velocity}px`;

            particle.addEventListener('animationend', () => particle.remove(), { once: true });
            fragment.appendChild(particle);
        }
        document.body.appendChild(fragment);
    });

    // 8. Neonowy kotek
    const cat = document.getElementById('neon-cat');
    let catTimer = null;
    if (cat) {
        cat.addEventListener('click', () => {
            cat.classList.add('active');
            const msgs = ["Miau~", "Purrr... 💜", "Meow! ✨"];
            const msgEl = cat.querySelector('.cat-message');
            if (msgEl) msgEl.textContent = msgs[Math.floor(Math.random() * msgs.length)];
            clearTimeout(catTimer);
            catTimer = setTimeout(() => cat.classList.remove('active'), 2000);
        });
    }

    // 9. Karty "Za co Cię uwielbiam" na telefonie odwracają się dotknięciem (na komputerze — najechaniem)
    if (isTouch) {
        document.querySelectorAll('.flip-card').forEach(card => {
            card.addEventListener('click', () => card.classList.toggle('flipped'));
        });
    }
});
