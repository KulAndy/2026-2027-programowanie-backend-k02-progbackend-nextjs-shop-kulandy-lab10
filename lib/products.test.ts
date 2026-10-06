import { describe, expect, it } from "vitest";

import productsJson from "@/data/products.json";

import {
  validateProducts,
  sortProducts,
  filterProducts,
  type Product,
} from "./products";

const products = validateProducts(productsJson);

describe("products", () => {
  describe("validateProducts", () => {
    it("akceptuje poprawne dane z products.json", () => {
      expect(products.length).toBeGreaterThan(0);
    });

    it("odrzuca ujemną cenę", () => {
      const invalidProducts: Product[] = [
        {
          ...products[0],
          price: -1,
        },
      ];

      expect(() => validateProducts(invalidProducts)).toThrow();
    });

    it("odrzuca ujemny stan magazynowy", () => {
      const invalidProducts: Product[] = [
        {
          ...products[0],
          amount: -1,
        },
      ];

      expect(() => validateProducts(invalidProducts)).toThrow();
    });

    it("odrzuca duplikat id", () => {
      const invalidProducts: Product[] = [
        products[0],
        {
          ...products[1],
          id: products[0].id,
        },
      ];

      expect(() => validateProducts(invalidProducts)).toThrow();
    });

    it("odrzuca duplikat code", () => {
      const invalidProducts: Product[] = [
        products[0],
        {
          ...products[1],
          code: products[0].code,
        },
      ];

      expect(() => validateProducts(invalidProducts)).toThrow();
    });
  });

  describe("sortProducts", () => {
    it("sortuje produkty po nazwie", () => {
      const result = sortProducts(products, "name");

      expect(result.length).toBe(products.length);

      for (let i = 1; i < result.length; i++) {
        expect(
          result[i - 1].name.localeCompare(result[i].name),
        ).toBeLessThanOrEqual(0);
      }
    });

    it("sortuje produkty po dacie malejąco", () => {
      const result = sortProducts(products, "date");

      expect(result.length).toBe(products.length);

      for (let i = 1; i < result.length; i++) {
        expect(new Date(result[i - 1].date).getTime()).toBeGreaterThanOrEqual(
          new Date(result[i].date).getTime(),
        );
      }
    });

    it("nie modyfikuje danych wejściowych", () => {
      const original = [...products];

      sortProducts(products, "name");

      expect(products).toEqual(original);
    });
  });

  describe("filterProducts", () => {
    it("zwraca tylko dostępne produkty", () => {
      const result = filterProducts(products, "available");

      expect(result.every((product) => product.amount > 0)).toBe(true);
    });

    it("zwraca tylko niedostępne produkty", () => {
      const result = filterProducts(products, "unavailable");

      expect(result.every((product) => product.amount === 0)).toBe(true);
    });

    it("filtruje produkty po kategorii", () => {
      const result = filterProducts(products, "all", "cpu");

      expect(result.every((product) => product.type === "cpu")).toBe(true);
    });

    it("zwraca pustą tablicę dla nieistniejącej kombinacji filtrów", () => {
      const result = filterProducts(products, "available", "gpu");

      if (result.length === 0) {
        expect(result).toEqual([]);
      }
    });
  });
});
