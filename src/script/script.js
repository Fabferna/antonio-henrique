/**
 * Antônio Henrique — Portfólio
 * JavaScript sem dependências. Módulos:
 *   1. Ambiente (reduced motion, ponteiro fino)
 *   2. Header (estado no scroll, esconder/mostrar, seção ativa)
 *   3. Menu móvel (<dialog>)
 *   4. Revelação no scroll
 *   5. Rail de cartazes (arrastar com inércia, teclado, progresso)
 *   6. Vídeos sob demanda (só tocam quando visíveis)
 *   7. Cursor contextual com mola
 *   8. Pilha de cartazes do hero (parallax com mola)
 *   9. Índice de vídeos (miniatura que segue o cursor)
 *  10. Modais: mídia, galeria e clientes
 *
 * API pública mantida (usada por testes e por chamadas antigas):
 *   openMediaModal(src, title, type) · openGallery(type, startIndex)
 *   changeGalleryImage(dir) · closeModal() · openClientModal(key) · closeClientModal()
 */

(() => {
    'use strict';

    /* ═════════════ 1. AMBIENTE ═════════════ */
    const mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const mqFine = window.matchMedia('(hover: hover) and (pointer: fine)');
    const reduceMotion = () => mqReduce.matches;
    const finePointer = () => mqFine.matches;
    const $ = (sel, root = document) => root.querySelector(sel);
    const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
    const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

    /** Mola crítica simples: segue um alvo com velocidade, para animações decorativas */
    function createSpring({ stiffness = 0.12, damping = 0.78 } = {}) {
        return { x: 0, y: 0, vx: 0, vy: 0, tx: 0, ty: 0,
            step() {
                this.vx = (this.vx + (this.tx - this.x) * stiffness) * damping;
                this.vy = (this.vy + (this.ty - this.y) * stiffness) * damping;
                this.x += this.vx; this.y += this.vy;
                return Math.abs(this.vx) + Math.abs(this.vy) + Math.abs(this.tx - this.x) + Math.abs(this.ty - this.y) > 0.05;
            },
            snap(x, y) { this.x = this.tx = x; this.y = this.ty = y; this.vx = this.vy = 0; }
        };
    }

    function escapeHTML(str) {
        return String(str)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
    }

    /* ═════════════ 2. HEADER ═════════════ */
    function initHeader() {
        const header = $('.l-header');
        if (!header) return;
        let last = window.scrollY;
        let ticking = false;

        const update = () => {
            const y = window.scrollY;
            header.classList.toggle('is-scrolled', y > 24);
            const goingDown = y > last + 4;
            const goingUp = y < last - 4;
            if (goingDown && y > 400) header.classList.add('is-hidden');
            else if (goingUp || y < 400) header.classList.remove('is-hidden');
            last = y;
            ticking = false;
        };
        window.addEventListener('scroll', () => {
            if (!ticking) { requestAnimationFrame(update); ticking = true; }
        }, { passive: true });
        update();

        // Link da seção ativa
        const links = $$('.l-header__links a');
        const map = new Map(links.map(a => [a.getAttribute('href').slice(1), a]));
        const io = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                const link = map.get(entry.target.id);
                if (!link) return;
                if (entry.isIntersecting) {
                    links.forEach(l => l.removeAttribute('aria-current'));
                    link.setAttribute('aria-current', 'true');
                }
            });
        }, { rootMargin: '-45% 0px -50% 0px' });
        map.forEach((_, id) => { const s = document.getElementById(id); if (s) io.observe(s); });
        // No topo, nenhum link fica ativo
        const hero = document.getElementById('topo');
        if (hero) new IntersectionObserver(([e]) => {
            if (e.isIntersecting) links.forEach(l => l.removeAttribute('aria-current'));
        }, { rootMargin: '-45% 0px -50% 0px' }).observe(hero);
    }

    /* ═════════════ 3. MENU MÓVEL ═════════════ */
    function initMenu() {
        const dialog = $('#menu');
        const toggle = $('.c-menu-toggle');
        if (!dialog || !toggle) return;
        $$('.c-menu__list li', dialog).forEach((li, i) => li.style.setProperty('--i', i));

        toggle.addEventListener('click', () => {
            dialog.showModal();
            toggle.setAttribute('aria-expanded', 'true');
            document.documentElement.style.overflow = 'hidden';
        });
        dialog.addEventListener('close', () => {
            toggle.setAttribute('aria-expanded', 'false');
            document.documentElement.style.overflow = '';
        });
        dialog.addEventListener('click', e => {
            if (e.target.closest('[data-close]')) dialog.close();
            const link = e.target.closest('a[href^="#"]');
            if (link) {
                e.preventDefault();
                dialog.close();
                goTo(link.getAttribute('href'));
            }
        });
    }

    /** Navegação por âncora que também move o foco (leitores de tela) */
    function goTo(hash) {
        const target = hash === '#topo' ? document.getElementById('topo') : document.querySelector(hash);
        if (!target) return;
        target.scrollIntoView({ behavior: reduceMotion() ? 'auto' : 'smooth', block: 'start' });
        if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
        history.replaceState(null, '', hash);
    }

    function initAnchors() {
        document.addEventListener('click', e => {
            const a = e.target.closest('a[href^="#"]');
            if (!a || a.closest('#menu')) return;
            const hash = a.getAttribute('href');
            if (hash.length < 2) return;
            e.preventDefault();
            goTo(hash);
        });
    }

    /* ═════════════ 4. REVELAÇÃO NO SCROLL ═════════════ */
    function initReveal() {
        if (!('IntersectionObserver' in window)) return;
        const groups = [
            '.c-section-head > *',
            '.s-branding__clients',
            '.s-branding__grid > li',
            '.s-more__bento > li',
            '.c-reel',
            '.c-index__item',
            '.s-music__text > *', '.s-music__player',
            '.s-about__figure', '.s-about__content > *',
            '.s-contact > *', '.c-rail__controls'
        ];
        const els = [];
        groups.forEach(sel => $$(sel).forEach((el, i) => {
            el.setAttribute('data-reveal', '');
            el.style.setProperty('--i', i % 6);
            els.push(el);
        }));
        document.documentElement.classList.add('js-reveal');
        const io = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-in');
                    io.unobserve(entry.target);
                }
            });
        }, { rootMargin: '0px 0px -8% 0px', threshold: 0.01 });
        els.forEach(el => io.observe(el));
    }

    /* ═════════════ 5. RAIL DE CARTAZES ═════════════ */
    function initRail() {
        const rail = $('[data-rail]');
        if (!rail) return;
        const viewport = $('[data-rail-viewport]', rail);
        const track = $('[data-rail-track]', rail);
        const items = $$('.c-poster', track);
        const bar = $('[data-rail-progress]', rail);
        const current = $('[data-rail-current]', rail);
        const prev = $('[data-rail-prev]', rail);
        const next = $('[data-rail-next]', rail);

        let skew = 0;
        let skewRaf = 0;
        let lastLeft = viewport.scrollLeft;
        let lastT = performance.now();

        // Progresso, contador e inclinação proporcional à velocidade
        const onScroll = () => {
            const max = viewport.scrollWidth - viewport.clientWidth;
            const p = max > 0 ? viewport.scrollLeft / max : 0;
            bar.style.transform = `scaleX(${0.05 + p * 0.95})`;
            const idx = nearestIndex();
            current.textContent = String(idx + 1).padStart(2, '0');
            prev.disabled = viewport.scrollLeft <= 2;
            next.disabled = viewport.scrollLeft >= max - 2;

            if (!reduceMotion()) {
                const now = performance.now();
                const v = (viewport.scrollLeft - lastLeft) / Math.max(1, now - lastT);
                lastLeft = viewport.scrollLeft; lastT = now;
                skew = clamp(skew + v * -1.4, -6, 6);
                if (!skewRaf) skewRaf = requestAnimationFrame(relaxSkew);
            }
        };
        const relaxSkew = () => {
            skew *= 0.86;
            track.style.transform = Math.abs(skew) > 0.02 ? `skewX(${skew.toFixed(3)}deg)` : '';
            skewRaf = Math.abs(skew) > 0.02 ? requestAnimationFrame(relaxSkew) : 0;
        };

        function nearestIndex() {
            const left = viewport.scrollLeft + parseFloat(getComputedStyle(viewport).paddingLeft);
            let best = 0, bestD = Infinity;
            items.forEach((it, i) => {
                const d = Math.abs(it.offsetLeft - left);
                if (d < bestD) { bestD = d; best = i; }
            });
            return best;
        }

        function scrollToIndex(i) {
            const it = items[clamp(i, 0, items.length - 1)];
            const pad = parseFloat(getComputedStyle(viewport).paddingLeft);
            viewport.scrollTo({ left: it.offsetLeft - pad, behavior: reduceMotion() ? 'auto' : 'smooth' });
        }

        function page(dir) {
            const target = viewport.scrollLeft + dir * viewport.clientWidth * 0.8;
            const pad = parseFloat(getComputedStyle(viewport).paddingLeft);
            let idx = 0;
            items.forEach((it, i) => { if (it.offsetLeft - pad <= target + 1) idx = i; });
            scrollToIndex(dir > 0 ? Math.max(idx, nearestIndex() + 1) : Math.min(idx, nearestIndex() - 1));
        }

        viewport.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll, { passive: true });
        prev.addEventListener('click', () => page(-1));
        next.addEventListener('click', () => page(1));

        // Teclado: setas avançam um cartaz, Home/End vão às pontas
        viewport.addEventListener('keydown', e => {
            const map = { ArrowRight: 1, ArrowLeft: -1 };
            if (e.key in map) {
                e.preventDefault();
                scrollToIndex(nearestIndex() + map[e.key]);
            } else if (e.key === 'Home') { e.preventDefault(); scrollToIndex(0); }
            else if (e.key === 'End') { e.preventDefault(); scrollToIndex(items.length - 1); }
        });

        // Arrastar com o mouse + inércia (touch usa a rolagem nativa)
        let down = false, moved = 0, startX = 0, startLeft = 0, vel = 0, lastX = 0, lastMoveT = 0, inertiaRaf = 0;
        viewport.addEventListener('pointerdown', e => {
            if (e.pointerType !== 'mouse' || e.button !== 0) return;
            cancelAnimationFrame(inertiaRaf);
            down = true; moved = 0;
            startX = lastX = e.clientX; startLeft = viewport.scrollLeft;
            vel = 0; lastMoveT = performance.now();
        });
        window.addEventListener('pointermove', e => {
            if (!down) return;
            const dx = e.clientX - startX;
            if (!moved && Math.abs(dx) < 6) return;
            if (!moved) { rail.classList.add('is-dragging'); viewport.setPointerCapture?.(e.pointerId); }
            moved = Math.abs(dx);
            viewport.scrollLeft = startLeft - dx;
            const now = performance.now();
            vel = (e.clientX - lastX) / Math.max(1, now - lastMoveT);
            lastX = e.clientX; lastMoveT = now;
        });
        const release = () => {
            if (!down) return;
            down = false;
            requestAnimationFrame(() => rail.classList.remove('is-dragging'));
            if (moved && !reduceMotion() && performance.now() - lastMoveT < 80) {
                let v = vel * 16; // px por quadro
                const glide = () => {
                    viewport.scrollLeft -= v;
                    v *= 0.94;
                    if (Math.abs(v) > 0.4) inertiaRaf = requestAnimationFrame(glide);
                };
                inertiaRaf = requestAnimationFrame(glide);
            }
        };
        window.addEventListener('pointerup', release);
        window.addEventListener('pointercancel', release);
        // Um arrasto não pode virar clique
        viewport.addEventListener('click', e => {
            if (moved > 6) { e.preventDefault(); e.stopPropagation(); moved = 0; }
        }, true);
        viewport.addEventListener('dragstart', e => e.preventDefault());

        onScroll();
    }

    /* ═════════════ 6. VÍDEOS SOB DEMANDA ═════════════ */
    function initVideos() {
        const videos = $$('video[data-src]');
        if (!videos.length || !('IntersectionObserver' in window)) return;
        const io = new IntersectionObserver(entries => {
            entries.forEach(({ target: v, isIntersecting }) => {
                if (isIntersecting && !reduceMotion()) {
                    if (!v.src) { v.src = v.dataset.src; v.preload = 'auto'; }
                    v.play().catch(() => {});
                } else if (!v.paused) {
                    v.pause();
                }
            });
        }, { rootMargin: '0px 200px', threshold: 0.25 });
        videos.forEach(v => io.observe(v));
        mqReduce.addEventListener?.('change', () => { if (reduceMotion()) videos.forEach(v => v.pause()); });
        document.addEventListener('visibilitychange', () => { if (document.hidden) videos.forEach(v => v.pause()); });
    }

    /* ═════════════ 7. CURSOR CONTEXTUAL ═════════════ */
    function initCursor() {
        const cursor = $('.c-cursor');
        const label = $('.c-cursor__label');
        if (!cursor || !finePointer()) return;
        const s = createSpring({ stiffness: 0.2, damping: 0.72 });
        let raf = 0, activeEl = null, seen = false;

        const loop = () => {
            const moving = s.step();
            cursor.style.transform = `translate3d(${s.x}px, ${s.y}px, 0)`;
            raf = moving ? requestAnimationFrame(loop) : 0;
        };
        window.addEventListener('pointermove', e => {
            if (e.pointerType !== 'mouse') return;
            if (!seen || reduceMotion()) { s.snap(e.clientX, e.clientY); seen = true; }
            s.tx = e.clientX; s.ty = e.clientY;
            if (!raf) raf = requestAnimationFrame(loop);
        }, { passive: true });

        document.addEventListener('pointerover', e => {
            const el = e.target.closest('[data-cursor]');
            if (el === activeEl) return;
            activeEl?.removeAttribute('data-cursor-active');
            activeEl = el;
            if (el) {
                label.textContent = el.dataset.cursor;
                el.setAttribute('data-cursor-active', '');
                cursor.classList.add('is-active');
            } else {
                cursor.classList.remove('is-active');
            }
        });
        document.addEventListener('pointerdown', () => cursor.classList.add('is-pressed'));
        document.addEventListener('pointerup', () => cursor.classList.remove('is-pressed'));
        document.documentElement.addEventListener('pointerleave', () => cursor.classList.remove('is-active'));
    }

    /* ═════════════ 8. PILHA DO HERO ═════════════ */
    function initHeroStack() {
        const stack = $('[data-tilt]');
        if (!stack || !finePointer() || reduceMotion()) return;
        const s = createSpring({ stiffness: 0.06, damping: 0.82 });
        let raf = 0, visible = true;
        const loop = () => {
            const moving = s.step();
            stack.style.setProperty('--mx', s.x.toFixed(3));
            stack.style.setProperty('--my', s.y.toFixed(3));
            raf = moving ? requestAnimationFrame(loop) : 0;
        };
        new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(stack.parentElement);
        window.addEventListener('pointermove', e => {
            if (!visible) return;
            s.tx = (e.clientX / window.innerWidth - 0.5) * 2;
            s.ty = (e.clientY / window.innerHeight - 0.5) * 2;
            if (!raf) raf = requestAnimationFrame(loop);
        }, { passive: true });
    }

    /* ═════════════ 9. ÍNDICE DE VÍDEOS ═════════════ */
    function initIndex() {
        const list = $('[data-index]');
        const float = $('[data-index-float]');
        if (!list || !float) return;
        const img = $('img', float);
        const mq = window.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 900px)');
        const s = createSpring({ stiffness: 0.1, damping: 0.75 });
        let raf = 0, over = false, scale = 0.85;

        const loop = () => {
            const moving = s.step();
            const target = over ? 1 : 0.85;
            scale += (target - scale) * 0.18;
            const tilt = clamp(s.vx * 0.6, -8, 8);
            float.style.transform = `translate3d(${s.x}px, ${s.y}px, 0) translate(2rem, -50%) rotate(${tilt}deg) scale(${scale.toFixed(3)})`;
            raf = moving || Math.abs(target - scale) > 0.002 ? requestAnimationFrame(loop) : 0;
        };
        list.addEventListener('pointermove', e => {
            if (!mq.matches || e.pointerType !== 'mouse') return;
            if (!over && !raf) s.snap(e.clientX, e.clientY);
            s.tx = e.clientX; s.ty = e.clientY;
            if (reduceMotion()) s.snap(e.clientX, e.clientY);
            if (!raf) raf = requestAnimationFrame(loop);
        });
        list.addEventListener('pointerover', e => {
            const btn = e.target.closest('.c-index__button');
            if (!btn || !mq.matches) return;
            if (img.getAttribute('src') !== btn.dataset.thumb) img.src = btn.dataset.thumb;
            over = true;
            float.classList.add('is-visible');
            if (!raf) raf = requestAnimationFrame(loop);
        });
        list.addEventListener('pointerleave', () => {
            over = false;
            float.classList.remove('is-visible');
            if (!raf) raf = requestAnimationFrame(loop);
        });
    }

    /* ═════════════ 10. MODAIS ═════════════ */
    const GALLERIES = {
        productDesign: {
            title: 'Product Design',
            images: [20, 21, 22].map(n => `src/img/opt/pd-${n}.webp`)
        },
        social: {
            title: 'Social media',
            images: [7, 8, 9, 10, 11].map(n => `src/img/opt/social-midia--${n}-full.webp`)
        },
        foto: {
            title: 'Olhar urbano',
            images: [12, 13, 14].map(n => `src/img/opt/fotografia--${n}-full.webp`)
        }
    };

    const CLIENT_DATA = {
        yamaha: {
            name: 'Yamaha',
            services: ['Identidade visual', 'Social media', 'Gestão de conteúdo', 'Campanha digital'],
            images: ['src/img/opt/client-yamaha-1.webp']
        },
        egtc: {
            name: 'EGTC Engetec Infra',
            services: ['Branding', 'Design gráfico', 'Material institucional'],
            images: ['src/img/opt/client-egtc-1.webp']
        },
        gilbarco: {
            name: 'Gilbarco Veeder-Root',
            services: ['Design gráfico', 'Social media', 'Campanha visual'],
            images: ['src/img/opt/client-gilbarco-1.webp', 'src/img/opt/client-gilbarco-2.webp']
        },
        ciee: {
            name: 'CIEE RS',
            services: ['Identidade visual', 'Motion graphics', 'Redes sociais'],
            images: ['src/img/opt/client-ciee-1.webp', 'src/img/opt/client-ciee-2.webp']
        }
    };

    const mediaModal = $('#media-modal');
    const clientModal = $('#client-modal');
    const stage = $('[data-modal-body]', mediaModal || document);
    const countEl = $('[data-modal-count]', mediaModal || document);
    const titleEl = $('#media-modal-title');
    const prevBtn = $('[data-modal-prev]');
    const nextBtn = $('[data-modal-next]');
    let currentGallery = null;
    let currentIndex = 0;
    let lastTrigger = null;

    function openDialog(dialog) {
        lastTrigger = document.activeElement;
        if (!dialog.open) dialog.showModal();
        document.documentElement.style.overflow = 'hidden';
    }

    function onDialogClose(dialog, cleanup) {
        dialog.addEventListener('close', () => {
            document.documentElement.style.overflow = '';
            cleanup();
            if (lastTrigger && document.contains(lastTrigger)) lastTrigger.focus({ preventScroll: true });
        });
        dialog.addEventListener('click', e => {
            // Fechar no X ou ao clicar no "vazio" em volta da mídia
            if (e.target.closest('[data-close]') || e.target === dialog || e.target.matches('[data-modal-body], .c-client-sheet')) dialog.close();
        });
    }

    function renderMedia(src, title, type) {
        if (type === 'vimeo') {
            const url = new URL(src);
            url.search = 'autoplay=1&title=0&byline=0&portrait=0&color=F4E600&dnt=1';
            return `<div class="c-modal__frame"><iframe src="${escapeHTML(url.toString())}" title="${escapeHTML(title)}" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe></div>`;
        }
        if (type === 'video') {
            const auto = reduceMotion() ? '' : ' autoplay';
            return `<video src="${escapeHTML(src)}" controls loop playsinline${auto} aria-label="${escapeHTML(title)}"></video>`;
        }
        return `<img src="${escapeHTML(src)}" alt="${escapeHTML(title)}" decoding="async">`;
    }

    function renderGalleryFrame() {
        const g = currentGallery;
        const total = g.images.length;
        const label = `${g.title}, imagem ${currentIndex + 1} de ${total}`;
        stage.innerHTML = renderMedia(g.images[currentIndex], label, 'image');
        titleEl.textContent = g.title;
        countEl.textContent = `${String(currentIndex + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;
    }

    /** Abre uma mídia única (imagem, vídeo local ou Vimeo) */
    function openMediaModal(src, title, type = 'image') {
        if (!mediaModal) return;
        currentGallery = null;
        prevBtn.hidden = nextBtn.hidden = true;
        countEl.textContent = '';
        titleEl.textContent = title || 'Visualizar';
        stage.innerHTML = renderMedia(src, title || '', type);
        openDialog(mediaModal);
    }

    /** Abre uma galeria; startIndex opcional para começar numa imagem específica */
    function openGallery(type, startIndex) {
        if (!mediaModal || !GALLERIES[type]) return;
        currentGallery = GALLERIES[type];
        currentIndex = typeof startIndex === 'number' ? clamp(startIndex, 0, currentGallery.images.length - 1) : 0;
        prevBtn.hidden = nextBtn.hidden = false;
        renderGalleryFrame();
        openDialog(mediaModal);
    }

    /** Navega na galeria aberta (dir = -1 ou 1), com loop */
    function changeGalleryImage(dir) {
        if (!currentGallery) return;
        const len = currentGallery.images.length;
        currentIndex = ((currentIndex + dir) % len + len) % len;
        if (reduceMotion()) { renderGalleryFrame(); return; }
        stage.classList.add('is-swapping');
        setTimeout(() => { renderGalleryFrame(); stage.classList.remove('is-swapping'); }, 120);
    }

    function closeModal() { if (mediaModal?.open) mediaModal.close(); }

    function openClientModal(key) {
        const data = CLIENT_DATA[key];
        const body = $('#client-modal-body');
        if (!data || !clientModal || !body) return;
        const chips = data.services.map(s => `<li>${escapeHTML(s)}</li>`).join('');
        const imgs = data.images.map((src, i) =>
            `<img src="${escapeHTML(src)}" alt="${escapeHTML(data.name)}: trabalho ${i + 1}" loading="lazy" decoding="async">`).join('');
        body.innerHTML = `
            <div class="c-client-sheet__head">
                <p class="c-label">Cliente</p>
                <p class="c-client-sheet__name">${escapeHTML(data.name)}</p>
                <ul class="c-chips" role="list" aria-label="Serviços prestados">${chips}</ul>
            </div>
            <div class="c-client-sheet__gallery">${imgs}</div>`;
        $('#client-modal-title').textContent = data.name;
        openDialog(clientModal);
    }

    function closeClientModal() { if (clientModal?.open) clientModal.close(); }

    function initModals() {
        if (mediaModal) {
            onDialogClose(mediaModal, () => { stage.innerHTML = ''; currentGallery = null; });
            prevBtn.addEventListener('click', () => changeGalleryImage(-1));
            nextBtn.addEventListener('click', () => changeGalleryImage(1));
            mediaModal.addEventListener('keydown', e => {
                if (!currentGallery) return;
                if (e.key === 'ArrowLeft') { e.preventDefault(); changeGalleryImage(-1); }
                if (e.key === 'ArrowRight') { e.preventDefault(); changeGalleryImage(1); }
            });
            // Swipe horizontal no touch
            let sx = 0, sy = 0;
            stage.addEventListener('touchstart', e => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
            stage.addEventListener('touchend', e => {
                if (!currentGallery) return;
                const dx = e.changedTouches[0].clientX - sx;
                const dy = e.changedTouches[0].clientY - sy;
                if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) changeGalleryImage(dx < 0 ? 1 : -1);
            }, { passive: true });
        }
        if (clientModal) onDialogClose(clientModal, () => { $('#client-modal-body').innerHTML = ''; });

        // Delegação: qualquer botão com data-media / data-gallery / data-client
        document.addEventListener('click', e => {
            const media = e.target.closest('[data-media]');
            if (media) { openMediaModal(media.dataset.media, media.dataset.title, media.dataset.type); return; }
            const gallery = e.target.closest('[data-gallery]');
            if (gallery) { openGallery(gallery.dataset.gallery, Number(gallery.dataset.start) || 0); return; }
            const client = e.target.closest('[data-client]');
            if (client) openClientModal(client.dataset.client);
        });
    }

    Object.assign(window, { openMediaModal, openGallery, changeGalleryImage, closeModal, openClientModal, closeClientModal });

    /** Miniaturas externas (Vimeo) que falham não deixam ícone quebrado */
    function initImageFallbacks() {
        $$('.c-reel__img, .c-index__thumb').forEach(img => {
            const mark = () => img.classList.add('is-broken');
            if (img.complete && img.naturalWidth === 0) mark();
            img.addEventListener('error', mark);
        });
    }

    /* ═════════════ BOOT ═════════════ */
    function boot() {
        const year = $('[data-year]');
        if (year) year.textContent = new Date().getFullYear();
        initHeader();
        initMenu();
        initAnchors();
        initReveal();
        initRail();
        initVideos();
        initCursor();
        initHeroStack();
        initIndex();
        initModals();
        initImageFallbacks();
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
    else boot();
})();
