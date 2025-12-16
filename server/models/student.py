from pydantic import BaseModel, Field, EmailStr
from typing import Optional, Dict, List
from datetime import datetime

class PlatformHandles(BaseModel):
    leetcode: Optional[str] = None
    codechef: Optional[str] = None
    codeforces: Optional[str] = None
    hackerrank: Optional[str] = None

class StudentBase(BaseModel):
    reg_no: str = Field(..., description="Unique Register Number")
    name: str
    department: str
    year: int
    handles: PlatformHandles

class StudentCreate(StudentBase):
    pass

class Student(StudentBase):
    id: Optional[str] = Field(None, alias="_id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Aggregated stats (updated periodically)
    stats: Optional[Dict] = {} 

    class Config:
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "reg_no": "21CS101",
                "name": "John Doe",
                "department": "CSE",
                "year": 3,
                "handles": {
                    "leetcode": "johndoe_lc",
                    "codechef": "john_cc",
                    "codeforces": "john_cf",
                    "hackerrank": "john_hr"
                }
            }
        }

class ContestPerformance(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    reg_no: str
    platform: str
    contest_name: str
    date: str # YYYY-MM-DD
    
    # Solved Counts
    easy: int = 0
    medium: int = 0
    hard: int = 0
    total: int = 0
    
    # Rank/Rating (Optional)
    rank: Optional[int] = None
    rating_change: Optional[int] = None

    class Config:
        populate_by_name = True
