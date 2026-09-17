import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { render } from "astro:content";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { loadRenderers } from "astro:container";
import { getContainerRenderer as mdxRenderer } from "@astrojs/mdx/container-renderer";
import { getNotes, getProjects } from "../lib/content";
import { site } from "../data/site";

export async function GET(ctx: APIContext) {
	if (!ctx.site) throw new Error("Astro site URL is required to build RSS");
	const container = await AstroContainer.create({
		renderers: await loadRenderers([mdxRenderer()]),
	});
	const siteUrl = ctx.site.toString();
	const clean = (html: string) =>
		html
			.replace(/<button[\s\S]*?<\/button>/g, "")
			.replace(/(src|href)="\//g, `$1="${siteUrl}`);

	const notes = await Promise.all(
		(await getNotes()).map(async (n) => {
			const { Content } = await render(n);
			return {
				title: n.data.title,
				description: n.data.summary,
				pubDate: n.data.date,
				link: `/notes/${n.id}/`,
				content: clean(await container.renderToString(Content)),
				categories: n.data.tags,
			};
		}),
	);
	const projects = (await getProjects()).map((p) => ({
		title: p.data.title,
		description: p.data.summary,

		link: `/projects/${p.id}/`,
		categories: ["project"],
	}));

	return rss({
		title: `${site.name} — notes`,
		description: "Projects and notes on what I build and learn.",
		site: ctx.site!,
		items: [...notes, ...projects],
		customData: "<language>en</language>",
	});
}
