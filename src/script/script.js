document.addEventListener('DOMContentLoaded', () => {

    /* --- 1. CONFIGURAÇÃO DE GALERIAS (NOVAS SESSÕES) --- */
    const galleries = {
        social: {
            title: "Social Media",
            images: [
                'src/img/social-midia/7.jpg',
                'src/img/social-midia/8.jpg',
                'src/img/social-midia/9.jpg',
                'src/img/social-midia/10.jpg',
                'src/img/social-midia/11.jpg'
            ]
        },
        foto: {
            title: "Olhar Urbano",
            images: [
                'src/img/fotografia/12.jpg',
                'src/img/fotografia/13.jpg',
                'src/img/fotografia/14.jpg'
            ]
        }
    };

    let currentGallery = null;
    let currentIndex = 0;

    /* --- 2. ELEMENTOS DO DOM --- */
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const closeBtn = document.querySelector('.close-menu-btn');
    const overlay = document.querySelector('.mobile-nav-overlay');
    const mediaModal = document.getElementById('media-modal');
    const modalBody = document.getElementById('modal-body-content');
    const navButtons = document.querySelectorAll('.modal-nav'); // Setas

    /* --- 3. MENU MOBILE --- */
    function toggleMenu() {
        overlay.classList.toggle('active');
        document.body.style.overflow = overlay.classList.contains('active') ? 'hidden' : '';
    }
    
    if (mobileBtn) mobileBtn.addEventListener('click', toggleMenu);
    if (closeBtn) closeBtn.addEventListener('click', toggleMenu);
    document.querySelectorAll('.mobile-links a').forEach(link => link.addEventListener('click', toggleMenu));


    /* --- 4. FUNÇÕES DE GALERIA E MODAL --- */

    // Abre a galeria (Social ou Foto)
    window.openGallery = function(type) {
        if (!galleries[type]) return;
        
        currentGallery = galleries[type];
        currentIndex = 0;
        
        // Mostra setas de navegação
        navButtons.forEach(btn => btn.style.display = 'block');
        
        updateGalleryUI();
        mediaModal.style.display = 'flex';
    };

    // Navega na galeria (+1 ou -1)
    window.changeGalleryImage = function(direction) {
        if (!currentGallery) return;
        
        currentIndex += direction;
        
        // Loop infinito
        if (currentIndex >= currentGallery.images.length) currentIndex = 0;
        if (currentIndex < 0) currentIndex = currentGallery.images.length - 1;
        
        updateGalleryUI();
    };

    // Atualiza a imagem dentro do modal
    function updateGalleryUI() {
        const src = currentGallery.images[currentIndex];
        modalBody.innerHTML = `
            <img src="${src}" alt="${currentGallery.title}" style="max-width: 100%; max-height: 85vh; object-fit: contain; border-radius: 4px;">
            <h4 style="color: #fff; font-family: 'Playfair Display', serif; margin-top: 1rem; text-align:center;">
                ${currentGallery.title} (${currentIndex + 1} / ${currentGallery.images.length})
            </h4>
        `;
    }

    // Abre Modal de Mídia Única (Vídeos/Posters originais)
    window.openMediaModal = function(src, title, type) {
        mediaModal.style.display = 'flex';
        currentGallery = null; 
        
        // Esconde setas de navegação pois é mídia única
        navButtons.forEach(btn => btn.style.display = 'none');
        
        let contentHTML = '';

        if (type === 'vimeo') {
            contentHTML = `
                <div class="vimeo-container">
                    <iframe src="${src}?autoplay=1&title=0&byline=0&portrait=0" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>
                </div>
            `;
        } else if (type === 'video') {
            contentHTML = `
                <video src="${src}" autoplay loop controls playsinline 
                       style="width: 100%; height: 100%; object-fit: contain; border-radius: 4px; box-shadow: 0 0 20px rgba(244, 230, 0, 0.1);">
                </video>`;
        } else if (type === 'video-placeholder') {
            contentHTML = `<h3 style="color:#fff; text-align:center;">${title} (Em breve)</h3>`;
        } else {
            contentHTML = `<img src="${src}" alt="${title}" style="max-width: 100%; max-height: 85vh; object-fit: contain; border-radius: 4px;">`;
        }

        modalBody.innerHTML = `
            ${contentHTML}
            <h4 style="color: #fff; font-family: 'Playfair Display', serif; margin-top: 1rem;">${title}</h4>
        `;
    }

    // Fecha Modal
    window.closeModal = function(modalId) {
        mediaModal.style.display = 'none';
        modalBody.innerHTML = ''; 
    }

    // Fecha ao clicar fora
    window.onclick = function(event) {
        if (event.target == mediaModal) {
            closeModal('media-modal');
        }
    }

    /* --- 5. SCROLL REVEAL --- */
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if(entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));
});