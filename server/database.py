from pymongo import MongoClient
from pymongo.server_api import ServerApi
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = "contest_tracker"

class Database:
    client: MongoClient = None

    def connect(self):
        # Use ServerApi for Atlas
        # Adding timeouts and potential fix for DNS issues
        self.client = MongoClient(MONGO_URI, server_api=ServerApi('1'), serverSelectionTimeoutMS=5000)
        try:
            self.client.admin.command('ping')
            print("Pinged your deployment. You successfully connected to MongoDB!")
        except Exception as e:
            print(f"MongoDB Connection Error: {e}")

    def get_db(self):
        return self.client[DB_NAME]

    def close(self):
        if self.client:
            self.client.close()

db = Database()
