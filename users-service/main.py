import os
import hashlib
import secrets
from contextlib import asynccontextmanager
from datetime import datetime, timedelta, timezone
from pathlib import Path

import asyncpg
from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, EmailStr
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=['pbkdf2_sha256'], deprecated='auto')

async def connect():
    if os.getenv('DATABASE_URL'):
        return await asyncpg.connect(os.environ['DATABASE_URL'], timeout=10)
    return await asyncpg.connect(user=os.getenv('DB_USER', 'user'), password=os.getenv('DB_PASSWORD', 'password'),
        database=os.getenv('DB_NAME', 'ecommerce_db'), host=os.getenv('DB_HOST', 'database'),
        port=int(os.getenv('DB_PORT', '5432')), timeout=10)

@asynccontextmanager
async def lifespan(app):
    conn = await connect()
    try:
        async with conn.transaction():
            await conn.execute("SELECT pg_advisory_xact_lock(5352026)")
            await conn.execute(Path(__file__).with_name('schema.sql').read_text())
    finally:
        await conn.close()
    yield

app = FastAPI(lifespan=lifespan)
app.add_middleware(CORSMiddleware,
    allow_origins=os.getenv('ALLOWED_ORIGINS', 'http://localhost:5173').split(','),
    allow_methods=['GET', 'POST', 'DELETE'], allow_headers=['Authorization', 'Content-Type'])

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    name: str | None = Field(default=None, max_length=100)

class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)

def token_digest(authorization):
    if not authorization or not authorization.startswith('Bearer '):
        raise HTTPException(401, 'Please log in')
    return hashlib.sha256(authorization[7:].encode()).hexdigest()

@app.get('/health')
async def health():
    conn = await connect()
    try:
        await conn.fetchval('SELECT 1')
        return {'status': 'ok'}
    finally:
        await conn.close()

@app.post('/register', status_code=201)
async def register(user: RegisterRequest):
    conn = await connect()
    try:
        await conn.execute('''INSERT INTO "User"(email,password,name,role,"createdAt","updatedAt")
            VALUES($1,$2,$3,'customer',NOW(),NOW())''', str(user.email).lower(), pwd_context.hash(user.password), user.name)
        return {'message': 'Account created. Please log in.'}
    except asyncpg.UniqueViolationError:
        raise HTTPException(409, 'Email already registered')
    finally:
        await conn.close()

@app.post('/login')
async def login(user: LoginRequest):
    conn = await connect()
    try:
        row = await conn.fetchrow('SELECT * FROM "User" WHERE email=$1', str(user.email).lower())
        valid = False
        if row:
            try:
                valid = pwd_context.verify(user.password, row['password'])
            except (ValueError, TypeError):
                pass
        if not valid:
            raise HTTPException(401, 'Invalid email or password')
        token = secrets.token_urlsafe(32)
        await conn.execute('DELETE FROM sessions WHERE expires_at < NOW()')
        await conn.execute('INSERT INTO sessions(token_hash,user_id,expires_at) VALUES($1,$2,$3)',
            hashlib.sha256(token.encode()).hexdigest(), row['id'], datetime.now(timezone.utc) + timedelta(hours=8))
        return {'token': token, 'user': {key: row[key] for key in ['id', 'email', 'name', 'role']}}
    finally:
        await conn.close()

@app.get('/me')
async def me(authorization: str | None = Header(default=None)):
    digest = token_digest(authorization)
    conn = await connect()
    try:
        row = await conn.fetchrow('''SELECT u.id,u.email,u.name,u.role FROM "User" u
            JOIN sessions s ON s.user_id=u.id WHERE s.token_hash=$1 AND s.expires_at>NOW()''', digest)
        if not row:
            raise HTTPException(401, 'Session expired. Please log in again.')
        return dict(row)
    finally:
        await conn.close()

@app.post('/logout')
async def logout(authorization: str | None = Header(default=None)):
    digest = token_digest(authorization)
    conn = await connect()
    try:
        await conn.execute('DELETE FROM sessions WHERE token_hash=$1', digest)
        return {'message': 'Logged out'}
    finally:
        await conn.close()
