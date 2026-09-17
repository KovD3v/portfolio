import { initTheme, toggleTheme } from "./theme";
import { initSound } from "./sound";
import { initEmail } from "./email";
import { initClock } from "./clock";
import { initPalette, openPalette, closePalette } from "./palette";

initTheme();
initSound();
initEmail();
initClock();
initPalette();

addEventListener("keydown", (e) => {
	const target = e.target;
	const typing =
		target instanceof Element &&
		target.closest(
		'input, textarea, select, [contenteditable="true"]',
		);
	if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
		e.preventDefault();
		document.querySelector<HTMLDialogElement>("#palette")?.open
			? closePalette()
			: openPalette();
		return;
	}
	if (typing || e.metaKey || e.ctrlKey || e.altKey) return;
	if (e.key === "t") toggleTheme();
});

document.addEventListener("click", async (e) => {
	const btn =
		e.target instanceof Element
			? e.target.closest<HTMLButtonElement>(".copy")
			: null;
	if (!btn) return;
	try {
		await navigator.clipboard.writeText(
			btn.parentElement?.querySelector("pre")?.textContent ?? "",
		);
		btn.textContent = "copied";
	} catch {
		btn.textContent = "copy failed";
	} finally {
		setTimeout(() => (btn.textContent = "copy"), 1500);
	}
});
