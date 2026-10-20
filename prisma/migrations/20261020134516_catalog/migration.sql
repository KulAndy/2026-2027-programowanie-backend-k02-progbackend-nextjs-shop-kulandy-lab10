-- CreateTable
CREATE TABLE "Category" (
    "id" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "date" TIMESTAMPTZ(3) NOT NULL,
    "nameSortKey" TEXT NOT NULL,
    "categoryId" INTEGER NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_code_key" ON "Category"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Product_code_key" ON "Product"("code");

-- CreateIndex
CREATE INDEX "Product_categoryId_idx" ON "Product"("categoryId");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


-- Collation for byte-wise UTF-8 comparison (matches Buffer.compare from Lab 06)
ALTER TABLE "Product"
ALTER COLUMN "nameSortKey" TYPE TEXT COLLATE "C";

-- CHECK constraints
ALTER TABLE "Product"
ADD CONSTRAINT "product_price_nonnegative"
CHECK ("price" >= 0);

ALTER TABLE "Product"
ADD CONSTRAINT "product_amount_nonnegative"
CHECK ("amount" >= 0);

ALTER TABLE "Product"
ADD CONSTRAINT "product_id_positive"
CHECK ("id" > 0);