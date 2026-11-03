// ===== Portfolio JavaScript — Adi Abdul Rozaq =====
document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    initTheme();
    initRouter();
    initNavbar();
    initMobileMenu();
    initScrollReveal();
    initProjectFilter();
    initContactForm();
    initBackToTop();
    initSmoothHover();
    initCursorGlow();
});

// ===== Router (History API) =====
function getBasePath() {
    const path = window.location.pathname;
    const segments = ['about', 'skills', 'experience', 'projects', 'contact'];
    for (const seg of segments) {
        const idx = path.indexOf('/' + seg);
        if (idx !== -1) {
            return path.substring(0, idx + 1);
        }
    }
    return path.endsWith('/') ? path : path + '/';
}

const BASE_PATH = getBasePath();

// Flag to prevent scroll handler from overwriting URL during programmatic scroll
let isProgrammaticScroll = false;
let programmaticScrollTimer = null;

function getSectionFromPath() {
    const path = window.location.pathname;
    const segments = ['about', 'skills', 'experience', 'projects', 'contact'];
    for (const seg of segments) {
        if (path.endsWith('/' + seg) || path.endsWith('/' + seg + '/')) {
            return seg;
        }
    }
    return null;
}

function scrollToSection(sectionId, smooth = true) {
    isProgrammaticScroll = true;
    clearTimeout(programmaticScrollTimer);

    if (sectionId === 'hero' || !sectionId) {
        window.scrollTo({ top: 0, behavior: smooth ? 'smooth' : 'auto' });
    } else {
        const el = document.getElementById(sectionId);
        if (el) {
            const navbarHeight = document.getElementById('navbar').offsetHeight;
            const top = el.offsetTop - navbarHeight;
            window.scrollTo({ top, behavior: smooth ? 'smooth' : 'auto' });
        }
    }

    programmaticScrollTimer = setTimeout(() => {
        isProgrammaticScroll = false;
    }, smooth ? 800 : 200);
}

function updateURL(sectionId) {
    try {
        const newPath = sectionId === 'hero' || !sectionId
            ? BASE_PATH
            : BASE_PATH + sectionId;

        if (window.location.pathname !== newPath) {
            history.pushState({ section: sectionId }, '', newPath);
        }
    } catch (e) {
        // Fallback for file:// protocol or restricted environments
    }
}

function replaceURL(sectionId) {
    try {
        const newPath = sectionId === 'hero' || !sectionId
            ? BASE_PATH
            : BASE_PATH + sectionId;

        if (window.location.pathname !== newPath) {
            history.replaceState({ section: sectionId }, '', newPath);
        }
    } catch (e) {
        // Fallback for file:// protocol
    }
}

function initRouter() {
    // Intercept navigation clicks with data-section
    document.addEventListener('click', (e) => {
        const link = e.target.closest('[data-section]');
        if (!link) return;

        e.preventDefault();
        e.stopPropagation();

        const section = link.getAttribute('data-section');

        scrollToSection(section, true);
        updateURL(section);

        // Close mobile menu if open
        const toggle = document.getElementById('menuToggle');
        const menu = document.getElementById('mobileMenu');
        if (menu && menu.classList.contains('active')) {
            toggle.classList.remove('active');
            menu.classList.remove('active');
            document.body.style.overflow = '';
        }
    });

    // Browser back/forward navigation
    window.addEventListener('popstate', (e) => {
        const section = e.state?.section || getSectionFromPath();
        scrollToSection(section, true);
    });

    // Handle initial redirect or direct URL load
    const redirectSection = sessionStorage.getItem('redirect_section');
    if (redirectSection) {
        sessionStorage.removeItem('redirect_section');
        const newPath = BASE_PATH + redirectSection;
        try {
            history.replaceState({ section: redirectSection }, '', newPath);
        } catch (e) {}
        setTimeout(() => scrollToSection(redirectSection, false), 80);
    } else {
        const initialSection = getSectionFromPath();
        if (initialSection) {
            setTimeout(() => scrollToSection(initialSection, false), 80);
        }
    }
}

// ===== Theme Toggle =====
function initTheme() {
    const toggle = document.getElementById('themeToggle');
    if (!toggle) return;

    const saved = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', saved);
    
    toggle.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
    });
}

// ===== Navbar Scroll & Active Section Highlighting =====
let scrollTimeout;

function initNavbar() {
    const navbar = document.getElementById('navbar');
    const links = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section, header');

    window.addEventListener('scroll', () => {
        if (!navbar) return;

        // Toggle background blur on scroll
        navbar.classList.toggle('scrolled', window.scrollY > 40);

        // Highlight active link based on scroll position
        let current = '';
        sections.forEach(sec => {
            const top = sec.offsetTop - 140;
            if (window.scrollY >= top) {
                current = sec.getAttribute('id') || '';
            }
        });

        links.forEach(link => {
            const section = link.getAttribute('data-section');
            link.classList.toggle('active', section === current);
        });

        // Update URL state during manual scroll (debounced)
        if (!isProgrammaticScroll) {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                if (current === 'hero' || current === '') {
                    replaceURL(null);
                } else if (current) {
                    replaceURL(current);
                }
            }, 180);
        }
    });
}

// ===== Mobile Navigation Menu =====
function initMobileMenu() {
    const toggle = document.getElementById('menuToggle');
    const menu = document.getElementById('mobileMenu');
    if (!toggle || !menu) return;

    toggle.addEventListener('click', () => {
        toggle.classList.toggle('active');
        menu.classList.toggle('active');
        document.body.style.overflow = menu.classList.contains('active') ? 'hidden' : '';
    });
}

// ===== Scroll Reveal Observer =====
function initScrollReveal() {
    const items = document.querySelectorAll(
        '.section-header, .about-visual, .about-text, .skill-card, ' +
        '.exp-item, .edu-card, .cert-item, .project-card, .contact-left, .contact-form, .system-card'
    );
    
    items.forEach(el => el.classList.add('reveal'));

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, i) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, i * 35);
                observer.unobserve(entry.target);
            }
        });
    }, { 
        threshold: 0.08, 
        rootMargin: '0px 0px -40px 0px' 
    });

    items.forEach(el => observer.observe(el));
}

// ===== Project Filter Functionality (if filter bar exists) =====
function initProjectFilter() {
    const btns = document.querySelectorAll('.filter-btn');
    const cards = document.querySelectorAll('.project-card');
    if (!btns.length || !cards.length) return;

    btns.forEach(btn => {
        btn.addEventListener('click', () => {
            btns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const filter = btn.dataset.filter;

            cards.forEach(card => {
                const match = filter === 'all' || card.dataset.cat === filter;
                card.classList.toggle('hidden', !match);
                
                if (match) {
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(12px)';
                    requestAnimationFrame(() => {
                        card.style.transition = 'all 0.3s ease';
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    });
                }
            });
        });
    });
}

// ===== Contact Form Handler =====
function initContactForm() {
    const form = document.getElementById('contactForm');
    const btn = document.getElementById('submitBtn');
    if (!form || !btn) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const origHTML = btn.innerHTML;
        
        btn.innerHTML = '<span>Mengirim...</span>';
        btn.disabled = true;

        try {
            const ajaxUrl = form.action.replace('formsubmit.co/', 'formsubmit.co/ajax/');
            const formData = new FormData(form);
            const payload = {};
            formData.forEach((val, key) => { payload[key] = val; });
            
            if (payload.name) {
                payload._subject = `[PORTOFOLIO] Pesan Baru dari ${payload.name}`;
            }

            const res = await fetch(ajaxUrl, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json' 
                },
                body: JSON.stringify(payload)
            });

            const data = await res.json().catch(() => ({}));

            if (res.ok && (data.success === "true" || data.success === true)) {
                btn.innerHTML = '<span>✓ Pesan Berhasil Terkirim</span>';
                btn.style.backgroundColor = '#10b981';
                btn.style.color = '#ffffff';
                form.reset();
            } else if (data.message && data.message.toLowerCase().includes('activation')) {
                btn.innerHTML = '<span>Perlu Aktivasi Email</span>';
                btn.style.backgroundColor = '#f59e0b';
                btn.style.color = '#ffffff';
                alert('Pemberitahuan FormSubmit:\n\nSilakan cek inbox/spam email Anda (adiabdulrozaq15@gmail.com) dan klik tautan "Activate Form". Pesan berikutnya akan langsung masuk otomatis!');
            } else {
                form.submit();
                return;
            }
        } catch {
            form.submit();
            return;
        }

        setTimeout(() => {
            btn.innerHTML = origHTML;
            btn.style.backgroundColor = '';
            btn.style.color = '';
            btn.disabled = false;
            lucide.createIcons();
        }, 5000);
    });
}

// ===== Back to Top Button =====
function initBackToTop() {
    const btn = document.getElementById('backToTop');
    if (!btn) return;

    window.addEventListener('scroll', () => {
        btn.classList.toggle('visible', window.scrollY > 350);
    });

    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        replaceURL(null);
    });
}

// ===== Smooth Interactive Hover on Cards =====
function initSmoothHover() {
    const cards = document.querySelectorAll('.project-card, .skill-card, .system-card, .exp-item');

    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.classList.add('is-hovered');
        });

        card.addEventListener('mouseleave', () => {
            card.classList.remove('is-hovered');
        });
    });
}

// ===== Subtle Cursor Ambience =====
function initCursorGlow() {
    // Only activate for non-touch cursor devices
    if (!window.matchMedia('(pointer: fine)').matches) return;

    const glow = document.createElement('div');
    glow.classList.add('cursor-glow');
    document.body.appendChild(glow);

    document.addEventListener('mousemove', (e) => {
        glow.style.setProperty('--mx', e.clientX + 'px');
        glow.style.setProperty('--my', e.clientY + 'px');
    });
}
