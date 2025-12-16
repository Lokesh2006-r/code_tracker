from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
import asyncio
from datetime import datetime
from database import db
from services.aggregator import PlatformAggregator

scheduler = BackgroundScheduler()

def test_job():
    print(f"[{datetime.now()}] Background Job: Service is alive.")

async def update_single_student(student):
    try:
        print(f"Updating {student['reg_no']}...")
        current_handles = student.get("handles", {})
        
        # 1. Update Aggregate Stats
        new_stats = await PlatformAggregator.verify_profile(current_handles)
        if new_stats:
            db.get_db()["students"].update_one(
                {"_id": student["_id"]},
                {"$set": {"stats": new_stats, "last_updated": datetime.utcnow()}}
            )

        # 2. Sync LeetCode Contest History (Historical Aggregation)
        if "leetcode" in current_handles and current_handles["leetcode"]:
            from services.platforms.leetcode import LeetCodeService
            history = await LeetCodeService.get_contest_history(current_handles["leetcode"])
            
            # Bulk Insert/Upsert logic for ContestPerformance
            # This is simplified; normally we'd check duplicates efficiently
            for contest in history:
                contest_name = contest["contest"]["title"]
                
                # Check if exists
                exists = db.get_db()["contest_performance"].find_one({
                    "reg_no": student["reg_no"],
                    "platform": "LeetCode",
                    "contest_name": contest_name
                })
                
                if not exists:
                    db.get_db()["contest_performance"].insert_one({
                        "reg_no": student["reg_no"],
                        "platform": "LeetCode",
                        "contest_name": contest_name,
                        "date": datetime.fromtimestamp(contest["contest"]["startTime"]).strftime('%Y-%m-%d'),
                        "rating": contest["rating"],
                        "rank": contest["ranking"],
                        "total_solved": contest["problemsSolved"], # LC gives total solved in contest
                        "easy": 0, "medium": 0, "hard": 0, # API doesn't give difficulty split easily here
                        "total": 4 # Standard LC contest size
                    })
                    
    except Exception as e:
        print(f"Failed to update {student['reg_no']}: {e}")

def update_student_stats():
    """
    Scheduled job to update all student stats.
    Since Apscheduler runs in a separate thread, we need a new event loop for async calls if not careful.
    However, using asyncio.run() is the safest way to execute the async aggregator from a synchronous job.
    """
    print(f"[{datetime.now()}] Starting scheduled update for all students...")
    try:
        # Check if DB is connected (it should be)
        students = list(db.get_db()["students"].find())
        
        async def runner():
            tasks = [update_single_student(s) for s in students]
            if tasks:
                await asyncio.gather(*tasks)
        
        asyncio.run(runner())
        print(f"[{datetime.now()}] Completed update for {len(students)} students.")
    except Exception as e:
        print(f"Error in scheduled update: {e}")

def start_scheduler():
    # Run every 6 hours
    scheduler.add_job(update_student_stats, CronTrigger(hour='*/6'))
    
    # Keep the heartbeat
    scheduler.add_job(test_job, 'interval', minutes=30)
    
    scheduler.start()
    print("Scheduler started!")

def shutdown_scheduler():
    scheduler.shutdown()
