// Rotating role text
(function () {
    const el = document.getElementById('role-text');
    if (!el) return;
    const roles = ['Offensive Security Learner', 'Penetration Tester (in training)', 'Full-Stack Developer', 'ML Pipeline Builder', 'Freelance Developer'];
    let r = 0, c = 0, del = false;
    (function tick() {
        const cur = roles[r];
        el.textContent = cur.substring(0, del ? c-- : c++);
        let t = del ? 40 : 80;
        if (!del && c > cur.length) { del = true; t = 1800; }
        else if (del && c < 0) { del = false; r = (r + 1) % roles.length; t = 400; }
        setTimeout(tick, t);
    })();
})();

// Nav: active link + mobile menu
(function () {
    const links = [...document.querySelectorAll('#nav-links a')];
    const list = document.getElementById('nav-links');
    document.getElementById('burger').addEventListener('click', () => list.classList.toggle('open'));
    links.forEach(a => a.addEventListener('click', () => list.classList.remove('open')));
    const obs = new IntersectionObserver(es => es.forEach(e => {
        if (e.isIntersecting) links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
    }), { rootMargin: '-45% 0px -50% 0px' });
    links.forEach(a => { const s = document.querySelector(a.getAttribute('href')); if (s) obs.observe(s); });
})();

// Screenshot carousels
document.querySelectorAll('.shots').forEach(box => {
    const track = box.querySelector('.carousel');
    const step = dir => {
        const w = track.clientWidth + 10;
        const end = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
        if (dir > 0 && end) track.scrollTo({ left: 0, behavior: 'smooth' });
        else if (dir < 0 && track.scrollLeft < 4) track.scrollTo({ left: track.scrollWidth, behavior: 'smooth' });
        else track.scrollBy({ left: dir * w, behavior: 'smooth' });
    };
    box.querySelector('.next').addEventListener('click', () => step(1));
    box.querySelector('.prev').addEventListener('click', () => step(-1));
});

// Skill bars fill on view
(function () {
    const obs = new IntersectionObserver(es => es.forEach(e => {
        if (e.isIntersecting) { e.target.style.width = e.target.dataset.pct + '%'; obs.unobserve(e.target); }
    }), { threshold: 0.3 });
    document.querySelectorAll('.sk s').forEach(b => obs.observe(b));
})();

// Contact form (Formspree)
(function () {
    const FORMSPREE_ID = 'xgopabng';
    const form = document.getElementById('contact-form');
    if (!form) return;
    const errEl = document.getElementById('form-error');
    const btn = form.querySelector('.form-send-btn');

    form.addEventListener('submit', async e => {
        e.preventDefault();
        const name = document.getElementById('f-name').value.trim();
        const email = document.getElementById('f-email').value.trim();
        const msg = document.getElementById('f-msg').value.trim();

        if (!name) { errEl.textContent = '// ERROR: NAME field is empty'; return; }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { errEl.textContent = '// ERROR: invalid EMAIL address'; return; }
        if (!msg) { errEl.textContent = '// ERROR: MESSAGE cannot be empty'; return; }

        errEl.textContent = '';
        btn.textContent = 'Sending...';
        btn.disabled = true;

        try {
            const res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, message: msg }),
            });
            if (res.ok) {
                document.getElementById('form-view').style.display = 'none';
                document.getElementById('form-success').style.display = 'block';
            } else {
                const d = await res.json().catch(() => ({}));
                errEl.textContent = `// ERROR: ${d.error || 'server rejected the request'}`;
                btn.textContent = 'Send Message ↗'; btn.disabled = false;
            }
        } catch {
            errEl.textContent = '// ERROR: network failure — check your connection';
            btn.textContent = 'Send Message ↗'; btn.disabled = false;
        }
    });
})();

// Tile serial IDs, QR stickers, error-dialog buttons
(function () {
    document.querySelectorAll('.tile').forEach((t, i) => {
        t.dataset.id = '#' + ((i + 7) * 2654435761 >>> 0).toString(16).slice(0, 5).toUpperCase();
    });
    function qr(seed) {
        let s = seed, o = '';
        const r = () => (s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
        for (let y = 0; y < 9; y++) for (let x = 0; x < 9; x++) {
            const f = (x < 3 && y < 3) || (x > 5 && y < 3) || (x < 3 && y > 5);
            const on = f ? !((x > 5 ? x - 6 : x) === 1 && (y > 5 ? y - 6 : y) === 1) : r() > 0.5;
            if (on) o += `<rect x="${x}" y="${y}" width="1" height="1"/>`;
        }
        return `<svg viewBox="0 0 9 9" fill="#efe3c8" shape-rendering="crispEdges" aria-hidden="true">${o}</svg>`;
    }
    document.querySelectorAll('.cert').forEach((c, i) => {
        const q = document.createElement('div');
        q.className = 'qr'; q.innerHTML = qr(41 + i * 17); c.appendChild(q);
    });
    const dlg = document.querySelector('.sysdlg');
    if (dlg) dlg.querySelectorAll('.dbtn').forEach(b => b.addEventListener('click', () => dlg.classList.toggle('retry')));
})();

// Certificate viewer (blurred backdrop, not full-screen)
(function () {
    const lb = document.createElement('div');
    lb.className = 'lb';
    lb.innerHTML = '<div class="lb-card" role="dialog" aria-modal="true"><div class="lb-bar"><span></span><button aria-label="Close">✕</button></div><img alt=""></div>';
    document.body.appendChild(lb);
    const img = lb.querySelector('img'), ttl = lb.querySelector('.lb-bar span');
    const close = () => lb.classList.remove('open');
    function open(c) {
        const n = c.querySelector('h4').textContent;
        img.src = c.dataset.img; img.alt = n + ' certificate';
        ttl.textContent = 'CERT // ' + n.toUpperCase();
        lb.classList.add('open'); lb.querySelector('button').focus();
    }
    document.querySelectorAll('.cert').forEach(c => {
        c.tabIndex = 0; c.setAttribute('role', 'button');
        const h = document.createElement('span'); h.className = 'hint'; h.textContent = 'CLICK TO VIEW ↗'; c.appendChild(h);
        c.addEventListener('click', () => open(c));
        c.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(c); } });
    });
    lb.addEventListener('click', e => { if (e.target === lb || e.target.tagName === 'BUTTON') close(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
})();

// Footer name: scrolling strip with per-letter hover fills
(function () {
    const w = document.querySelector('.wordmark');
    if (!w) return;
    const set = () => {
        const d = document.createElement('div'); d.className = 'wm-set';
        [...'SHARVIL SAGALGILE'].forEach(c => {
            const s = document.createElement('span');
            s.className = c === ' ' ? 'sp' : 'ch'; s.textContent = c === ' ' ? '\u00a0' : c; d.appendChild(s);
        });
        const x = document.createElement('span'); x.className = 'sep'; x.textContent = '✦'; d.appendChild(x);
        return d;
    };
    const t = document.createElement('div'); t.className = 'wm-track'; t.append(set(), set());
    w.textContent = ''; w.appendChild(t);
})();

// Bug bounty teaser
(function () {
    const term = document.getElementById('bb-term');
    if (!term) return;
    const fill = document.getElementById('bb-fill'), pct = document.getElementById('bb-pct');
    const scan = document.getElementById('bb-scan'), reset = document.getElementById('bb-reset');
    const lines = [['$ ./bounty --scan --all'], ['[*] loading scope list …'], ['[*] enumerating subdomains …'], ['[*] fuzzing parameters …'], ['[!] 0 programs enrolled', 'e'], ['[!] hunter still in training', 'e'], ['[✓] module status: COMING SOON', 'ok']];
    let timers = [];
    const put = (t, c) => { const d = document.createElement('div'); d.textContent = t; if (c) d.className = c; term.appendChild(d); term.scrollTop = term.scrollHeight; };
    function init() {
        timers.forEach(clearTimeout); timers = []; term.innerHTML = '';
        put('$ ./bounty --status'); put('COMING SOON. Press “Run scan” to poke it.', 'ok');
        fill.style.width = '0'; pct.textContent = 'SCAN 00%'; scan.disabled = false;
    }
    scan.addEventListener('click', () => {
        init(); term.innerHTML = ''; scan.disabled = true;
        lines.forEach(([t, c], i) => timers.push(setTimeout(() => {
            put(t, c);
            const p = Math.round((i + 1) / lines.length * 100);
            fill.style.width = p + '%'; pct.textContent = 'SCAN ' + String(p).padStart(2, '0') + '%';
            if (i === lines.length - 1) scan.disabled = false;
        }, 500 * (i + 1))));
    });
    reset.addEventListener('click', init);
    init();
    document.querySelectorAll('.rd').forEach(b => b.addEventListener('click', () => b.classList.toggle('open')));
    const clk = document.getElementById('bb-clock');
    setInterval(() => { clk.textContent = '0x' + Math.floor(Math.random() * 65536).toString(16).toUpperCase().padStart(4, '0'); }, 120);
})();
