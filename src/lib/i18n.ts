export type Locale = "en" | "it";
export const localeFrom = (url: URL): Locale => /^\/it(?:\/|$)/.test(url.pathname) ? "it" : "en";
export const localizedPath = (path: string, locale: Locale) => locale === "it" ? `/it${path === "/" ? "/" : path}` : path;
export function i18n(url: URL) {
    const locale = localeFrom(url);
    return {
        locale,
        t: (en: string, it: string) => locale === "it" ? it : en,
        href: (path: string) => localizedPath(path, locale),
    };
}
