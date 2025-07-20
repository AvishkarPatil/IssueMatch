import firebase_admin
from firebase_admin import credentials, firestore
import os
from functools import lru_cache

@lru_cache()
def get_firebase_admin():
    """
    Initialize and return Firebase Admin SDK instance.
    Uses LRU cache to ensure we only initialize once.
    """
    # Check if already initialized
    if not firebase_admin._apps:
        # Get credentials from environment or file
        cred_path = os.environ.get("FIREBASE_CREDENTIALS_PATH", "app/services/keys.json")
        
        try:
            cred = credentials.Certificate(cred_path)
            firebase_admin.initialize_app(cred)
        except Exception as e:
            print(f"Error initializing Firebase: {e}")
            # Fallback to default app if credentials fail
            firebase_admin.initialize_app()
    
    # Return a simple object with helper methods
    class FirebaseAdmin:
        @property
        def firestore_client(self):
            return firestore.client()
            
        def server_timestamp(self):
            return firestore.SERVER_TIMESTAMP
    
    return FirebaseAdmin()