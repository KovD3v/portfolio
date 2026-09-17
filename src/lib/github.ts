export async function lastPush(repo?: string): Promise<Date | null> {
	if (!repo) return null;
	const parts = repo.trim().split("/");
	if (parts.length !== 2 || parts.some((part) => !part || /\s/.test(part)))
		return null;
	try {
		const headers: Record<string, string> = {
			accept: "application/vnd.github+json",
		};
		if (process.env.GITHUB_TOKEN)
			headers.authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
		const path = parts.map(encodeURIComponent).join("/");
		const r = await fetch(`https://api.github.com/repos/${path}`, {
			headers,
			signal: AbortSignal.timeout(5000),
		});
		if (!r.ok) return null;
		const body: unknown = await r.json();
		if (!body || typeof body !== "object" || !("pushed_at" in body))
			return null;
		const pushedAt = body.pushed_at;
		if (typeof pushedAt !== "string") return null;
		const date = new Date(pushedAt);
		return Number.isFinite(date.getTime()) ? date : null;
	} catch {
		return null;
	}
}
