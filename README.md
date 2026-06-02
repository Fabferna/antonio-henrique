# Antônio Henrique — Portfólio Visual & Motion

![Status](https://img.shields.io/badge/Status-Finalizado-success?style=for-the-badge)
![Versão](https://img.shields.io/badge/Versão-2.0.0-blue?style=for-the-badge)
![Licença](https://img.shields.io/badge/Licença-MIT-green?style=for-the-badge)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![GSAP](https://img.shields.io/badge/GSAP-88CE02?style=for-the-badge&logo=greensock&logoColor=black)

> Ecossistema digital imersivo e responsivo — Dark & Premium — desenvolvido para exibir a excelência em Design, Motion Graphics e Identidade Visual de Antônio Henrique.

🔗 **[Ver online](https://fabferna.github.io/antonio-henrique/#)**

---

## Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [O que há de novo na v2.0](#-o-que-há-de-novo-na-v20)
- [Funcionalidades](#-funcionalidades)
- [Design System](#-design-system)
- [Tecnologias](#-tecnologias)
- [Estrutura de Arquivos](#-estrutura-de-arquivos)
- [Como Executar](#-como-executar)
- [Autores](#-autores)

---

## 📄 Sobre o Projeto

Portfólio web responsivo desenvolvido sob medida para **Antônio Henrique** — designer multidisciplinar, diretor de arte, videomaker e produtor musical (alter ego **Pizzadelic**).

O objetivo foi construir uma interface **Dark & Premium** que não apenas exiba os trabalhos, mas transmita a identidade criativa do artista em cada detalhe: da tipografia às microinterações, do cursor customizado ao showreel em destaque.

O site atua como um hub centralizado unindo **Branding, Motion Graphics, Social Media, Fotografia e Música** em uma única experiência coesa e fluida.

---

## ✨ O que há de novo na v2.0

A versão 2.0 é uma repaginada visual e técnica completa em relação à v1.0. As principais evoluções foram:

### Design
| Aspecto | v1.0 | v2.0 |
|---|---|---|
| **Tipografia** | Inter + Playfair Display | **Syne** (display) + **DM Sans** (body) |
| **Hero section** | Inexistente | Nova seção com título animado, stats e CTA |
| **Branding** | Grid genérico | Projeto em destaque (featured) + grid secundário |
| **Motion** | 4 vídeos em grid igual | **Showreel Hero** em destaque + vídeos secundários |
| **Cursor** | Padrão do sistema | Cursor customizado magnético com GSAP |
| **Animações** | `fade-up` via IntersectionObserver | GSAP + ScrollTrigger com timelines orquestradas |
| **Navbar** | Estática | Smart nav: scrolled state + hide/show no scroll |
| **Fundo** | Liso | Grain SVG cinematográfico (zero peso) |

### Técnico
- **GSAP 3 + ScrollTrigger** substituindo IntersectionObserver simples
- **Carrossel RAF-based** com `requestAnimationFrame` — elimina o valor fixo de slides e funciona com qualquer quantidade de itens
- **Counter animation** nos números do hero (8+, 60+, 5+)
- **Sanitização XSS** (`escapeHTML`) no sistema de modal
- **Acessibilidade (a11y)** completa: `aria-label`, `aria-expanded`, `role`, skip link, navegação por teclado (`Enter`, `Space`, `Escape`, `←`, `→`)
- `loading="lazy"` em todos os assets fora do fold
- `rel="noopener noreferrer"` em todos os links externos
- `prefers-reduced-motion` respeitado no CSS

### Novo vídeo integrado
O Showreel **Vimeo `1187397152`** foi integrado como peça central da seção Motion & Films, com:
- Thumbnail em alta resolução via `vumbnail.com`
- Overlay cinematográfico com metadados (tag, título, ano)
- Anel pulsante animado no botão de play
- Lightbox responsivo 95vw × 95vh ao clicar

---

## 🚀 Funcionalidades

### Hero Section
- Título com **reveal animado palavra por palavra** (GSAP `power4.out`)
- Subtítulo com disciplinas e localização
- **Counter animation** nos stats (anos, projetos, disciplinas)
- CTA de scroll com bounce animado

### Navegação
- **Smart Navbar**: aparece com blur e borda ao rolar, desaparece ao rolar para baixo e reaparece ao rolar para cima
- **Menu mobile** com animação de entrada staggerada nos links e overlay fullscreen

### Carrossel Infinito
- Loop contínuo de posters estáticos e motion posters (vídeos `.mp4` com `autoplay muted loop`)
- Pausado ao hover
- Slides clonados dinamicamente via JS — funciona com qualquer quantidade de itens
- Fade nas bordas via `mask-image`

### Galerias & Modal
- **Branding**: projeto em destaque (full-width) + 5 cards em grid
- **Social Media & Fotografia**: modal com navegação por setas (← →) e contador de imagens
- **Motion**: Showreel Hero + grid de vídeos secundários
- **E-books**: grid editorial com aspect-ratio de capa (3:4)
- Modal unificado com suporte a: imagens, vídeos locais MP4 e iframes Vimeo

### Audio
- Player **Spotify embed** para o projeto musical Pizzadelic

### Acessibilidade
- Skip link visível ao receber foco
- Todos os elementos interativos com `role="button"` e `tabindex="0"`
- Navegação completa por teclado no modal (ESC fecha, ← → navegam na galeria)
- Contraste WCAG AA em todos os textos

---

## 🎨 Design System

```css
/* Cores */
--bg:           #0D0D0D   /* Fundo principal        */
--bg-alt:       #111111   /* Fundo alternado        */
--surface:      #161616   /* Cards e overlays       */
--accent:       #F4E600   /* Amarelo neon (marca)   */
--text:         #EBEBEB   /* Texto principal        */
--text-muted:   #767676   /* Texto secundário       */

/* Tipografia */
--font-display: 'Syne', sans-serif      /* Títulos, logo, destaque */
--font-body:    'DM Sans', sans-serif   /* Corpo, nav, labels      */

/* Espaçamento (8pt grid) */
--sp-1: 0.5rem  |  --sp-2: 1rem  |  --sp-4: 2rem
--sp-6: 3rem    |  --sp-8: 4rem  |  --sp-12: 6rem  |  --sp-16: 8rem

/* Bordas */
--radius-sm: 6px  |  --radius: 12px  |  --radius-lg: 20px
```

---

## 🛠️ Tecnologias

| Tecnologia | Versão | Uso |
|---|---|---|
| **HTML5** | — | Estrutura semântica (`header`, `main`, `nav`, `article`, `figure`) |
| **CSS3** | — | Design system completo com CSS Custom Properties, Flexbox, Grid |
| **JavaScript** | ES2020+ | Módulos: loader, cursor, navbar, carrossel, modal, a11y |
| **GSAP** | 3.12.5 | Animações de entrada, timelines, counters |
| **ScrollTrigger** | 3.12.5 | Reveal de seções ao scroll com `start: 'top 80%'` |
| **Google Fonts** | — | Syne + DM Sans via `preconnect` |
| **Vimeo** | — | Embed via iframe no modal lightbox |
| **Spotify** | — | Embed do artista Pizzadelic |

---

## 📂 Estrutura de Arquivos

```
antonio-henrique/
│
├── index.html              # Estrutura semântica completa
├── README.md               # Esta documentação
│
└── src/
    ├── styles/
    │   └── style.css       # Design system, tokens, todas as seções e responsividade
    │
    ├── script/
    │   └── script.js       # 10 módulos: loader, cursor, navbar, menu, hero
    │                       # GSAP reveal, carrossel RAF, counters, galeria/modal, a11y
    │
    └── img/
        ├── branding/       # Imagens dos projetos de identidade visual
        │   ├── branding-1.jpg  → branding-6.jpg
        ├── fotografia/     # Galeria fotográfica (Olhar Urbano)
        │   ├── 12.jpg → 14.jpg
        ├── social-midia/   # Galeria de Social Media
        │   ├── thumbail_socialmedia.jpg
        │   └── 7.jpg → 11.jpg
        ├── thumbnail/      # Thumbnails dos cards de branding e e-books
        │   ├── tumbnail-1.jpg → tumbnail-6.jpg
        │   ├── ebook-1.jpg, ebook-2.jpg
        ├── me.jpg          # Foto de perfil (seção Sobre)
        └── [motion posters]
            ├── *.mp4       # Motion posters em vídeo (carrossel)
            └── *.webp      # Posters estáticos (carrossel)
```

---

## 💻 Como Executar

Este é um projeto **100% estático** — sem dependências de Node.js, npm ou bundlers.

**1. Clone o repositório**
```bash
git clone https://github.com/fabferna/antonio-henrique.git
cd antonio-henrique
```

**2. Abra no navegador**

Basta abrir o `index.html` diretamente no navegador. Para desenvolvimento com live reload:

```bash
# Com VS Code + extensão Live Server
# Clique com botão direito em index.html → "Open with Live Server"

# Ou com npx (sem instalar nada):
npx serve .
```

> **Nota sobre fontes e GSAP:** o projeto carrega Syne, DM Sans (Google Fonts) e GSAP 3 via CDN. É necessária conexão com a internet para que as animações e a tipografia funcionem corretamente em desenvolvimento local.

---

## 👨‍💻 Autores

### Desenvolvimento & Front-End

<table>
  <tr>
    <td align="center">
      <b>Fabio Javarrotti</b><br>
      <sub>Engenharia Front-End · UI/UX · Performance</sub><br><br>
      <a href="#">💻 Código</a> · <a href="#">🎨 Interface</a> · <a href="#">♿ Acessibilidade</a>
    </td>
  </tr>
</table>

### Cliente & Direção Criativa

<table>
  <tr>
    <td align="center">
      <b>Antônio Henrique</b><br>
      <sub>Direção Criativa · Assets Visuais · Conteúdo · Motion</sub><br><br>
      <a href="https://www.instagram.com/nuvensgordas/" target="_blank">Instagram</a> ·
      <a href="https://www.linkedin.com/in/antoniohenriquedesign/" target="_blank">LinkedIn</a> ·
      <a href="https://www.behance.net/nuvensgordas" target="_blank">Behance</a>
    </td>
  </tr>
</table>

---

## 📋 Changelog

### v2.0.0 — Repaginada Visual & Técnica Completa
- ✅ Nova Hero Section com título animado, stats e CTA
- ✅ Migração tipográfica: Inter/Playfair → Syne/DM Sans
- ✅ GSAP 3 + ScrollTrigger substituindo IntersectionObserver
- ✅ Cursor customizado magnético com GSAP
- ✅ Smart Navbar (scrolled state + hide/show)
- ✅ Carrossel RAF-based com clonagem dinâmica de slides
- ✅ Showreel Hero (Vimeo 1187397152) como destaque da seção Motion
- ✅ Projeto Featured na seção Branding
- ✅ Grain SVG cinematográfico no hero e seção de contato
- ✅ Counter animation nos números do hero
- ✅ Sanitização XSS no sistema de modal
- ✅ Acessibilidade completa (WCAG AA, teclado, aria)
- ✅ `loading="lazy"` em todos os assets secundários
- ✅ `prefers-reduced-motion` no CSS

### v1.0.0 — Lançamento inicial
- ✅ Estrutura base HTML/CSS/JS
- ✅ Carrossel CSS com `animation: scroll`
- ✅ Modal de mídia (imagens, vídeos, Vimeo)
- ✅ Galerias Social Media e Fotografia
- ✅ Integração Spotify
- ✅ Menu mobile com overlay

---

<p align="center">
  Feito com 💛 e muito código por <strong>Fabio Javarrotti</strong> · Cliente <strong>Antônio Henrique</strong>
</p>