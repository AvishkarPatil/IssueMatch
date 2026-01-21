from motor.motor_asyncio import AsyncIOMotorClient
from typing import Optional
import certifi

class MongoDB:
    client: Optional[AsyncIOMotorClient] = None
    db = None

mongodb = MongoDB()

async def connect_to_mongo():
    try:
        from app.core.config import settings
        uri = settings.MONGODB_URI
        
        print(f"🔄 Connecting to MongoDB...")
        mongodb.client = AsyncIOMotorClient(
            uri,
            serverSelectionTimeoutMS=5000,
            connectTimeoutMS=5000,
            socketTimeoutMS=5000,
            tlsCAFile=certifi.where()
        )
        mongodb.db = mongodb.client.issuematch
        
        await mongodb.client.admin.command('ping')
        print("✅ Connected to MongoDB")
    except Exception as e:
        print(f"⚠️ MongoDB connection failed: {e}")
        print("⚠️ API will work but database features disabled")
        mongodb.client = None
        mongodb.db = None

async def close_mongo_connection():
    if mongodb.client:
        mongodb.client.close()
        print("❌ Closed MongoDB connection")

def get_database():
    if mongodb.db is None:
        raise Exception("MongoDB not connected")
    return mongodb.db
