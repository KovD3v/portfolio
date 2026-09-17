import { execSync } from "node:child_process";
import pkg from "../../package.json" with { type: "json" };

const sh = (c: string) => {
	try {
		return execSync(c, { stdio: ["ignore", "pipe", "ignore"] })
			.toString()
			.trim();
	} catch {
		return "";
	}
};

export const version = typeof pkg.version === "string" ? pkg.version : "dev";
export const commit = sh("git rev-parse --short HEAD") || "dev";
const timestamp = Number(sh("git log -1 --format=%ct"));
export const commitDate = new Date(
	(Number.isFinite(timestamp) && timestamp > 0 ? timestamp : Date.now() / 1000) *
		1000,
);
export const built = new Date();

export function relative(d: Date, from = built) {
	const s = (from.getTime() - d.getTime()) / 1000;
	if (!Number.isFinite(s)) return "unknown";
	const age = Math.max(0, Math.round(s));
	if (age < 60) return "just now";
	const units: [number, string][] = [
		[31536000, "y"],
		[2592000, "mo"],
		[604800, "w"],
		[86400, "d"],
		[3600, "h"],
		[60, "m"],
	];
	for (const [n, u] of units)
		if (age >= n) return `${Math.floor(age / n)}${u} ago`;
	return "just now";
}

export const iso = (d: Date) =>
	Number.isFinite(d.getTime()) ? d.toISOString().slice(0, 10) : "unknown";
