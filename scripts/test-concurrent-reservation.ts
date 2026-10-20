import "dotenv/config";
import { Pool } from "pg";

const connectionString = process.env.TEST_DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "Set TEST_DATABASE_URL to the shop_test database on port 5433.",
  );
}

const parsedUrl = new URL(connectionString);

if (!parsedUrl.pathname.endsWith("/shop_test")) {
  throw new Error(
    "Safety check failed: TEST_DATABASE_URL must target shop_test.",
  );
}

const pool = new Pool({
  connectionString,
  max: 4,
});

async function main() {
  const client = await pool.connect();

  let productId: number | undefined;
  let categoryId: number | undefined;

  try {
    await client.query("BEGIN");

    const category = await client.query(
      `INSERT INTO "Category" ("id", "code", "name")
       VALUES (999, 'lab08test', 'Lab 08 test')
       ON CONFLICT ("id") DO UPDATE SET "name" = EXCLUDED."name"
       RETURNING "id"`,
    );

    categoryId = category.rows[0].id;

    const product = await client.query(
      `INSERT INTO "Product"
         ("id", "code", "name", "description", "image", "price",
          "amount", "date", "nameSortKey", "categoryId")
       VALUES
         (2147483000, 'LAB08TEST01', 'Reservation test',
          'Temporary concurrency test product', '/test.png', 100,
          1, NOW(), 'reservation-test', $1)
       ON CONFLICT ("id") DO UPDATE
       SET "amount" = 1, "categoryId" = EXCLUDED."categoryId"
       RETURNING "id"`,
      [categoryId],
    );

    productId = product.rows[0].id;

    await client.query("COMMIT");
  } finally {
    client.release();
  }

  if (productId === undefined) {
    throw new Error("Could not prepare the test product.");
  }

  try {
    const reserve = async () => {
      const result = await pool.query(
        `UPDATE "Product"
         SET "amount" = "amount" - 1
         WHERE "id" = $1 AND "amount" >= 1
         RETURNING "amount"`,
        [productId],
      );

      return result.rowCount === 1;
    };

    const results = await Promise.all([reserve(), reserve()]);
    const successes = results.filter(Boolean).length;

    const final = await pool.query(
      `SELECT "amount" FROM "Product" WHERE "id" = $1`,
      [productId],
    );

    console.log("Reservation results:", results);
    console.log("Successful reservations:", successes);
    console.log("Remaining amount:", final.rows[0].amount);

    if (successes !== 1 || final.rows[0].amount !== 0) {
      throw new Error("Concurrency test failed.");
    }

    console.log("PASS: exactly one reservation succeeded.");
  } finally {
    const cleanup = await pool.connect();

    try {
      await cleanup.query("BEGIN");
      await cleanup.query(`DELETE FROM "Product" WHERE "id" = $1`, [productId]);

      if (categoryId !== undefined) {
        await cleanup.query(`DELETE FROM "Category" WHERE "id" = $1`, [
          categoryId,
        ]);
      }

      await cleanup.query("COMMIT");
    } catch (error) {
      await cleanup.query("ROLLBACK");
      throw error;
    } finally {
      cleanup.release();
    }
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
