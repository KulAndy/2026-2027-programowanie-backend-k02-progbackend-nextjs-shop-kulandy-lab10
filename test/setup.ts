import "dotenv/config";

const testUrl = process.env.TEST_DATABASE_URL;

if (!testUrl) {
  throw new Error("Set TEST_DATABASE_URL (shop_test on 5433).");
}
if (!new URL(testUrl).pathname.endsWith("/shop_test")) {
  throw new Error(
    "Safety check failed: TEST_DATABASE_URL must target shop_test.",
  );
}

process.env.DATABASE_URL = testUrl;
