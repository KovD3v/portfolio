import type { Scene, SceneCtx } from "./scenes";

export interface Options {
	scene: Scene;
	fps: number;
	alpha: number | null; // null → --field token
	density: number; // 0..1
	radius: number; // pointer radius, px
	boost: number; // pointer target alpha
	masks: boolean;
	maskEl: Element | null; // prose column to protect
	figure: [number, number] | null; // explicit centre as fractions; null → auto
	ramp?: string;
	fontSize: number;
	lineHeight: number;
}

const reduce = matchMedia("(prefers-reduced-motion: reduce)");
const fine = matchMedia("(pointer: fine)");

export function mount(canvas: HTMLCanvasElement, init: Partial<Options>) {
	const o: Options = {
		scene: () => {},
		fps: 12,
		alpha: null,
		density: 1,
		radius: 140,
		boost: 0.3,
		masks: true,
		maskEl: null,
		figure: null,
		fontSize: 12,
		lineHeight: 14,
		...init,
	};
	const context = canvas.getContext("2d");
	if (!context)
		return {
			set(_p: Partial<Options>) {},
			stats: () => ({ cols: 0, rows: 0, cw: 0, ch: 0, ms: 0 }),
			destroy() {},
		};
	const ctx = context;
	const root = document.documentElement;
	const css = (p: string) =>
		getComputedStyle(root).getPropertyValue(p).trim();

	let w = 0,
		h = 0,
		cw = 7,
		ch = 14,
		cols = 0,
		rows = 0;
	let fg = "#000",
		theme: "light" | "oled" = "light",
		fieldAlpha = 0.08;
	let mask: { l: number; r: number; top: number } | null = null;
	let raf = 0,
		last = 0,
		acc = 0,
		t = 0,
		ms = 0,
		visible = true,
		ready = false;
	let px = 0,
		py = 0,
		pOn = false,
		sig = 70;
	const ptr = { cx: -1e4, cy: -1e4 };

	function readTheme() {
		fg = css("--fg");
		theme = root.dataset.theme === "oled" ? "oled" : "light";
		fieldAlpha = parseFloat(css("--field")) || 0.08;
	}

	function measure() {
		const dpr = devicePixelRatio || 1;
		const r = canvas.getBoundingClientRect();
		w = r.width;
		h = r.height;
		canvas.width = Math.round(w * dpr);
		canvas.height = Math.round(h * dpr);
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		ctx.font = `${o.fontSize}px ${css("--mono")}`;
		ctx.textBaseline = "top";
		cw = ctx.measureText("M").width;
		ch = o.lineHeight;
		cols = Math.floor(w / cw);
		rows = Math.floor(h / ch);
		if (o.maskEl) {
			const m = o.maskEl.getBoundingClientRect();
			const pad = parseFloat(getComputedStyle(o.maskEl).paddingTop) || 0;
			mask = {
				l: m.left - r.left,
				r: m.right - r.left,
				top: m.top - r.top + pad,
			};
		} else mask = null;
	}

	const hash = (x: number, y: number) =>
		((((x * 73856093) ^ (y * 19349663)) >>> 0) % 1000) / 1000;

	function put(x: number, y: number, c: string, a: number) {
		x = Math.round(x);
		y = Math.round(y);
		if (a <= 0 || x < 0 || y < 0 || x >= cols || y >= rows) return;
		if (o.density < 1 && hash(x, y) > o.density) return;
		const sx = x * cw,
			sy = y * ch;
		let v = a * (o.alpha ?? fieldAlpha);
		let inCol = false;
		if (o.masks) {
			// column mask only applies from the prose top downward
			if (mask && sy >= mask.top - 16) {
				const d =
					sx < mask.l - 32
						? mask.l - 32 - sx
						: sx > mask.r + 32
							? sx - mask.r - 32
							: 0;
				inCol = d === 0;
				v *= d >= 80 ? 1 : 0.45 + 0.55 * (d / 80);
			}
			const f = sy / h;
			if (f > 0.6) v *= (1 - f) / 0.4;
		}
		if (pOn && o.boost > v) {
			const dx = sx - px,
				dy = sy - py;
			v +=
				(o.boost - v) *
				Math.exp(-(dx * dx + dy * dy) / (2 * sig * sig));
		}
		if (inCol) v = Math.min(v, theme === "light" ? 0.14 : 0.18);
		if (v < 0.005) return;
		ctx.globalAlpha = Math.min(1, Math.round(v * 40) / 40);
		ctx.fillText(c, sx, sy);
	}

	function draw() {
		if (!ready) return;
		const t0 = performance.now();
		ctx.clearRect(0, 0, w, h);
		ctx.fillStyle = fg;

		pOn = false;
		if (fine.matches && !reduce.matches) {
			const r = canvas.getBoundingClientRect();
			px = ptr.cx - r.left;
			py = ptr.cy - r.top;
			sig = o.radius / 2;
			pOn =
				px > -o.radius &&
				py > -o.radius &&
				px < w + o.radius &&
				py < h + o.radius;
		}

		// figure placement: explicit → right margin → header band (narrow) → centre
		let fx = w / 2,
			fy = h * 0.4,
			fr = rows * 0.42; // fr = radius in rows
		if (o.figure) {
			fx = o.figure[0] * w;
			fy = o.figure[1] * h;
		} else if (mask) {
			const margin = w - mask.r;
			if (margin > 200) {
				fx = mask.r + margin / 2;
				fy = h * 0.42;
				fr = Math.min(fr, (margin * 0.46) / ch);
			} else if (mask.top > 120) {
				fx = w / 2;
				fy = mask.top / 2;
				fr = Math.min(fr, (mask.top * 0.42) / ch);
			}
		}

		const sc: SceneCtx = {
			t,
			cols,
			rows,
			aspect: ch / cw,
			fx: fx / cw,
			fy: fy / ch,
			fr,
			pointer: pOn ? { x: px / cw, y: py / ch } : null,
			theme,
			ramp: o.ramp,
		};
		o.scene(sc, put);
		ms = performance.now() - t0;
	}

	function loop(now: number) {
		raf = requestAnimationFrame(loop);
		if (!last) last = now;
		acc += now - last;
		last = now;
		const step = 1000 / o.fps;
		if (acc < step) return;
		acc = Math.min(acc - step, step);
		t += 1 / o.fps;
		draw();
	}
	function start() {
		if (raf || reduce.matches || !visible || document.hidden) return;
		last = 0;
		raf = requestAnimationFrame(loop);
	}
	function stop() {
		cancelAnimationFrame(raf);
		raf = 0;
	}

	addEventListener(
		"pointermove",
		(e) => {
			ptr.cx = e.clientX;
			ptr.cy = e.clientY;
		},
		{ passive: true },
	);
	document.addEventListener("mouseleave", () => {
		ptr.cx = ptr.cy = -1e4;
	});
	new ResizeObserver(() => {
		measure();
		draw();
	}).observe(canvas);
	new IntersectionObserver((entries) => {
		const e = entries[0];
		if (!e) return;
		visible = e.isIntersecting;
		visible ? start() : stop();
	}).observe(canvas);
	document.addEventListener("visibilitychange", () =>
		document.hidden ? stop() : start(),
	);
	new MutationObserver(() => {
		readTheme();
		draw();
	}).observe(root, { attributes: true, attributeFilter: ["data-theme"] });
	reduce.addEventListener("change", () =>
		reduce.matches ? (stop(), draw()) : start(),
	);

	document.fonts
		.load(`${o.fontSize}px ${css("--mono")}`)
		.catch(() => undefined)
		.then(() => {
			readTheme();
			measure();
			ready = true;
			draw();
			start();
		});

	return {
		set(p: Partial<Options>) {
			Object.assign(o, p);
			if ("maskEl" in p || "fontSize" in p || "lineHeight" in p)
				measure();
			draw();
		},
		stats: () => ({
			cols,
			rows,
			cw: +cw.toFixed(2),
			ch,
			ms: +ms.toFixed(2),
		}),
		destroy: stop,
	};
}
