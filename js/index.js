/* ==========================================================================
   1st Anniversary — a candle, a ring, and one question
   Everything you might want to personalize lives in CONFIG below.
   ========================================================================== */

const CONFIG = {
    daysTogether: 365,
    signature: 'Charles',
    typeSpeedMs: 36,
    // The letter: two paragraphs. Replace with your own words.
    paragraphs: [
        "365 days ago I didn't know a love could be this gentle and this loud at the same time. Somewhere between our first hello and today, you became my favorite place to be.",
        "Thank you for every laugh, every patient moment, and every ordinary day you turned into a celebration. I would choose you in every version of every year."
    ]
};

(function () {
    'use strict';

    const reduced = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    const $ = (id) => document.getElementById(id);
    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, reduced ? ms * 0.4 : ms));
    const rand = (a, b) => a + Math.random() * (b - a);
    const pick = (list) => list[Math.floor(Math.random() * list.length)];
    const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

    const scene = $('scene');
    const candle = $('candle');
    const glow = $('glow');
    const hintBlock = $('hintBlock');
    const counterBlock = $('counterBlock');
    const daysEl = $('days');
    const letterBlock = $('letterBlock');
    const ringStage = $('ringStage');
    const ringSlot = $('ringSlot');
    const ring = $('ring');
    const askBlock = $('askBlock');
    const finalBlock = $('finalBlock');
    const yesBtn = $('yesBtn');
    const noBtn = $('noBtn');
    const bgMusic = $('bgMusic');
    const soundToggle = $('soundToggle');
    const soundIcon = $('soundIcon');

    $('finalSign').textContent = '— ' + CONFIG.signature;

    /* ======================================================================
       Particles — warm floating bokeh, plus hearts and sparkles on demand
       ====================================================================== */

    const fx = (function () {
        const canvas = $('particles');
        const ctx = canvas.getContext && canvas.getContext('2d');

        if (!ctx) {
            const noop = function () {};
            return { resize: noop, start: noop, setIntensity: noop, radial: noop, celebrate: noop };
        }

        const COLORS = ['#ff7aa2', '#ffb3c6', '#f3c777', '#ffe2a8', '#ff9a4d', '#fff1dc'];
        const ambient = [];
        const bits = [];
        let W = 0;
        let H = 0;
        let intensity = 0.18;
        let target = 0.18;
        let last = 0;
        let clock = 0;

        function resize() {
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            W = window.innerWidth;
            H = window.innerHeight;
            canvas.width = Math.round(W * dpr);
            canvas.height = Math.round(H * dpr);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            buildAmbient();
        }

        function buildAmbient() {
            ambient.length = 0;
            const count = clamp(Math.round((W * H) / 20000), 22, 56);
            for (let i = 0; i < count; i += 1) {
                const big = Math.random() < 0.22;
                ambient.push({
                    x0: rand(0, W),
                    y: rand(0, H),
                    r: big ? rand(12, 24) : rand(3, 10),
                    vy: rand(6, 22),
                    sway: rand(8, 26),
                    phase: rand(0, 6.283),
                    a: big ? rand(0.06, 0.16) : rand(0.14, 0.4),
                    c: Math.random() < 0.65 ? '255,205,130' : '255,160,185'
                });
            }
        }

        function heartPath(s) {
            ctx.beginPath();
            ctx.moveTo(0, s * 0.35);
            ctx.bezierCurveTo(-s * 0.9, -s * 0.35, -s * 0.5, -s * 0.95, 0, -s * 0.45);
            ctx.bezierCurveTo(s * 0.5, -s * 0.95, s * 0.9, -s * 0.35, 0, s * 0.35);
            ctx.closePath();
        }

        function starPath(s) {
            ctx.beginPath();
            ctx.moveTo(0, -s);
            ctx.lineTo(s * 0.25, -s * 0.25);
            ctx.lineTo(s, 0);
            ctx.lineTo(s * 0.25, s * 0.25);
            ctx.lineTo(0, s);
            ctx.lineTo(-s * 0.25, s * 0.25);
            ctx.lineTo(-s, 0);
            ctx.lineTo(-s * 0.25, -s * 0.25);
            ctx.closePath();
        }

        function radial(x, y, n, opt) {
            const o = Object.assign({
                minSpeed: 120, maxSpeed: 420, g: 260, heartRatio: 0.6,
                minSize: 7, maxSize: 16, lifeScale: 1
            }, opt || {});
            for (let i = 0; i < n; i += 1) {
                const angle = rand(0, 6.283);
                const speed = rand(o.minSpeed, o.maxSpeed);
                bits.push({
                    kind: Math.random() < o.heartRatio ? 'heart' : 'spark',
                    x: x, y: y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    g: o.g,
                    size: rand(o.minSize, o.maxSize),
                    rot: rand(-0.6, 0.6),
                    vr: rand(-2, 2),
                    life: 0,
                    max: rand(1.4, 2.8) * o.lifeScale,
                    color: pick(COLORS)
                });
            }
        }

        function fountain(fromX, n) {
            for (let i = 0; i < n; i += 1) {
                const x = fromX + rand(-20, 20);
                bits.push({
                    kind: Math.random() < 0.8 ? 'heart' : 'spark',
                    x: x, y: H + 10,
                    vx: (W / 2 - x) * rand(0.05, 0.35) + rand(-80, 80),
                    vy: -rand(520, 880),
                    g: 620,
                    size: rand(10, 20),
                    rot: rand(-0.6, 0.6),
                    vr: rand(-2, 2),
                    life: 0,
                    max: rand(2.2, 3.4),
                    color: pick(COLORS)
                });
            }
        }

        function rain(n) {
            for (let i = 0; i < n; i += 1) {
                bits.push({
                    kind: Math.random() < 0.85 ? 'heart' : 'spark',
                    x: rand(0, W), y: -20,
                    vx: rand(-25, 25),
                    vy: rand(60, 140),
                    g: 20,
                    size: rand(8, 15),
                    rot: rand(-0.6, 0.6),
                    vr: rand(-1.2, 1.2),
                    life: 0,
                    max: rand(3, 5),
                    color: pick(COLORS)
                });
            }
        }

        function celebrate(x, y) {
            radial(x, y, reduced ? 24 : 70);
            setTimeout(function () { fountain(W * 0.18, reduced ? 12 : 34); fountain(W * 0.82, reduced ? 12 : 34); }, 350);
            setTimeout(function () { radial(x, y, reduced ? 20 : 60, { maxSpeed: 520 }); }, 900);
            const id = setInterval(function () { rain(reduced ? 1 : 3); }, 220);
            setTimeout(function () { clearInterval(id); }, 7000);
        }

        function frame(now) {
            const dt = Math.min(0.05, (now - last) / 1000 || 0);
            last = now;
            clock += dt;
            intensity += (target - intensity) * Math.min(1, dt * 1.4);
            ctx.clearRect(0, 0, W, H);

            ctx.globalCompositeOperation = 'lighter';
            for (let i = 0; i < ambient.length; i += 1) {
                const p = ambient[i];
                if (!reduced) {
                    p.y -= p.vy * dt;
                    if (p.y < -p.r * 2) {
                        p.y = H + p.r * 2;
                        p.x0 = rand(0, W);
                    }
                }
                const x = p.x0 + Math.sin(clock * 0.4 + p.phase) * p.sway;
                const a = p.a * intensity;
                const g = ctx.createRadialGradient(x, p.y, 0, x, p.y, p.r);
                g.addColorStop(0, 'rgba(' + p.c + ',' + a.toFixed(3) + ')');
                g.addColorStop(1, 'rgba(' + p.c + ',0)');
                ctx.fillStyle = g;
                ctx.beginPath();
                ctx.arc(x, p.y, p.r, 0, 6.283);
                ctx.fill();
            }

            for (let i = bits.length - 1; i >= 0; i -= 1) {
                const b = bits[i];
                b.life += dt;
                if (b.life >= b.max) {
                    bits.splice(i, 1);
                    continue;
                }
                b.vy += b.g * dt;
                b.x += b.vx * dt;
                b.y += b.vy * dt;
                b.rot += b.vr * dt;
                const alpha = Math.min(1, (1 - b.life / b.max) * 2.2);

                ctx.save();
                ctx.globalAlpha = alpha;
                ctx.globalCompositeOperation = b.kind === 'spark' ? 'lighter' : 'source-over';
                ctx.translate(b.x, b.y);
                ctx.rotate(b.rot);
                ctx.fillStyle = b.color;
                if (b.kind === 'heart') {
                    heartPath(b.size);
                } else {
                    starPath(b.size * 0.7);
                }
                ctx.fill();
                ctx.restore();
            }
            ctx.globalCompositeOperation = 'source-over';
            requestAnimationFrame(frame);
        }

        return {
            resize: resize,
            start: function () { requestAnimationFrame(frame); },
            setIntensity: function (v) { target = v; },
            radial: radial,
            celebrate: celebrate
        };
    })();

    /* ======================================================================
       Layout helpers
       ====================================================================== */

    function flameCenter() {
        const r = candle.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height * 0.155 };
    }

    function slotCenter() {
        const r = ringSlot.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    }

    function anchorGlow() {
        const f = flameCenter();
        glow.style.setProperty('--fx', f.x + 'px');
        glow.style.setProperty('--fy', f.y + 'px');
    }

    function ringTransform(x, y, s) {
        return 'translate(' + x + 'px, ' + y + 'px) translate(-50%, -50%) scale(' + s + ')';
    }

    function show(el) { el.classList.add('show'); }
    function hide(el) { el.classList.remove('show'); }

    /* ======================================================================
       Typewriter — the full text is laid out up front (hidden), so nothing
       jumps around while it types
       ====================================================================== */

    let skipTyping = false;

    function prepareTyper(el, text) {
        const typed = document.createElement('span');
        const cursor = document.createElement('span');
        const ghost = document.createElement('span');
        cursor.className = 'cursor';
        cursor.style.visibility = 'hidden';
        ghost.className = 'ghost';
        ghost.textContent = text;
        el.textContent = '';
        el.appendChild(typed);
        el.appendChild(cursor);
        el.appendChild(ghost);
        return { typed: typed, cursor: cursor, ghost: ghost, text: text };
    }

    async function typeInto(t) {
        t.cursor.style.visibility = 'visible';
        for (let i = 1; i <= t.text.length; i += 1) {
            if (skipTyping) {
                t.typed.textContent = t.text;
                t.ghost.textContent = '';
                return;
            }
            t.typed.textContent = t.text.slice(0, i);
            t.ghost.textContent = t.text.slice(i);
            await sleep(CONFIG.typeSpeedMs * (/[,.;—]/.test(t.text[i - 1]) ? 5 : 1));
        }
    }

    function countUp(el, to, ms) {
        return new Promise(function (resolve) {
            const total = reduced ? ms * 0.4 : ms;
            const t0 = performance.now();
            function step(now) {
                const p = Math.min(1, (now - t0) / total);
                el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
                if (p < 1) {
                    requestAnimationFrame(step);
                } else {
                    resolve();
                }
            }
            requestAnimationFrame(step);
        });
    }

    /* ======================================================================
       The story
       ====================================================================== */

    let started = false;
    let stage = 'unlit';
    let ringPlaced = false;
    let typing = false;
    let answered = false;

    async function light() {
        if (started) return;
        started = true;
        stage = 'lit';

        candle.classList.add('lit');
        scene.classList.add('lit');
        glow.classList.add('lit');
        candle.setAttribute('aria-label', 'The candle is lit');
        candle.removeAttribute('tabindex');
        hide(hintBlock);

        bgMusic.volume = 0.5;
        bgMusic.play().catch(function () {
            /* If autoplay is blocked, the sound button lets her start it. */
        });
        soundToggle.classList.add('show');

        fx.setIntensity(1);
        const f = flameCenter();
        fx.radial(f.x, f.y, 16, {
            minSpeed: 30, maxSpeed: 140, g: -40, heartRatio: 0,
            minSize: 3, maxSize: 7, lifeScale: 0.8
        });

        await sleep(1600);
        stage = 'counting';
        show(counterBlock);
        await countUp(daysEl, CONFIG.daysTogether, 3200);
        await sleep(1400);
        hide(counterBlock);
        await sleep(1000);

        stage = 'letter';
        show(letterBlock);
        await sleep(700);
        typing = true;
        skipTyping = false;
        const t1 = prepareTyper($('para1'), CONFIG.paragraphs[0]);
        const t2 = prepareTyper($('para2'), CONFIG.paragraphs[1]);
        await typeInto(t1);
        t1.cursor.style.visibility = 'hidden';
        if (!skipTyping) await sleep(500);
        await typeInto(t2);
        typing = false;
        await sleep(2800);
        hide(letterBlock);
        await sleep(1000);

        stage = 'ring';
        show(ringStage);
        await sleep(400);
        riseRing();
        await sleep(2300);
        const c = slotCenter();
        fx.radial(c.x, c.y, 18, {
            minSpeed: 40, maxSpeed: 200, g: 40, heartRatio: 0.2,
            minSize: 4, maxSize: 9, lifeScale: 0.9
        });
        show(askBlock);
    }

    function riseRing() {
        const from = flameCenter();
        ring.style.transition = 'none';
        ring.style.opacity = '0';
        ring.style.transform = ringTransform(from.x, from.y, 0.2);
        void ring.offsetWidth;
        ring.style.transition = '';
        const to = slotCenter();
        ring.style.opacity = '1';
        ring.style.transform = ringTransform(to.x, to.y, 1);
        ringPlaced = true;
    }

    async function yes() {
        if (answered) return;
        answered = true;
        stage = 'final';
        hide(askBlock);
        candle.classList.add('big');
        ring.classList.add('glad');
        const c = slotCenter();
        fx.celebrate(c.x, c.y);
        await sleep(700);
        show(finalBlock);
    }

    /* ======================================================================
       The button that doesn't want to say no
       ====================================================================== */

    const NO_LABELS = ['let me think', 'hmm, not so fast', 'are you sure?', 'think again', 'ok fine, yes'];
    let dodges = 0;
    let lastDodge = 0;

    function dodge() {
        dodges += 1;
        lastDodge = Date.now();
        noBtn.textContent = NO_LABELS[Math.min(dodges, NO_LABELS.length - 1)];

        if (dodges >= NO_LABELS.length - 1) {
            noBtn.classList.add('is-yes');
            noBtn.style.transform = 'none';
            return;
        }

        const previous = noBtn.style.transform;
        noBtn.style.transform = 'none';
        const r = noBtn.getBoundingClientRect();
        noBtn.style.transform = previous;

        const margin = 10;
        const left = rand(margin, Math.max(margin, window.innerWidth - r.width - margin));
        const top = clamp(r.top + rand(-90, 90), margin, window.innerHeight - r.height - margin);
        noBtn.style.transform = 'translate(' + (left - r.left) + 'px, ' + (top - r.top) + 'px)';
    }

    noBtn.addEventListener('pointerdown', function (e) {
        if (dodges >= NO_LABELS.length - 1) return;
        e.preventDefault();
        dodge();
    });

    noBtn.addEventListener('click', function () {
        if (Date.now() - lastDodge < 450) return;
        if (dodges >= NO_LABELS.length - 1) {
            yes();
        } else {
            dodge();
        }
    });

    yesBtn.addEventListener('click', yes);

    /* ======================================================================
       Wiring
       ====================================================================== */

    candle.addEventListener('click', light);
    candle.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            light();
        }
    });

    scene.addEventListener('pointerdown', function () {
        if (typing) skipTyping = true;
    });

    document.addEventListener('pointerdown', function (e) {
        if (stage !== 'final') return;
        if (e.target && e.target.closest && e.target.closest('.sound-toggle')) return;
        fx.radial(e.clientX, e.clientY, 12, {
            minSpeed: 80, maxSpeed: 300, g: 220, heartRatio: 0.7,
            minSize: 7, maxSize: 14, lifeScale: 0.8
        });
    });

    soundToggle.addEventListener('click', function () {
        if (bgMusic.paused) {
            bgMusic.play().catch(function () {});
            soundToggle.classList.remove('muted');
            soundIcon.textContent = '♪';
        } else {
            bgMusic.pause();
            soundToggle.classList.add('muted');
            soundIcon.textContent = '♪̸';
        }
    });

    window.addEventListener('resize', function () {
        fx.resize();
        anchorGlow();
        if (ringPlaced) {
            const t = slotCenter();
            ring.style.transition = 'none';
            ring.style.transform = ringTransform(t.x, t.y, 1);
            void ring.offsetWidth;
            ring.style.transition = '';
        }
    });

    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(anchorGlow);
    }

    fx.resize();
    anchorGlow();
    fx.start();
})();