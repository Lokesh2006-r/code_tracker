from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
# from apscheduler.schedulers.background import BackgroundScheduler
# from contextlib import asynccontextmanager

app = FastAPI(
    title="Student Performance Tracker API",
    version="1.0.0"
)

@app.get("/")
def read_root():
    return {"status": "online", "message": "Student Performance Tracker API is running"}

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://localhost:5175",
    "http://127.0.0.1:5175",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from api.routes import students, export, dashboard
from auth import routes as auth_routes
from services.scheduler import start_scheduler, shutdown_scheduler
from database import db

app.include_router(auth_routes.router, tags=["Authentication"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])
app.include_router(students.router, prefix="/api/students", tags=["Students"])
app.include_router(export.router, prefix="/api/export", tags=["Export"])

@app.on_event("startup")
def startup():
    db.connect()
    start_scheduler()

@app.on_event("shutdown")
def shutdown():
    db.close()
    shutdown_scheduler()
