import { describe, expect, it } from "vitest";
import { parseCatalogParams, parseProductId } from "./catalog-params";

describe("parseCatalogParams", () => {
  it("poprawna kombinacja", () => {
    const c = parseCatalogParams({
      type: "gpu",
      stock: "available",
      sort: "newest",
    });
    expect(c.type).toBe("gpu");
    expect(c.stock).toBe("available");
    expect(c.sort).toBe("date");
    expect(c.skipped).toEqual([]);
  });

  it("brak parametrów → domyślne", () => {
    const c = parseCatalogParams({});
    expect(c.type).toBe("all");
    expect(c.stock).toBe("all");
    expect(c.sort).toBe("name");
    expect(c.skipped).toEqual([]);
  });

  it("nieznana wartość → domyślna + komunikat", () => {
    const c = parseCatalogParams({ type: "server" });
    expect(c.type).toBe("all");
    expect(c.skipped).toContain("type");
  });

  it("pusty tekst → pominięty", () => {
    const c = parseCatalogParams({ stock: "" });
    expect(c.stock).toBe("all");
    expect(c.skipped).toContain("stock");
  });

  it("powtórzony klucz → pominięty, pozostałe zachowane", () => {
    const c = parseCatalogParams({ type: ["gpu", "cpu"], sort: "newest" });
    expect(c.type).toBe("all");
    expect(c.sort).toBe("date");
    expect(c.skipped).toContain("type");
  });

  it("nieznane nazwy ignorowane", () => {
    const c = parseCatalogParams({ foo: "bar" });
    expect(c.skipped).toEqual([]);
  });

  it("nie mutuje danych wejściowych", () => {
    const input = Object.freeze({ type: "gpu" });
    expect(() => parseCatalogParams(input)).not.toThrow();
  });
});

describe("parseProductId", () => {
  it.each(["abc", "12abc", "0", "-1", "01", "2147483648", "1.5", ""])(
    "odrzuca %s",
    (raw) => {
      expect(parseProductId(raw)).toBeNull();
    },
  );

  it("akceptuje 1 i 2147483647", () => {
    expect(parseProductId("1")).toBe(1);
    expect(parseProductId("2147483647")).toBe(2147483647);
  });
});
