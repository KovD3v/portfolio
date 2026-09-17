export function initClock() {
	const els = document.querySelectorAll<HTMLElement>("[data-clock]");
	if (!els.length) return;
	const fmts = new Map<string, Intl.DateTimeFormat | null>();
	const fmt = (tz: string) => {
		let f = fmts.get(tz);
		if (f !== undefined) return f;
		try {
			f = new Intl.DateTimeFormat("en-GB", {
				hour: "2-digit",
				minute: "2-digit",
				second: "2-digit",
				timeZone: tz,
			});
		} catch {
			f = null;
		}
		fmts.set(tz, f);
		return f;
	};
	const tick = () => {
		const now = new Date();
		for (const el of els) {
			const zone = el.dataset.clock;
			const formatter = zone ? fmt(zone) : null;
			if (!formatter) continue;
			el.textContent = `${formatter.format(now)}, ${el.dataset.city ?? ""}`;
		}
		setTimeout(tick, 1000 - (now.getTime() % 1000));
	};
	tick();
}
