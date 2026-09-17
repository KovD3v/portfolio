import now from "../data/now.json";
import { built } from "./build";
import { localizedPath, type Locale } from "./i18n";

export async function nowItems(locale: Locale = "en") {
    const it = locale === "it";
    const time = new Intl.DateTimeFormat(it ? "it-IT" : "en-GB", { hour: "2-digit", minute: "2-digit", timeZone: now.location.tz }).format(built);
    return [
        { label: it ? "da leggere" : "to read", value: now.reading.title, note: it ? "Non ancora iniziato" : now.reading.note, progress: now.reading.progress },
        ...now.building.map(project => ({ label: it ? "sto costruendo" : "building", value: project.title, href: localizedPath(project.href, locale) })),
        { label: it ? "ora locale" : "local time", value: `${time}, ${it ? "Roma" : now.location.city}`, live: true, clock: now.location.tz, city: it ? "Roma" : now.location.city },
    ];
}
export const nowUpdated = new Date(now.updated);
