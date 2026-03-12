 
ALTER TABLE "Order" DROP CONSTRAINT "Order_statusId_fkey";


DROP TABLE "Order";


DROP TABLE "OrderStatus";


CREATE TABLE "order_statuses" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "order_statuses_pkey" PRIMARY KEY ("id")
);


CREATE TABLE "orders" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "statusId" INTEGER NOT NULL,
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);


CREATE UNIQUE INDEX "order_statuses_name_key" ON "order_statuses"("name");


ALTER TABLE "orders" ADD CONSTRAINT "orders_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "order_statuses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
