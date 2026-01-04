import asyncio
from database import db
from services.platforms.codeforces import CodeforcesService

async def main():
    db.connect()
    try:
        # 1. Check DB for students with CF handles
        students = list(db.get_db()["students"].find({"handles.codeforces": {"$exists": True, "$ne": ""}}))
        print(f"Found {len(students)} students with CF handles.")
        
        if not students:
            print("No students with CF handles!")
            return

        handles = [s["handles"]["codeforces"] for s in students[:5]] # Take first 5
        print(f"Testing handles: {handles}")
        
        # 2. Try fetching a known contest
        print("Verifying first profile...")
        profile = await CodeforcesService.get_user_profile(handles[0])
        if profile:
            print(f"History count: {len(profile.get('history', []))}")
            if profile.get('history'):
                print(f"Last contest: {profile['history'][0]}")
        else:
             print("Profile fetch failed")
        
        # 3. Test Standings API with a random recent contest ID (e.g. 2050 - doesn't exist yet, 1920?)
        # Let's check a contest the user might have participated in if we can guess.
        # Or just check if the API returns OK status even with 0 rows.
        print("Testing standings API for contest 1920...")
        rows, probs = await CodeforcesService.get_contest_standings("1920", handles)
        print(f"Standings result: Rows={len(rows) if rows else 0}, Probs={len(probs) if probs else 0}")
        if rows:
            print(f"Sample row: {rows[0]}")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    loop = asyncio.get_event_loop()
    loop.run_until_complete(main())
