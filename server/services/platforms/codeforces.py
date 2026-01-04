import httpx
import re

CODEFORCES_USER_URL = "https://codeforces.com/api/user.info"

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
                history = []
                if rating_res.status_code == 200:
                    r_data = rating_res.json()
                    if r_data["status"] == "OK":
                        history = r_data["result"]
                        contest_count = len(history)
                        
                # 3. Get Solved Count (via Status API)
                solved_count = 0
                try:
                    # Fetch only OK submissions, we might need pagination if user has > 10000 submissions but defaults usually cover enough for students
                    status_url = f"https://codeforces.com/api/user.status?handle={username}&from=1&count=10000"
                    status_res = await client.get(status_url, timeout=30.0)
                    
                    if status_res.status_code == 200:
                        s_data = status_res.json()
                        if s_data["status"] == "OK":
                            submissions = s_data["result"]
                            solved_problems = set()
                            for sub in submissions:
                                if sub.get("verdict") == "OK":
                                    # Create a unique key for the problem (contestId + index)
                                    problem = sub.get("problem", {})
                                    if "contestId" in problem and "index" in problem:
                                        key = f"{problem['contestId']}-{problem['index']}"
                                        solved_problems.add(key)
                                    # Fallback for old problems or problems without contest ID (rare)
                                    elif "name" in problem:
                                        solved_problems.add(problem["name"])
                                        
                            solved_count = len(solved_problems)
                except Exception as api_err:
                    print(f"CF API Status Error for {username}: {api_err}")

                return {
                    "platform": "Codeforces",
                    "username": username,
                    "rating": user_info.get("rating", 0),
                    "rank": user_info.get("rank", "Unrated"),
                    "max_rank": user_info.get("maxRank", "Unrated"),
                    "max_rating": user_info.get("maxRating", 0),
                    "contests": contest_count,
                    "history": history,
                    "solved": solved_count
                }
            except Exception as e:
                print(f"Error fetching Codeforces for {username}: {e}")
                return None

    @staticmethod
    async def get_contest_standings(contest_id: str, handles: list):
        if not handles:
            return None, None
            
        # Codeforces allows a large number of handles, but let's be safe and chunk if needed
        # For now, just one call as URL length is the main limit. 
        # A safer limit might be 100 handles per call if we were strictly robust, 
        # but typical class size is small enough for one GET usually.
        # Let's try one call first.
        
        handle_str = ";".join(handles)
        url = "https://codeforces.com/api/contest.standings"
        params = {
            "contestId": contest_id,
            "handles": handle_str,
            "showUnofficial": "true" # Include practice/virtual if needed? matching usually checks official
        }
        
        async with httpx.AsyncClient() as client:
            try:
                # We might need POST if handles string is too long
                response = await client.post(url, data=params, timeout=20.0)
                data = response.json()
                
                if data["status"] == "OK":
                    result = data["result"]
                    return result["rows"], result["problems"]
                else:
                    print(f"CF Standings Error: {data.get('comment')}")
                    return None, None
            except Exception as e:
                print(f"Error fetching CF standings: {e}")
                return None, None
