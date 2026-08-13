// ============================================================
// UIC ASME — site interactions
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

  /* ---- Mobile nav toggle ---- */
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('open');
      links.classList.toggle('open');
    });
    links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      toggle.classList.remove('open');
      links.classList.remove('open');
    }));
  }

  /* ---- Sticky nav border/background intensifies on scroll ---- */
  const nav = document.querySelector('.site-nav');
  if (nav) {
    const onScroll = () => {
      const inHero = nav.closest('.hero-v2');
      if (window.scrollY > 12) nav.style.background = 'rgba(17,17,19,0.92)';
      else nav.style.background = inHero ? 'transparent' : 'rgba(17,17,19,0.72)';
    };
    document.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---- Scroll reveal ---- */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('in'));
  }

  // stagger index vars for children of .reveal-stagger
  document.querySelectorAll('.reveal-stagger').forEach(parent => {
    Array.from(parent.children).forEach((child, i) => child.style.setProperty('--i', i));
  });

  /* ---- Accordion (event detail page) ---- */
  document.querySelectorAll('.accordion-item').forEach((item, i) => {
    const trigger = item.querySelector('.accordion-trigger');
    const panel = item.querySelector('.accordion-panel');
    if (!trigger || !panel) return;
    // open first item by default
    if (i === 0) {
      item.classList.add('open');
      panel.style.maxHeight = panel.scrollHeight + 'px';
    }
    trigger.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      item.parentElement.querySelectorAll('.accordion-item').forEach(other => {
        other.classList.remove('open');
        other.querySelector('.accordion-panel').style.maxHeight = 0;
      });
      if (!isOpen) {
        item.classList.add('open');
        panel.style.maxHeight = panel.scrollHeight + 'px';
      }
    });
  });

  /* ---- Filter chips (events page) ---- */
  const chips = document.querySelectorAll('.filter-chip');
  const filterCards = document.querySelectorAll('[data-status]');
  if (chips.length && filterCards.length) {
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        chips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        const val = chip.dataset.filter;
        filterCards.forEach(card => {
          const show = val === 'all' || card.dataset.status === val;
          card.style.display = show ? '' : 'none';
        });
      });
    });
  }

  /* ---- Project team tabs (home page) ---- */
  const teamTabs = document.querySelectorAll('.team-tab');
  if (teamTabs.length) {
    teamTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        teamTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        document.querySelectorAll('.team-panel').forEach(p => p.classList.remove('active'));
        const panel = document.getElementById(tab.dataset.team);
        if (panel) panel.classList.add('active');
      });
    });
  }

  /* ---- Animated stat counters (home page) ---- */
  const statEls = document.querySelectorAll('.stat[data-count]');
  if (statEls.length && 'IntersectionObserver' in window) {
    const animateStat = (el) => {
      const target = parseInt(el.dataset.count, 10);
      const suffix = el.dataset.suffix || '';
      const numEl = el.querySelector('b');
      const duration = 1100;
      const start = performance.now();
      const tick = (now) => {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        numEl.textContent = Math.round(eased * target) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    const statIo = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateStat(entry.target);
          statIo.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    statEls.forEach(el => statIo.observe(el));
  }

  /* ---- Lightbox (gallery page) ---- */
  const lightbox = document.querySelector('.lightbox');
  if (lightbox) {
    const lightboxImg = lightbox.querySelector('img');
    document.querySelectorAll('.gallery-item').forEach(item => {
      item.addEventListener('click', () => {
        const src = item.querySelector('img').src;
        lightboxImg.src = src;
        lightbox.classList.add('open');
      });
    });
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox || e.target.classList.contains('lightbox-close')) {
        lightbox.classList.remove('open');
        lightboxImg.src = '';
      }
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { lightbox.classList.remove('open'); lightboxImg.src=''; }
    });
  }

});
