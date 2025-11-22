#!/usr/bin/env python3
"""
Script to check existing users in the database.
"""
import sys
from app.db.base import SessionLocal
from app.models.user import User

def main():
    try:
        db = SessionLocal()
        users = db.query(User).all()
        
        if not users:
            print("No users found in the database.")
            print("\nTo create a user, you can:")
            print("1. Use the frontend: http://localhost:3000/register")
            print("2. Use the API: POST http://localhost:8000/api/v1/auth/register")
            return
        
        print(f"Found {len(users)} user(s):\n")
        for user in users:
            print(f"  ID: {user.id}")
            print(f"  Email: {user.email}")
            print(f"  Name: {user.full_name}")
            print(f"  Role: {user.role.value}")
            print(f"  Created: {user.created_at}")
            print("-" * 40)
        
        db.close()
    except Exception as e:
        print(f"Error: {e}")
        print("\nPossible issues:")
        print("1. Database not initialized - run: alembic upgrade head")
        print("2. Database connection failed - check DATABASE_URL in .env")
        print("3. PostgreSQL not running - start PostgreSQL service")
        sys.exit(1)

if __name__ == "__main__":
    main()

