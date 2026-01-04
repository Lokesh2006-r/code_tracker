from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import FileResponse
import os
import pandas as pd
from datetime import datetime
from database import db
from services.export import ExportService

router = APIRouter()
REPORTS_DIR = "reports"

@router.post("/{dept}/{type}/update")
async def update_report(
    dept: str, 
    type: str, 
    year: str = Query("All"),
    platform: str = Query(None), 
    contest_name: str = Query(None)
):
    os.makedirs(REPORTS_DIR, exist_ok=True)
    filename = f"{dept}_{year}_{type_clean(type)}.xlsx"
    filepath = os.path.join(REPORTS_DIR, filename)
    
    try:
        new_df = None
        sheet_name = ""

        if type == "performance":
            date_str = datetime.now().strftime("%Y-%m-%d")
            query = {"department": dept}
            if year != "All":
                 query["year"] = int(year)

            students = list(db.get_db()["students"].find(query))
            try:
                students.sort(key=lambda s: s.get("reg_no", "").lower())
            except: pass
            
            lc_data, cf_data, cc_data, hr_data = [], [], [], []

            for idx, s in enumerate(students, 1):
                base = { 
                    "Reg No": s.get("reg_no", "Unknown"), 
                    "Name": s.get("name", "Unknown"), 
                    "Date": date_str 
                }
                stats = s.get("stats", {})

                # LeetCode
                lc = stats.get("leetcode", {})
                lc_hist = lc.get("history", [])
                # Calculate Max Rating
                lc_max = lc.get("rating", 0)
                if lc_hist:
                    try:
                        valid_ratings = [h.get("rating") for h in lc_hist if isinstance(h.get("rating"), (int, float))]
                        if valid_ratings:
                            lc_max = max(valid_ratings)
                    except: pass
                
                lc_data.append({
                    **base,
                    "Current Rating": lc.get("rating", "N/A"),
                    "Max Rating": int(lc_max) if lc_max else "N/A",
                    "Total Contest Attended": lc.get("attended", 0)
                })

                # Codeforces
                cf = stats.get("codeforces", {})
                cf_data.append({
                    **base,
                    "Max Rating": cf.get("max_rating", 0),
                    "Total Contest Participated": cf.get("contests", 0),
                    "Total Problems Solved": cf.get("solved", 0)
                })

                # HackerRank
                hr = stats.get("hackerrank", {})
                hr_data.append({
                    **base,
                    "Total Problems Solved": hr.get("solved", 0)
                })

                # CodeChef
                cc = stats.get("codechef", {})
                cc_data.append({
                    **base,
                    "Current Rating": cc.get("rating", 0),
                    "Stars": cc.get("stars", 0),
                    "Total Problems Solved": cc.get("solved", 0)
                })
            
            # Prepare DataFrames
            platform_dfs = {
                "LeetCode": pd.DataFrame(lc_data),
                "Codeforces": pd.DataFrame(cf_data), 
                "HackerRank": pd.DataFrame(hr_data),
                "CodeChef": pd.DataFrame(cc_data)
            }
            
            # Save strategy: Full Rewrite to avoid corruption
            # 1. Read existing data to memory
            existing_dfs = {}
            if os.path.exists(filepath):
                try:
                    existing_dfs = pd.read_excel(filepath, sheet_name=None)
                except Exception as e:
                    print(f"Error reading existing excel (might be corrupt, resetting): {e}")
                    existing_dfs = {}
            
            # 2. Merge Data in Memory
            final_sheets = {}
            for sheet_name, new_df in platform_dfs.items():
                if sheet_name in existing_dfs:
                     old_df = existing_dfs[sheet_name]
                     # Deduplicate: If we already have data for this Date, remove it (Update/Overwrite for today)
                     if "Date" in old_df.columns:
                         # Convert to string to compare just in case
                         old_df = old_df[old_df["Date"].astype(str) != date_str]
                     
                     combined = pd.concat([old_df, new_df], ignore_index=True)
                     final_sheets[sheet_name] = combined
                else:
                     final_sheets[sheet_name] = new_df
            
            # 3. Clean Write
            try:
                if os.path.exists(filepath):
                    os.remove(filepath)
            except PermissionError:
                raise HTTPException(400, "File is open in Excel. Please close it and try again.")
            except Exception as e:
                 print(f"Error removing file: {e}")

            with pd.ExcelWriter(filepath, engine='openpyxl', mode='w') as writer:
                for sheet_name, df in final_sheets.items():
                    df.to_excel(writer, sheet_name=sheet_name, index=False)

            return {"status": "updated", "file": filename, "sheets": list(final_sheets.keys())}

        elif type == "contest":
            if not contest_name:
                raise HTTPException(400, "Contest Name required")
            
            # Use ExportService to generate the snapshot
            # ExportService supports 'year' filter
            excel_bytes = ExportService.generate_excel(
                department=dept, 
                year=year,
                platform=platform, 
                contest_name=contest_name
            )
            # Read back
            dfs = pd.read_excel(excel_bytes, sheet_name=None)
            if not dfs:
                 # If empty data returned
                 new_df = pd.DataFrame([{"Message": "No Data Found"}])
            else:
                 new_df = list(dfs.values())[0] # First sheet
            
            # Sheet Name: Platform_Contest (cleaned)
            clean_p = (platform or "Unknown")[:3]
            clean_c = "".join(c for c in contest_name if c.isalnum())[:20]
            sheet_name = f"{clean_p}_{clean_c}"

        # Write/Append to Excel
        mode = 'a' if os.path.exists(filepath) else 'w'
        
        # Openpyxl handling for removal of existing sheet
        if mode == 'a':
            import openpyxl
            wb = openpyxl.load_workbook(filepath)
            if sheet_name in wb.sheetnames:
                std = wb[sheet_name]
                wb.remove(std)
                wb.save(filepath)
                
        with pd.ExcelWriter(filepath, engine='openpyxl', mode='a' if os.path.exists(filepath) else 'w') as writer:
            new_df.to_excel(writer, sheet_name=sheet_name, index=False)
            
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(500, f"Error updating report: {str(e)}")

    return {"status": "updated", "file": filename, "sheet": sheet_name}

@router.get("/{dept}/{type}/download")
async def download_report(dept: str, type: str, year: str = Query("All")):
    filename = f"{dept}_{year}_{type_clean(type)}.xlsx"
    filepath = os.path.join(REPORTS_DIR, filename)
    if not os.path.exists(filepath):
        raise HTTPException(404, "Report not created yet. Please Click Update Data first.")
        
    return FileResponse(filepath, filename=filename)

def type_clean(t):
    return "Performance" if t == "performance" else "Contest"
