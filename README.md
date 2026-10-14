# Antônio Henrique — Portfólio

> Diretor de arte, designer e videomaker em São Paulo. Cartazes, branding, motion, fotografia e música (Pizzadelic).

🔗 **[Ver online](https://fabferna.github.io/antonio-henrique/)**

---

## v3.0 — Redesign "muro de cartazes"

A direção visual nasce do próprio trabalho do Antônio: cartazes de cinema, games e cultura pop com tipografia condensada pesada em preto, branco e amarelo. O site virou um muro de cartazes.

| Aspecto | v2 | v3 |
|---|---|---|
| Tipografia | Syne + DM Sans (Google Fonts) | **Archivo** variável (largura 62–125%) + **Instrument Serif**, hospedadas localmente |
| Galeria | Carrossel automático em loop | **Rail arrastável** com inércia, inclinação por velocidade, teclado, botões e progresso |
| Cores | Escuro + amarelo | Três campos de cor: **tinta**, **papel** e **amarelo-sinal**, alternados por seção |
| Motion | GSAP + ScrollTrigger (CDN) | CSS + `requestAnimationFrame`, **zero dependências** |
| Cursor | Substituía o cursor nativo | Cursor nativo mantido + rótulo contextual com mola ("Arraste", "Play", "Abrir") |
| Vídeos | Lista de vídeos em grade | Showreel + **índice editorial** com miniatura que segue o cursor |
| Modais | `div` + JS manual | `<dialog>` nativo: foco preso, `Esc`, foco devolvido ao gatilho |
| Imagens | Originais de até 7 MB | Variantes WebP responsivas (`src/img/opt/`) com `srcset` |
| Testes | — | **Playwright** (desktop + mobile) + **axe-core** |

### Acessibilidade
- HTML semântico: um `h1`, seções com `aria-labelledby`, listas reais, `<button>` para tudo que é clicável.
- Navegação completa por teclado: skip link, setas/Home/End na galeria, setas nas galerias do modal.
- `prefers-reduced-motion`: sem marquee, sem inclinação, sem inércia, vídeos não tocam sozinhos; restam apenas fades.
- Hovers só em `(hover: hover) and (pointer: fine)`; alvos de toque com 48px.
- Zero violações do axe-core (WCAG 2.1 A/AA) no desktop e no mobile.

### Performance
- Fontes locais com `preload`, sem CSS externo bloqueando a renderização.
- Cartazes servidos em 480/960 px no grid e 1600 px no modal (antes: originais de 3508 px).
- Vídeos com `preload="none"` + quadro de pôster; só tocam quando visíveis e pausam fora da tela.
- Animações apenas em `transform` e `opacity`.

---

## Design system

Organizado como um arquivo Figma, em `@layer`s:

```
tokens      primitivos (--ink-*, --paper-*, --signal-*, escala --step-*, --space-*)
            semânticos (--bg, --fg, --fg-muted, --line, --accent, --focus)
base        reset e elementos
components  c-button, c-icon-button, c-rail, c-poster, c-project, c-tile, c-reel,
            c-index, c-modal, c-cursor, c-chips, c-link-row, c-eyebrow, c-marquee
layout      l-header, l-footer
sections    s-hero, s-branding, s-more, s-motion, s-music, s-about, s-contact
utilities   u-theme-paper, u-theme-accent, u-visually-hidden, u-accent
```

Os temas trocam só os tokens semânticos. Um componente funciona em qualquer seção sem variante própria de cor.

Curvas de movimento: `--ease-out: cubic-bezier(0.23, 1, 0.32, 1)` para entradas e respostas, `--ease-in-out` para movimento na tela. Nada de `ease-in` em UI.

---

## API JavaScript (mantida)

```js
openMediaModal(src, title, type)   // type: 'image' | 'video' | 'vimeo'
openGallery(type, startIndex)      // 'social' | 'foto' | 'productDesign'
changeGalleryImage(dir)            // -1 | 1
closeModal()
openClientModal(key)               // 'yamaha' | 'egtc' | 'gilbarco' | 'ciee'
closeClientModal()
```

No HTML, qualquer elemento com `data-media`, `data-gallery` ou `data-client` abre o modal certo, sem `onclick` inline.

---

## Rodar e testar

```bash
npm install            # só para os testes; o site não tem build
npm run serve          # http://localhost:4173
npx playwright install chromium   # primeira vez
npm test               # 25 testes em desktop + mobile, com axe-core
```

---

## Estrutura

```
index.html
playwright.config.js · package.json
src/
  styles/style.css      design system completo
  script/script.js      interações (sem dependências)
  fonts/                Archivo + Instrument Serif (OFL)
  img/opt/              variantes WebP geradas a partir dos originais
  img/…                 originais, vídeos .mp4 e SVGs
tests/
  site.spec.js          testes e2e e de acessibilidade
  serve.js              servidor estático local
```

---

**Desenvolvimento:** Fabio Javarrotti · **Direção criativa e conteúdo:** Antônio Henrique
