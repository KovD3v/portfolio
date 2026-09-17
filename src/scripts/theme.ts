const root = document.documentElement;
const meta = document.querySelector<HTMLMetaElement>(
	'meta[name="theme-color"]',
);

type Theme = "light" | "oled";

export const current = (): Theme =>
	root.dataset.theme === "oled" ? "oled" : "light";

function render() {
	const oled = current() === "oled";
	for (const b of document.querySelectorAll<HTMLButtonElement>(".theme")) {
		b.setAttribute("aria-pressed", String(oled));
		b.setAttribute("aria-label", document.documentElement.lang === "it" ? `Passa al tema ${oled ? "chiaro" : "scuro"}` : `Switch to ${oled ? "light" : root.dataset.dark === "warm" ? "warm dark" : "OLED"} theme`);
	}
}

function apply(theme: Theme) {
	root.dataset.theme = theme;
    if (root.hasAttribute("data-proposal-v3")) {
        root.dataset.dark = "warm";
        const url = new URL(location.href);
        if (url.searchParams.has("appearance")) {
            url.searchParams.set("appearance", theme === "light" ? "light" : "warm");
            history.replaceState(null, "", url);
        }
    }
	try {
		localStorage.setItem("theme", theme);
	} catch {}
	if (meta) meta.content = getComputedStyle(root).getPropertyValue("--bg").trim();
	render();
}

export function toggleTheme() {
	const freeze = document.createElement("style");
	freeze.textContent = "*,*::before,*::after{transition:none!important}";
	document.head.append(freeze);
	apply(current() === "oled" ? "light" : "oled");
	void root.offsetHeight;
	requestAnimationFrame(() => freeze.remove());
}

export function initTheme() {
	render();
	document.querySelector(".theme")?.addEventListener("click", toggleTheme);
}
