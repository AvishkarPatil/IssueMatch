from pymongo import MongoClient
from typing import Generator

MONGO_DETAILS = "mongodb://localhost:27017"  # MongoDB URI
client = MongoClient(MONGO_DETAILS)
db = client.issuematch  # database name

def get_db() -> Generator:
    """
    Dependency function to get MongoDB database.
    Use it with FastAPI Depends.
    """
    try:
        yield db
    finally:
        pass  # MongoClient doesn't need explicit close here

