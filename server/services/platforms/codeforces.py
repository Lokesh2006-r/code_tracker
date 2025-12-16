import httpx

CODEFORCES_USER_URL = "https://codeforces.com/api/user.info"

import re

class CodeforcesService:
    @staticmethod
    async def get_user_profile(username: str):
        async with httpx.AsyncClient() as client:
            try:
                # 1. Get User Info
                response = await client.get(
                    CODEFORCES_USER_URL, 
                    params={"handles": username},
                    timeout=10.0
                )
                data = response.json()
                
                if data["status"] != "OK":
                    return None
                
                user_info = data["result"][0]
                
                # 2. Get Contest Count (via Rating History)
                rating_url = f"https://codeforces.com/api/user.rating?handle={username}"
                rating_res = await client.get(rating_url, timeout=10.0)
                contest_count = 0
                if rating_res.status_code == 200:
                    r_data = rating_res.json()
                    if r_data["status"] == "OK":
                        contest_count = len(r_data["result"])
                        
                # 3. Get Solved Count (Scrape Profile)
                solved_count = 0
                try:
                    profile_url = f"https://codeforces.com/profile/{username}"
                    profile_res = await client.get(profile_url, timeout=10.0, follow_redirects=True)
                    if profile_res.status_code == 200:
                        text = profile_res.text
                        # Look for "X problems solved"
                        # Robust regex for "6474 problems solved" allowing for intervening HTML tags
                        # Matches digits, then any amount of non-digit/tags, then "problems solved"
                        # But we want to be close.
                        # Try finding just the digits followed eventually by "problems solved" within a short distance
                        
                        # Use match for: digits ... "problems solved"
                        # Handles: <div class="val">123</div> <div class="lbl">problems solved</div>
                        match = re.search(r'(\d+)(?:<[^>]+>|\s)+problems solved', text, re.IGNORECASE)
                        
                        if not match:
                             # Try "Problems solved: 123" pattern just in case
                             match = re.search(r'problems solved:?\s*(\d+)', text, re.IGNORECASE)

                        if match:
                            solved_count = int(match.group(1))
                except Exception as scrape_err:
                    print(f"CF Scrape Error for {username}: {scrape_err}")

                return {
                    "platform": "Codeforces",
                    "username": username,
                    "rating": user_info.get("rating", 0),
                    "rank": user_info.get("rank", "Unrated"),
                    "max_rank": user_info.get("maxRank", "Unrated"),
                    "max_rating": user_info.get("maxRating", 0),
                    "contests": contest_count,
                    "solved": solved_count
                }
            except Exception as e:
                print(f"Error fetching Codeforces for {username}: {e}")
                return None
