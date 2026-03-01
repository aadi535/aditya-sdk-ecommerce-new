import os
import asyncpg
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

async def get_db_connection():
    return await asyncpg.connect(
        user=os.getenv("DB_USER", "user"),
        password=os.getenv("DB_PASSWORD", "password"),
        database=os.getenv("DB_NAME", "ecommerce_db"),
        host=os.getenv("DB_HOST", "database"),
        port=os.getenv("DB_PORT", "5432")
    )

@app.get("/users")
async def get_users():
    conn = await get_db_connection()
    try:
        rows = await conn.fetch('SELECT * FROM "User"')
        return [dict(row) for row in rows]
    finally:
        await conn.close()
