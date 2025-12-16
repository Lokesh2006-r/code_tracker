import httpx
import asyncio

LEETCODE_URL = "https://leetcode.com/graphql"

class LeetCodeService:
    @staticmethod
    async def get_user_profile(username: str):
        query = """
        query getUserProfile($username: String!) {
          matchedUser(username: $username) {
            username
            submitStats: submitStatsGlobal {
              acSubmissionNum {
                difficulty
                count
                submissions
              }
            }
            profile {
              ranking
              reputation
            }
          }
          userContestRanking(username: $username) {
            attendedContestsCount
            rating
            globalRanking
            topPercentage
          }
          userContestRankingHistory(username: $username) {
            rating
            attended
            problemsSolved
            ranking
            contest {
              title
              startTime
            }
          }
        }
        """
        
        variables = {"username": username}
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    LEETCODE_URL, 
                    json={"query": query, "variables": variables},
                    timeout=10.0
                )
                data = response.json()
                
                if "errors" in data or not data.get("data", {}).get("matchedUser"):
                    return None
                
                user_data = data["data"]["matchedUser"]
                contest_data = data["data"].get("userContestRanking") or {}
                
                # Parse Solved Counts
                stats = user_data["submitStats"]["acSubmissionNum"]
                total = next((x["count"] for x in stats if x["difficulty"] == "All"), 0)
                easy = next((x["count"] for x in stats if x["difficulty"] == "Easy"), 0)
                medium = next((x["count"] for x in stats if x["difficulty"] == "Medium"), 0)
                hard = next((x["count"] for x in stats if x["difficulty"] == "Hard"), 0)
                
                # Contest History for Max Rating
                attended_count = contest_data.get("attendedContestsCount", 0)
                max_rating = 0
                
                history = data["data"].get("userContestRankingHistory") or []
                if history:
                    # Filter attended
                    attended_history = [h for h in history if h["attended"]]
                    if attended_history:
                        max_rating = max(h["rating"] for h in attended_history)

                return {
                    "platform": "LeetCode",
                    "username": username,
                    "total_solved": total,
                    "easy": easy,
                    "medium": medium,
                    "hard": hard,
                    "rating": int(contest_data.get("rating", 0)) if contest_data.get("rating") else 0,
                    "global_rank": contest_data.get("globalRanking", 0),
                    "top_percentage": contest_data.get("topPercentage", 0),
                    "ranking": user_data["profile"]["ranking"],
                    "attended": attended_count,
                    "max_rating": int(max_rating),
                    "history": [h for h in history if h.get("attended")] # Store attended history
                }
            except Exception as e:
                print(f"Error fetching LeetCode for {username}: {e}")
                return None

    @staticmethod
    async def get_contest_history(username: str):
        query = """
        query getContestRankingData($username: String!) {
          userContestRankingHistory(username: $username) {
            attended
            rating
            ranking
            problemsSolved
            contest {
              title
              startTime
            }
          }
        }
        """
        variables = {"username": username}
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    LEETCODE_URL, 
                    json={"query": query, "variables": variables},
                    timeout=10.0
                )
                data = response.json()
                history = data.get("data", {}).get("userContestRankingHistory", [])
                
                # Filter only attended contests
                return [h for h in history if h["attended"]]
            except Exception as e:
                print(f"Error fetching LC History for {username}: {e}")
                return []
