import { getCollection, type CollectionEntry } from "astro:content";

export type Note = CollectionEntry<"notes">;

export function readingTime(body = "") {
	const words = body
		.replace(/```[\s\S]*?```/g, "")
		.replace(/^---[\s\S]*?---/, "")
		.replace(/[#>*_`[\]()|]/g, " ")
		.split(/\s+/)
		.filter(Boolean).length;
	return Math.max(1, Math.round(words / 220));
}

export function fmtDate(
	d: Date | undefined,
	year = d ? d.getFullYear() !== new Date().getFullYear() : false,
) {
	if (!d || !Number.isFinite(d.getTime())) return "";
	return d.toLocaleDateString("en-US", {
		month: "short",
		day: "2-digit",
		...(year && { year: "numeric" }),
	});
}

export async function getNotes() {
	const all = await getCollection("notes", (n) =>
		import.meta.env.PROD ? !n.data.draft : true,
	);
	return all.sort((a, b) => (b.data.date?.valueOf() ?? 0) - (a.data.date?.valueOf() ?? 0));
}

export const noteMeta = (n: Note) =>
	`${readingTime(n.body)} min${n.data.date ? ` · ${fmtDate(n.data.date)}` : ""}`;

export type Project = CollectionEntry<"projects">;
export type Lab = CollectionEntry<"lab">;

export const fmtMonth = (d: Date | undefined) =>
	d && Number.isFinite(d.getTime())
		? d.toLocaleDateString("en-US", { month: "short", year: "numeric" })
		: "";

export async function getProjects(locale = "en") {
	const all = await getCollection("projects", (project) => !project.data.draft && (locale === "it" ? project.id.startsWith("it/") : !project.id.startsWith("it/")));
	return all.sort(
		(a, b) =>
			(a.data.order ?? 1e9) - (b.data.order ?? 1e9) ||
			b.data.year - a.data.year ||
			a.data.title.localeCompare(b.data.title),
	);
}

export async function getLab() {
	const all = await getCollection("lab");
	return all.sort(
		(a, b) => (b.data.touched?.valueOf() ?? 0) - (a.data.touched?.valueOf() ?? 0),
	);
}

export const host = (u: string) => {
	try {
		const x = new URL(u);
		return x.host + x.pathname.replace(/\/$/, "");
	} catch {
		return u;
	}
};
