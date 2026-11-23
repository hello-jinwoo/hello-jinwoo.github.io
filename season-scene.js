(() => {
  const scene = document.querySelector('.season-scene');
  scene.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 62" aria-hidden="true" focusable="false"
         fill="none" stroke-linecap="round" stroke-linejoin="round">
      <g class="scene-world">
        <g class="scene-subject" data-subject="spring" transform="translate(200 62)">
          <path d="M-8-.7q4-1.3 8-.6m3-.3 3 .4" stroke="#7e8961" stroke-width="1.1"/>
          <g class="spring-stem">
            <path d="M0-.8C2-7-2-12 2-19" stroke="#52794e" stroke-width="1.9"/>
            <g transform="translate(.5 -10)">
              <g class="spring-leaf-left">
                <path d="M0 0C-7 1-12-3-13-9c6-1 12 2 13 9Z" fill="#8eaf72" stroke="#537746"/>
                <path d="m-9-6 8 5" stroke="#d9e5bb" stroke-width=".85"/>
              </g>
            </g>
            <g transform="translate(1.4 -16)">
              <g class="spring-leaf-right">
                <path d="M0 0c-1-6 4-11 13-12C13-5 8 .3 0 0Z" fill="#abc985" stroke="#64864d"/>
                <path d="M2-2q4-4 8-7" stroke="#eff1d0" stroke-width=".9"/>
              </g>
            </g>
          </g>
        </g>

        <g class="scene-subject" data-subject="summer" transform="translate(201 62)">
          <path d="M-2-.5c1-7 1-16-1-23h3c1 7 2 16 1 23Z" fill="#997d56" stroke="#675e47"/>
          <path d="m-.5-14-6-6m6 3 6-6" stroke="#997d56" stroke-width="2.1"/>
          <g transform="translate(0 -16)">
            <g class="summer-crown">
              <path d="M-9 .5c-7 0-12-4-11-10 0-4 3-7 7-8 0-6 5-10 11-9 4-5 13-3 15 3 7 0 11 6 9 12 2 7-5 12-12 11-5 4-14 5-19 1Z"
                    fill="#619779" stroke="#a6c49a" stroke-width="1.05"/>
              <path d="M-18-7c3 3 8 3 11-1 5 4 12 3 15-1 4 2 9 1 13-3 1 8-5 12-12 11-6 4-13 4-18 1-5 0-8-3-9-7Z" fill="#47795e"/>
              <path d="M-13-12c2-3 4-4 7-4m6-5c3-2 6-1 8 1" stroke="#b3ce9a" stroke-width="1.35"/>
              <g class="summer-light" stroke="#dce5aa" stroke-width="1.5">
                <path d="m-10-12 2-.8m8-6 2.5-.8m6 5 2 .7"/>
              </g>
            </g>
          </g>
          <path d="m-6-.7-2-2.2m12 2 2-2.6" stroke="#86a881" stroke-width="1.15"/>
        </g>

        <g class="scene-subject" data-subject="autumn" transform="translate(200 59)">
          <g transform="translate(10 1)">
            <g class="autumn-small">
              <path d="M0 0Q3-6 11-4 8 2 0 0Z" fill="#ceab77" stroke="#94734f" stroke-width=".8"/>
              <path d="m-2 .8 10-3" stroke="#8a6646" stroke-width=".8"/>
            </g>
          </g>
          <g class="autumn-maple">
            <path d="m0 0-7.4-.6.9-2.3-5-3.4 4.2-.9-1-4.4 4.5 2.3 1.2-7 3.3 5.4 3.3-2.8-.3 5.7 4.1-1.9-1.1 4.6 3 .7L2-.3Z"
                  fill="#c68a58" stroke="#8d6346" stroke-width=".95"/>
            <path d="M1 2.7.4-1-2.8-11m3.1 10-6-5.6M.5-1.8l4.3-4.5" stroke="#86593f" stroke-width=".9"/>
          </g>
        </g>

        <g class="scene-subject" data-subject="winter" transform="translate(198 62)">
          <g class="winter-bank">
            <path d="M-16-.6q3-3.4 7-2.8c2-5.5 8-6.1 12-2.6 3-.7 6 .5 7 2.7 3-1.1 6-.5 8 2.7Z"
                  fill="#f4f9fb" stroke="#89aabd" stroke-width="1"/>
            <path d="M-5-3.8q3-1 5-.2" stroke="#c2dae6" stroke-width="1.1"/>
          </g>
          <g transform="translate(3 -15)">
            <g class="winter-crystal" stroke="#6293ae" stroke-width="1.25">
              <path d="M0-6v12m-5.2-9 10.4 6m0-6-10.4 6M-1.7-4.7 0-3l1.7-1.7M-1.7 4.7 0 3l1.7 1.7m-6.5-6.5 2.2.3-.4-2.2m8 4.8L2.7.9l.4 2.2m-7.9-1.4 2.2-.4-.4 2.2m7.9-5.2-2.2.4.4-2.2"/>
            </g>
          </g>
          <g fill="#85a9c0">
            <g transform="translate(-9 -15)"><circle class="snow-grain" r="1.3"/></g>
            <g transform="translate(13 -25)"><circle class="snow-grain" r="1.5"/></g>
            <g transform="translate(-3 -33)"><circle class="snow-grain" r="1.05"/></g>
          </g>
        </g>

        <g transform="translate(120 61.4)">
          <g class="scene-travel">
            <g class="scene-facing" stroke="#39443b" stroke-width="1.2">
              <g class="paw-far">
                <path d="m-6-10 4 .4-.5 7.3q1.6.2 2.1 2.6h-8.4C-10-2.8-7-3.7-6.8-4Z" fill="#9e8564"/>
              </g>
              <g class="paw-near">
                <path d="m2-10 4 .1.5 6q3-.3 4.2 2.5.4 1.2-.8 1.8H2.4L1.6-3Z" fill="#b39871"/>
              </g>
              <g class="scene-body">
                <circle cx="-9.9" cy="-11.7" r="2.9" fill="#ac805c"/>
                <path d="M-7.7-21.6C-11-19-10.5-11-9.1-7.2c5.1 1.7 12 .9 16.3-.1 1.4-5 .1-11.8-2.1-14.3Z"
                      fill="var(--field-coat)"/>
                <path d="m-6.9-21.9 11 14.4" stroke="#725f47" stroke-width="2.15"/>
                <path d="M-10-15.3h5.4l.8 6.3q-2.8 2.3-6.5.5Z" fill="#a7825c"/>
                <path d="m-9.3-13.4 3.9-.4" stroke="#d5b88e" stroke-width=".85"/>
                <g class="scene-head">
                  <g fill="#c49970">
                    <circle cx="-8.6" cy="-37.8" r="4.9"/>
                    <circle cx="6.1" cy="-38.4" r="4.5"/>
                  </g>
                  <g fill="#956c50" stroke="none">
                    <circle cx="-8.6" cy="-37.8" r="2.5"/>
                    <circle cx="6.1" cy="-38.4" r="2.2"/>
                  </g>
                  <path d="M-12-30c0-6.3 4.6-10.6 11.8-10.6 6.8 0 11.1 4.3 11.7 9.4 2.7 1.3 3 4.3.8 6.8-2.3 2.8-6.9 4.5-12.3 4.4C-6.5-20.1-12-23.5-12-30Z" fill="#c99c71"/>
                  <ellipse cx="7.1" cy="-26.2" rx="5.8" ry="4.2" fill="#e9cba2" stroke="none"/>
                  <circle cx="-2" cy="-31" r="1.35" fill="#302f29" stroke="none"/>
                  <circle cx="7.5" cy="-32" r="1.1" fill="#302f29" stroke="none"/>
                  <path d="M6.9-28.3q2.1-1.1 4.4-.3.7.7-1.6 2.1-1.1.7-2.8-1Z" fill="#513d30" stroke="none"/>
                  <path d="M9.1-26.3q.1 1.6-1.6 1.9" stroke="#795740" stroke-width=".8"/>
                </g>
                <path d="M-6.7-21.7q5.2 2.6 11.9.6l.1 2.4q-6 2-12.5-1Z" fill="#b37a54"/>
                <path d="M-6-20.8q-2 .6-4.7 3.3l3.3.2 3.1-2.6Z" fill="#bb875f"/>
                <g class="scene-camera">
                  <path d="M-1.4-18.7q.3 7.6 6.3 7.5" stroke="#70624f" stroke-width="1"/>
                  <path d="M2.4-18h3.2l1.5-2.3h4.5l1.1 2.3h2.4q1 0 1 1.1v6.5q0 .8-.9.8H3q-1 0-1-1v-6.5Z"
                        fill="#394441" stroke-width="1.05"/>
                  <path d="M3.1-17.1h11.8" stroke="#d8d4b9" stroke-width="1.3"/>
                  <circle cx="11.2" cy="-13.6" r="3.05" fill="#aebdb3" stroke="#283531" stroke-width=".95"/>
                  <circle cx="11.2" cy="-13.6" r="1.65" fill="#344b49" stroke="none"/>
                  <circle cx="11.75" cy="-14.35" r=".57" fill="#edf4df" stroke="none"/>
                  <path d="M-1.1-15.9c1.1-1.7 3.2-1.9 4.8-.5l1.3 1.6c.7 1.4-.9 3-2.3 2.6l-3-1Z" fill="#c99c71"/>
                  <path class="scene-glint" d="m18-20 .9 3.3 3.5.8-3.5.9-.9 3.3-.8-3.3-3.3-.9 3.3-.8Z"
                        fill="var(--lens-glint)" stroke="none"/>
                </g>
              </g>
            </g>
          </g>
        </g>
      </g>
    </svg>`;

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  document.getElementById('palette').addEventListener('season-selected', () => {
    scene.classList.remove('is-playing');
    if (!reducedMotion.matches) {
      // Reading layout gives even two consecutive selections their own first frame.
      scene.getBoundingClientRect();
      scene.classList.add('is-playing');
    }
  });
  scene.addEventListener('animationend', event => {
    if (event.animationName === 'photographer-walk') scene.classList.remove('is-playing');
  });
  reducedMotion.addEventListener('change', () => {
    if (reducedMotion.matches) scene.classList.remove('is-playing');
  });
})();
