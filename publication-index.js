(() => {
  const index = document.querySelector('.year-links');
  const years = Array.from(index.querySelectorAll('a'), link => {
    const heading = document.getElementById(link.hash.slice(1));
    const count = heading.closest('.archive-year').querySelectorAll('.archive-list > li').length;
    const number = document.createElement('span');
    number.className = 'year-count';
    number.textContent = count;
    number.setAttribute('aria-hidden', 'true');
    link.setAttribute('aria-label', `${heading.textContent}, ${count} ${count === 1 ? 'paper' : 'papers'}`);
    link.append(number);
    return { heading, link };
  });
  index.querySelector('.count-key').hidden = false;

  let current;
  let pending = false;
  function update() {
    pending = false;
    const offset = parseFloat(getComputedStyle(years[0].heading).scrollMarginBlockStart) + 2;
    let visible = years[0];
    for (const year of years) {
      if (year.heading.getBoundingClientRect().top > offset) break;
      visible = year;
    }
    const page = document.documentElement;
    if (window.scrollY + page.clientHeight >= page.scrollHeight - 2) {
      // Short final sections can share a viewport. Honor a jump to either of them.
      const target = years.find(({ link }) => link.hash === location.hash);
      const top = target?.heading.getBoundingClientRect().top;
      visible = top >= -offset && top < page.clientHeight ? target : years[years.length - 1];
    }
    if (current === visible.link) return;
    current?.removeAttribute('aria-current');
    current = visible.link;
    current.setAttribute('aria-current', 'location');
  }
  function schedule() {
    if (!pending) {
      pending = true;
      requestAnimationFrame(update);
    }
  }
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  window.addEventListener('hashchange', schedule);
  window.addEventListener('pageshow', schedule);
  document.fonts.ready.then(schedule);
  update();
})();
