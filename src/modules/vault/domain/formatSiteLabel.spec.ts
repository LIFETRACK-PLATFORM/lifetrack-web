import { describe, expect, it } from "vitest";
import { formatSiteLabel } from "./formatSiteLabel";

describe("formatSiteLabel", () => {
  it("decodifica caracteres escapados en la URL", () => {
    expect(formatSiteLabel("https://Xuper%20TV")).toBe("Xuper TV");
    expect(formatSiteLabel("Xuper%20TV")).toBe("Xuper TV");
  });

  it("normaliza hostnames sin protocolo", () => {
    expect(formatSiteLabel("github.com")).toBe("github.com");
    expect(formatSiteLabel("www.google.com")).toBe("google.com");
  });
});
