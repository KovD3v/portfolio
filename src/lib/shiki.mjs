export const plate = {
	name: "plate",
	type: /** @type {"light"} */ ("light"),
	colors: { "editor.foreground": "#000001", "editor.background": "#000004" },
	settings: [],
	tokenColors: [
		{
			scope: ["comment", "punctuation.definition.comment"],
			settings: { foreground: "#000003" },
		},
		{
			scope: [
				"string",
				"constant.numeric",
				"constant.language",
				"constant.character",
				"constant.other",
			],
			settings: { foreground: "#000002" },
		},
		{
			scope: ["keyword", "storage", "keyword.operator"],
			settings: { foreground: "#000001" },
		},
	],
};

const vars = {
	"#000001": "var(--fg)",
	"#000002": "var(--fg-2)",
	"#000003": "var(--fg-3)",
	"#000004": "var(--bg-2)",
};
const el = (tagName, properties = {}, children = []) => ({
	type: "element",
	tagName,
	properties,
	children,
});
const text = (value) => ({ type: "text", value });

export const plateTransformer = {
	name: "plate",
	span(node) {
		if (node.properties.style)
			node.properties.style = String(node.properties.style).replace(
				/#00000[1-4]/gi,
				(m) => vars[m.toLowerCase()],
			);
	},
	pre(node) {
		delete node.properties.style;
	},
	root(node) {
		const pre = node.children.find(
			(c) => c.type === "element" && c.tagName === "pre",
		);
		if (!pre) return;
		const title = /title="([^"]*)"/.exec(
			this.options.meta?.__raw ?? "",
		)?.[1];
		node.children = [
			el("figure", { className: ["code"] }, [
				...(title ? [el("figcaption", {}, [text(title)])] : []),
				el("div", { className: ["code-body"] }, [
					pre,
					el(
						"button",
						{
							type: "button",
							className: ["copy"],
							"aria-label": "Copy code",
						},
						[text("copy")],
					),
				]),
			]),
		];
	},
};
