import os
import asyncpg
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from passlib.context import CryptContext


app = FastAPI()

 
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")


 
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

 

class RegisterRequest(BaseModel):
    email: str
    password: str
    name: str | None = None


class LoginRequest(BaseModel):
    email: str
    password: str

 

async def get_db_connection():
    return await asyncpg.connect(
        user=os.getenv("DB_USER", "user"),
        password=os.getenv("DB_PASSWORD", "password"),
        database=os.getenv("DB_NAME", "ecommerce_db"),
        host=os.getenv("DB_HOST", "database"),
        port=os.getenv("DB_PORT", "5432"),
    )

 

@app.get("/users")
async def get_users():
    conn = await get_db_connection()
    try:
        rows = await conn.fetch('SELECT * FROM "User"')
        return [dict(row) for row in rows]
    finally:
        await conn.close()

 

@app.post("/register")
async def register_user(user: RegisterRequest):
    conn = await get_db_connection()
    try:
         
        existing_user = await conn.fetchrow(
            'SELECT * FROM "User" WHERE email = $1',
            user.email,
        )

        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")

         
        hashed_password = pwd_context.hash(user.password)

     
        await conn.execute(
            '''
            INSERT INTO "User"(email, password, name, role, "createdAt", "updatedAt")
            VALUES($1, $2, $3, $4, NOW(), NOW())
            ''',
            user.email,
            hashed_password,
            user.name,
            "customer",
        )

        return {"message": "User registered successfully"}

    finally:
        await conn.close()

 

@app.post("/login")
async def login_user(user: LoginRequest):
    conn = await get_db_connection()
    try:
        db_user = await conn.fetchrow(
            'SELECT * FROM "User" WHERE email = $1',
            user.email,
        )

        if not db_user:
            raise HTTPException(status_code=400, detail="Invalid email or password")

        
        if not pwd_context.verify(user.password, db_user["password"]):
            raise HTTPException(status_code=400, detail="Invalid email or password")

        return {
            "message": "Login successful",
            "user": {
                "id": db_user["id"],
                "email": db_user["email"],
                "name": db_user["name"],
                "role": db_user["role"],
            },
        }

    finally:
        await conn.close()

 
