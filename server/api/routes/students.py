from fastapi import APIRouter, HTTPException, Body
from models.student import Student, StudentCreate
from services.aggregator import PlatformAggregator
from database import db
from typing import List

router = APIRouter()

@router.post("/verify-profiles")
async def verify_student_profiles(handles: dict = Body(...)):
    """
    Fetches live data from provided handles to verify they exist.
    """
    try:
        results = await PlatformAggregator.verify_profile(handles)
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{reg_no}", response_model=Student)
async def get_student(reg_no: str):
    student = db.get_db()["students"].find_one({"reg_no": reg_no})
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    if "_id" in student: student["_id"] = str(student["_id"])
    return student

@router.delete("/{reg_no}", status_code=204)
async def delete_student(reg_no: str):
    result = db.get_db()["students"].delete_one({"reg_no": reg_no})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Student not found")
    return None

@router.put("/{reg_no}", response_model=Student)
async def update_student(reg_no: str, student_update: StudentCreate):
    # Check if student exists
    existing = db.get_db()["students"].find_one({"reg_no": reg_no})
    if not existing:
        raise HTTPException(status_code=404, detail="Student not found")

    update_data = student_update.dict(exclude_unset=True)
    
    # If handles changed, we might want to re-verify stats, but let's keep it simple for now or optionally trigger refresh
    # For now, just update the info. If the user wants to refresh stats, they can hit the refresh button.
    # Actually, if handles change, we SHOULD update stats because the old stats belong to old handles.
    
    old_handles = existing.get("handles", {})
    new_handles = update_data.get("handles", {})
    
    # Simple check if handles object is different (needs careful comparison as pydantic models converted to dict)
    # Let's just re-verify if handles are in the update payload
    if "handles" in update_data:
         stats = await PlatformAggregator.verify_profile(student_update.handles.dict())
         update_data["stats"] = stats

    db.get_db()["students"].update_one(
        {"reg_no": reg_no},
        {"$set": update_data}
    )
    
    updated_student = db.get_db()["students"].find_one({"reg_no": reg_no})
    return fix_id(updated_student)

@router.post("/{reg_no}/refresh", response_model=Student)
async def refresh_student_stats(reg_no: str):
    student = db.get_db()["students"].find_one({"reg_no": reg_no})
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
        
    handles = student.get("handles", {})
    # Re-verify/fetch stats
    new_stats = await PlatformAggregator.verify_profile(handles)
    
    # Update DB
    db.get_db()["students"].update_one(
        {"reg_no": reg_no},
        {"$set": {"stats": new_stats}}
    )
    
    updated_student = db.get_db()["students"].find_one({"reg_no": reg_no})
    return fix_id(updated_student)

def fix_id(doc):
    if doc and "_id" in doc:
        doc["_id"] = str(doc["_id"])
    return doc

@router.post("/", response_model=Student, status_code=201)
async def create_student(student: StudentCreate):
    student_dict = student.dict(by_alias=True)
    
    # Check for duplicates
    existing = db.get_db()["students"].find_one({"reg_no": student.reg_no})
    if existing:
        raise HTTPException(status_code=400, detail="Student with this Register Number already exists")

    # Initial Fetch of stats
    stats = await PlatformAggregator.verify_profile(student.handles.dict())
    student_dict["stats"] = stats
    
    new_student = db.get_db()["students"].insert_one(student_dict)
    created_student = db.get_db()["students"].find_one({"_id": new_student.inserted_id})
    return fix_id(created_student)

@router.get("/", response_model=List[Student])
async def get_students(department: str = None):
    query = {}
    if department:
        query["department"] = department
    students = list(db.get_db()["students"].find(query))
    return [fix_id(s) for s in students]
