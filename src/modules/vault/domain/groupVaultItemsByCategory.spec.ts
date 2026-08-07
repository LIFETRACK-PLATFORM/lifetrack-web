import { describe, expect, it } from "vitest";
import { groupVaultItemsByCategory } from "./groupVaultItemsByCategory";
import { normalizeVaultCategory } from "./vaultCategories";

describe("groupVaultItemsByCategory", () => {
  it("agrupa items por categoría en orden predefinido", () => {
    const items = [
      { id: "1", site: "netflix.com", category: "Streaming" },
      { id: "2", site: "github.com", category: "Trabajo" },
      { id: "3", site: "gmail.com", category: "Personal" },
      { id: "4", site: "spotify.com", category: "Streaming" },
    ];

    const groups = groupVaultItemsByCategory(items);

    expect(groups.map((group) => group.category)).toEqual([
      "Personal",
      "Trabajo",
      "Streaming",
    ]);
    expect(groups[2]?.items).toHaveLength(2);
  });

  it("normaliza categorías desconocidas a Personal", () => {
    const groups = groupVaultItemsByCategory([
      { site: "foo.com", category: "Desconocida" },
    ]);

    expect(groups[0]?.category).toBe(normalizeVaultCategory("Desconocida"));
  });
});
