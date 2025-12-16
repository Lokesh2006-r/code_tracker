from fastapi import APIRouter, Query
from fastapi.responses import StreamingResponse
from services.export import ExportService
from datetime import datetime

router = APIRouter()

@router.get("/download")
async def download_report(
    department: str = Query(None), 
    year: int = Query(None),
    platform: str = Query(None),
    contest_name: str = Query(None),
    contest_date: str = Query(None)
):
    try:
        excel_file = ExportService.generate_excel(department, year, platform, contest_name, contest_date)
        
        filename = f"Performance_Report_{datetime.now().strftime('%Y%m%d')}.xlsx"
        
        headers = {
            'Content-Disposition': f'attachment; filename="{filename}"'
        }
        
        return StreamingResponse(
            excel_file, 
            headers=headers, 
            media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
    except Exception as e:
        import traceback
        traceback.print_exc()
        return {"error": str(e)}, 500
