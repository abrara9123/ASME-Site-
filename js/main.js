// ============================================================
// UIC ASME — site interactions
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

  /* ---- Consistent active nav item ---- */
  const pageFile = (location.pathname.split('/').pop() || 'index.html').toLowerCase() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href') || '';
    if (href.includes('#')) {
      a.classList.remove('active');
      return;
    }
    const target = href.split('/').pop().toLowerCase();
    a.classList.toggle('active', target === pageFile);
  });

  /* ---- Sponsors / Legacy hash links always scroll ---- */
  const scrollToHash = (hash) => {
    if (!hash) return false;
    const el = document.getElementById(hash.replace('#', ''));
    if (!el) return false;

    const start = window.scrollY;
    const target = Math.max(0, el.getBoundingClientRect().top + window.scrollY - 84);
    const distance = target - start;
    const duration = Math.min(820, Math.max(520, Math.abs(distance) * 0.55));
    const startTime = performance.now();
    const ease = t => 1 - Math.pow(1 - t, 4);

    const animateScroll = now => {
      const progress = Math.min((now - startTime) / duration, 1);
      window.scrollTo(0, start + distance * ease(progress));
      if (progress < 1) requestAnimationFrame(animateScroll);
    };
    requestAnimationFrame(animateScroll);
    return true;
  };
  if (location.hash) setTimeout(() => scrollToHash(location.hash), 80);
  document.querySelectorAll('a[href*="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const raw = a.getAttribute('href') || '';
      const hash = raw.includes('#') ? raw.slice(raw.indexOf('#')) : '';
      if (!hash || hash === '#') return;
      const samePage = raw.startsWith('#') || raw.split('#')[0] === '' || raw.split('#')[0] === pageFile;
      if (samePage && scrollToHash(hash)) {
        e.preventDefault();
        history.pushState(null, '', hash);
      }
    });
  });

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
const teamPanels = document.querySelectorAll('.team-panel');
const teamTrack = document.querySelector('.teams-track');
const teamViewport = document.querySelector('.teams-viewport');

let teamSwitchTimer;

if (teamTabs.length && teamPanels.length && teamTrack) {

  teamTabs.forEach(tab => {

    tab.addEventListener('click', () => {

      const selectedTeam = tab.dataset.team;
      let selectedIndex = 0;

      teamPanels.forEach((panel, index) => {

        panel.classList.toggle(
          'active',
          panel.id === selectedTeam
        );

        if (panel.id === selectedTeam) {
          selectedIndex = index;
        }

      });


      /* Change active tab immediately */
      teamTabs.forEach(button =>
        button.classList.remove('active')
      );

      tab.classList.add('active');


      const newPosition =
        `translateX(-${selectedIndex * 100}%)`;


      /* MOBILE */
      if (
        window.matchMedia('(max-width: 720px)').matches &&
        teamViewport
      ) {

        clearTimeout(teamSwitchTimer);

        /* Fade current card out */
        teamViewport.classList.add('team-switching');

        teamSwitchTimer = setTimeout(() => {

          /* Switch cards while invisible */
          teamTrack.style.transform = newPosition;

          requestAnimationFrame(() => {

            /* Fade new card in */
            teamViewport.classList.remove('team-switching');

          });

        }, 180);

      }

      /* DESKTOP */
      else {

        teamTrack.style.transform = newPosition;

      }

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

  /* ---- About next-step list ---- */
const aboutSteps = document.querySelectorAll('.about-step');
const aboutImg = document.getElementById('about-step-img');
if (aboutSteps.length && aboutImg) {
  aboutSteps.forEach(step => {
    step.addEventListener('click', () => {
      aboutSteps.forEach(s => s.classList.remove('active'));
      step.classList.add('active');
      const src = step.dataset.img;
      if (src) {
        aboutImg.src = src;
      }
    });
  });

  // Load the first/active image when the page opens
  const activeStep =
    document.querySelector('.about-step.active') || aboutSteps[0];
  if (activeStep) {
    activeStep.classList.add('active');
    const src = activeStep.dataset.img;
    if (src) {
      aboutImg.src = src;
    }
  }
}

  /* ---- Where We've Been carousel ---- */
  const beenSlides = Array.from(document.querySelectorAll('.been-slide'));
  if (beenSlides.length) {
    let beenIndex = beenSlides.findIndex(s => s.classList.contains('is-center'));
    if (beenIndex < 0) beenIndex = 2;
    const layoutBeen = () => {
      const n = beenSlides.length;
      beenSlides.forEach((slide, i) => {
        let d = i - beenIndex;
        if (d > n / 2) d -= n;
        if (d < -n / 2) d += n;
        slide.classList.toggle('is-center', i === beenIndex);
        slide.classList.toggle('is-off', Math.abs(d) > 2);
        slide.style.order = String(d + 10);
      });
    };
    layoutBeen();
    const stepBeen = () => {
      beenIndex = (beenIndex + 1) % beenSlides.length;
      layoutBeen();
    };
    let beenTimer = setInterval(stepBeen, 2800);
    beenSlides.forEach((slide, i) => {
      slide.addEventListener('click', () => {
        beenIndex = i;
        layoutBeen();
        clearInterval(beenTimer);
        beenTimer = setInterval(stepBeen, 2800);
      });
    });
  }

  /* ---- Legacy year tabs ---- */
  const yearTabs = document.querySelectorAll('.legacy-year');
  if (yearTabs.length) {
    yearTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        yearTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        document.querySelectorAll('.legacy-board').forEach(b => b.classList.remove('active'));
        const board = document.getElementById(tab.dataset.year);
        if (board) board.classList.add('active');
      });
    });
  }
/* ---- About Building Fast stats animation ---- */
const aboutStats = document.querySelector('.about-stats');

if (aboutStats) {

  const animateAboutNumber = (card) => {

    const number = card.querySelector('b');
    const target = parseInt(card.dataset.count, 10);
    const suffix = card.dataset.suffix || '';

    const duration = 1000;
    const startTime = performance.now();

    const updateNumber = (currentTime) => {

      const progress = Math.min(
        (currentTime - startTime) / duration,
        1
      );

      /* Smooth easing */
      const eased = 1 - Math.pow(1 - progress, 3);

      const currentNumber = Math.round(target * eased);

      number.textContent = currentNumber + suffix;

      if (progress < 1) {
        requestAnimationFrame(updateNumber);
      }
    };

    requestAnimationFrame(updateNumber);
  };


  const statsObserver = new IntersectionObserver(
    (entries, observer) => {

      entries.forEach(entry => {

        if (entry.isIntersecting) {

          /* Start card rise animation */
          aboutStats.classList.add('animate');

          const cards =
            aboutStats.querySelectorAll('.about-stat');

          cards.forEach((card, index) => {

            /* Match the staggered card animation */
            setTimeout(() => {
              animateAboutNumber(card);
            }, 100 + (index * 120));

          });

          /* Only run once */
          observer.unobserve(aboutStats);
        }

      });

    },
    {
      threshold: 0.3
    }
  );

  statsObserver.observe(aboutStats);
}
/* ---- Sponsorship inquiry modal ---- */
const sponsorModal = document.getElementById('sponsorModal');
const sponsorModalClose = document.getElementById('sponsorModalClose');
const sponsorButtons = document.querySelectorAll('.sponsor-open');
const sponsorTier = document.getElementById('sponsorTier');

if (sponsorModal && sponsorButtons.length) {
  sponsorButtons.forEach(button => {
    button.addEventListener('click', () => {
      const tier = button.dataset.tier;
      if (sponsorTier) {
        sponsorTier.value = tier;
      }
      sponsorModal.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  });
  const closeSponsorModal = () => {
    sponsorModal.classList.remove('open');
    document.body.style.overflow = '';
  };
  sponsorModalClose?.addEventListener(
    'click',
    closeSponsorModal
  );
  /* Click outside popup to close */
  sponsorModal.addEventListener('click', (event) => {
    if (event.target === sponsorModal) {
      closeSponsorModal();
    }
  });
  /* ESC key closes popup */
  document.addEventListener('keydown', (event) => {

    if (event.key === 'Escape') {
      closeSponsorModal();
    }

  });
}
/* ---- Sponsorship form submission ---- */
const sponsorForm = document.getElementById('sponsorForm');
const sponsorSuccess =
  document.getElementById('sponsorSuccess');

const successTicketId =
  document.getElementById('successTicketId');

const sponsorSuccessClose =
  document.getElementById('sponsorSuccessClose');
if (sponsorForm) {
  sponsorForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const submitButton =
      sponsorForm.querySelector('.sponsor-submit');
    submitButton.disabled = true;
    submitButton.textContent = 'Sending...';
    const formData = {
      company:
        document.getElementById('companyName').value,
      name:
        document.getElementById('contactName').value,
      email:
        document.getElementById('contactEmail').value,
      tier:
        document.getElementById('sponsorTier').value,
      message:
        document.getElementById('sponsorComments').value
    };
    try {
      const response = await fetch('/api/sponsor-ticket', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(
          result.error || 'Unable to send sponsorship request.'
        );
      }
      sponsorForm.reset();

/* Hide form */
sponsorForm.style.display = 'none';

/* Hide original heading + intro */
const modalHeading =
  sponsorModal?.querySelector('.sponsor-modal-box > h2');

const modalIntro =
  sponsorModal?.querySelector('.sponsor-modal-intro');

if (modalHeading) {
  modalHeading.style.display = 'none';
}

if (modalIntro) {
  modalIntro.style.display = 'none';
}

/* Add ticket number */
if (successTicketId) {
  successTicketId.textContent = result.ticketId;
}

/* Show success screen */
if (sponsorSuccess) {
  sponsorSuccess.classList.add('show');
}
    } catch (error) {
      console.error('Sponsorship request error:', error);
      alert(
        'Unable to send your sponsorship request. Please try again.'
      );
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = 'Send Request →';
    }
  });
}

sponsorSuccessClose?.addEventListener('click', () => {

     sponsorSuccess?.classList.remove('show');
   
     if (sponsorForm) {
       sponsorForm.style.display = '';
     }
   
     const modalHeading =
       sponsorModal?.querySelector('.sponsor-modal-box > h2');
   
     const modalIntro =
       sponsorModal?.querySelector('.sponsor-modal-intro');
   
     if (modalHeading) {
       modalHeading.style.display = '';
     }
   
     if (modalIntro) {
       modalIntro.style.display = '';
     }
   
     sponsorModal?.classList.remove('open');
   
     document.body.style.overflow = '';
   });
   
   
   }); // END DOMContentLoaded
   
   
   /* =========================================
      PAGE WIPE — ALL INTERNAL PAGES
      ========================================= */
   
   (() => {
   
     const beginPageTransition = (url) => {
   
       if (document.body.classList.contains('page-transitioning')) {
         return;
       }
   
       document.body.classList.add('page-transitioning');
   
       setTimeout(() => {
         window.location.href = url;
       }, 500);
     };
   
   
     document.addEventListener('click', (event) => {
   
       const link = event.target.closest('a[href]');
   
       if (!link) return;
   
       const href = link.getAttribute('href');
   
       if (
         !href ||
         href.startsWith('#') ||
         href.startsWith('mailto:') ||
         href.startsWith('tel:') ||
         link.target === '_blank'
       ) {
         return;
       }
   
       const destination =
         new URL(href, window.location.href);
   
       if (destination.origin !== window.location.origin) {
         return;
       }
   
       if (
         destination.pathname === window.location.pathname &&
         destination.hash
       ) {
         return;
       }
   
       event.preventDefault();
   
       beginPageTransition(destination.href);
     });
   
   })();
