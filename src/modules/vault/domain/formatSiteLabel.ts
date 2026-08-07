export function formatSiteLabel(site: string): string {
  const trimmed = site.trim();
  if (!trimmed) return trimmed;

  let decoded = trimmed;
  try {
    decoded = decodeURIComponent(trimmed);
  } catch {
    decoded = trimmed;
  }

  try {
    const url = decoded.includes("://") ? decoded : `https://${decoded}`;
    const parsed = new URL(url);
    const hostname = parsed.hostname.replace(/^www\./, "");
    const path = parsed.pathname === "/" ? "" : parsed.pathname;
    return `${hostname}${path}` || decoded;
  } catch {
    return decoded.replace(/^https?:\/\//, "").replace(/^www\./, "");
  }
}

export function getSiteHref(site: string): string | null {
  const trimmed = site.trim();
  if (!trimmed) return null;

  try {
    const decoded = decodeURIComponent(trimmed);
    if (decoded.includes("://")) return decoded;
    return `https://${decoded}`;
  } catch {
    return trimmed.includes("://") ? trimmed : `https://${trimmed}`;
  }
}
