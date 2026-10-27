
CREATE TEMP TABLE product_index_lab (
    id            INTEGER PRIMARY KEY,
    category_id   INTEGER NOT NULL,
    amount        INTEGER NOT NULL,
    name_sort_key TEXT COLLATE "C" NOT NULL,
    price         INTEGER NOT NULL
);

INSERT INTO product_index_lab (
    id,
    category_id,
    amount,
    name_sort_key,
    price
)
SELECT
    n,
    (n % 4) + 1,
    CASE WHEN n % 5 = 0 THEN 0 ELSE n % 20 + 1 END,
    'product-' || lpad(n::text, 8, '0'),
    (n % 100000) + 100
FROM generate_series(1, 100000) AS n;

ANALYZE product_index_lab;

-- Pomiar przed indeksem.
EXPLAIN (ANALYZE, BUFFERS)
SELECT id, name_sort_key, price
FROM product_index_lab
WHERE category_id = 2
  AND amount > 0
ORDER BY name_sort_key ASC, id ASC
LIMIT 100;

-- Indeks częściowy dla dostępnych produktów.
CREATE INDEX product_index_lab_available_sort_idx
ON product_index_lab (category_id, name_sort_key, id)
INCLUDE (price)
WHERE amount > 0;

ANALYZE product_index_lab;

-- Pomiar po indeksie.
EXPLAIN (ANALYZE, BUFFERS)
SELECT id, name_sort_key, price
FROM product_index_lab
WHERE category_id = 2
  AND amount > 0
ORDER BY name_sort_key ASC, id ASC
LIMIT 100;
