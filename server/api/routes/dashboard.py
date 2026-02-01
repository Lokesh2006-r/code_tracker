from fastapi import APIRouter, Depends
from database import db

router = APIRouter()

@router.get("/stats")
async def get_dashboard_stats():
    students = list(db.get_db()["students"].find())
    
    total_students = len(students)
    total_solved = 0
    department_counts = {}
    # Initialize default departments
    default_depts = ["CSE", "ECE", "IT", "AI"]
    dept_aggregated = {d: {"count": 0, "solved": 0} for d in default_depts}
    
    skill_dist = {"expert": 0, "intermediate": 0, "beginner": 0}
    zero_solvers = 0
    
    for s in students:
        stats = s.get("stats", {})
        
        # Aggregate Solved Count
        lc = stats.get("leetcode", {}).get("total_solved", 0)
        cc = stats.get("codechef", {}).get("solved", 0)
        cf = stats.get("codeforces", {}).get("solved", 0)
        hr = stats.get("hackerrank", {}).get("solved", 0)
        
        student_total = lc + cc + cf + hr
        total_solved += student_total
        
        # Skill categorization
        if student_total > 500:
            skill_dist["expert"] += 1
        elif student_total > 200:
            skill_dist["intermediate"] += 1
        else:
            skill_dist["beginner"] += 1
            
        if student_total == 0:
            zero_solvers += 1
        
        dept = s.get("department", "Unknown")
        department_counts[dept] = department_counts.get(dept, 0) + 1
        
        if dept not in dept_aggregated:
            dept_aggregated[dept] = {"count": 0, "solved": 0}
        dept_aggregated[dept]["count"] += 1
        dept_aggregated[dept]["solved"] += student_total

    department_stats = []
    for dept, data in dept_aggregated.items():
        avg = data["solved"] // data["count"] if data["count"] > 0 else 0
        department_stats.append({
            "id": dept,
            "name": dept, 
            "students": data["count"],
            "avg_solved": int(avg)
        })

    return {
        "total_students": total_students,
        "total_solved": total_solved,
        "department_counts": department_counts,
        "department_stats": department_stats,
        "skill_distribution": skill_dist,
        "inactive_students": zero_solvers,
        "active_contests": 2
    }
from services.contests import ContestService

@router.get("/contests")
async def get_upcoming_contests():
    return await ContestService.get_upcoming()

# End of file
