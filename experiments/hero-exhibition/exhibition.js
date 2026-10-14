(() => {
  const runway = document.querySelector('.hero-runway');
  const scene = document.querySelector('.exhibition-scene');
  if (!runway || !scene) return;

  const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
  const ease = value => value * value * (3 - 2 * value);
  const clamp = value => Math.min(1, Math.max(0, value));
  const state = { scroll: 0, x: 0, y: 0 };
  const target = { scroll: 0, x: 0, y: 0 };
  let frame = 0;

  function targetFromScroll() {
    const distance = Math.max(1, runway.offsetHeight - innerHeight);
    target.scroll = clamp((scrollY - runway.offsetTop) / distance);
    schedule();
  }

  function render() {
    frame = 0;
    const factor = motionPreference.matches ? 1 : .085;
    state.scroll += (target.scroll - state.scroll) * factor;
    state.x += (target.x - state.x) * factor;
    state.y += (target.y - state.y) * factor;

    const progress = ease(state.scroll);
    const board = ease(clamp((progress - .42) / .47));
    scene.style.setProperty('--progress', progress.toFixed(4));
    scene.style.setProperty('--board-progress', board.toFixed(4));
    runway.style.setProperty('--board-progress', board.toFixed(4));
    scene.style.setProperty('--pointer-x', state.x.toFixed(4));
    scene.style.setProperty('--pointer-y', state.y.toFixed(4));
    scene.dataset.progress = String(Math.round(progress * 100));

    if (Math.abs(target.scroll - state.scroll) > .0005 || Math.abs(target.x - state.x) > .0005 || Math.abs(target.y - state.y) > .0005) schedule();
  }

  function schedule() {
    if (!frame) frame = requestAnimationFrame(render);
  }

  window.addEventListener('scroll', targetFromScroll, { passive: true });
  window.addEventListener('resize', targetFromScroll);
  runway.addEventListener('pointermove', event => {
    if (motionPreference.matches) return;
    target.x = (event.clientX / innerWidth - .5) * 2;
    target.y = (event.clientY / innerHeight - .5) * 2;
    schedule();
  }, { passive: true });
  runway.addEventListener('pointerleave', () => {
    target.x = 0;
    target.y = 0;
    schedule();
  });
  motionPreference.addEventListener('change', () => {
    target.x = 0;
    target.y = 0;
    targetFromScroll();
  });
  targetFromScroll();
})();
