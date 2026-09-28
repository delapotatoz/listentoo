# Listen too

Site vitrine statique (HTML / CSS / JS vanilla, sans build), intégré depuis la maquette Figma (frame desktop 1440px, contenu 1180px).

```
index.html
contact.html         # page contact (formulaire)
assets/
  css/style.css      # tokens (couleurs, typos, espacements Figma), composants, sections, responsive
  js/main.js         # marquees, menu burger mobile, retour du formulaire de contact
  js/motion.js       # smooth scroll (Lenis) + apparitions au scroll
  js/liquid-gradient.js, js/text-particles.js  # fond animé du hero, effet CX IS HUMAN
  js/vendor/         # Lenis 1.3.26 (MIT)
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

## Formulaire de contact

Le site étant statique, l'envoi passe par [FormSubmit](https://formsubmit.co) (gratuit, sans compte) vers
`mdelapoterie@listen-too.com`.

- **Activation (une seule fois)** : au premier envoi, FormSubmit envoie un e-mail de confirmation à cette
  adresse. Cliquer sur le lien d'activation ; les messages suivants arrivent directement.
- **Anti-spam** : reCAPTCHA vérifié côté serveur par FormSubmit (étape « Je ne suis pas un robot » après
  « Envoyer ») + champ piège invisible (`_honey`).
- Après l'envoi, le visiteur revient sur `contact.html?envoye=1` qui affiche un message de confirmation
  (nécessite que le site soit servi en http/https).

## Lancer

Ouvrir `index.html` dans un navigateur ou servir le dossier (`npx serve .`).
