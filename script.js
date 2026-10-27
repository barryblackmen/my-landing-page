'use strict';

(() => {
  // Paste your form endpoint here (e.g. Formspree: https://formspree.io/f/xxxxxxxx).
  // Until then the form shows "not connected" instead of pretending to send.
  const FORM_ENDPOINT = '';

  /* ---------- 1. Project mockups (desktop / tablet / phone) ---------- */
  // Replace this block with real <img> screenshots when you have them.
  const miniScreen = (title) => `
    <div class="mini">
      <div class="mini__nav"><i></i><span></span><span></span><span></span><u></u></div>
      <div class="mini__hero">
        <div class="mini__copy"><b>${title}</b><span></span><span class="short"></span><em></em></div>
        <div class="mini__art"></div>
      </div>
      <div class="mini__row"><span></span><span></span><span></span><span></span></div>
    </div>`;

  document.querySelectorAll('.project__devices').forEach((wrap) => {
    const title = wrap.dataset.title || '';
    ['desktop', 'tablet', 'phone'].forEach((kind) => {
      const device = document.createElement('div');
      device.className = `device device--${kind}`;
      device.setAttribute('aria-hidden', 'true');
      device.innerHTML = miniScreen(title);
      wrap.appendChild(device);
    });
  });

  /* ---------- 3. Reveal on scroll ---------- */
  const revealEls = document.querySelectorAll('.reveal, .watch');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  /* ---------- 4. Contact form (validation) ---------- */
  const form = document.getElementById('contact-form');
  if (form) {
    const status = form.querySelector('.form-status');
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    const setStatus = (msg, isError = false) => {
      status.textContent = msg;
      status.classList.toggle('is-error', isError);
    };

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const fields = ['name', 'email', 'message'].map((n) => form.elements[n]);
      let valid = true;

      fields.forEach((field) => {
        const value = field.value.trim();
        const ok = field.name === 'email' ? emailRe.test(value) : value.length > 1;
        field.setAttribute('aria-invalid', String(!ok));
        if (!ok) valid = false;
      });

      if (!valid) {
        setStatus('Please fill in all fields with a valid email.', true);
        return;
      }

      if (!FORM_ENDPOINT) {
        console.warn('Contact form: set FORM_ENDPOINT in script.js');
        setStatus('The form is not connected yet. Please email me at lyukfreelance@gmail.com.', true);
        return;
      }

      setStatus('Sending…');
      try {
        const res = await fetch(FORM_ENDPOINT, {
          method: 'POST',
          headers: { Accept: 'application/json' },
          body: new FormData(form),
        });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        setStatus('Thank you! I will get back to you soon.');
        form.reset();
      } catch (err) {
        setStatus('Something went wrong. Please try again.', true);
      }
    });
  }


  /* ---------- 6. Motion ---------- */
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // split the headline into words (the "Code" underline stays intact)
  const h1 = document.querySelector('.hero h1');
  if (h1) {
    let idx = 0;
    const frag = document.createDocumentFragment();
    const wrap = (node) => {
      const w = document.createElement('span');
      w.className = 'w';
      const inner = document.createElement('span');
      inner.className = 'w__in';
      inner.style.setProperty('--i', idx++);
      inner.appendChild(node);
      w.appendChild(inner);
      return w;
    };
    [...h1.childNodes].forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        node.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          frag.appendChild(/^\s+$/.test(part) ? document.createTextNode(' ') : wrap(document.createTextNode(part)));
        });
      } else {
        frag.appendChild(wrap(node));
      }
    });
    h1.textContent = '';
    h1.appendChild(frag);
  }
  requestAnimationFrame(() => requestAnimationFrame(() => document.body.classList.add('is-loaded')));

  // scroll progress bar
  const bar = document.querySelector('.progress');
  const onScroll = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    if (bar && max > 0) bar.style.setProperty('--p', (scrollY / max).toFixed(4));
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // pins: stagger index
  document.querySelectorAll('.pins > g').forEach((g, i) => g.style.setProperty('--n', i));

  // donuts: count the numbers up when the charts appear
  const charts = document.querySelector('.stars__charts');
  if (charts && 'IntersectionObserver' in window && !reduce) {
    const co = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      co.disconnect();
      document.querySelectorAll('.donut').forEach((d) => {
        const target = Number(d.dataset.v);
        const label = d.querySelector('span');
        const start = performance.now() + 400;
        const tick = (now) => {
          const t = Math.min(Math.max((now - start) / 1800, 0), 1);
          label.textContent = Math.round(target * (1 - Math.pow(1 - t, 3))) + '%';
          if (t < 1) requestAnimationFrame(tick);
        };
        label.textContent = '0%';
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.3 });
    co.observe(charts);
  }

  // pointer effects (mouse devices only)
  if (!reduce && window.matchMedia('(hover: hover)').matches) {
    const hero = document.querySelector('.hero');
    const avatar = document.querySelector('.avatar');
    if (hero && avatar) {
      hero.addEventListener('mousemove', (e) => {
        const r = avatar.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width / 2)) / innerWidth;
        const dy = (e.clientY - (r.top + r.height / 2)) / innerHeight;
        avatar.style.setProperty('--ry', (dx * 14).toFixed(2) + 'deg');
        avatar.style.setProperty('--rx', (-dy * 14).toFixed(2) + 'deg');
      });
      hero.addEventListener('mouseleave', () => {
        avatar.style.setProperty('--rx', '0deg');
        avatar.style.setProperty('--ry', '0deg');
      });
    }

    // magnetic buttons
    document.querySelectorAll('.handle, .contact button').forEach((el) => {
      el.style.transition = 'transform .2s ease-out, background .2s';
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.25}px, ${(e.clientY - r.top - r.height / 2) * 0.35}px)`;
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
  }

  /* ---------- typing code card ---------- */
  const typed = document.getElementById('typed');
  if (typed) {
    const parts = [
      ['k', 'const '], ['b', 'lyuk'], ['p', ' = {\n  '], ['b', 'role'], ['p', ': '], ['s', '"designer & developer"'], ['p', ',\n  '],
      ['b', 'stack'], ['p', ': ['], ['s', '"Figma"'], ['p', ', '], ['s', '"HTML"'], ['p', ', '], ['s', '"CSS"'], ['p', ', '], ['s', '"JS"'], ['p', '],\n  '],
      ['b', 'openToWork'], ['p', ': '], ['k', 'true'], ['p', ',\n};'],
    ];
    const spans = parts.map(([cls, text]) => {
      const el = document.createElement('span');
      el.className = cls;
      typed.appendChild(el);
      return [el, text];
    });
    if (reduce) {
      spans.forEach(([el, text]) => { el.textContent = text; });
    } else {
      typed.classList.add('typing');
      let si = 0, ci = 0;
      const step = () => {
        if (si >= spans.length) return;
        const [el, text] = spans[si];
        el.textContent = text.slice(0, ++ci);
        if (ci >= text.length) { si++; ci = 0; }
        setTimeout(step, 38);
      };
      setTimeout(step, 2300);
    }
  }

  /* ---------- 5. Footer year ---------- */
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
