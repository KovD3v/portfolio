// 2D simplex noise (Gustavson), seeded so every visit renders the same field.
const G = [
	[1, 1],
	[-1, 1],
	[1, -1],
	[-1, -1],
	[1, 0],
	[-1, 0],
	[0, 1],
	[0, -1],
];
const P = new Uint8Array(512);
{
	const p = Array.from({ length: 256 }, (_, i) => i);
	let s = 1337;
	for (let i = 255; i > 0; i--) {
		s = (s * 16807) % 2147483647;
		const j = s % (i + 1);
		[p[i], p[j]] = [p[j], p[i]];
	}
	for (let i = 0; i < 512; i++) P[i] = p[i & 255];
}
const F2 = 0.5 * (Math.sqrt(3) - 1);
const G2 = (3 - Math.sqrt(3)) / 6;

function corner(t: number, x: number, y: number, gi: number) {
	if (t < 0) return 0;
	t *= t;
	const g = G[gi & 7];
	return t * t * (g[0] * x + g[1] * y);
}

export function snoise(x: number, y: number) {
	const s = (x + y) * F2;
	const i = Math.floor(x + s),
		j = Math.floor(y + s);
	const t = (i + j) * G2;
	const x0 = x - (i - t),
		y0 = y - (j - t);
	const i1 = x0 > y0 ? 1 : 0,
		j1 = x0 > y0 ? 0 : 1;
	const x1 = x0 - i1 + G2,
		y1 = y0 - j1 + G2;
	const x2 = x0 - 1 + 2 * G2,
		y2 = y0 - 1 + 2 * G2;
	const ii = i & 255,
		jj = j & 255;
	return (
		70 *
		(corner(0.5 - x0 * x0 - y0 * y0, x0, y0, P[ii + P[jj]]) +
			corner(0.5 - x1 * x1 - y1 * y1, x1, y1, P[ii + i1 + P[jj + j1]]) +
			corner(0.5 - x2 * x2 - y2 * y2, x2, y2, P[ii + 1 + P[jj + 1]]))
	);
}

export function fbm(x: number, y: number, octaves = 3) {
	let a = 0.5,
		f = 1,
		sum = 0,
		max = 0;
	for (let o = 0; o < octaves; o++) {
		sum += a * snoise(x * f, y * f);
		max += a;
		a *= 0.5;
		f *= 2;
	}
	return sum / max;
}
