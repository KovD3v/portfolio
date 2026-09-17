import type { APIRoute, GetStaticPaths } from "astro";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { readFile } from "node:fs/promises";
import {
	getNotes,
	getProjects,
	getLab,
	fmtDate,
	fmtMonth,
	readingTime,
} from "../../lib/content";
import { lorenz } from "../../scripts/field/scenes";
import { commit } from "../../lib/build";
import { site } from "../../data/site";

const SITE = new URL(import.meta.env.SITE).host;
const C = {
	bg: "#F4F1EC",
	fg: "#1A1816",
	fg2: "#6B665E",
	fg3: "#A8A297",
	line: "#DDD8CF",
	accent: "#FF4F00",
};

export const getStaticPaths: GetStaticPaths = async () => {
	const [notes, projects, lab] = await Promise.all([
		getNotes(),
		getProjects(),
		getLab(),
	]);
	const p = (path: string, title: string, kind: string, meta: string) => ({
		params: { path },
		props: { title, kind, meta },
	});
	const english = [
		p("home", site.name, "computer engineering", "projects · notes · lab"),
		p("about", "Profile", "Tommaso Coviello", "education · experience · projects"),
		p("notes", "Notes", "index", `${notes.length} notes`),
		p("projects", "Projects", "index", `${projects.length} projects`),
		p("lab/ascii", "ASCII lab", "lab", "interactive studies"),
		p("lab/texture", "Texture lab", "lab", "grain · fibers · folds"),
		p("lab", "Lab", "index", `${lab.length + 2} experiments`),
		p("now", "Now", "page", "reading · building · local time"),
		p("uses", "Uses", "page", "hardware · software · site"),
		p("changelog", "Changelog", "page", "one line per change"),
		p("404", "Not found", "page", ""),
		...notes.map((n) =>
			p(
				`notes/${n.id}`,
				n.data.title,
				"note",
				`${readingTime(n.body)} min · ${fmtDate(n.data.date, true)} · ${n.data.status}`,
			),
		),
		...projects.map((x) =>
			p(
				`projects/${x.id}`,
				x.data.title,
				"project",
				`${x.data.stack.join(", ")} · ${x.data.year}`,
			),
		),
		...lab.map((e) =>
			p(
				`lab/${e.id}`,
				e.data.title,
				"lab",
				`${e.data.status} · ${fmtMonth(e.data.touched)}`,
			),
		),
    ];
    const italianProjects = await getProjects("it");
    const italian = [
        p("it/home", site.name, "ingegneria informatica", "progetti · appunti · lab"),
        p("it/about", "Profilo", "Tommaso Coviello", "formazione · esperienze · progetti"),
        p("it/notes", "Appunti", "indice", "articoli in inglese"),
        p("it/projects", "Progetti", "indice", `${italianProjects.length} progetti`),
        p("it/lab", "Lab", "indice", "esperimenti interattivi"),
        p("it/lab/ascii", "ASCII lab", "lab", "studi interattivi"),
        p("it/lab/texture", "Texture lab", "lab", "grana · fibre · pieghe"),
        p("it/lab/field", "Field", "lab", "sei scene in caratteri"),
        p("it/now", "Ora", "pagina", "letture · progetti · ora locale"),
        p("it/uses", "Strumenti", "pagina", "hardware · software · sito"),
        p("it/changelog", "Aggiornamenti", "pagina", "in attesa della prima pubblicazione"),
        p("it/404", "Pagina non trovata", "pagina", ""),
        ...italianProjects.map(project => p(`it/projects/${project.id.replace(/^it\//, "")}`, project.data.title, "progetto", `${project.data.stack.join(", ")} · ${project.data.year}`)),
    ];
    return [...english, ...italian];
};

function frame(seed: number, cols = 46, rows = 15) {
	const g = Array.from({ length: rows }, () => Array<string>(cols).fill(" "));
	lorenz(seed)(
		{
			t: 0,
			cols,
			rows,
			aspect: 2,
			fx: cols / 2,
			fy: rows / 2,
			fr: rows * 0.46,
			pointer: null,
			theme: "light",
		},
		(x, y, ch) => {
			x = Math.round(x);
			y = Math.round(y);
			if (g[y]?.[x] !== undefined) g[y][x] = ch;
		},
	);
	return g.map((r) => r.join("")).join("\n");
}

const h = (
	type: string,
	style: Record<string, unknown>,
	children?: unknown,
) => ({ type, props: { style, children } });
let fonts: { name: string; data: ArrayBuffer; weight: 400 | 500 }[] | null =
	null;

export const GET: APIRoute = async ({ props }) => {
	fonts ??= [
		{
			name: "sans",
			weight: 500,
			data: (
				await readFile(
					"node_modules/@fontsource/ibm-plex-sans/files/ibm-plex-sans-latin-500-normal.woff",
				)
			).buffer,
		},
		{
			name: "mono",
			weight: 400,
			data: (
				await readFile(
					"node_modules/@fontsource/jetbrains-mono/files/jetbrains-mono-latin-400-normal.woff",
				)
			).buffer,
		},
	];
	const { title, kind, meta } = props as {
		title: string;
		kind: string;
		meta: string;
	};
	const mono = { fontFamily: "mono", fontSize: 22, color: C.fg2 };

	const tree = h(
		"div",
		{
			width: 1200,
			height: 630,
			display: "flex",
			flexDirection: "column",
			background: C.bg,
			color: C.fg,
			padding: "0 72px 56px",
			position: "relative",
		},
		[
			h("div", {
				position: "absolute",
				top: 0,
				left: 0,
				width: 1200,
				height: 4,
				background: C.accent,
			}),
			h(
				"div",
				{
					position: "absolute",
					top: 56,
					right: 72,
					fontFamily: "mono",
					fontSize: 20,
					lineHeight: 1.15,
					whiteSpace: "pre",
					color: C.fg,
					opacity: 0.16,
				},
				frame(parseInt(commit, 16) || 0),
			),
			h(
				"div",
				{
					display: "flex",
					flex: 1,
					alignItems: "flex-end",
					paddingBottom: 40,
				},
				h(
					"div",
					{
						fontFamily: "sans",
						fontWeight: 500,
						fontSize: title.length > 40 ? 52 : 64,
						lineHeight: 1.15,
						letterSpacing: -1,
						maxWidth: 900,
					},
					title,
				),
			),
			h(
				"div",
				{
					display: "flex",
					flexDirection: "column",
					borderTop: `1px solid ${C.line}`,
				},
				[
					h(
						"div",
						{
							display: "flex",
							gap: 48,
							padding: "14px 0",
							borderBottom: `1px solid ${C.line}`,
						},
						[
							h("div", { ...mono, width: 160 }, kind),
							h("div", { ...mono, color: C.fg }, meta),
						],
					),
					h(
						"div",
						{
							display: "flex",
							gap: 48,
							padding: "14px 0",
							borderBottom: `1px solid ${C.line}`,
						},
						[
							h("div", { ...mono, width: 160 }, "site"),
							h("div", { ...mono, color: C.fg }, SITE),
						],
					),
				],
			),
		],
	);

	const svg = await satori(tree as any, { width: 1200, height: 630, fonts });
	const png = new Resvg(svg, { fitTo: { mode: "width", value: 1200 } })
		.render()
		.asPng();
	return new Response(Uint8Array.from(png), {
		headers: { "content-type": "image/png" },
	});
};
