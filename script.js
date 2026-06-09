/* WebGift — Advanced Visual Experience */

(function () {
  'use strict';

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  let giftOpened = false;
  const isMobile = window.matchMedia('(max-width: 767px)').matches;
  let scrollPerfTicking = false;
  let isUserScrolling = false;
  let scrollIdleTimer;

  window.addEventListener('scroll', () => {
    isUserScrolling = true;
    document.body.classList.add('is-scrolling');
    clearTimeout(scrollIdleTimer);
    scrollIdleTimer = setTimeout(() => {
      isUserScrolling = false;
      document.body.classList.remove('is-scrolling');
      if (ambientResumePending && ambientRunning) {
        ambientResumePending = false;
        requestAnimationFrame(ambientDrawFrame);
      }
      if (sparklesResumePending && sparklesRunning && sparklesDrawFrame) {
        sparklesResumePending = false;
        requestAnimationFrame(sparklesDrawFrame);
      }
    }, 150);
  }, { passive: true });

  /* ─── Preloader ─── */
  const preloader = $('#preloader');
  window.addEventListener('load', () => {
    setTimeout(() => preloader?.classList.add('done'), 600);
  });

  /* ─── Intro Particles ─── */
  const introParticles = $('#introParticles');
  if (introParticles) {
    const particleCount = isMobile ? 10 : 24;
    for (let i = 0; i < particleCount; i++) {
      const p = document.createElement('span');
      p.className = 'intro__particle';
      p.style.left = `${Math.random() * 100}%`;
      p.style.animationDelay = `${Math.random() * 4}s`;
      p.style.animationDuration = `${3 + Math.random() * 3}s`;
      introParticles.appendChild(p);
    }
  }

  /* ─── Open Burst Effect ─── */
  const openBurstCanvas = $('#openBurst');
  let burstCtx;
  let burstParticles = [];
  let burstAnimating = false;

  function playOpenBurst() {
    if (!openBurstCanvas) return;

    openBurstCanvas.width = window.innerWidth;
    openBurstCanvas.height = window.innerHeight;
    burstCtx = openBurstCanvas.getContext('2d');
    openBurstCanvas.classList.add('active');

    const cx = openBurstCanvas.width / 2;
    const cy = openBurstCanvas.height / 2;
    const colors = ['#ff4d8d', '#f0a8c0', '#b06aff', '#e8b87a', '#fff'];

    burstParticles = [];
    const count = isMobile ? 32 : 140;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 6 + Math.random() * 14;
      burstParticles.push({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        r: 2 + Math.random() * 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 1,
        decay: 0.012 + Math.random() * 0.01,
        gravity: 0.08
      });
    }

    if (!burstAnimating) {
      burstAnimating = true;
      animateBurst();
    }
  }

  function animateBurst() {
    if (!burstCtx) return;
    burstCtx.clearRect(0, 0, openBurstCanvas.width, openBurstCanvas.height);

    let alive = 0;
    burstParticles.forEach(p => {
      p.vy += p.gravity;
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.98;
      p.life -= p.decay;

      if (p.life > 0) {
        alive++;
        burstCtx.beginPath();
        burstCtx.arc(p.x, p.y, p.r * p.life, 0, Math.PI * 2);
        burstCtx.fillStyle = p.color;
        burstCtx.globalAlpha = p.life;
        burstCtx.fill();
        burstCtx.globalAlpha = 1;
      }
    });

    if (alive > 0) {
      requestAnimationFrame(animateBurst);
    } else {
      burstAnimating = false;
      burstCtx.clearRect(0, 0, openBurstCanvas.width, openBurstCanvas.height);
      openBurstCanvas.classList.remove('active');
    }
  }

  /* ─── Hero Sparkles ─── */
  const heroSparkles = $('#heroSparkles');
  let sparkleCtx;
  let sparkles = [];
  let sparklesRunning = false;
  let sparklesDrawFrame = null;
  let sparklesResumePending = false;
  let sparklesHeroVisible = true;

  function initHeroSparkles() {
    if (!heroSparkles || sparklesRunning) return;
    sparklesRunning = true;

    const resize = () => {
      const rect = heroSparkles.parentElement.getBoundingClientRect();
      heroSparkles.width = Math.max(1, Math.floor(rect.width));
      heroSparkles.height = Math.max(1, Math.floor(rect.height));
    };
    resize();
    window.addEventListener('resize', resize);

    const count = isMobile ? 32 : 70;
    sparkles = Array.from({ length: count }, () => ({
      x: Math.random() * heroSparkles.width,
      y: Math.random() * heroSparkles.height,
      r: Math.random() * (isMobile ? 1.6 : 2) + 0.5,
      phase: Math.random() * Math.PI * 2,
      speed: 0.02 + Math.random() * 0.03,
      drift: (Math.random() - 0.5) * 0.3
    }));

    sparkleCtx = heroSparkles.getContext('2d');

    function drawSparkles() {
      if (!giftOpened || !sparkleCtx) return;
      sparklesDrawFrame = drawSparkles;

      if (isUserScrolling || document.hidden || !sparklesHeroVisible) {
        sparklesResumePending = true;
        return;
      }
      sparklesResumePending = false;

      sparkleCtx.clearRect(0, 0, heroSparkles.width, heroSparkles.height);

      sparkles.forEach(s => {
        s.phase += s.speed;
        s.y -= isMobile ? 0.1 : 0.15;
        s.x += s.drift;
        const alpha = (Math.sin(s.phase) + 1) / 2 * 0.7 + 0.1;

        if (s.y < -5) {
          s.y = heroSparkles.height + 5;
          s.x = Math.random() * heroSparkles.width;
        }

        sparkleCtx.beginPath();
        sparkleCtx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        sparkleCtx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        sparkleCtx.fill();

        if (!isMobile && s.r > 1.2) {
          sparkleCtx.beginPath();
          sparkleCtx.arc(s.x, s.y, s.r * 3, 0, Math.PI * 2);
          sparkleCtx.fillStyle = `rgba(255, 77, 141, ${alpha * 0.2})`;
          sparkleCtx.fill();
        } else if (isMobile && s.r > 1.2) {
          sparkleCtx.beginPath();
          sparkleCtx.arc(s.x, s.y, s.r * 2, 0, Math.PI * 2);
          sparkleCtx.fillStyle = `rgba(255, 77, 141, ${alpha * 0.18})`;
          sparkleCtx.fill();
        }
      });

      requestAnimationFrame(drawSparkles);
    }

    const heroEl = $('.hero');
    if (heroEl) {
      new IntersectionObserver(
        ([entry]) => {
          sparklesHeroVisible = entry.isIntersecting;
          if (sparklesHeroVisible && sparklesResumePending) {
            requestAnimationFrame(drawSparkles);
          }
        },
        { threshold: 0.08 }
      ).observe(heroEl);
    }

    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && sparklesResumePending && sparklesHeroVisible) {
        requestAnimationFrame(drawSparkles);
      }
    });

    drawSparkles();
  }

  /* ─── Ambient Canvas ─── */
  const ambientCanvas = $('#ambientCanvas');
  let ambientCtx;
  let ambientParticles = [];
  let ambientRunning = false;
  let ambientDrawFrame = null;
  let ambientResumePending = false;

  function initAmbient() {
    if (!ambientCanvas || ambientRunning) return;
    ambientRunning = true;

    const resize = () => {
      ambientCanvas.width = window.innerWidth;
      ambientCanvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const count = isMobile ? 36 : 90;
    const colors = ['rgba(255,77,141,', 'rgba(176,106,255,', 'rgba(240,168,192,', 'rgba(232,184,122,'];

    ambientParticles = Array.from({ length: count }, () => ({
      x: Math.random() * ambientCanvas.width,
      y: Math.random() * ambientCanvas.height,
      r: Math.random() * 2 + 0.5,
      speed: Math.random() * 0.4 + 0.15,
      opacity: Math.random() * 0.5 + 0.2,
      drift: (Math.random() - 0.5) * 0.25,
      color: colors[Math.floor(Math.random() * colors.length)]
    }));

    ambientCtx = ambientCanvas.getContext('2d');

    function draw() {
      if (!ambientCtx || !giftOpened) return;
      ambientDrawFrame = draw;
      if (isUserScrolling || document.hidden) {
        ambientResumePending = true;
        return;
      }
      ambientResumePending = false;
      ambientCtx.clearRect(0, 0, ambientCanvas.width, ambientCanvas.height);

      ambientParticles.forEach(p => {
        p.y -= p.speed;
        p.x += p.drift;
        if (p.y < -5) {
          p.y = ambientCanvas.height + 5;
          p.x = Math.random() * ambientCanvas.width;
        }
        ambientCtx.beginPath();
        ambientCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ambientCtx.fillStyle = `${p.color}${p.opacity})`;
        ambientCtx.fill();
      });

      if (!isMobile && ambientParticles.length > 10) {
        ambientCtx.strokeStyle = 'rgba(255, 77, 141, 0.06)';
        ambientCtx.lineWidth = 1;
        for (let i = 0; i < ambientParticles.length; i += 3) {
          for (let j = i + 1; j < ambientParticles.length; j += 5) {
            const a = ambientParticles[i];
            const b = ambientParticles[j];
            const dist = Math.hypot(a.x - b.x, a.y - b.y);
            if (dist < 120) {
              ambientCtx.globalAlpha = (1 - dist / 120) * 0.4;
              ambientCtx.beginPath();
              ambientCtx.moveTo(a.x, a.y);
              ambientCtx.lineTo(b.x, b.y);
              ambientCtx.stroke();
            }
          }
        }
        ambientCtx.globalAlpha = 1;
      }

      requestAnimationFrame(draw);
    }

    draw();
  }

  /* ─── Reveal System ─── */
  let revealObserver;

  function initReveal() {
    if (revealObserver) {
      flushReveal();
      return;
    }

    revealObserver = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -20px 0px' }
    );

    $$('.reveal, .timeline__event').forEach(el => {
      if (!el.closest('.hero')) revealObserver.observe(el);
    });

    flushReveal();
  }

  function flushReveal() {
    $$('.reveal, .timeline__event').forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.95 && rect.bottom > 0) {
        el.classList.add('visible');
        revealObserver?.unobserve(el);
      }
    });
  }

  function revealHero() {
    const hero = $('.hero');
    if (!hero) return;

    hero.classList.add('in-view', 'revealed');

    $$('.hero .reveal').forEach(el => {
      requestAnimationFrame(() => el.classList.add('visible'));
    });
  }

  /* ─── Open Gift ─── */
  const intro = $('#intro');
  const main = $('#main');
  const openBtn = $('#openGift');
  const nav = $('#siteNav');

  function setNavMenuOpen(open) {
    nav?.classList.toggle('menu-open', open);
    if (giftOpened) document.body.style.overflow = open ? 'hidden' : '';
  }

  function openGift() {
    if (giftOpened) return;
    giftOpened = true;

    playOpenBurst();
    intro.classList.add('closing');
    main.classList.remove('hidden');

    requestAnimationFrame(() => {
      main.classList.add('is-active');
    });

    setTimeout(() => {
      intro.style.display = 'none';
      document.body.style.overflow = '';
      nav?.classList.add('visible');
      revealHero();
      initReveal();
      initCounters();
      initTogetherCounter();
      initHeroSparkles();
      initAmbient();
      if (!isMobile) {
        initTimelineGlow();
      }
      initGalleryTilt();
      initQuiz();
      initCatchGame();
      initScratch();
      initEnvelope();
    }, 300);
  }

  openBtn?.addEventListener('click', openGift);
  document.body.style.overflow = 'hidden';

  /* ─── Navigation ─── */
  const navToggle = $('#navToggle');
  const navMenu = $('#navMenu');

  navToggle?.addEventListener('click', () => {
    const open = navMenu.classList.toggle('open');
    navToggle.classList.toggle('open', open);
    navToggle.setAttribute('aria-expanded', open);
    setNavMenuOpen(open);
  });

  $$('.nav__menu a').forEach(link => {
    link.addEventListener('click', () => {
      navMenu?.classList.remove('open');
      navToggle?.classList.remove('open');
      navToggle?.setAttribute('aria-expanded', 'false');
      setNavMenuOpen(false);
    });
  });

  /* ─── Counters ─── */
  let countersStarted = false;

  function initCounters() {
    if (countersStarted) return;
    countersStarted = true;

    const counterObserver = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const target = parseInt(el.dataset.count, 10);
          const duration = 2200;
          const start = performance.now();

          function tick(now) {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 4);
            const val = Math.floor(eased * target);
            el.textContent = target === 1 && progress >= 1 ? '∞' : val.toLocaleString('bg-BG');
            if (progress < 1) requestAnimationFrame(tick);
          }

          requestAnimationFrame(tick);
          counterObserver.unobserve(el);
        });
      },
      { threshold: 0.3 }
    );

    $$('[data-count]').forEach(c => counterObserver.observe(c));
    initRelationshipStatCounter();
  }

  /* ─── Together Live Counter ─── */
  const TOGETHER_SINCE = '2022-03-14T00:00:00';

  function getSinceDate() {
    const section = $('#together');
    const sinceEl = section?.dataset.since || TOGETHER_SINCE;
    const since = new Date(sinceEl);
    return Number.isNaN(since.getTime()) ? null : since;
  }

  function getRelationshipStat(since, now = new Date()) {
    const diff = Math.max(0, now.getTime() - since.getTime());
    const totalDays = Math.floor(diff / 86400000);

    let years = now.getFullYear() - since.getFullYear();
    let months = now.getMonth() - since.getMonth();
    if (now.getDate() < since.getDate()) months--;
    if (months < 0) {
      years--;
      months += 12;
    }

    if (years >= 1) {
      return {
        value: years,
        label: years === 1 ? 'година заедно' : 'години заедно'
      };
    }

    const totalMonths = (now.getFullYear() - since.getFullYear()) * 12
      + (now.getMonth() - since.getMonth())
      - (now.getDate() < since.getDate() ? 1 : 0);

    if (totalMonths >= 1) {
      return {
        value: totalMonths,
        label: totalMonths === 1 ? 'месец заедно' : 'месеца заедно'
      };
    }

    if (totalDays >= 1) {
      const weeks = Math.max(1, Math.ceil(totalDays / 7));
      return {
        value: weeks,
        label: weeks === 1 ? 'седмица заедно' : 'седмици заедно'
      };
    }

    return { value: 0, label: 'дни заедно' };
  }

  function initRelationshipStatCounter() {
    const el = $('#statsTogether');
    const labelEl = $('#statsTogetherLabel');
    const since = getSinceDate();
    if (!el || !labelEl || !since) return;

    const statObserver = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;

          const { value, label } = getRelationshipStat(since);
          labelEl.textContent = label;

          const duration = 2200;
          const start = performance.now();

          function tick(now) {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 4);
            el.textContent = Math.floor(eased * value).toLocaleString('bg-BG');
            if (progress < 1) requestAnimationFrame(tick);
            else el.textContent = value.toLocaleString('bg-BG');
          }

          requestAnimationFrame(tick);
          statObserver.unobserve(el);
        });
      },
      { threshold: 0.3 }
    );

    statObserver.observe(el);
  }

  function getTogetherDuration(since, now = new Date()) {
    const diff = Math.max(0, now.getTime() - since.getTime());
    const dayMs = 86400000;
    const hourMs = 3600000;
    const minuteMs = 60000;

    const days = Math.floor(diff / dayMs);
    const hours = Math.floor((diff % dayMs) / hourMs);
    const minutes = Math.floor((diff % hourMs) / minuteMs);
    const seconds = Math.floor((diff % minuteMs) / 1000);

    return { days, hours, minutes, seconds };
  }

  function padNum(n, len = 2) {
    return String(n).padStart(len, '0');
  }

  let togetherTimer = null;
  let togetherStarted = false;

  function initTogetherCounter() {
    if (togetherStarted) return;

    const section = $('#together');
    if (!section) return;

    const sinceEl = section.dataset.since || TOGETHER_SINCE;
    const since = getSinceDate();
    if (!since) return;

    const els = {
      days: $('#togetherDays'),
      hours: $('#togetherHours'),
      minutes: $('#togetherMinutes'),
      seconds: $('#togetherSeconds')
    };

    if (!els.days || !els.hours || !els.minutes || !els.seconds) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let isVisible = false;

    function render() {
      const { days, hours, minutes, seconds } = getTogetherDuration(since);
      els.days.textContent = padNum(days, 3);
      els.hours.textContent = padNum(hours);
      els.minutes.textContent = padNum(minutes);
      els.seconds.textContent = padNum(seconds);
    }

    function startTicker() {
      if (togetherTimer || !isVisible || document.hidden) return;
      render();
      if (reduceMotion) return;
      togetherTimer = setInterval(render, 1000);
    }

    function stopTicker() {
      if (!togetherTimer) return;
      clearInterval(togetherTimer);
      togetherTimer = null;
    }

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stopTicker();
      else if (isVisible) startTicker();
    });

    const togetherObserver = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          isVisible = entry.isIntersecting;
          if (isVisible) startTicker();
          else stopTicker();
        });
      },
      { threshold: 0.15 }
    );

    togetherObserver.observe(section);
    togetherStarted = true;
  }

  /* ─── Timeline Glow Progress ─── */
  function initTimelineGlow() {
    if (isMobile) return;
    const track = $('.timeline__track');
    const glow = $('.timeline__line-glow');
    if (!track || !glow) return;

    function update() {
      const rect = track.getBoundingClientRect();
      const winH = window.innerHeight;
      const start = winH * 0.3;
      const progress = Math.min(Math.max((start - rect.top) / (rect.height + start), 0), 1);
      glow.style.transform = `scaleY(${progress})`;
    }

    function onScroll() {
      if (scrollPerfTicking) return;
      scrollPerfTicking = true;
      requestAnimationFrame(() => {
        update();
        scrollPerfTicking = false;
      });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    update();
  }
  function initGalleryTilt() {
    const items = $$('[data-tilt]');

    items.forEach(item => {
      const onMove = e => {
        const rect = item.getBoundingClientRect();
        const x = e.clientX ?? e.touches?.[0]?.clientX;
        const y = e.clientY ?? e.touches?.[0]?.clientY;
        if (!x || !y) return;

        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const rotateX = ((y - cy) / (rect.height / 2)) * -8;
        const rotateY = ((x - cx) / (rect.width / 2)) * 8;

        item.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
      };

      const onLeave = () => {
        item.style.transform = '';
      };

      if (isMobile) return;

      item.addEventListener('mousemove', onMove);
      item.addEventListener('mouseleave', onLeave);
    });
  }

  /* ─── Gallery 3D Tilt ─── */
  const lightbox = $('#lightbox');
  const lightboxImg = $('#lightboxImg');
  const lightboxCaption = $('#lightboxCaption');
  const galleryItems = $$('.gallery__item');
  let currentIndex = 0;

  function openLightbox(index) {
    currentIndex = index;
    const item = galleryItems[index];
    const img = item.querySelector('img');
    const caption = item.querySelector('.gallery__text');

    lightboxImg.src = img.currentSrc || img.src;
    lightboxImg.alt = img.alt;
    lightboxCaption.textContent = caption?.textContent || '';
    lightbox.classList.add('active');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    lightbox.setAttribute('aria-hidden', 'true');
    if (giftOpened && !navMenu?.classList.contains('open')) {
      document.body.style.overflow = '';
    }
  }

  function navigateLightbox(dir) {
    currentIndex = (currentIndex + dir + galleryItems.length) % galleryItems.length;
    openLightbox(currentIndex);
  }

  galleryItems.forEach((item, i) => {
    item.addEventListener('click', () => openLightbox(i));
  });

  $('.lightbox__close')?.addEventListener('click', closeLightbox);
  $('.lightbox__prev')?.addEventListener('click', () => navigateLightbox(-1));
  $('.lightbox__next')?.addEventListener('click', () => navigateLightbox(1));

  lightbox?.addEventListener('click', e => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', e => {
    if (!lightbox?.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') navigateLightbox(-1);
    if (e.key === 'ArrowRight') navigateLightbox(1);
  });

  /* ─── Confetti ─── */
  const surpriseBtn = $('#surpriseBtn');
  const confettiCanvas = $('#confetti');
  let confettiCtx;
  let confettiParticles = [];
  let confettiAnimating = false;

  function initConfettiCanvas() {
    if (!confettiCanvas) return;
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
    confettiCtx = confettiCanvas.getContext('2d');
  }

  window.addEventListener('resize', initConfettiCanvas);

  const confettiColors = ['#ff4d8d', '#f0a8c0', '#b06aff', '#e8b87a', '#fff'];

  function launchConfetti() {
    initConfettiCanvas();
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;

    confettiParticles = [];
    const confettiCount = isMobile ? 50 : 200;
    for (let i = 0; i < confettiCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 5 + Math.random() * 12;
      confettiParticles.push({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 8,
        w: 6 + Math.random() * 8,
        h: 4 + Math.random() * 5,
        color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 14,
        gravity: 0.12 + Math.random() * 0.1
      });
    }

    if (!confettiAnimating) {
      confettiAnimating = true;
      animateConfetti();
    }
  }

  function animateConfetti() {
    if (!confettiCtx) return;
    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

    let alive = 0;
    confettiParticles.forEach(p => {
      p.vy += p.gravity;
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.99;
      p.rotation += p.rotationSpeed;

      if (p.y < confettiCanvas.height + 20) {
        alive++;
        confettiCtx.save();
        confettiCtx.translate(p.x, p.y);
        confettiCtx.rotate((p.rotation * Math.PI) / 180);
        confettiCtx.fillStyle = p.color;
        confettiCtx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        confettiCtx.restore();
      }
    });

    if (alive > 0) {
      requestAnimationFrame(animateConfetti);
    } else {
      confettiAnimating = false;
      confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    }
  }

  surpriseBtn?.addEventListener('click', () => {
    surpriseBtn.classList.add('burst');
    launchConfetti();

    const heartSvg = $('.surprise__heart-pulse svg');
    if (heartSvg) {
      heartSvg.style.animation = 'none';
      void heartSvg.offsetHeight;
      heartSvg.style.animation = '';
    }

    setTimeout(() => surpriseBtn.classList.remove('burst'), 600);
  });

  /* ─── Nav highlight ─── */
  const sections = $$('section[id]');
  const navLinks = $$('.nav__menu a');

  const sectionObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
          });
        }
      });
    },
    {
      threshold: isMobile ? 0.15 : 0.35,
      rootMargin: isMobile ? '-10% 0px -55% 0px' : '0px'
    }
  );

  sections.forEach(s => sectionObserver.observe(s));

  /* ─── Quiz Game ─── */
  const quizData = [
    {
      q: 'Къде се срещнахме за първи път?',
      options: ['В парка', 'На кафе', 'На работа'],
      correct: 0
    },
    {
      q: 'Кой каза „обичам те" първи?',
      options: ['Аз', 'Ти', 'Едновременно'],
      correct: 2
    },
    {
      q: 'Кой е любимият ни сезон заедно?',
      options: ['Лято', 'Есен', 'Зима'],
      correct: 0
    },
    {
      q: 'Какво правим най-често в неделя?',
      options: ['Спим до обяд', 'Готвим заедно', 'Гледаме филми'],
      correct: 2
    },
    {
      q: 'Какво обичам най-много у теб?',
      options: ['Усмивката ти', 'Смеха ти', 'Грижата ти'],
      correct: 0
    }
  ];

  let quizIndex = 0;
  let quizScore = 0;
  let quizInitialized = false;

  function initQuiz() {
    if (quizInitialized) return;
    quizInitialized = true;

    const quizBody = $('#quizBody');
    const quizResult = $('#quizResult');
    const quizQuestion = $('#quizQuestion');
    const quizOptions = $('#quizOptions');
    const quizProgress = $('#quizProgress');
    const quizBar = $('#quizBar');
    const quizScoreEl = $('#quizScore');
    const quizMsg = $('#quizMsg');
    const quizRetry = $('#quizRetry');

    function showQuestion() {
      const item = quizData[quizIndex];
      quizProgress.textContent = `${quizIndex + 1} / ${quizData.length}`;
      quizBar.style.width = `${((quizIndex + 1) / quizData.length) * 100}%`;
      quizQuestion.textContent = item.q;
      quizOptions.innerHTML = '';

      item.options.forEach((opt, i) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'quiz__option';
        btn.textContent = opt;
        btn.addEventListener('click', () => {
          $$('.quiz__option', quizOptions).forEach(b => b.disabled = true);
          if (i === item.correct) {
            btn.classList.add('correct');
            quizScore++;
          } else {
            btn.classList.add('wrong');
            $$('.quiz__option', quizOptions)[item.correct]?.classList.add('correct');
          }
          setTimeout(() => {
            quizIndex++;
            if (quizIndex < quizData.length) showQuestion();
            else showResult();
          }, 900);
        });
        quizOptions.appendChild(btn);
      });
    }

    function showResult() {
      quizBody.classList.add('is-collapsed');
      quizResult.classList.remove('is-collapsed');
      const pct = Math.round((quizScore / quizData.length) * 100);
      quizScoreEl.textContent = `${quizScore} / ${quizData.length}`;
      if (pct === 100) quizMsg.textContent = 'Перфектно! Познаваш ме на 100% — обичам те! 💕';
      else if (pct >= 60) quizMsg.textContent = 'Много добре! Очевидно сме близки. Още малко практика! 😊';
      else quizMsg.textContent = 'Ха-ха, трябва още време заедно — но това е част от магията! ♥';
    }

    function resetQuiz() {
      quizIndex = 0;
      quizScore = 0;
      quizBody.classList.remove('is-collapsed');
      quizResult.classList.add('is-collapsed');
      showQuestion();
    }

    quizRetry?.addEventListener('click', resetQuiz);
    showQuestion();
  }

  /* ─── Catch Hearts Game ─── */
  let catchInitialized = false;
  let catchRunning = false;
  let catchScore = 0;
  let catchTimer = null;
  let catchSpawnTimer = null;
  let catchAnimFrame = null;
  const catchHearts = [];

  function initCatchGame() {
    if (catchInitialized) return;
    catchInitialized = true;

    const arena = $('#catchArena');
    const startBtn = $('#catchStart');
    const scoreEl = $('#catchScore');
    const timeEl = $('#catchTime');
    const hint = $('#catchHint');
    const endMsg = $('#catchEnd');

    function spawnHeart() {
      if (!catchRunning || !arena) return;
      const heart = document.createElement('span');
      heart.className = 'catch__heart';
      heart.textContent = '♥';
      const size = 1.2 + Math.random() * 0.8;
      heart.style.fontSize = `${size}rem`;
      heart.style.left = `${10 + Math.random() * 80}%`;
      heart.style.top = '-40px';

      const data = {
        el: heart,
        y: -40,
        speed: 1.5 + Math.random() * 2.5,
        active: true
      };

      heart.addEventListener('pointerdown', e => {
        e.preventDefault();
        if (!data.active) return;
        data.active = false;
        heart.classList.add('pop');
        catchScore++;
        scoreEl.textContent = catchScore;
        setTimeout(() => heart.remove(), 350);
      });

      arena.appendChild(heart);
      catchHearts.push(data);
    }

    function gameLoop() {
      if (!catchRunning) return;
      const h = arena.offsetHeight;

      for (let i = catchHearts.length - 1; i >= 0; i--) {
        const data = catchHearts[i];
        if (!data.active) continue;
        data.y += data.speed;
        data.el.style.top = `${data.y}px`;
        if (data.y > h + 20) {
          data.active = false;
          data.el.remove();
          catchHearts.splice(i, 1);
        }
      }

      catchAnimFrame = requestAnimationFrame(gameLoop);
    }

    function endGame() {
      catchRunning = false;
      clearInterval(catchSpawnTimer);
      cancelAnimationFrame(catchAnimFrame);
      startBtn.disabled = false;
      startBtn.textContent = 'Играй отново';
      catchHearts.forEach(d => d.el.remove());
      catchHearts.length = 0;

      let msg = '';
      if (catchScore >= 15) msg = 'Невероятно! Хващаш сърцата ми перфектно! 💕';
      else if (catchScore >= 8) msg = 'Супер! Доста сърца хвана! ♥';
      else if (catchScore >= 3) msg = 'Нелошо! Опитай пак за повече точки!';
      else msg = 'Хвани поне няколко сърца следващия път! 😄';

      endMsg.textContent = msg;
      endMsg.classList.remove('is-collapsed');
    }

    startBtn?.addEventListener('click', () => {
      if (catchRunning) return;
      catchRunning = true;
      catchScore = 0;
      scoreEl.textContent = '0';
      endMsg.classList.add('is-collapsed');
      hint.style.display = 'none';
      startBtn.disabled = true;
      startBtn.textContent = 'Играе се...';

      let timeLeft = 20;
      timeEl.textContent = timeLeft;

      catchSpawnTimer = setInterval(spawnHeart, 650);
      gameLoop();

      catchTimer = setInterval(() => {
        timeLeft--;
        timeEl.textContent = timeLeft;
        if (timeLeft <= 0) {
          clearInterval(catchTimer);
          endGame();
        }
      }, 1000);
    });
  }

  /* ─── Scratch Card ─── */
  let scratchInitialized = false;

  function initScratch() {
    if (scratchInitialized) return;

    const canvas = $('#scratchCanvas');
    const card = $('.scratch__card');
    if (!canvas || !card) return;

    const ctx = canvas.getContext('2d');
    let drawing = false;
    let cleared = false;
    let layerDrawn = false;
    let logicalW = 0;
    let logicalH = 0;

    function drawScratchLayer() {
      if (layerDrawn || cleared) return;

      const rect = card.getBoundingClientRect();
      if (rect.width < 10 || rect.height < 10) return;

      const dpr = isMobile ? 1 : Math.min(window.devicePixelRatio || 1, 2);
      logicalW = rect.width;
      logicalH = rect.height;

      canvas.width = Math.floor(logicalW * dpr);
      canvas.height = Math.floor(logicalH * dpr);
      canvas.style.width = `${logicalW}px`;
      canvas.style.height = `${logicalH}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.globalCompositeOperation = 'source-over';

      const grad = ctx.createLinearGradient(0, 0, logicalW, logicalH);
      grad.addColorStop(0, '#b8b8c8');
      grad.addColorStop(0.3, '#e8e8f0');
      grad.addColorStop(0.5, '#c0c0d0');
      grad.addColorStop(0.7, '#d8d8e8');
      grad.addColorStop(1, '#a8a8b8');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, logicalW, logicalH);

      ctx.fillStyle = 'rgba(80, 80, 100, 0.45)';
      ctx.font = 'bold 15px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('ИЗТРИЙ ТУК', logicalW / 2, logicalH / 2);

      layerDrawn = true;
      scratchInitialized = true;
    }

    let scratchChecks = 0;

    function scratch(x, y) {
      if (cleared || !layerDrawn) return;
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(x, y, 26, 0, Math.PI * 2);
      ctx.fill();

      scratchChecks++;
      if (scratchChecks % (isMobile ? 10 : 6) === 0) checkReveal();
    }

    function checkReveal() {
      if (cleared) return;
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const step = isMobile ? 32 : 16;
      let transparent = 0;
      let total = 0;

      for (let i = 3; i < imageData.data.length; i += 4 * step) {
        total++;
        if (imageData.data[i] < 128) transparent++;
      }

      if (transparent / total > 0.45) {
        cleared = true;
        card.classList.add('revealed');
      }
    }

    function getPos(e) {
      const rect = canvas.getBoundingClientRect();
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    }

    canvas.addEventListener('pointerdown', e => {
      if (!layerDrawn) drawScratchLayer();
      if (cleared) return;
      e.preventDefault();
      drawing = true;
      canvas.setPointerCapture(e.pointerId);
      scratch(getPos(e).x, getPos(e).y);
    });

    canvas.addEventListener('pointermove', e => {
      if (!drawing || cleared) return;
      e.preventDefault();
      const p = getPos(e);
      scratch(p.x, p.y);
    });

    canvas.addEventListener('pointerup', () => { drawing = false; });
    canvas.addEventListener('pointercancel', () => { drawing = false; });

    const scratchObserver = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          drawScratchLayer();
          scratchObserver.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    scratchObserver.observe(card);
  }

  /* ─── Envelope + Fullscreen Letter ─── */
  function initEnvelope() {
    const btn = $('#envelopeBtn');
    const wrap = $('.envelope-wrap');
    const overlay = $('#letterOverlay');
    const closeBtn = $('.letter-overlay__close');
    if (!btn || !overlay) return;

    function openLetter() {
      if (btn.classList.contains('open')) return;

      navMenu?.classList.remove('open');
      navToggle?.classList.remove('open');
      navToggle?.setAttribute('aria-expanded', 'false');
      setNavMenuOpen(false);

      btn.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
      wrap?.classList.add('is-opened');

      setTimeout(() => {
        overlay.classList.add('active');
        overlay.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
      }, 650);
    }

    function closeLetter() {
      overlay.classList.remove('active');
      overlay.setAttribute('aria-hidden', 'true');
      btn.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
      wrap?.classList.remove('is-opened');

      if (giftOpened && !navMenu?.classList.contains('open') && !$('#lightbox')?.classList.contains('active')) {
        document.body.style.overflow = '';
      }
    }

    btn.addEventListener('click', openLetter);
    closeBtn?.addEventListener('click', closeLetter);

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && overlay.classList.contains('active')) closeLetter();
    });
  }

})();
