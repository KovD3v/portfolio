import { fbm } from "./noise";

export type Put = (x: number, y: number, ch: string, a: number) => void;
export interface SceneCtx {
	t: number; // seconds, quantized to 1/fps
	cols: number;
	rows: number;
	aspect: number; // cellH / cellW, ≈ 1.94 — multiply x by this for round shapes
	fx: number;
	fy: number; // figure centre, in cells
	pointer: { x: number; y: number } | null;
	theme: "light" | "oled";
	ramp?: string;
	fr: number;
}
export type Scene = (c: SceneCtx, put: Put) => void;

const TAU = Math.PI * 2;

/* ── texture: slow drifting noise ─────────────────────────────── */
export const noise = (): Scene => (c, put) => {
	const ramp = c.ramp || " .:-=+";
	const s = 0.045;
	for (let y = 0; y < c.rows; y++)
		for (let x = 0; x < c.cols; x++) {
			const v =
				(fbm(x * s + c.t * 0.012, y * s * c.aspect + c.t * 0.008) + 1) /
				2;
			const i = Math.min(ramp.length - 1, Math.floor(v * ramp.length));
			if (i > 0) put(x, y, ramp[i], v);
		}
};

/* ── texture: contour lines of the same noise ─────────────────── */
export const contour = (): Scene => {
	let buf = new Float32Array(0);
	return (c, put) => {
		const W = c.cols + 2,
			H = c.rows + 2,
			s = 0.045,
			bands = 7;
		if (buf.length < W * H) buf = new Float32Array(W * H);
		for (let y = 0; y < H; y++)
			for (let x = 0; x < W; x++)
				buf[y * W + x] = fbm(
					(x - 1) * s + c.t * 0.012,
					(y - 1) * s * c.aspect + c.t * 0.008,
					2,
				);
		const band = (v: number) => Math.floor(((v + 1) / 2) * bands);
		for (let y = 0; y < c.rows; y++)
			for (let x = 0; x < c.cols; x++) {
				const i = (y + 1) * W + (x + 1),
					b0 = band(buf[i]);
				if (b0 === band(buf[i + 1]) && b0 === band(buf[i + W]))
					continue;
				const dx = buf[i + 1] - buf[i - 1],
					dy = buf[i + W] - buf[i - W];
				const ax = Math.abs(dx),
					ay = Math.abs(dy);
				const ch =
					ay > ax * 2
						? "-"
						: ax > ay * 2
							? "|"
							: dx * dy > 0
								? "\\"
								: "/";
				put(x, y, ch, 0.55 + 0.45 * (b0 / bands));
			}
	};
};

/* ── figure: the torus ────────────────────────────────────────── */
export const donut = (): Scene => {
	let zb = new Float32Array(0),
		out = new Uint8Array(0);
	const L = ".,-~:;=!*#$@";
	return (c, put) => {
		const N = c.cols * c.rows;
		if (zb.length < N) {
			zb = new Float32Array(N);
			out = new Uint8Array(N);
		}
		zb.fill(0);
		out.fill(0);
		const A = c.t * 0.157,
			B = c.t * 0.079;
		const cA = Math.cos(A),
			sA = Math.sin(A),
			cB = Math.cos(B),
			sB = Math.sin(B);
		const R1 = 1,
			R2 = 2,
			K2 = 5,
			K1 = (c.fr * K2) / (R1 + R2);
		for (let th = 0; th < TAU; th += 0.07) {
			const ct = Math.cos(th),
				st = Math.sin(th);
			for (let ph = 0; ph < TAU; ph += 0.02) {
				const cp = Math.cos(ph),
					sp = Math.sin(ph);
				const cx = R2 + R1 * ct,
					cy = R1 * st;
				const x = cx * (cB * cp + sA * sB * sp) - cy * cA * sB;
				const y = cx * (sB * cp - sA * cB * sp) + cy * cA * cB;
				const ooz = 1 / (K2 + cA * cx * sp + cy * sA);
				const xp = Math.round(c.fx + K1 * ooz * x * c.aspect);
				const yp = Math.round(c.fy - K1 * ooz * y);
				if (xp < 0 || xp >= c.cols || yp < 0 || yp >= c.rows) continue;
				const idx = yp * c.cols + xp;
				if (ooz <= zb[idx]) continue;
				const lum =
					cp * ct * sB -
					cA * ct * sp -
					sA * st +
					cB * (cA * st - ct * sA * sp);
				zb[idx] = ooz;
				out[idx] = lum > 0 ? Math.min(12, 1 + Math.floor(lum * 8)) : 1;
			}
		}
		for (let i = 0; i < N; i++)
			if (out[i])
				put(
					i % c.cols,
					(i / c.cols) | 0,
					L[out[i] - 1],
					0.35 + 0.65 * ((out[i] - 1) / 11),
				);
	};
};

/* ── figure: wireframe cube with faint hidden lines ───────────── */
export const cube = (): Scene => {
	const V: number[][] = [];
	for (let i = 0; i < 8; i++)
		V.push([i & 4 ? 1 : -1, i & 2 ? 1 : -1, i & 1 ? 1 : -1]);
	const E: [number, number][] = [];
	for (let a = 0; a < 8; a++)
		for (let b = a + 1; b < 8; b++) {
			const d = a ^ b;
			if ((d & (d - 1)) === 0) E.push([a, b]);
		}
	const ramp = ".:+#",
		R3 = Math.sqrt(3);
	return (c, put) => {
		const a = (c.t * TAU) / 30,
			b = (c.t * TAU) / 47;
		const ca = Math.cos(a),
			sa = Math.sin(a),
			cb = Math.cos(b),
			sb = Math.sin(b);
		const rot = ([x, y, z]: number[]) => {
			const y1 = y * ca - z * sa,
				z1 = y * sa + z * ca;
			return [x * cb + z1 * sb, y1, -x * sb + z1 * cb];
		};
		const P = V.map(rot);
		const nz = (k: number, s: number) =>
			rot([k === 0 ? s : 0, k === 1 ? s : 0, k === 2 ? s : 0])[2];
		const S = c.fr * 0.67,
			K = 4;
		const pr = (p: number[]) => {
			const d = K / (K + p[2]);
			return [c.fx + p[0] * S * d * c.aspect, c.fy - p[1] * S * d, p[2]];
		};
		for (const [i, j] of E) {
			let vis = false;
			for (let k = 0; k < 3; k++)
				if (V[i][k] === V[j][k] && nz(k, V[i][k]) < 0) vis = true;
			const A = pr(P[i]),
				B = pr(P[j]);
			const n =
				Math.max(Math.abs(B[0] - A[0]), Math.abs(B[1] - A[1])) | 0 || 1;
			for (let s = 0; s <= n; s++) {
				const u = s / n,
					z = A[2] + (B[2] - A[2]) * u;
				const near = 1 - (z + R3) / (2 * R3);
				put(
					A[0] + (B[0] - A[0]) * u,
					A[1] + (B[1] - A[1]) * u,
					ramp[Math.min(3, Math.floor(near * 4))],
					vis ? 0.5 + 0.5 * near : 0.18,
				);
			}
		}
	};
};

/* ── signal: overlaid sine bands ──────────────────────────────── */
export const wave = (): Scene => {
	let col = new Int8Array(0);
	// [centre (rows), amplitude (rows), frequency (per cell), direction, phase]
	const B = [
		[0.32, 0.08, 0.075, 1, 0],
		[0.5, 0.11, 0.05, -0.7, 2.1],
		[0.64, 0.06, 0.11, 1.4, 4.2],
		[0.44, 0.045, 0.16, -1.1, 1],
	];
	return (c, put) => {
		if (col.length < c.rows) col = new Int8Array(c.rows);
		const w = TAU / 8;
		for (let x = 0; x < c.cols; x++) {
			col.fill(0);
			for (let k = 0; k < B.length; k++) {
				const [cy, amp, f, dir, ph] = B[k];
				const arg = x * f + c.t * w * dir + ph,
					A = amp * c.rows;
				const y = Math.round(cy * c.rows + A * Math.sin(arg));
				if (y < 0 || y >= c.rows) continue;
				const slope = Math.abs(Math.cos(arg)) * A * f;
				const ch = col[y]
					? "+"
					: slope < 0.12
						? "-"
						: slope < 0.45
							? "~"
							: "=";
				col[y] = 1;
				put(x, y, ch, col[y] && ch === "+" ? 1 : 0.9 - k * 0.15);
			}
		}
	};
};

/* ── figure: Lorenz attractor trace ───────────────────────────── */
export const lorenz = (seed = 0): Scene => {
	const r = (seed % 9973) / 9973; // 0..1 from the commit hash
	const N = 600,
		px = new Float32Array(N),
		py = new Float32Array(N),
		pz = new Float32Array(N);
	let s = [0.1 + (r - 0.5) * 0.05, r * 0.02, 0],
		head = 0,
		filled = 0,
		lastT = -1;
	const ph0 = r * TAU;
	const step = () => {
		const [x, y, z] = s,
			dt = 0.005;
		s = [
			x + dt * 10 * (y - x),
			y + dt * (x * (28 - z) - y),
			z + dt * (x * y - (8 / 3) * z),
		];
		px[head] = s[0];
		py[head] = s[1];
		pz[head] = s[2];
		head = (head + 1) % N;
		filled = Math.min(filled + 1, N);
	};
	for (let i = 0; i < 3000; i++) step(); // settle onto the attractor
	const ramp = ".:+*";
	return (c, put) => {
		if (c.t > lastT) {
			const n =
				Math.min(40, Math.round((c.t - Math.max(lastT, 0)) * 48)) || 4;
			for (let i = 0; i < n; i++) step();
			lastT = c.t;
		}
		const th = ph0 + (c.t * TAU) / 60,
			ct = Math.cos(th),
			st = Math.sin(th);

		const sc = (c.fr * 2) / 50;
		for (let i = 0; i < filled; i++) {
			const k = (head - 1 - i + N) % N,
				age = i / N;
			const xr = px[k] * ct - py[k] * st;
			put(
				c.fx + xr * sc * c.aspect,
				c.fy + (25 - pz[k]) * sc,
				ramp[Math.min(3, Math.floor((1 - age) * 4))],
				0.25 + 0.75 * (1 - age),
			);
		}
	};
};

export const scenes: Record<string, (seed?: number) => Scene> = {
	noise,
	contour,
	donut,
	cube,
	wave,
	lorenz,
};
