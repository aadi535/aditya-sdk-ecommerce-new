CREATE TABLE IF NOT EXISTS "User" (
 id SERIAL PRIMARY KEY, email TEXT UNIQUE NOT NULL, password TEXT NOT NULL, name TEXT,
 role TEXT NOT NULL DEFAULT 'customer', "createdAt" TIMESTAMP(3) NOT NULL DEFAULT NOW(), "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS "Product" (
 id SERIAL PRIMARY KEY, name TEXT NOT NULL, description TEXT, price DECIMAL(10,2) NOT NULL,
 stock INTEGER NOT NULL DEFAULT 0, "imageUrl" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT NOW(), "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS order_statuses (id SERIAL PRIMARY KEY, name TEXT UNIQUE NOT NULL);
INSERT INTO order_statuses(id,name) VALUES (1,'Pending'),(2,'Confirmed'),(3,'Payment Pending'),(4,'Payment Received'),(5,'Delivered'),(6,'Canceled') ON CONFLICT DO NOTHING;
SELECT setval(pg_get_serial_sequence('order_statuses','id'),GREATEST((SELECT MAX(id) FROM order_statuses),1));
CREATE TABLE IF NOT EXISTS orders (
 id SERIAL PRIMARY KEY, "userId" INTEGER NOT NULL REFERENCES "User"(id), "statusId" INTEGER NOT NULL REFERENCES order_statuses(id),
 "totalAmount" DECIMAL(10,2) NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT NOW(), "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS order_items (
 order_id INTEGER NOT NULL REFERENCES orders(id), product_id INTEGER NOT NULL,
 name TEXT NOT NULL, quantity INTEGER NOT NULL, price DECIMAL(10,2) NOT NULL
);
CREATE TABLE IF NOT EXISTS sessions (
 token_hash TEXT PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES "User"(id) ON DELETE CASCADE, expires_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX IF NOT EXISTS sessions_expiry ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS orders_user ON orders("userId");
INSERT INTO "Product"(id,name,description,price,stock,"imageUrl","updatedAt") VALUES
 (1,'APEX Smartphone','Sample smartphone for this educational storefront.',1200,100,'/images/iphone.jpg',NOW()),
 (2,'Galaxy Smartphone','Sample premium smartphone.',1100,100,'/images/samsung.jpg',NOW()),
 (3,'Ultralight Laptop','Sample laptop for work and study.',1500,100,'/images/macbook.jpg',NOW()),
 (4,'Wireless Headphones','Sample over-ear wireless headphones.',400,100,'/images/sony.jpg',NOW()),
 (5,'Smart Watch','Sample smartwatch.',900,100,'/images/watch.jpg',NOW()),
 (6,'Pro Tablet','Sample tablet.',1000,100,'/images/ipad.jpg',NOW()),
 (7,'Camera Drone','Sample compact camera drone.',800,100,'/images/drone.jpg',NOW()),
 (8,'Game Console','Sample home gaming console.',600,100,'/images/ps5.jpg',NOW()),
 (9,'Gaming Laptop','Sample gaming laptop.',1800,100,'/images/asus.jpg',NOW())
ON CONFLICT(id) DO NOTHING;
SELECT setval(pg_get_serial_sequence('"Product"','id'),GREATEST((SELECT MAX(id) FROM "Product"),1));
