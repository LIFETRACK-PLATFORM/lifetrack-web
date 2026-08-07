import { describe, expect, it } from "vitest";
import {
  extractDomain,
  groupVaultItemsByDomain,
  normalizeSiteForCopy,
} from "./extractDomain";

describe("extractDomain", () => {
  it("normaliza dominios con y sin protocolo", () => {
    expect(extractDomain("github.com")).toBe("github.com");
    expect(extractDomain("https://github.com/login")).toBe("github.com");
    expect(extractDomain("www.google.com")).toBe("google.com");
  });

  it("normaliza sitio para copiar con https", () => {
    expect(normalizeSiteForCopy("github.com")).toBe("https://github.com");
    expect(normalizeSiteForCopy("https://github.com")).toBe(
      "https://github.com",
    );
  });

  it("agrupa items por dominio", () => {
    const grouped = groupVaultItemsByDomain([
      { site: "github.com", id: "1" },
      { site: "https://github.com/org", id: "2" },
      { site: "google.com", id: "3" },
    ]);

    expect(grouped).toHaveLength(2);
    expect(grouped[0]?.domain).toBe("github.com");
    expect(grouped[0]?.items).toHaveLength(2);
    expect(grouped[1]?.domain).toBe("google.com");
  });
});
