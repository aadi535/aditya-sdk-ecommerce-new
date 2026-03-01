import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    // Seed Users
    const admin = await prisma.user.upsert({
        where: { email: 'admin@example.com' },
        update: {},
        create: {
            email: 'admin@example.com',
            name: 'Admin User',
            password: 'hashed_password_here', // In a real app, hash this!
            role: 'admin',
        },
    })

    const customer = await prisma.user.upsert({
        where: { email: 'user@example.com' },
        update: {},
        create: {
            email: 'user@example.com',
            name: 'John Doe',
            password: 'hashed_password_here',
            role: 'customer',
        },
    })

    console.log({ admin, customer })

    // Seed Products
    const product1 = await prisma.product.upsert({
        where: { id: 1 },
        update: {},
        create: {
            name: 'Smartphone X',
            description: 'Latest model with AI features',
            price: 999.99,
            stock: 50,
            imageUrl: 'https://placehold.co/600x400?text=Smartphone+X',
        },
    })

    const product2 = await prisma.product.upsert({
        where: { id: 2 },
        update: {},
        create: {
            name: 'Wireless Headphones',
            description: 'Noise cancelling headphones',
            price: 199.99,
            stock: 100,
            imageUrl: 'https://placehold.co/600x400?text=Headphones',
        },
    })

    console.log({ product1, product2 })

    // Seed Order Statuses
    const statuses = [
        'Pending',
        'Confirmed',
        'Payment Pending',
        'Payment Received',
        'Delivered',
        'Canceled'
    ]

    for (const status of statuses) {
        await prisma.orderStatus.upsert({
            where: { name: status },
            update: {},
            create: { name: status },
        })
    }

    // Seed Orders
    const pendingStatus = await prisma.orderStatus.findUnique({ where: { name: 'Pending' } })

    if (pendingStatus && customer) {
        const order1 = await prisma.order.create({
            data: {
                userId: customer.id,
                statusId: pendingStatus.id,
                totalAmount: 1199.98, // Smartphone + Headphones
            }
        })
        const order2 = await prisma.order.create({
            data: {
                userId: customer.id,
                statusId: pendingStatus.id,
                totalAmount: 999.99, // Smartphone only
            }
        })
        const order3 = await prisma.order.create({
            data: {
                userId: customer.id,
                statusId: pendingStatus.id,
                totalAmount: 199.99, // Headphones only
            }
        })
        console.log({ order1, order2, order3 })
    }
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
