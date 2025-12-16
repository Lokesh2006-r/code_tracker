from fastapi import APIRouter, Depends
from database import db

router = APIRouter()

@router.get("/stats")
async def get_dashboard_stats():
    students = list(db.get_db()["students"].find())
    
    total_students = len(students)
    total_solved = 0
    department_counts = {}
    
    for s in students:
        stats = s.get("stats", {})
        # LeetCode
        total_solved += stats.get("leetcode", {}).get("total_solved", 0)
        # Codeforces (problems solved isn't easily available in our lightweight User Info call, ignoring for now or adding if we tracked it)
        
        dept = s.get("department", "Unknown")
        department_counts[dept] = department_counts.get(dept, 0) + 1

    return {
        "total_students": total_students,
        "total_solved": total_solved,
        "department_counts": department_counts,
        # Mock active contests for now
        "active_contests": 2 
    }
