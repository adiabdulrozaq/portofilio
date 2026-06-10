// ===== Portfolio JavaScript =====
document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    initTheme();
    initRouter();
    initNavbar();
    initMobileMenu();
    initTypewriter();
    initScrollReveal();
    initProjectFilter();
    initContactForm();
    initBackToTop();
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
    // Block scroll-based URL updates during programmatic scroll
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

    // Re-enable scroll-based URL updates after scroll animation completes
    programmaticScrollTimer = setTimeout(() => {
        isProgrammaticScroll = false;
    }, smooth ? 1000 : 300);
}

function updateURL(sectionId) {
    const newPath = sectionId === 'hero' || !sectionId
        ? BASE_PATH
        : BASE_PATH + sectionId;

    if (window.location.pathname !== newPath) {
        history.pushState({ section: sectionId }, '', newPath);
    }
}

function replaceURL(sectionId) {
    const newPath = sectionId === 'hero' || !sectionId
        ? BASE_PATH
        : BASE_PATH + sectionId;

    if (window.location.pathname !== newPath) {
        history.replaceState({ section: sectionId }, '', newPath);
    }
}

function initRouter() {
    // Intercept all clicks on links with data-section
    document.addEventListener('click', (e) => {
        const link = e.target.closest('[data-section]');
        if (!link) return;

        e.preventDefault();
        e.stopPropagation();

        const section = link.getAttribute('data-section');

        updateURL(section);
        scrollToSection(section, true);

        // Close mobile menu if open
        const toggle = document.getElementById('menuToggle');
        const menu = document.getElementById('mobileMenu');
        if (menu && menu.classList.contains('active')) {
            toggle.classList.remove('active');
            menu.classList.remove('active');
            document.body.style.overflow = '';
        }
    });

    // Handle browser back/forward
    window.addEventListener('popstate', (e) => {
        const section = e.state?.section || getSectionFromPath();
        scrollToSection(section, true);
    });

    // On initial load, check for redirect from 404.html first
    const redirectSection = sessionStorage.getItem('redirect_section');
    if (redirectSection) {
        sessionStorage.removeItem('redirect_section');
        const newPath = BASE_PATH + redirectSection;
        history.replaceState({ section: redirectSection }, '', newPath);
        setTimeout(() => scrollToSection(redirectSection, false), 100);
    } else {
        const initialSection = getSectionFromPath();
        if (initialSection) {
            setTimeout(() => scrollToSection(initialSection, false), 100);
        }
    }
}

// Theme Toggle
function initTheme() {
    const toggle = document.getElementById('themeToggle');
    const saved = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', saved);
    
    toggle.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
    });
}

// Navbar Scroll & Section Highlighting with URL sync
let scrollTimeout;

function initNavbar() {
    const navbar = document.getElementById('navbar');
    const links = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section, header');

    window.addEventListener('scroll', () => {
        // Toggle Scrolled Class
        navbar.classList.toggle('scrolled', window.scrollY > 50);

        // Highlight Active Section Link
        let current = '';
        sections.forEach(sec => {
            const top = sec.offsetTop - 120;
            if (window.scrollY >= top) {
                current = sec.getAttribute('id') || '';
            }
        });

        links.forEach(link => {
            const section = link.getAttribute('data-section');
            link.classList.toggle('active', section === current);
        });

        // Update URL silently while scrolling (debounced)
        // Only when user is manually scrolling, NOT during programmatic scroll
        if (!isProgrammaticScroll) {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                if (current === 'hero' || current === '') {
                    replaceURL(null);
                } else if (current) {
                    replaceURL(current);
                }
            }, 200);
        }
    });
}

// Mobile Navigation
function initMobileMenu() {
    const toggle = document.getElementById('menuToggle');
    const menu = document.getElementById('mobileMenu');

    toggle.addEventListener('click', () => {
        toggle.classList.toggle('active');
        menu.classList.toggle('active');
        document.body.style.overflow = menu.classList.contains('active') ? 'hidden' : '';
    });
}

// Typewriter Effect
function initTypewriter() {
    const el = document.getElementById('typewriter');
    if (!el) return;
    
    const texts = [
        'Full Stack Developer',
        'Software Engineer',
        'UI/UX Enthusiast',
        'Problem Solver'
    ];
    let wordIdx = 0;
    let charIdx = 0;
    let isDeleting = false;

    function type() {
        const currentWord = texts[wordIdx];
        if (isDeleting) {
            el.textContent = currentWord.substring(0, charIdx--);
        } else {
            el.textContent = currentWord.substring(0, charIdx++);
        }

        let speed = isDeleting ? 40 : 85;

        if (!isDeleting && charIdx > currentWord.length) {
            speed = 2000;
            isDeleting = true;
        } else if (isDeleting && charIdx < 0) {
            isDeleting = false;
            wordIdx = (wordIdx + 1) % texts.length;
            speed = 500;
        }
        setTimeout(type, speed);
    }
    type();
}

// Scroll Reveal Animations
function initScrollReveal() {
    const items = document.querySelectorAll(
        '.section-title, .about-visual, .about-text, .about-details, .skill-card, ' +
        '.tl-item, .edu-item, .cert-row, .project-card, .contact-left, .contact-form'
    );
    
    items.forEach(el => el.classList.add('reveal'));

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, i) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, i * 60);
                observer.unobserve(entry.target);
            }
        });
    }, { 
        threshold: 0.1, 
        rootMargin: '0px 0px -40px 0px' 
    });

    items.forEach(el => observer.observe(el));
}

// Project Portfolio Filtering
function initProjectFilter() {
    const btns = document.querySelectorAll('.filter-btn');
    const cards = document.querySelectorAll('.project-card');

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
                    card.style.transform = 'translateY(16px)';
                    requestAnimationFrame(() => {
                        card.style.transition = 'all 0.4s ease';
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    });
                }
            });
        });
    });
}

// Contact Form Handler
function initContactForm() {
    const form = document.getElementById('contactForm');
    const btn = document.getElementById('submitBtn');
    if (!form || !btn) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const origText = btn.innerHTML;
        
        btn.innerHTML = 'Mengirim...';
        btn.disabled = true;

        try {
            const res = await fetch(form.action, {
                method: 'POST',
                body: new FormData(form),
                headers: { 'Accept': 'application/json' }
            });

            if (res.ok) {
                btn.innerHTML = '✓ Pesan Terkirim!';
                btn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
                form.reset();
            } else {
                throw new Error();
            }
        } catch {
            btn.innerHTML = '✕ Gagal Mengirim';
            btn.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
        }

        setTimeout(() => {
            btn.innerHTML = origText;
            btn.style.background = '';
            btn.disabled = false;
            lucide.createIcons();
        }, 3000);
    });
}

// Back to Top Button
function initBackToTop() {
    const btn = document.getElementById('backToTop');
    if (!btn) return;

    window.addEventListener('scroll', () => {
        btn.classList.toggle('visible', window.scrollY > 400);
    });

    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        replaceURL(null);
    });
}
