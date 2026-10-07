(() => {
  const detailRoot = document.querySelector('.spread-list');
  if (!detailRoot) return;

  const slides = [...detailRoot.querySelectorAll('.spread')];
  const images = slides.map(slide => slide.querySelector('img'));
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const originalAsset = page => `../assets/figma-projects/${page}`;
  const highResolutionAsset = page => {
    const a = /^A(\d+)\./.exec(page);
    const b = /^B(\d+)\./.exec(page);
    const d = /^D(\d+)\./.exec(page);
    if (a && Number(a[1]) <= 10) return `../assets/detail-hi/portfolio-${String(Number(a[1]) + 3).padStart(2, '0')}.webp`;
    if (b) return `../assets/detail-hi/portfolio-${String(Number(b[1]) + 14).padStart(2, '0')}.webp`;
    if (d) return `../assets/detail-hi/portfolio-${String(Number(d[1]) + 30).padStart(2, '0')}.webp`;
    const special = {
      'A11.jpg': 'A11.png',
      'A12.png': 'A12.png',
      'OW1.jpg': 'portfolio-44.webp',
      'ECO01.jpg': 'portfolio-48.webp',
      'ECO02.jpg': 'portfolio-49.webp',
      'AEGIS.jpg': 'portfolio-50.webp',
      'free-harness-detail.png': 'free-harness.png',
      'longchi-umbrella-detail.png': 'longchi.png',
      'cerebotune-serenity-detail.png': 'cerebotune.png'
    };
    return special[page] ? `../assets/detail-hi/${special[page]}` : null;
  };

  images.forEach((img, index) => {
    const page = portfolioProjects[document.body.dataset.project].pages[index];
    const better = highResolutionAsset(page);
    const fallback = originalAsset(page);
    img.dataset.fallback = fallback;
    img.dataset.fullSrc = better || fallback;
    if (better) img.src = better;
    img.addEventListener('error', () => {
      if (better && img.dataset.fullSrc === better) {
        img.dataset.fullSrc = fallback;
        img.src = fallback;
      }
    }, { once: true });
  });

  if (document.body.dataset.project === 'kidulting') {
    const demo = document.createElement('section');
    demo.className = 'dialogue-demo';
    demo.setAttribute('aria-label', 'Kidulting conversation preview');
    demo.innerHTML = `
      <div class="dialogue-copy">
        <span class="dialogue-kicker">A MOMENT FROM THE PLAYTEST</span>
        <h2>A small prompt can open a bigger conversation.</h2>
        <p>The role play invites a parent and child to enter the same story from different points of view.</p>
        <button class="dialogue-replay" type="button" aria-label="Replay the conversation">Replay moment <span aria-hidden="true">↻</span></button>
      </div>
      <div class="dialogue-scene" aria-label="An example conversation">
        <span class="dialogue-orbit orbit-one" aria-hidden="true"></span>
        <span class="dialogue-orbit orbit-two" aria-hidden="true"></span>
        <div class="dialogue-bubble bubble-one"><small>Parent</small><span>So how do we start the game?</span></div>
        <div class="dialogue-bubble bubble-two"><small>Child</small><span>You can read the booklet to understand your character.</span></div>
        <div class="dialogue-bubble bubble-three"><small>Parent</small><span>I choose…</span></div>
      </div>`;
    detailRoot.closest('section').before(demo);
    const play = () => {
      demo.classList.remove('is-playing');
      void demo.offsetWidth;
      demo.classList.add('is-playing');
    };
    demo.querySelector('.dialogue-replay').addEventListener('click', play);
    const demoObserver = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        play();
        demoObserver.disconnect();
      }
    }, { threshold: .35 });
    demoObserver.observe(demo);
  }

  const rail = document.createElement('aside');
  rail.className = 'project-rail';
  rail.setAttribute('aria-label', 'Project scroll controls');
  rail.innerHTML = `
    <button class="rail-step rail-up" type="button" aria-label="Scroll up">↑</button>
    <div class="rail-track" role="scrollbar" tabindex="0" aria-label="Scroll through project" aria-controls="project-main" aria-orientation="vertical" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
      <span class="rail-fill"></span><span class="rail-glow"></span><span class="rail-thumb"><span aria-hidden="true">↕</span></span>
    </div>
    <span class="rail-count" aria-live="off">01 / ${String(slides.length).padStart(2, '0')}</span>
    <button class="rail-step rail-down" type="button" aria-label="Scroll down">↓</button>`;
  document.querySelector('main').id = 'project-main';
  document.body.append(rail);
  const track = rail.querySelector('.rail-track');
  const count = rail.querySelector('.rail-count');
  const thumb = rail.querySelector('.rail-thumb');
  const maxScroll = () => Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  let dragging = false;
  let lastY = window.scrollY;
  let railFrame = 0;
  let activityTimer = 0;

  function updateRail() {
    railFrame = 0;
    const maximum = maxScroll();
    const progress = maximum ? Math.min(1, Math.max(0, window.scrollY / maximum)) : 0;
    rail.style.setProperty('--rail-progress', `${progress * 100}%`);
    rail.style.setProperty('--thumb-top', `${progress * Math.max(0, track.clientHeight - thumb.clientHeight)}px`);
    track.setAttribute('aria-valuenow', String(Math.round(progress * 100)));
    const active = slides.reduce((found, slide, index) => slide.getBoundingClientRect().top < window.innerHeight * .56 ? index : found, 0);
    count.textContent = `${String(active + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
    if (Math.abs(window.scrollY - lastY) > 1) rail.dataset.direction = window.scrollY > lastY ? 'down' : 'up';
    lastY = window.scrollY;
  }
  function queueRailUpdate() {
    if (!railFrame) railFrame = requestAnimationFrame(updateRail);
    rail.classList.add('is-scrolling');
    clearTimeout(activityTimer);
    activityTimer = setTimeout(() => rail.classList.remove('is-scrolling'), 500);
  }
  function seekFromPointer(event, smooth = false) {
    const box = track.getBoundingClientRect();
    const progress = Math.max(0, Math.min(1, (event.clientY - box.top) / box.height));
    window.scrollTo({ top: progress * maxScroll(), behavior: smooth && !reducedMotion.matches ? 'smooth' : 'instant' });
  }
  track.addEventListener('pointerenter', () => rail.classList.add('is-hovering'));
  track.addEventListener('pointerleave', () => { if (!dragging) rail.classList.remove('is-hovering'); });
  track.addEventListener('pointermove', event => {
    const box = track.getBoundingClientRect();
    rail.style.setProperty('--hover-y', `${Math.max(0, Math.min(box.height, event.clientY - box.top))}px`);
    if (dragging) seekFromPointer(event);
  });
  track.addEventListener('pointerdown', event => {
    if (event.button !== 0) return;
    dragging = true;
    rail.classList.add('is-dragging');
    track.setPointerCapture(event.pointerId);
    seekFromPointer(event);
  });
  const stopDragging = () => {
    dragging = false;
    rail.classList.remove('is-dragging', 'is-hovering');
  };
  track.addEventListener('pointerup', stopDragging);
  track.addEventListener('pointercancel', stopDragging);
  track.addEventListener('keydown', event => {
    const distance = window.innerHeight * .7;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'PageDown' || event.key === 'PageUp') {
      event.preventDefault();
      const direction = /Down/.test(event.key) ? 1 : -1;
      window.scrollBy({ top: distance * direction, behavior: reducedMotion.matches ? 'instant' : 'smooth' });
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      window.scrollTo({ top: event.key === 'Home' ? 0 : maxScroll(), behavior: reducedMotion.matches ? 'instant' : 'smooth' });
    }
  });
  rail.querySelector('.rail-up').addEventListener('click', () => window.scrollBy({ top: -window.innerHeight * .72, behavior: reducedMotion.matches ? 'instant' : 'smooth' }));
  rail.querySelector('.rail-down').addEventListener('click', () => window.scrollBy({ top: window.innerHeight * .72, behavior: reducedMotion.matches ? 'instant' : 'smooth' }));
  window.addEventListener('scroll', queueRailUpdate, { passive: true });
  window.addEventListener('resize', queueRailUpdate);
  track.addEventListener('wheel', queueRailUpdate, { passive: true });
  requestAnimationFrame(updateRail);

  const lightbox = document.querySelector('.zoom');
  lightbox.setAttribute('role', 'dialog');
  lightbox.setAttribute('aria-modal', 'true');
  lightbox.setAttribute('aria-label', 'Expanded project page');
  lightbox.innerHTML = `
    <div class="zoom-heading"><span>${portfolioProjects[document.body.dataset.project].name}</span><span class="zoom-page-count"></span></div>
    <button class="zoom-close" type="button" aria-label="Close expanded page">×</button>
    <button class="zoom-nav zoom-prev" type="button" aria-label="Previous page">←</button>
    <div class="zoom-stage"><img alt="" draggable="false"><span class="zoom-loading">Loading high resolution image…</span></div>
    <button class="zoom-nav zoom-next" type="button" aria-label="Next page">→</button>
    <div class="zoom-toolbar"><button class="zoom-minus" type="button" aria-label="Zoom out">−</button><span class="zoom-level" aria-live="off">100%</span><button class="zoom-plus" type="button" aria-label="Zoom in">+</button><span class="zoom-help">Scroll to zoom · drag to explore</span></div>`;
  const stage = lightbox.querySelector('.zoom-stage');
  const zoomImage = stage.querySelector('img');
  const loading = stage.querySelector('.zoom-loading');
  const level = lightbox.querySelector('.zoom-level');
  const pageCount = lightbox.querySelector('.zoom-page-count');
  let activeIndex = 0;
  let scale = 1;
  let panX = 0;
  let panY = 0;
  let imageRequest = 0;
  let pointerStart = null;
  let returnFocus = null;

  function updateZoom() {
    zoomImage.style.transform = `translate3d(${panX}px, ${panY}px, 0) scale(${scale})`;
    level.textContent = `${Math.round(scale * 100)}%`;
    stage.classList.toggle('is-magnified', scale > 1);
  }
  function changeScale(next, event) {
    const old = scale;
    scale = Math.min(4, Math.max(1, next));
    if (scale === 1) { panX = 0; panY = 0; }
    else if (event && old !== scale) {
      const box = stage.getBoundingClientRect();
      const offsetX = event.clientX - (box.left + box.width / 2);
      const offsetY = event.clientY - (box.top + box.height / 2);
      const ratio = scale / old;
      panX = offsetX + (panX - offsetX) * ratio;
      panY = offsetY + (panY - offsetY) * ratio;
    }
    updateZoom();
  }
  function displayImage(index) {
    activeIndex = (index + images.length) % images.length;
    const source = images[activeIndex];
    const requested = ++imageRequest;
    pageCount.textContent = `${String(activeIndex + 1).padStart(2, '0')} / ${String(images.length).padStart(2, '0')}`;
    zoomImage.classList.add('is-changing');
    loading.textContent = 'Loading high resolution image…';
    loading.classList.add('is-visible');
    const next = new Image();
    let finished = false;
    let retried = false;
    const show = url => {
      if (requested !== imageRequest || finished) return;
      finished = true;
      zoomImage.src = url;
      zoomImage.alt = source.alt;
      changeScale(1);
      requestAnimationFrame(() => {
        zoomImage.classList.remove('is-changing');
        loading.classList.remove('is-visible');
      });
    };
    next.onload = () => show(next.src);
    next.onerror = () => {
      if (!retried) { retried = true; next.src = source.dataset.fallback; }
      else loading.textContent = 'Image unavailable';
    };
    next.src = source.dataset.fullSrc || source.src;
    if (next.complete && next.naturalWidth) show(next.src);
  }
  function openExpanded(source) {
    const index = images.indexOf(source);
    if (index < 0) return;
    returnFocus = source.closest('button');
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('zoom-open');
    displayImage(index);
    lightbox.querySelector('.zoom-close').focus({ preventScroll: true });
  }
  function closeExpanded() {
    if (!lightbox.classList.contains('open')) return;
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('zoom-open');
    ++imageRequest;
    if (returnFocus) returnFocus.focus({ preventScroll: true });
  }
  window.projectExperience = { openSpread: openExpanded };
  lightbox.querySelector('.zoom-close').addEventListener('click', closeExpanded);
  lightbox.querySelector('.zoom-prev').addEventListener('click', () => displayImage(activeIndex - 1));
  lightbox.querySelector('.zoom-next').addEventListener('click', () => displayImage(activeIndex + 1));
  lightbox.querySelector('.zoom-minus').addEventListener('click', () => changeScale(scale / 1.4));
  lightbox.querySelector('.zoom-plus').addEventListener('click', () => changeScale(scale * 1.4));
  lightbox.addEventListener('click', event => { if (event.target === lightbox) closeExpanded(); });
  stage.addEventListener('wheel', event => {
    event.preventDefault();
    changeScale(scale * (event.deltaY < 0 ? 1.16 : 1 / 1.16), event);
  }, { passive: false });
  stage.addEventListener('dblclick', event => changeScale(scale === 1 ? 2 : 1, event));
  stage.addEventListener('pointerdown', event => {
    if (scale <= 1 || event.button !== 0) return;
    pointerStart = { x: event.clientX, y: event.clientY, panX, panY };
    stage.classList.add('is-panning');
    stage.setPointerCapture(event.pointerId);
  });
  stage.addEventListener('pointermove', event => {
    if (!pointerStart) return;
    panX = pointerStart.panX + event.clientX - pointerStart.x;
    panY = pointerStart.panY + event.clientY - pointerStart.y;
    updateZoom();
  });
  const stopPanning = () => { pointerStart = null; stage.classList.remove('is-panning'); };
  stage.addEventListener('pointerup', stopPanning);
  stage.addEventListener('pointercancel', stopPanning);
  document.addEventListener('keydown', event => {
    if (!lightbox.classList.contains('open')) return;
    if (event.key === 'Escape') closeExpanded();
    else if (event.key === 'ArrowLeft') displayImage(activeIndex - 1);
    else if (event.key === 'ArrowRight') displayImage(activeIndex + 1);
    else if (event.key === '+' || event.key === '=') changeScale(scale * 1.4);
    else if (event.key === '-') changeScale(scale / 1.4);
  });
})();
