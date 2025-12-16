from services.export import ExportService
from database import db
import sys

try:
    print("Connecting to DB...")
    db.connect()
    print("Testing generate_excel...")
    # Test contest mode
    output = ExportService.generate_excel(
        department="CSE", 
        year=None, 
        platform="Codeforces", 
        contest_name="Test Contest", 
        contest_date="2025-01-01"
    )
    print("Success! Output size:", len(output.getvalue()))
except Exception as e:
    print("Error occurred:")
    import traceback
    traceback.print_exc()
