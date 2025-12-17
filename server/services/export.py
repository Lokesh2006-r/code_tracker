import pandas as pd
import io
from models.student import Student
from database import db
from datetime import datetime

class ExportService:
    @staticmethod
    @staticmethod
    def generate_excel(department: str = None, year: int = None, platform: str = None, contest_name: str = None, contest_date: str = None):
        query = {}
        if department and department != "All":
            query["department"] = department
        if year and year != "All":
            query["year"] = int(year)

        students = list(db.get_db()["students"].find(query))
        
        # Sort by Reg No (case-insensitive alphanumeric sort)
        try:
             students.sort(key=lambda s: s.get("reg_no", "").lower())
        except:
             pass
        
        output = io.BytesIO()
        
        # --- Contest Report Mode ---
        if platform and contest_name:
            data = []
            selected_platform = platform.lower()
            
            for idx, s in enumerate(students, 1):
                base_info = {
                    "S. No": idx,
                    "Register Number": s.get("reg_no", "Unknown"),
                    "Name of the Student": s.get("name", "Unknown"),
                }
                stats = s.get("stats", {}).get(selected_platform, {})
                
                row = {}
                if selected_platform == "leetcode":
                    # Try to find specific contest data
                    history = stats.get("history", [])
                    contest_stats = None
                    
                    if contest_name:
                        # Fuzzy match or exact match contest name
                        # Title format example: "Weekly Contest 300"
                        clean_name = contest_name.lower().replace(" ", "")
                        for h in history:
                            c_title = h.get("contest", {}).get("title", "").lower().replace(" ", "")
                            if clean_name in c_title:
                                contest_stats = h
                                break
                    
                    # If found, use contest specific stats
                    solved_count = contest_stats.get("problemsSolved", 0) if contest_stats else 0
                    contest_rating = contest_stats.get("rating", "Absent") if contest_stats else "Absent"
                    
                    # Note: LeetCode API doesn't give Easy/Medium/Hard breakdown per contest in this history, just total solved (0-4).
                    # We will put total solved in 'Total' and 0 in others to avoid confusion, or try to distribute if we knew better.
                    # For now, we put the count in Total.
                    
                    # Calculate Top % for Specific Contest
                    top_percent_str = "N/A"
                    if contest_stats:
                        rank = contest_stats.get("ranking", 0)
                        total_participants = contest_stats.get("totalParticipants", 0)
                        if total_participants > 0 and rank > 0:
                            top_percent = (rank / total_participants) * 100
                            top_percent_str = f"{top_percent:.2f}%"

                    row = {
                        **base_info,
                        "Leet Code Easy": "-", # Not available in simple history
                        "Leet Code Medium": "-",
                        "Leet code Hard": "-",
                        "Total": solved_count if contest_stats else "Absent",
                        "Contest count": stats.get("attended", 0), # Overall attended
                        "Contest Rating": contest_rating,
                        "Global Rank": stats.get("global_rank", "N/A"),
                        "Top %": top_percent_str
                    }
                elif selected_platform == "codeforces":
                    row = {
                        **base_info,
                        "Current Rating": stats.get("rating", 0),
                        "Max Rating": stats.get("max_rating", 0),
                        "Current Rank": stats.get("rank", "Unrated"),
                        "Max Rank": stats.get("max_rank", "Unrated"),
                        "Problems Count": stats.get("solved", 0),
                        "Total Contest Attend": stats.get("contests", 0)
                    }
                elif selected_platform == "codechef":
                     row = {
                        **base_info,
                        "Total Questions Solved": stats.get("solved", 0),
                        "Division": stats.get("division", "N/A"),
                        "Rating": stats.get("rating", 0),
                        "Max Rating": stats.get("max_rating", 0),
                        "Global Rank": stats.get("global_rank", "N/A"),
                        "Country Rank": stats.get("country_rank", "N/A"),
                    }
                else:
                    # Default/HackerRank
                     row = {
                        **base_info,
                        "Badges": stats.get("badges", 0),
                        "Solved": stats.get("solved", 0)
                    }
                
                data.append(row)

            if not data:
                # Handle empty data case with default columns to avoid crash
                if selected_platform == "leetcode":
                    cols = ["S. No", "Register Number", "Name of the Student", "Leet Code Easy", "Leet Code Medium", "Leet code Hard", "Total", "Contest count", "Contest Rating", "Global Rank", "Top %"]
                elif selected_platform == "codeforces":
                    cols = ["S. No", "Register Number", "Name of the Student", "Current Rating", "Max Rating", "Current Rank", "Max Rank", "Problems Count", "Total Contest Attend"]
                elif selected_platform == "codechef":
                    cols = ["S. No", "Register Number", "Name of the Student", "Total Questions Solved", "Division", "Rating", "Max Rating", "Global Rank", "Country Rank"]
                else:
                    cols = ["S. No", "Register Number", "Name of the Student", "Badges", "Solved"]
                df = pd.DataFrame(columns=cols)
            else:
                df = pd.DataFrame(data)
            
            # Use openpyxl for custom header
            with pd.ExcelWriter(output, engine='openpyxl') as writer:
                # Write data starting from row 3 (leaving room for header)
                df.to_excel(writer, index=False, sheet_name='Contest Data', startrow=2)
                
                workbook = writer.book
                worksheet = writer.sheets['Contest Data']
                
                # Add Big Date Header
                from openpyxl.styles import Font, Alignment
                
                # Merge first row
                worksheet.merge_cells(start_row=1, start_column=1, end_row=1, end_column=len(df.columns))
                cell = worksheet.cell(row=1, column=1)
                cell.value = contest_date if contest_date else datetime.now().strftime("%d-%m-%Y")
                cell.font = Font(size=24, bold=True)
                cell.alignment = Alignment(horizontal='center', vertical='center')
                
                # Adjust column widths
                from openpyxl.utils import get_column_letter
                for i, col in enumerate(worksheet.columns, 1):
                    max_length = 0
                    column_letter = get_column_letter(i)
                    for cell in col:
                        try:
                            if len(str(cell.value)) > max_length:
                                max_length = len(str(cell.value))
                        except:
                            pass
                    adjusted_width = (max_length + 2)
                    worksheet.column_dimensions[column_letter].width = adjusted_width

            output.seek(0)
            return output

        # --- Normal Export Mode (Multi-sheet) ---
        
        # Prepare lists for each sheet
        lc_data = []
        cf_data = []
        cc_data = []
        hr_data = []
        
        for idx, s in enumerate(students, 1):
            base_info = {
                "S.No": idx,
                "Reg No": s.get("reg_no", "Unknown"),
                "Name": s.get("name", "Unknown"),
                "Department": s.get("department", "Unknown")
            }
            stats = s.get("stats", {})
            
            # LeetCode Row
            lc = stats.get("leetcode", {})
            lc_row = {
                **base_info,
                "LeetCode Easy": lc.get("easy", 0),
                "LeetCode Medium": lc.get("medium", 0),
                "LeetCode Hard": lc.get("hard", 0),
                "Total Solved": lc.get("total_solved", 0),
                "Contest Count": lc.get("attended", 0),
                "Contest Rating": lc.get("rating", "N/A"),
                "Global Rank": lc.get("global_rank", "N/A"),
                "Top %": f"{lc.get('top_percentage', 0)}%" if lc.get('top_percentage') else "N/A"
            }
            lc_data.append(lc_row)
            
            # CodeChef Row
            cc = stats.get("codechef", {})
            cc_row = {
                **base_info,
                "Rating": cc.get("rating", 0),
                "Global Rank": cc.get("global_rank", "N/A"),
                "Stars": cc.get("stars", 0),
                "Solved": cc.get("solved", 0),
                "Contests": cc.get("contests", 0)
            }
            cc_data.append(cc_row)
            
            # Codeforces Row
            cf = stats.get("codeforces", {})
            cf_row = {
                **base_info,
                "Rating": cf.get("rating", 0),
                "Max Rating": cf.get("max_rating", 0),
                "Rank": cf.get("rank", "Unrated"),
                "Solved": cf.get("solved", 0),
                "Contests": cf.get("contests", 0)
            }
            cf_data.append(cf_row)
            
            # HackerRank Row
            hr = stats.get("hackerrank", {})
            hr_row = {
                **base_info,
                "Badges": hr.get("badges", 0),
                "Solved": hr.get("solved", 0)
            }
            hr_data.append(hr_row)
            
        # Create DataFrames
        df_lc = pd.DataFrame(lc_data)
        df_cc = pd.DataFrame(cc_data)
        df_cf = pd.DataFrame(cf_data)
        df_hr = pd.DataFrame(hr_data)
        
        # Write to Excel
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            if not df_lc.empty:
                df_lc.to_excel(writer, index=False, sheet_name='LeetCode')
            else:
                 pd.DataFrame(columns=["S.No", "Name", "Department"]).to_excel(writer, index=False, sheet_name='LeetCode')
                 
            if not df_cc.empty:
                df_cc.to_excel(writer, index=False, sheet_name='CodeChef')
            else:
                pd.DataFrame(columns=["S.No", "Name", "Department"]).to_excel(writer, index=False, sheet_name='CodeChef')

            if not df_cf.empty:
                df_cf.to_excel(writer, index=False, sheet_name='Codeforces')
            else:
                 pd.DataFrame(columns=["S.No", "Name", "Department"]).to_excel(writer, index=False, sheet_name='Codeforces')

            if not df_hr.empty:
                df_hr.to_excel(writer, index=False, sheet_name='HackerRank')
            else:
                 pd.DataFrame(columns=["S.No", "Name", "Department"]).to_excel(writer, index=False, sheet_name='HackerRank')
            
        output.seek(0)
        return output
