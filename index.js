const SLIDER_TRANSITION_DURATION = 300;
const DEFAULT_LANGUAGE = 'en';
class ImageSlider {
    constructor(container) {
        this.container = container;
        this.images = container.dataset.images?.split(',')?.map(img => img.trim()) || [];
        this.currentIndex = 0;
        this.navTimeout = null;

        this.textElement = container.closest('.textinfo1')?.querySelector('.textinfo2');
        this.textKeys = this.textElement?.dataset.i18n?.split(',').map(k => k.trim()) || [];

        this.imageElement = container.querySelector('.spoopy');
        this.prevBtn = container.querySelector('.pic-click:nth-child(1)');
        this.nextBtn = container.querySelector('.pic-click:nth-child(2)');
        this.indicators = container.querySelectorAll('.pic-indicator');

        if (!this.imageElement || !this.prevBtn || !this.nextBtn) {
            return;
        }

        this.boundPrev = this.prev.bind(this);
        this.boundNext = this.next.bind(this);

        this.initialize();
        this.addEventListeners();
        sliders.push(this);
    }

    initialize() {
        this.imageElement.src = this.images[this.currentIndex];
        this.updateText();
        this.updateIndicators();
    }

    updateText() {
        if (!this.textElement || !translations || Object.keys(translations).length === 0) return;
        const key = this.textKeys[this.currentIndex];
        this.textElement.innerHTML = translations[currentLang]?.[key] ?? '';
    }

    addEventListeners() {
        this.prevBtn.addEventListener('click', this.boundPrev);
        this.nextBtn.addEventListener('click', this.boundNext);
    }

    destroy() {
        this.prevBtn.removeEventListener('click', this.boundPrev);
        this.nextBtn.removeEventListener('click', this.boundNext);
    }

    prev() {
        clearTimeout(this.navTimeout);
        this.navTimeout = setTimeout(() => {
            this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
            this.updateSlider();
        }, 100);
    }

    next() {
        clearTimeout(this.navTimeout);
        this.navTimeout = setTimeout(() => {
            this.currentIndex = (this.currentIndex + 1) % this.images.length;
            this.updateSlider();
        }, 100);
    }

    updateSlider() {
        this.imageElement.src = this.images[this.currentIndex];
        this.updateText();
        this.updateIndicators();
    }

    updateIndicators() {
        if (!this.indicators) return;
        this.indicators.forEach((indicator, index) => {
            indicator.style.backgroundColor = index === this.currentIndex ? 'white' : 'teal';
        });
    }
}

let currentLang = DEFAULT_LANGUAGE;
let currentOverlay = null;
let scrollPosition = { x: 0, y: 0 };
let translations = {};
let sliders = [];

async function loadTranslations() {
    try {
        const response = await fetch('translations.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        translations = await response.json();
    } catch (error) {
        console.error('Error loading translations:', error);
        translations = { [DEFAULT_LANGUAGE]: {} };
    }
}

function toggleLanguageMenu() {
    const menu = document.getElementById("languagecontainer");
    menu.classList.toggle('visible');
}

async function setLanguage(lang, estrangeiroMode = false) {
    currentLang = lang;
    
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        element.innerHTML = translations[currentLang]?.[key] ?? ''; 
    });
    
    sliders.forEach(slider => slider.updateText());
    localStorage.setItem('language', lang);

    document.documentElement.classList.toggle('estrangeiro-mode', 
        lang === 'en' && estrangeiroMode
    );
    localStorage.setItem('estrangeiroMode', estrangeiroMode ? 'true' : 'false');
}

// overlay shit
function createOverlay(imageUrl) {
    if (currentOverlay) return;

    scrollPosition = {
        x: window.scrollX || window.pageXOffset,
        y: window.scrollY || window.pageYOffset
    };

    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    
    const img = new Image();
    img.className = 'overlay-img';
    img.src = imageUrl;

    const close = () => {
        if (!overlay.classList.contains('active')) return;
        
        overlay.classList.remove('active');
        setTimeout(() => {
            document.documentElement.classList.remove('overlay-active');
            document.body.classList.remove('overlay-active');
            overlay.remove();
            currentOverlay = null;
            document.removeEventListener('keydown', handleKeyPress);
            window.scrollTo(scrollPosition.x, scrollPosition.y);
        }, 300);
    };

    const handleKeyPress = (e) => e.key === 'Escape' && close();

    overlay.onclick = close;
    document.addEventListener('keydown', handleKeyPress);

    overlay.appendChild(img);
    document.body.appendChild(overlay);
    
    document.documentElement.classList.add('overlay-active');
    document.body.classList.add('overlay-active');
    
    currentOverlay = overlay;

    requestAnimationFrame(() => {
        overlay.classList.add('active');
    });
}

// clipboard shit
function handleDiscordClick() {
    const discordElement = document.querySelector('.discord');
    const existingMsg = discordElement.querySelector('.copied-message');
    if (existingMsg) existingMsg.remove();

    navigator.clipboard.writeText(document.querySelector('.discord_text').textContent)
        .then(() => {
            const message = translations[currentLang]?.copied || 'copied!';
            const msg = document.createElement('div');
            msg.className = 'copied-message';
            msg.innerHTML = message;
            discordElement.appendChild(msg);

            msg.addEventListener('animationend', () => msg.remove());
        })
        .catch(console.error);
}

// start
document.addEventListener('DOMContentLoaded', async () => {
    await loadTranslations();
    
    const savedLang = localStorage.getItem('language') || DEFAULT_LANGUAGE;
    const isEstrangeiro = localStorage.getItem('estrangeiroMode') === 'true';
    
    document.querySelectorAll('.pic_frame').forEach(container => {
        new ImageSlider(container);
    });

    const sectionButtons = document.querySelectorAll('.sectionbtn');
    const sections = {
        0: document.querySelector('.main-section'),
        1: document.querySelector('.spooky-section')
    };

    sections[1].style.display = 'none';
    
    sectionButtons.forEach((btn, index) => {
        btn.addEventListener('click', () => {
            sectionButtons.forEach(b => b.classList.remove('selected_sb'));
            btn.classList.add('selected_sb');
            Object.values(sections).forEach(section => section.style.display = 'none');
            sections[index].style.display = 'grid';
        });
    });

    await setLanguage(savedLang, isEstrangeiro);

    document.querySelector('.discord').addEventListener('click', handleDiscordClick);
    
    document.querySelectorAll('.pic_frame:not(.disable)').forEach(frame => {
        frame.addEventListener('click', (e) => {
            const img = frame.querySelector('img');
            const bg = getComputedStyle(frame).backgroundImage;
            const src = img?.src || bg.replace(/^url\(["']?(.*?)["']?\)$/, '$1');
            createOverlay(src);
        });
    });
});

window.addEventListener('beforeunload', () => {
    sliders.forEach(slider => slider.destroy());
});