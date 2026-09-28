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

La maquette utilise **WT Gothic** (sans) et **Didot Italic** (serif).

- WT Gothic est une police commerciale : ajoutez ses fichiers dans `assets/fonts/` et déclarez-les
  avec `@font-face { font-family: "WT Gothic"; … }` en haut de `style.css` — elle sera utilisée automatiquement.
- Didot est fournie avec macOS.
- En attendant, les polices de secours sont **Archivo** (largeur 110 %, calée sur les métriques de WT Gothic)
  et **Bodoni Moda** Italic.

## Lancer

Ouvrir `index.html` dans un navigateur ou servir le dossier (`npx serve .`).
