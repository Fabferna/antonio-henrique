/**
 * script.js — Antônio Henrique Portfólio
 * ─────────────────────────────────────────────
 * Módulos:
 *   1. Page Loader
 *   2. Cursor Magnético
 *   3. Smart Navbar (scroll hide/show + scrolled state)
 *   4. Mobile Menu
 *   5. Hero Animations (GSAP)
 *   6. Scroll Reveal (GSAP ScrollTrigger)
 *   7. Carrossel Infinito (RAF-based, dinâmico)
 *   8. Counter Animation (stats)
 *   9. Galeria & Modal (Social / Foto / Vídeo)
 *  10. Keyboard & Acessibilidade
 * ─────────────────────────────────────────────
 */

/* ═══════════════════════════════════════════════
   AGUARDA GSAP E DOM
═══════════════════════════════════════════════ */
function init() {
    if (typeof gsap === 'undefined') {
        // GSAP ainda carregando — retry em 50ms
        setTimeout(init, 50);
        return;
    }
    gsap.registerPlugin(ScrollTrigger);
    bootstrap();
}

document.addEventListener('DOMContentLoaded', init);


/* ═══════════════════════════════════════════════
   1. PAGE LOADER
═══════════════════════════════════════════════ */
function initLoader() {
    const loader   = document.getElementById('page-loader');
    const progress = loader?.querySelector('.loader-progress');
    if (!loader) return;

    // Anima a barra de progresso
    gsap.to(progress, {
        width: '100%',
        duration: 1.2,
        ease: 'power2.out',
        onComplete: () => {
            gsap.to(loader, {
                opacity: 0,
                y: -20,
                duration: 0.5,
                delay: 0.15,
                ease: 'power2.in',
                onComplete: () => {
                    loader.classList.add('hidden');
                    loader.setAttribute('aria-hidden', 'true');
                    initHeroAnimation();
                }
            });
        }
    });
}


/* ═══════════════════════════════════════════════
   2. CURSOR MAGNÉTICO
═══════════════════════════════════════════════ */
function initCursor() {
    const dot  = document.querySelector('.cursor-dot');
    const ring = document.querySelector('.cursor-ring');
    if (!dot || !ring) return;

    // Detecta touch device
    if (window.matchMedia('(hover: none)').matches) return;

    let mouseX = 0, mouseY = 0;
    let ringX  = 0, ringY  = 0;
    let raf;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        gsap.set(dot, { x: mouseX, y: mouseY });
    });

    function animateRing() {
        ringX += (mouseX - ringX) * 0.12;
        ringY += (mouseY - ringY) * 0.12;
        gsap.set(ring, { x: ringX, y: ringY });
        raf = requestAnimationFrame(animateRing);
    }
    animateRing();

    // Hover em interativos — expande o anel
    const interactives = document.querySelectorAll('a, button, [role="button"], [tabindex="0"]');
    interactives.forEach(el => {
        el.addEventListener('mouseenter', () => ring.classList.add('hovering'));
        el.addEventListener('mouseleave', () => ring.classList.remove('hovering'));
    });

    // Esconde cursor ao sair da janela
    document.addEventListener('mouseleave', () => { dot.style.opacity = '0'; ring.style.opacity = '0'; });
    document.addEventListener('mouseenter', () => { dot.style.opacity = '1'; ring.style.opacity = '1'; });
}


/* ═══════════════════════════════════════════════
   3. SMART NAVBAR
═══════════════════════════════════════════════ */
function initNavbar() {
    const nav   = document.querySelector('.navbar');
    if (!nav) return;

    let lastScroll = 0;
    const THRESHOLD = 80;

    window.addEventListener('scroll', () => {
        const current = window.scrollY;

        // Adiciona classe .scrolled após THRESHOLD
        nav.classList.toggle('scrolled', current > THRESHOLD);

        // Esconde ao rolar down, mostra ao rolar up
        if (current > lastScroll && current > THRESHOLD + 50) {
            nav.classList.add('hidden');
        } else {
            nav.classList.remove('hidden');
        }

        lastScroll = Math.max(0, current);
    }, { passive: true });
}


/* ═══════════════════════════════════════════════
   4. MOBILE MENU
═══════════════════════════════════════════════ */
function initMobileMenu() {
    const btn     = document.querySelector('.mobile-menu-btn');
    const closeBtn = document.querySelector('.close-menu-btn');
    const overlay = document.getElementById('mobile-nav');
    if (!btn || !overlay) return;

    function open() {
        overlay.classList.add('active');
        btn.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
        // Anima os links com stagger
        gsap.fromTo('.mobile-links li', 
            { x: -30, opacity: 0 },
            { x: 0, opacity: 1, stagger: 0.06, duration: 0.4, ease: 'power2.out', delay: 0.1 }
        );
    }

    function close() {
        overlay.classList.remove('active');
        btn.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    }

    btn.addEventListener('click', () => overlay.classList.contains('active') ? close() : open());
    if (closeBtn) closeBtn.addEventListener('click', close);

    // Fecha ao clicar em um link
    overlay.querySelectorAll('a').forEach(a => a.addEventListener('click', close));

    // Fecha com ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && overlay.classList.contains('active')) close();
    });
}


/* ═══════════════════════════════════════════════
   5. HERO ANIMATIONS (GSAP)
═══════════════════════════════════════════════ */
function initHeroAnimation() {
    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

    // Palavras do título fazem reveal de baixo para cima
    tl.to('.hero-word', {
        y: 0, opacity: 1,
        stagger: 0.15,
        duration: 1.1,
    })
    .to('.hero-title-dot', {
        y: 0, opacity: 1,
        duration: 0.6,
    }, '-=0.5')
    .to('.hero-meta', {
        y: 0, opacity: 1,
        duration: 0.6,
    }, '-=0.8')
    .to('.reveal-fade', {
        y: 0, opacity: 1,
        stagger: 0.1,
        duration: 0.7,
    }, '-=0.5')
    .to('.hero-scroll-cta', {
        opacity: 1,
        duration: 0.5,
    }, '-=0.2');

    // Counter animation para as stats
    initCounters();
}


/* ═══════════════════════════════════════════════
   6. SCROLL REVEAL (GSAP ScrollTrigger)
═══════════════════════════════════════════════ */
function initScrollReveal() {
    // Section headers
    gsap.utils.toArray('.section-header').forEach(el => {
        gsap.fromTo(el,
            { y: 50, opacity: 0 },
            {
                y: 0, opacity: 1, duration: 0.9, ease: 'power3.out',
                scrollTrigger: { trigger: el, start: 'top 80%', once: true }
            }
        );
    });

    // Cards com stagger
    const cardGroups = gsap.utils.toArray('.projects-grid, .video-grid, .subsection');
    cardGroups.forEach(group => {
        const cards = group.querySelectorAll('.project-card, .video-item');
        gsap.fromTo(cards,
            { y: 40, opacity: 0 },
            {
                y: 0, opacity: 1,
                stagger: 0.07,
                duration: 0.7, ease: 'power3.out',
                scrollTrigger: { trigger: group, start: 'top 75%', once: true }
            }
        );
    });

    // Project featured
    gsap.fromTo('.project-featured',
        { y: 40, opacity: 0 },
        {
            y: 0, opacity: 1, duration: 0.9, ease: 'power3.out',
            scrollTrigger: { trigger: '.project-featured', start: 'top 80%', once: true }
        }
    );

    // Showreel hero
    gsap.fromTo('.showreel-hero',
        { y: 50, opacity: 0, scale: 0.97 },
        {
            y: 0, opacity: 1, scale: 1, duration: 1, ease: 'power3.out',
            scrollTrigger: { trigger: '.showreel-hero', start: 'top 80%', once: true }
        }
    );

    // Audio section
    gsap.fromTo('.audio-wrapper > *',
        { y: 40, opacity: 0 },
        {
            y: 0, opacity: 1, stagger: 0.15, duration: 0.8, ease: 'power3.out',
            scrollTrigger: { trigger: '.audio-wrapper', start: 'top 75%', once: true }
        }
    );

    // About
    gsap.fromTo('.about-wrapper > *',
        { y: 40, opacity: 0 },
        {
            y: 0, opacity: 1, stagger: 0.15, duration: 0.9, ease: 'power3.out',
            scrollTrigger: { trigger: '.about-wrapper', start: 'top 75%', once: true }
        }
    );

    // Contact
    gsap.fromTo('.contact-heading',
        { y: 60, opacity: 0 },
        {
            y: 0, opacity: 1, duration: 1.1, ease: 'power3.out',
            scrollTrigger: { trigger: '.contact-heading', start: 'top 80%', once: true }
        }
    );

    gsap.fromTo('.social-icon',
        { y: 30, opacity: 0 },
        {
            y: 0, opacity: 1, stagger: 0.1, duration: 0.6, ease: 'power3.out',
            scrollTrigger: { trigger: '.social-links', start: 'top 85%', once: true }
        }
    );
}


/* ═══════════════════════════════════════════════
   7. CARROSSEL INFINITO (RAF-based, dinâmico)
═══════════════════════════════════════════════ */
function initCarousel() {
    const track = document.getElementById('carousel-track');
    if (!track) return;

    const slides = Array.from(track.querySelectorAll('.carousel-slide'));
    const slideCount = slides.length;

    if (slideCount === 0) return;

    // Duplica os slides para loop infinito
    slides.forEach(slide => {
        const clone = slide.cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        clone.setAttribute('tabindex', '-1');
        // Vídeos clonados: pausar e manter muted
        clone.querySelectorAll('video').forEach(v => {
            v.muted = true;
            v.autoplay = true;
            v.loop = true;
            v.play().catch(() => {});
        });
        track.appendChild(clone);
    });

    // Calcula o offset correto para o loop (largura de um conjunto de slides)
    const slideW   = 280; // --slide-w em px (deve bater com a CSS var)
    const slideGap = 24;  // --slide-gap em px
    const totalW   = (slideW + slideGap) * slideCount;

    // Velocidade em px/ms
    const SPEED = 0.4; // px por frame (60fps ≈ 24px/s)

    let position = 0;
    let isPaused = false;
    let raf;

    function tick() {
        if (!isPaused) {
            position += SPEED;
            if (position >= totalW) position -= totalW;
            track.style.transform = `translateX(-${position}px)`;
        }
        raf = requestAnimationFrame(tick);
    }

    tick();

    // Pausa ao hover
    track.addEventListener('mouseenter', () => { isPaused = true; });
    track.addEventListener('mouseleave', () => { isPaused = false; });

    // Clique nos slides — abre modal (apenas originais com data-src)
    track.addEventListener('click', (e) => {
        const slide = e.target.closest('.carousel-slide[data-src]');
        if (!slide || slide.getAttribute('aria-hidden') === 'true') return;
        openMediaModal(
            slide.dataset.src,
            slide.dataset.title || '',
            slide.dataset.type || 'image'
        );
    });

    // Keyboard nos slides originais
    track.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            const slide = e.target.closest('.carousel-slide[data-src]');
            if (!slide) return;
            e.preventDefault();
            openMediaModal(slide.dataset.src, slide.dataset.title || '', slide.dataset.type || 'image');
        }
    });

    // Remove animação CSS (JS assume o controle)
    track.style.animation = 'none';
    track.style.gap = `${slideGap}px`;
    track.style.willChange = 'transform';
}


/* ═══════════════════════════════════════════════
   8. COUNTER ANIMATION (Hero Stats)
═══════════════════════════════════════════════ */
function initCounters() {
    document.querySelectorAll('.stat-num').forEach(el => {
        const target = parseInt(el.dataset.target, 10) || 0;
        gsap.fromTo({ val: 0 },
            { val: target },
            {
                val: target,
                duration: 1.8,
                ease: 'power2.out',
                delay: 0.8,
                onUpdate() {
                    el.textContent = Math.round(this.targets()[0].val);
                }
            }
        );
    });
}


/* ═══════════════════════════════════════════════
   9. GALERIA & MODAL
═══════════════════════════════════════════════ */
const GALLERIES = {
    social: {
        title: 'Social Media',
        images: [
            'src/img/social-midia/7.jpg',
            'src/img/social-midia/8.jpg',
            'src/img/social-midia/9.jpg',
            'src/img/social-midia/10.jpg',
            'src/img/social-midia/11.jpg',
        ]
    },
    foto: {
        title: 'Olhar Urbano',
        images: [
            'src/img/fotografia/12.jpg',
            'src/img/fotografia/13.jpg',
            'src/img/fotografia/14.jpg',
        ]
    }
};

let currentGallery = null;
let currentIndex   = 0;

const mediaModal  = document.getElementById('media-modal');
const modalBody   = document.getElementById('modal-body-content');
const navBtns     = document.querySelectorAll('.modal-nav');

/** Abre galeria (social/foto) */
window.openGallery = function(type) {
    if (!GALLERIES[type]) return;
    currentGallery = GALLERIES[type];
    currentIndex   = 0;
    navBtns.forEach(b => b.style.display = 'flex');
    renderGalleryFrame();
    showModal();
};

/** Navega entre frames da galeria */
window.changeGalleryImage = function(dir) {
    if (!currentGallery) return;
    const len = currentGallery.images.length;
    currentIndex = ((currentIndex + dir) % len + len) % len;
    renderGalleryFrame();
};

function renderGalleryFrame() {
    const src = currentGallery.images[currentIndex];
    modalBody.innerHTML = `
        <img 
            src="${escapeHTML(src)}" 
            alt="${escapeHTML(currentGallery.title)} — imagem ${currentIndex + 1}"
            style="max-width:100%;max-height:82vh;object-fit:contain;border-radius:12px;"
        >
        <h4>${escapeHTML(currentGallery.title)} <span style="color:var(--text-muted);font-size:0.85em">${currentIndex + 1} / ${currentGallery.images.length}</span></h4>
    `;
}

/** Abre modal de mídia única */
window.openMediaModal = function(src, title, type) {
    currentGallery = null;
    navBtns.forEach(b => b.style.display = 'none');

    let html = '';

    if (type === 'vimeo') {
        html = `
            <div class="vimeo-container">
                <iframe 
                    src="${escapeHTML(src)}?autoplay=1&title=0&byline=0&portrait=0&color=F4E600"
                    frameborder="0"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowfullscreen
                    title="${escapeHTML(title)}"
                ></iframe>
            </div>
        `;
    } else if (type === 'video') {
        html = `
            <video 
                src="${escapeHTML(src)}" 
                autoplay loop controls playsinline
                style="width:100%;max-height:82vh;object-fit:contain;border-radius:12px;"
                aria-label="${escapeHTML(title)}"
            ></video>
        `;
    } else {
        html = `
            <img 
                src="${escapeHTML(src)}" 
                alt="${escapeHTML(title)}"
                style="max-width:100%;max-height:82vh;object-fit:contain;border-radius:12px;"
            >
        `;
    }

    modalBody.innerHTML = `
        ${html}
        <h4>${escapeHTML(title)}</h4>
    `;

    showModal();
};

function showModal() {
    if (!mediaModal) return;
    mediaModal.style.display = 'flex';
    // Pequeno delay para transição suave
    requestAnimationFrame(() => {
        mediaModal.classList.add('active');
        gsap.fromTo('.modal-content',
            { scale: 0.94, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.4, ease: 'power3.out' }
        );
    });
    document.body.style.overflow = 'hidden';
    // Foca no botão de fechar para acessibilidade
    setTimeout(() => document.querySelector('.close-modal')?.focus(), 100);
}

/** Fecha modal */
window.closeModal = function() {
    if (!mediaModal) return;
    gsap.to('.modal-content', {
        scale: 0.96, opacity: 0, duration: 0.25, ease: 'power2.in',
        onComplete: () => {
            mediaModal.style.display = 'none';
            mediaModal.classList.remove('active');
            if (modalBody) modalBody.innerHTML = '';
            document.body.style.overflow = '';
            currentGallery = null;
        }
    });
};

// Fecha ao clicar no backdrop
mediaModal?.querySelector('.modal-backdrop')?.addEventListener('click', closeModal);

// Fecha com ESC
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mediaModal?.classList.contains('active')) {
        closeModal();
    }
    // Navega na galeria com setas do teclado
    if (e.key === 'ArrowLeft' && currentGallery) changeGalleryImage(-1);
    if (e.key === 'ArrowRight' && currentGallery) changeGalleryImage(1);
});

/** Sanitização simples para prevenir XSS */
function escapeHTML(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}


/* ═══════════════════════════════════════════════
   10. KEYBOARD & ACESSIBILIDADE
═══════════════════════════════════════════════ */
function initA11y() {
    // Cards clicáveis via teclado
    document.querySelectorAll('[role="button"][tabindex="0"]').forEach(el => {
        el.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                el.click();
            }
        });
    });

    // Smooth scroll nos links de âncora
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', (e) => {
            const id  = a.getAttribute('href');
            const target = document.querySelector(id);
            if (!target) return;
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth' });
            // Foca no target para acessibilidade
            target.setAttribute('tabindex', '-1');
            target.focus({ preventScroll: true });
        });
    });
}


/* ═══════════════════════════════════════════════
   11. MODAL DE CLIENTES (Empresas Destaque)
═══════════════════════════════════════════════ */

/**
 * Dados de cada empresa parceira.
 * images: array de caminhos SVG que serão exibidos no modal como galeria.
 * services: lista de serviços prestados para aquela empresa.
 */
const CLIENT_DATA = {
    yamaha: {
        name:     'Yamaha',
        logo:     'src/img/trabalhei/destaque-yamaha.png',
        services: ['Identidade Visual', 'Social Media', 'Gestão de Conteúdo', 'Campanha Digital'],
        images:   [
            'src/img/trabalhei/destaque-yamaha.svg',
        ]
    },
    egtc: {
        name:     'EGTC Engetes Infra',
        logo:     'src/img/trabalhei/destaque-egtc.png',
        services: ['Branding', 'Design Gráfico', 'Material Institucional'],
        images:   [
            'src/img/trabalhei/destaque-egtc.svg',
        ]
    },
    gilbarco: {
        name:     'Gilbarco Veeder-Root',
        logo:     'src/img/trabalhei/destaque-gilbarco.png',
        services: ['Design Gráfico', 'Social Media', 'Campanha Visual'],
        images:   [
            'src/img/trabalhei/destaque-gilbarco.svg',
            'src/img/trabalhei/destaque-gilbarco-2.svg',
        ]
    },
    ciee: {
        name:     'CIEE RS',
        logo:     'src/img/trabalhei/destaque-ciee.png',
        services: ['Identidade Visual', 'Motion Graphics', 'Redes Sociais'],
        images:   [
            'src/img/trabalhei/destaque-ciee.svg',
            'src/img/trabalhei/destaque-ciee-2.svg',
        ]
    }
};

const clientModal     = document.getElementById('client-modal');
const clientModalBody = document.getElementById('client-modal-body');

/** Abre o modal de detalhe de uma empresa */
window.openClientModal = function(key) {
    const data = CLIENT_DATA[key];
    if (!data || !clientModal) return;

    // Constrói os chips de serviços
    const serviceChips = data.services
        .map(s => `<span class="cm-service-chip">${escapeHTML(s)}</span>`)
        .join('');

    // Constrói a galeria de imagens SVG
    const galleryItems = data.images
        .map((src, i) => `
            <div class="cm-gallery-item">
                <img src="${escapeHTML(src)}"
                     alt="${escapeHTML(data.name)} — trabalho ${i + 1}"
                     loading="lazy">
            </div>
        `).join('');

    clientModalBody.innerHTML = `
        <div class="cm-header">
            <img src="${escapeHTML(data.logo)}"
                 alt="${escapeHTML(data.name)}"
                 class="cm-logo">
            <div class="cm-meta">
                <h3 class="cm-company-name">${escapeHTML(data.name)}</h3>
                <div class="cm-services" aria-label="Serviços prestados">
                    ${serviceChips}
                </div>
            </div>
        </div>
        <div class="cm-gallery">
            ${galleryItems}
        </div>
    `;

    // Exibe o modal com animação
    clientModal.style.display = 'flex';
    requestAnimationFrame(() => {
        clientModal.classList.add('active');
        if (typeof gsap !== 'undefined') {
            gsap.fromTo('.client-modal-content',
                { scale: 0.94, opacity: 0, y: 20 },
                { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: 'power3.out' }
            );
        }
    });
    document.body.style.overflow = 'hidden';
    setTimeout(() => clientModal.querySelector('.close-modal')?.focus(), 150);
};

/** Fecha o modal de cliente */
window.closeClientModal = function() {
    if (!clientModal) return;
    if (typeof gsap !== 'undefined') {
        gsap.to('.client-modal-content', {
            scale: 0.96, opacity: 0, y: 10, duration: 0.25, ease: 'power2.in',
            onComplete: () => {
                clientModal.style.display = 'none';
                clientModal.classList.remove('active');
                if (clientModalBody) clientModalBody.innerHTML = '';
                document.body.style.overflow = '';
            }
        });
    } else {
        clientModal.style.display = 'none';
        clientModal.classList.remove('active');
        if (clientModalBody) clientModalBody.innerHTML = '';
        document.body.style.overflow = '';
    }
};

// Fecha com ESC
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && clientModal?.classList.contains('active')) {
        closeClientModal();
    }
});


/* ═══════════════════════════════════════════════
   BOOTSTRAP — Inicialização ordenada
═══════════════════════════════════════════════ */
function bootstrap() {
    initLoader();      // 1. Loader (dispara hero animation no callback)
    initCursor();      // 2. Cursor magnético
    initNavbar();      // 3. Smart navbar
    initMobileMenu();  // 4. Menu mobile
    initScrollReveal();// 5. Scroll reveal com ScrollTrigger
    initCarousel();    // 6. Carrossel RAF
    initA11y();        // 7. Acessibilidade
}