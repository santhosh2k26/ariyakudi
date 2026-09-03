/**
 * GHSS Ariyakudi - Official Website Script
 * Pure Vanilla JavaScript - Multi-View Tab Navigation, Modals, Lightbox & Bug-Free Animations
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // ==========================================================================
  // 1. Sticky Navbar & Back to Top Button
  // ==========================================================================
  const navbar = document.getElementById('navbar');
  const backToTopBtn = document.getElementById('backToTopBtn');

  const handleScroll = () => {
    const scrollY = window.scrollY || window.pageYOffset;
    
    // Navbar shrink effect
    if (navbar) {
      if (scrollY > 40) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }

    // Back to top button visibility
    if (backToTopBtn) {
      if (scrollY > 300) {
        backToTopBtn.classList.add('visible');
      } else {
        backToTopBtn.classList.remove('visible');
      }
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // ==========================================================================
  // 2. Mobile Hamburger Menu & Overlay
  // ==========================================================================
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const navMenu = document.getElementById('navMenu');
  const menuOverlay = document.getElementById('menuOverlay');

  const toggleMobileMenu = (open) => {
    if (!navMenu || !hamburgerBtn) return;
    const isOpen = open !== undefined ? open : !navMenu.classList.contains('active');
    hamburgerBtn.classList.toggle('active', isOpen);
    navMenu.classList.toggle('active', isOpen);
    if (menuOverlay) menuOverlay.classList.toggle('active', isOpen);
    hamburgerBtn.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  };

  if (hamburgerBtn) {
    hamburgerBtn.addEventListener('click', () => toggleMobileMenu());
  }
  if (menuOverlay) {
    menuOverlay.addEventListener('click', () => toggleMobileMenu(false));
  }

  // ==========================================================================
  // 3. Multi-View Tab Router (Click to View Individual Pages)
  // ==========================================================================
  const pageViews = document.querySelectorAll('.page-view');
  const navLinks = document.querySelectorAll('.nav-menu .nav-link');
  const allViewTriggers = document.querySelectorAll('[data-view]');

  const validViews = ['home', 'academics', 'campus', 'achievements', 'gallery', 'contact'];

  const normalizeViewName = (name) => {
    if (!name) return 'home';
    const clean = name.replace('#', '').trim().toLowerCase();
    if (clean === 'facilities') return 'campus';
    if (['about', 'notices'].includes(clean)) return 'home';
    if (['events', 'life'].includes(clean)) return 'gallery';
    if (clean === 'activities') return 'achievements';
    if (['contact', 'location', 'map'].includes(clean)) return 'contact';
    return validViews.includes(clean) ? clean : 'home';
  };

  const switchView = (targetView, shouldScroll = true) => {
    const viewName = normalizeViewName(targetView);
    const targetElement = document.getElementById(`view-${viewName}`);

    if (!targetElement) return;

    // 1. Switch active page view
    pageViews.forEach(view => {
      view.classList.remove('active');
    });
    targetElement.classList.add('active');

    // 2. Update navbar active link highlight
    navLinks.forEach(link => {
      const linkView = link.getAttribute('data-view') || link.getAttribute('href').replace('#', '');
      if (normalizeViewName(linkView) === viewName) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // 3. Close mobile menu if open
    toggleMobileMenu(false);

    // 4. Scroll to top instantly without jumping
    if (shouldScroll) {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'auto'
      });
    }

    // 5. Update browser URL hash without page reload
    if (window.location.hash !== `#${viewName}`) {
      if (history.pushState) {
        history.pushState(null, null, `#${viewName}`);
      } else {
        window.location.hash = `#${viewName}`;
      }
    }

    // 6. Trigger reveal animations & counters inside active view
    triggerActiveViewAnimations(targetElement);
  };

  // Attach click listener to all navigation triggers
  allViewTriggers.forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      const targetView = trigger.getAttribute('data-view') || trigger.getAttribute('href');
      switchView(targetView, true);
    });
  });

  // Handle generic hash links across the page (e.g. footer links, hero buttons)
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    if (!link.hasAttribute('data-view')) {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (href && href.length > 1) {
          const target = href.replace('#', '');
          const view = normalizeViewName(target);
          e.preventDefault();
          switchView(view, true);

          // If targeting a sub-section inside that view, scroll to it after switch
          if (!validViews.includes(target)) {
            setTimeout(() => {
              const subSection = document.getElementById(target);
              if (subSection) {
                subSection.scrollIntoView({ behavior: 'smooth' });
              }
            }, 60);
          }
        }
      });
    }
  });

  // Handle browser back/forward buttons (hashchange)
  window.addEventListener('hashchange', () => {
    const currentHash = window.location.hash;
    switchView(currentHash, true);
  });

  // Initial load check based on URL hash
  const initialHash = window.location.hash;
  if (initialHash && initialHash.length > 1) {
    switchView(initialHash, false);
  } else {
    switchView('home', false);
  }

  // ==========================================================================
  // 4. Scroll Reveal Animations & Stats Counters for Active View
  // ==========================================================================
  function triggerActiveViewAnimations(container) {
    if (!container) return;

    // Reveal elements with smooth progressive stagger
    const revealEls = container.querySelectorAll('.reveal-on-scroll');
    revealEls.forEach((el, index) => {
      el.classList.remove('is-visible', 'revealed');
      setTimeout(() => {
        el.classList.add('is-visible');
      }, 40 + (index * 55));
    });

    // Animate stats counters if present in this view
    const statValues = container.querySelectorAll('.stat-value');
    statValues.forEach(el => animateCounter(el));
  }

  function animateCounter(el) {
    const rawText = el.innerText.trim();
    if (rawText.includes('XX+')) {
      el.style.transition = 'transform 0.4s ease';
      el.style.transform = 'scale(1.08)';
      setTimeout(() => {
        el.style.transform = 'scale(1)';
      }, 400);
      return;
    }

    const target = parseInt(el.getAttribute('data-target'), 10);
    if (isNaN(target)) return;

    let current = 0;
    const duration = 1000;
    const stepTime = 20;
    const steps = duration / stepTime;
    const increment = target / steps;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        el.innerText = target + (rawText.includes('%') ? '%' : '+');
        clearInterval(timer);
      } else {
        el.innerText = Math.floor(current) + (rawText.includes('%') ? '%' : '+');
      }
    }, stepTime);
  }

  // ==========================================================================
  // 5. Event Category Filtering
  // ==========================================================================
  const eventFilterBtns = document.querySelectorAll('#eventFilters .filter-btn');
  const eventCards = document.querySelectorAll('#eventsGrid .event-card');

  eventFilterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      eventFilterBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      const filter = btn.getAttribute('data-filter');

      eventCards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          card.classList.remove('hidden');
          card.style.animation = 'viewFadeIn 0.3s ease';
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });

  // ==========================================================================
  // 6. Gallery Category Filtering & Lightbox Modal
  // ==========================================================================
  const galleryFilterBtns = document.querySelectorAll('#galleryFilters .filter-btn');
  const galleryItems = document.querySelectorAll('#galleryGrid .gallery-item');

  // Filtering
  galleryFilterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      galleryFilterBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      const filter = btn.getAttribute('data-filter');

      galleryItems.forEach(item => {
        const category = item.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          item.classList.remove('hidden');
          item.style.animation = 'viewFadeIn 0.3s ease';
        } else {
          item.classList.add('hidden');
        }
      });
    });
  });

  // Lightbox Modal
  const galleryLightbox = document.getElementById('galleryLightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');
  const lightboxBackdrop = document.getElementById('lightboxBackdrop');

  let currentGalleryIndex = 0;
  let activeGalleryItems = [];

  const getVisibleGalleryItems = () => {
    return Array.from(galleryItems).filter(item => !item.classList.contains('hidden'));
  };

  const openLightbox = (index) => {
    activeGalleryItems = getVisibleGalleryItems();
    if (activeGalleryItems.length === 0) return;

    currentGalleryIndex = (index + activeGalleryItems.length) % activeGalleryItems.length;
    const targetItem = activeGalleryItems[currentGalleryIndex];

    const src = targetItem.getAttribute('data-src');
    const caption = targetItem.getAttribute('data-caption');

    lightboxImg.src = src;
    lightboxImg.alt = caption;
    lightboxCaption.textContent = caption;

    galleryLightbox.classList.add('active');
    galleryLightbox.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    if (galleryLightbox) {
      galleryLightbox.classList.remove('active');
      galleryLightbox.setAttribute('hidden', '');
      document.body.style.overflow = '';
    }
  };

  const showNextImage = () => {
    openLightbox(currentGalleryIndex + 1);
  };

  const showPrevImage = () => {
    openLightbox(currentGalleryIndex - 1);
  };

  galleryItems.forEach(item => {
    item.addEventListener('click', () => {
      activeGalleryItems = getVisibleGalleryItems();
      const index = activeGalleryItems.indexOf(item);
      openLightbox(index);
    });
  });

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightboxBackdrop) lightboxBackdrop.addEventListener('click', closeLightbox);
  if (lightboxNext) lightboxNext.addEventListener('click', showNextImage);
  if (lightboxPrev) lightboxPrev.addEventListener('click', showPrevImage);

  // ==========================================================================
  // 7. Notice Board Modals (All Notices)
  // ==========================================================================
  const noticesModal = document.getElementById('noticesModal');
  const openAllNoticesModal = document.getElementById('openAllNoticesModal');
  const noticesModalClose = document.getElementById('noticesModalClose');
  const noticesModalCloseBtn = document.getElementById('noticesModalCloseBtn');
  const noticesModalBackdrop = document.getElementById('noticesModalBackdrop');

  const openNoticesModal = () => {
    if (noticesModal) {
      noticesModal.classList.add('active');
      noticesModal.removeAttribute('hidden');
      document.body.style.overflow = 'hidden';
    }
  };

  const closeNoticesModal = () => {
    if (noticesModal) {
      noticesModal.classList.remove('active');
      noticesModal.setAttribute('hidden', '');
      document.body.style.overflow = '';
    }
  };

  if (openAllNoticesModal) openAllNoticesModal.addEventListener('click', openNoticesModal);
  if (noticesModalClose) noticesModalClose.addEventListener('click', closeNoticesModal);
  if (noticesModalCloseBtn) noticesModalCloseBtn.addEventListener('click', closeNoticesModal);
  if (noticesModalBackdrop) noticesModalBackdrop.addEventListener('click', closeNoticesModal);

  // ==========================================================================
  // 8. Dynamic Scroll Reveal & Stagger Animation Observer
  // ==========================================================================
  const revealElements = document.querySelectorAll('.reveal-on-scroll');

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, {
    root: null,
    rootMargin: '0px 0px -30px 0px',
    threshold: 0.08
  });

  revealElements.forEach(el => revealObserver.observe(el));

  // Trigger animations whenever user switches to another page view
  window.triggerTabReveal = (container) => {
    if (!container) return;
    const elements = container.querySelectorAll('.reveal-on-scroll');
    elements.forEach((el, index) => {
      el.classList.remove('revealed');
      setTimeout(() => {
        el.classList.add('revealed');
      }, 40 + (index * 60));
    });
  };

  // Initial trigger for home view on load
  const activeViewEl = document.querySelector('.page-view.active');
  if (activeViewEl) {
    window.triggerTabReveal(activeViewEl);
  }

  // ==========================================================================
  // 9. Interactive 3D Card Gyro & Dynamic Tilt Effect (Desktop)
  // ==========================================================================
  const tiltCards = document.querySelectorAll('.stat-card, .achieve-cat-card, .facility-card, .academic-card, .pillar-box, .contact-item-card, .event-card');

  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    tiltCards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -5.5;
        const rotateY = ((x - centerX) / centerX) * 5.5;

        card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-6px) scale(1.02)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  // ==========================================================================
  // 10. Continuous Automatic 3D Letter Wave for GHSS Ariyakudi
  // ==========================================================================
  const heroTitle = document.getElementById('heroMainTitle');
  if (heroTitle && !heroTitle.dataset.split) {
    const text = heroTitle.textContent.trim();
    heroTitle.innerHTML = text.split('').map((char, index) => {
      if (char === ' ') return '&nbsp;';
      const delay = (index * 0.12).toFixed(2);
      return `<span class="char" style="animation-delay: ${delay}s">${char}</span>`;
    }).join('');
    heroTitle.dataset.split = 'true';
  }

  // Live Letter-by-Letter Typewriter Animation for School Motto
  const mottoElement = document.getElementById('mottoTypingText');
  const mottoFullText = '“The Growth of Students is the Growth of the School”';

  if (mottoElement) {
    mottoElement.textContent = '';
    let charIdx = 0;
    const typeMotto = () => {
      if (charIdx < mottoFullText.length) {
        mottoElement.textContent += mottoFullText.charAt(charIdx);
        charIdx++;
        setTimeout(typeMotto, 45);
      }
    };
    setTimeout(typeMotto, 600);
  }

});
