document.addEventListener('DOMContentLoaded', () => {

    /* --- 1. MENU MOBILE --- */
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const closeBtn = document.querySelector('.close-menu-btn');
    const overlay = document.querySelector('.mobile-nav-overlay');
    
    function toggleMenu() {
        overlay.classList.toggle('active');
        document.body.style.overflow = overlay.classList.contains('active') ? 'hidden' : '';
    }
    
    mobileBtn.addEventListener('click', toggleMenu);
    closeBtn.addEventListener('click', toggleMenu);
    document.querySelectorAll('.mobile-links a').forEach(link => link.addEventListener('click', toggleMenu));

    /* --- 2. MODAL UNIFICADO (IMAGEM E VÍDEO) --- */
    const mediaModal = document.getElementById('media-modal');
    const modalBody = document.getElementById('modal-body-content');

    // Função unificada para abrir modal
    // aceita: src (caminho/url), title (título), type ('image', 'video', 'video-placeholder' ou 'vimeo')
    window.openMediaModal = function(src, title, type) {
        mediaModal.style.display = 'flex';
        let contentHTML = '';

        if (type === 'vimeo') {
            // Player Vimeo Responsivo
            // Adicionado 'autoplay=1' para iniciar ao abrir (opcional)
            contentHTML = `
                <div class="vimeo-container">
                    <iframe src="${src}?autoplay=1&title=0&byline=0&portrait=0" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>
                </div>
            `;
        } else if (type === 'video') {
            // Vídeo MP4 Local
            contentHTML = `
                <video src="${src}" autoplay loop controls playsinline 
                       style="width: 100%; height: 100%; object-fit: contain; border-radius: 4px; box-shadow: 0 0 20px rgba(244, 230, 0, 0.1);">
                </video>`;
        } else if (type === 'video-placeholder') {
            // Placeholder
            contentHTML = `<h3 style="color:#fff; text-align:center;">${title} (Em breve)</h3>`;
        } else {
            // Imagem
            contentHTML = `<img src="${src}" alt="${title}" style="max-width: 100%; max-height: 85vh; object-fit: contain; border-radius: 4px;">`;
        }

        modalBody.innerHTML = `
            ${contentHTML}
            <h4 style="color: #fff; font-family: 'Playfair Display', serif; margin-top: 1rem;">${title}</h4>
        `;
    }

    // Função para fechar modal
    window.closeModal = function(modalId) {
        const modal = document.getElementById(modalId);
        modal.style.display = 'none';
        modalBody.innerHTML = ''; // Limpa conteúdo (para vídeos)
    }

    // Fechar ao clicar fora
    window.onclick = function(event) {
        if (event.target == mediaModal) {
            closeModal('media-modal');
        }
    }

    /* --- 3. SCROLL REVEAL --- */
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if(entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));
});