const KEY = "sound";
let ctx: AudioContext | null = null;
let on = false;
try {
	on = localStorage.getItem(KEY) === "1";
} catch {}

function render() {
	for (const b of document.querySelectorAll<HTMLElement>(".sound")) {
		b.toggleAttribute("data-on", on);
		b.title = document.documentElement.lang === "it" ? (on ? "suoni attivi" : "suoni disattivati") : (on ? "sound on" : "sound off");
		b.setAttribute("aria-pressed", String(on));
	}
}

export const enabled = () => on;

export function click() {
	if (!on) return;
	try {
		ctx ??= new AudioContext();
		if (ctx.state === "suspended") void ctx.resume().catch(() => {});
		const sr = ctx.sampleRate,
			n = Math.floor(sr * 0.03);
		const buf = ctx.createBuffer(1, n, sr),
			d = buf.getChannelData(0);
		for (let i = 0; i < n; i++)
			d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (sr * 0.004));
		const src = ctx.createBufferSource();
		src.buffer = buf;
		const bp = ctx.createBiquadFilter();
		bp.type = "bandpass";
		bp.frequency.value = 1800;
		bp.Q.value = 0.9;
		const g = ctx.createGain();
		g.gain.value = 0.22;
		src.connect(bp).connect(g).connect(ctx.destination);
		src.start();
	} catch {}
}

export function toggle() {
	on = !on;
	try {
		localStorage.setItem(KEY, on ? "1" : "0");
	} catch {}
	render();
	click(); // audible confirmation when turning on; silent when turning off
}

export function initSound() {
	render();
	for (const b of document.querySelectorAll(".sound"))
		b.addEventListener("click", toggle);
}
