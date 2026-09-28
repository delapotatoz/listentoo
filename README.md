# Listen too

Site vitrine statique (HTML / CSS / JS vanilla, sans build), intégré depuis la maquette Figma (frame desktop 1440px, contenu 1180px).

```
index.html
assets/
  css/style.css      # tokens (couleurs, typos, espacements Figma), composants, sections, responsive
  js/main.js         # duplication des marquees (défilement infini)
  fonts/             # polices de secours auto-hébergées
  img/
    logo.svg, oktav.svg        # logos vectoriels extraits du Figma
    icons/                     # pictos (rôles, secteurs, puces, flèches, réseaux)
    clients/                   # logos clients (blancs, comme le masque Figma)
    hero-bg.webp, cx-is-human.webp, label-*.webp, spotify.webp
```

## Polices

- **WT Gothic** (Medium 500, Semi-Bold 600, Bold 700) — auto-hébergée en WOFF2 dans `assets/fonts/`.
- **Didot** Italic — fournie avec macOS ; **Bodoni Moda** Italic auto-hébergée en secours ailleurs.

## Lancer

Ouvrir `index.html` dans un navigateur ou servir le dossier (`npx serve .`).
