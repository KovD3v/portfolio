let resetTimer: ReturnType<typeof setTimeout> | undefined;

export async function copyEmail() {
	const el = document.querySelector<HTMLAnchorElement>("[data-email]");
	const addr = el?.dataset.email;
	if (!addr) return false;
	try {
		await navigator.clipboard.writeText(addr);
		if (el) {
			clearTimeout(resetTimer);
			el.textContent = document.documentElement.lang === "it" ? "copiata" : "copied";
			resetTimer = setTimeout(() => (el.textContent = "email"), 1500);
		}
		return true;
	} catch {
		return false;
	}
}

export function initEmail() {
	const el = document.querySelector<HTMLAnchorElement>("[data-email]");
	if (!el) return;
	el.addEventListener("click", async (e) => {
		e.preventDefault();
		if (!(await copyEmail())) location.href = el.href; // no clipboard → mailto
	});
}
