import { toggleTheme, current } from "./theme";
import { toggle as toggleSound, enabled, click } from "./sound";
import { copyEmail } from "./email";

const dlg = document.querySelector<HTMLDialogElement>("#palette");

function score(q: string, s: string) {
	s = s.toLowerCase();
	let i = 0,
		sc = 0,
		last = -2;
	for (const c of q) {
		const j = s.indexOf(c, i);
		if (j < 0) return -1;
		sc += j === last + 1 ? 3 : 1;
		if (j === 0 || /[\s\-/:]/.test(s[j - 1])) sc += 2;
		last = j;
		i = j + 1;
	}
	return sc;
}

export function openPalette() {
	if (dlg && input && !dlg.open) {
		refresh();
		dlg.showModal();
		input.value = "";
		filter();
	}
}
export function closePalette() {
	dlg?.close();
}

let input: HTMLInputElement | null = null,
	list: HTMLElement | null = null,
	items: HTMLElement[] = [],
	visible: HTMLElement[] = [],
	sel = 0;

function refresh() {
	if (!dlg) return;
	const t = dlg.querySelector<HTMLElement>('[data-action="theme"] .p-label');
	if (t) t.textContent = document.documentElement.lang === "it" ? `tema → ${current() === "oled" ? "chiaro" : "scuro"}` : `theme → ${current() === "oled" ? "light" : "oled"}`;
	const s = dlg.querySelector<HTMLElement>('[data-action="sound"] .p-label');
	if (s) s.textContent = document.documentElement.lang === "it" ? `suoni → ${enabled() ? "disattiva" : "attiva"}` : `sound → ${enabled() ? "off" : "on"}`;
	let scene = "lorenz";
	try {
		scene = localStorage.getItem("field") ?? "lorenz";
	} catch {}
	for (const el of dlg.querySelectorAll<HTMLElement>(
		'[data-action^="field:"]',
	))
		el.toggleAttribute(
			"data-current",
			el.dataset.action === `field:${scene}`,
		);
}

function select(i: number) {
	if (!input) return;
	sel = Math.max(0, Math.min(visible.length - 1, i));
	items.forEach((el) => el.setAttribute("aria-selected", "false"));
	visible.forEach((el, k) => el.setAttribute("aria-selected", String(k === sel)));
	if (visible[sel]) input.setAttribute("aria-activedescendant", visible[sel].id);
	else input.removeAttribute("aria-activedescendant");
}

function filter() {
	if (!input || !list) return;
	const q = input.value.trim().toLowerCase();
	const scored = items.map((el) => ({
		el,
		s: q ? score(q, el.dataset.text ?? "") : 0,
	}));
	for (const { el, s } of scored) el.hidden = s < 0;
	visible = scored
		.filter((x) => x.s >= 0)
		.sort((a, b) => b.s - a.s)
		.map((x) => x.el);
	if (q) visible.forEach((el, k) => (el.style.order = String(k)));
	else items.forEach((el, i) => (el.id = `p-opt-${i}`));
	for (const g of list.querySelectorAll<HTMLElement>(".p-group"))
		g.hidden = !g.querySelector('[role="option"]:not([hidden])');
	list.classList.toggle("flat", !!q);
	select(0);
}

async function run(el: HTMLElement) {
	const { href, action } = el.dataset;
	if (href) {
		closePalette();
		location.assign(href);
		return;
	}
	if (action === "theme") toggleTheme();
	else if (action === "sound") toggleSound();
	else if (action === "email") await copyEmail();
	else if (action?.startsWith("field:")) {
		const scene = action.slice(6);
		try {
			localStorage.setItem("field", scene);
		} catch {}
		dispatchEvent(new CustomEvent("field:scene", { detail: scene }));
	}
	closePalette();
}

export function initPalette() {
	if (!dlg) return;
	const nextInput = dlg.querySelector<HTMLInputElement>("input");
	const nextList = dlg.querySelector<HTMLElement>(".p-list");
	if (!nextInput || !nextList) return;
	input = nextInput;
	list = nextList;
	items = Array.from(dlg.querySelectorAll<HTMLElement>('[role="option"]'));
	for (const el of items) {
		el.addEventListener("mousemove", () => {
			const k = visible.indexOf(el);
			if (k >= 0 && k !== sel) select(k);
		});
		el.addEventListener("click", () => run(el));
	}
	nextInput.addEventListener("input", filter);
	nextInput.addEventListener("keydown", (e) => {
		if (e.key === "ArrowDown") {
			e.preventDefault();
			select(sel + 1);
		} else if (e.key === "ArrowUp") {
			e.preventDefault();
			select(sel - 1);
		} else if (e.key === "Enter") {
			e.preventDefault();
			if (visible[sel]) run(visible[sel]);
		}
	});
	dlg.addEventListener("click", (e) => {
		if (e.target === dlg) closePalette();
	}); // backdrop
	dlg.addEventListener("close", click);
	const origShow = dlg.showModal.bind(dlg);
	dlg.showModal = () => {
		origShow();
		click();
	};
	for (const b of document.querySelectorAll("[data-open-palette]"))
		b.addEventListener("click", openPalette);
}
