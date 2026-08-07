const DOMAIN_LIKE = /^[a-z0-9][a-z0-9.-]*\.[a-z]{2,}(?:[/?#].*)?$/i;

function safeDecode(value: string): string {
  let result = value;
  for (let i = 0; i < 3; i++) {
    let next: string;
    try {
      next = decodeURIComponent(result);
    } catch {
      break;
    }
    if (next === result) break;
    result = next;
  }
  return result;
}

function looksLikeUrlOrDomain(value: string): boolean {
  return value.includes("://") || DOMAIN_LIKE.test(value);
}

export function formatSiteLabel(site: string): string {
  const trimmed = site.trim();
  if (!trimmed) return trimmed;

  const decoded = safeDecode(trimmed);
  if (!looksLikeUrlOrDomain(decoded)) return decoded;

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

  const decoded = safeDecode(trimmed);
  if (!looksLikeUrlOrDomain(decoded)) return null;

  return decoded.includes("://") ? decoded : `https://${decoded}`;
}
