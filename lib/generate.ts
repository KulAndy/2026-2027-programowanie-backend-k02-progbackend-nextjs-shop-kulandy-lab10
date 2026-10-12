import { faker } from "@faker-js/faker";

faker.seed(42);

const types = ["cpu", "gpu", "ram", "disk"] as const;
const names = {
  cpu: ["Ryzen 5", "Ryzen 7", "Core i5", "Core i7"],
  gpu: ["GeForce RTX", "Radeon RX", "Arc A"],
  ram: ["DDR4 3200", "DDR5 5600", "DDR5 6000"],
  disk: ["SSD NVMe", "SSD SATA", "HDD"],
};
const sizes = {
  cpu: ["6 rdzeni", "8 rdzeni", "12 rdzeni"],
  gpu: ["8 GB", "12 GB", "16 GB"],
  ram: ["8 GB", "16 GB", "32 GB"],
  disk: ["500 GB", "1 TB", "2 TB"],
};

const products = [];
for (let id = 1; id <= 100; id++) {
  const type = types[id % 4];
  const name =
    faker.helpers.arrayElement(names[type]) +
    " " +
    faker.helpers.arrayElement(sizes[type]);

  products.push({
    id,
    code: faker.string.alphanumeric(10).toUpperCase(),
    name,
    type,
    price: faker.number.int({ min: 19900, max: 799900 }),
    amount: faker.number.int({ min: 0, max: 50 }),
    description: `${name} do zastosowań ${faker.helpers.arrayElement([
      "domowych",
      "biurowych",
      "gamingowych",
    ])}.`,
    date: faker.date
      .between({ from: "2026-01-01T00:00:00Z", to: "2026-10-01T00:00:00Z" })
      .toISOString(),
    image: `/images/products/${type}.webp`,
  });
}

console.log(JSON.stringify(products, null, 2));
