/* =====================================================================
   gauge.js — Tacómetro decorativo de la pantalla de acceso (SVG).
   ===================================================================== */
(function (App) {
  "use strict";

  App.Gauge = {
    draw(svg) {
      const cx = 150, cy = 150;
      const pt = (t, r) => { const a = (135 + 270 * t) * Math.PI / 180; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; };
      let s = `<circle cx="150" cy="150" r="140" fill="#ffffff" stroke="#bcd0f2" stroke-width="2"/>`;
      for (let i = 0; i <= 24; i++) {
        const t = i / 24, major = i % 2 === 0;
        const [x1, y1] = pt(t, major ? 112 : 120), [x2, y2] = pt(t, 130);
        s += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${t >= 10 / 12 ? "#ef4444" : "#7b8bb0"}" stroke-width="${major ? 3 : 1.5}"/>`;
        if (major) { const [lx, ly] = pt(t, 92); s += `<text x="${lx}" y="${ly + 5}" fill="#1e2a47" font-size="15" text-anchor="middle">${i / 2}</text>`; }
      }
      s += `<text x="150" y="200" fill="#5d6b8a" font-size="12" text-anchor="middle">x1000 rpm</text>`;
      s += `<text x="150" y="228" fill="#2f6bff" font-size="20" font-weight="700" text-anchor="middle">Motos 3D</text>`;
      s += `<g class="needle"><line x1="150" y1="150" x2="248" y2="150" stroke="#f97316" stroke-width="4" stroke-linecap="round"/></g><circle cx="150" cy="150" r="9" fill="#f97316"/>`;
      svg.innerHTML = s;
    }
  };
})(window.App);
