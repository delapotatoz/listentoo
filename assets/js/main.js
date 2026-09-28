(() => {
  /**
   * Marquees: duplicate each track so the CSS animation loops seamlessly.
   * The clone is hidden from assistive technologies.
   */
  document.querySelectorAll('[data-marquee]').forEach((marquee) => {
    const track = marquee.querySelector('.marquee__track');
    if (!track) return;

    const clone = track.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    clone.removeAttribute('aria-label');
    marquee.append(clone);

    // Keep a constant speed whatever the content width (~60px/s).
    marquee.style.setProperty('--duration', `${track.scrollWidth / 60}s`);
  });

  /**
   * Burger menu (mobile): toggles the full-screen navigation.
   */
  const burger = document.querySelector('.burger');
  const nav = document.getElementById('nav');

  if (burger && nav) {
    const root = document.documentElement;
    const mobile = window.matchMedia('(max-width: 640px)');

    const setOpen = (open) => {
      root.classList.toggle('is-menu-open', open);
      root.style.overflow = open ? 'hidden' : '';
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
      if (open) window.lenis?.stop(); else window.lenis?.start();
    };

    burger.addEventListener('click', () => setOpen(!root.classList.contains('is-menu-open')));
    nav.addEventListener('click', (event) => { if (event.target.closest('a')) setOpen(false); });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && root.classList.contains('is-menu-open')) {
        setOpen(false);
        burger.focus();
      }
    });
    mobile.addEventListener('change', () => setOpen(false));
  }

  /**
   * Contact form: accessible error messages, return URL for the form service,
   * and the confirmation message on return (?envoye=1).
   */
  const form = document.querySelector('[data-contact-form]');

  if (form) {
    const fields = [...form.querySelectorAll('.form__field :is(input, select, textarea)')];

    // Custom messages replace the browser bubbles (which vanish and follow the browser language).
    form.noValidate = true;

    // Messages come from the field's data attributes (see contact.html).
    const messageFor = (field) => {
      const { validity, dataset } = field;
      if (validity.valueMissing) return dataset.errorRequired;
      if (validity.typeMismatch || validity.patternMismatch) return dataset.errorFormat;
      return '';
    };

    // Shows or clears the message below a field; returns true when the field is valid.
    const check = (field) => {
      const message = messageFor(field);
      const id = `${field.id}-error`;
      let error = document.getElementById(id);

      if (message) {
        if (!error) {
          error = document.createElement('p');
          error.id = id;
          error.className = 'form__error';
          field.closest('.form__field').append(error);
        }
        error.textContent = message;
        field.setAttribute('aria-invalid', 'true');
        field.setAttribute('aria-describedby', id);
      } else {
        error?.remove();
        field.removeAttribute('aria-invalid');
        field.removeAttribute('aria-describedby');
      }
      return !message;
    };

    // Once a field has an error, re-check it as the visitor corrects it.
    fields.forEach((field) => {
      const recheck = () => { if (field.hasAttribute('aria-invalid')) check(field); };
      field.addEventListener('input', recheck);
      field.addEventListener('change', recheck);
      field.addEventListener('blur', recheck);
    });

    const local = !location.protocol.startsWith('http');
    const next = form.querySelector('input[name="_next"]');
    if (local) next.remove();
    else next.value = `${location.origin}${location.pathname}?envoye=1`;

    form.addEventListener('submit', (event) => {
      const invalid = fields.filter((field) => !check(field));

      if (invalid.length) {
        event.preventDefault();
        invalid[0].focus(); // the screen reader reads its label + error message
        return;
      }

      if (local) {
        // Opened as a local file: FormSubmit rejects these, explain instead of failing.
        event.preventDefault();
        alert('Le formulaire ne peut pas être envoyé depuis un fichier ouvert en local.\n'
          + 'Servez le site via un serveur web (ex. : npx serve .) ou mettez-le en ligne.');
      }
    });

    const params = new URLSearchParams(location.search);

    // Preselect the reason, e.g. contact.html?motif=oktav
    const reason = params.get('motif');
    const option = reason && form.querySelector(`option[data-key="${CSS.escape(reason)}"]`);
    if (option) option.selected = true;

    if (params.has('envoye')) {
      form.hidden = true;
      document.querySelector('[data-contact-success]').hidden = false;
    }
  }
})();
