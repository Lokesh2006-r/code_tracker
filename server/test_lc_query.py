import httpx
import asyncio
import json

async def test_lc():
    username = "neal_wu" # A known active user
    query = """
    query getUserProfile($username: String!) {
      matchedUser(username: $username) {
        username
        submitStats: submitStatsGlobal {
          acSubmissionNum {
            difficulty
            count
          }
        }
        profile {
            ranking
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
        totalParticipants
        contest {
          title
          startTime
        }
      }
    }
    """
    
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.post("https://leetcode.com/graphql", json={"query": query, "variables": {"username": username}}, timeout=10)
            print("Status:", resp.status_code)
            data = resp.json()
            if "errors" in data:
                print("Errors found:", json.dumps(data["errors"], indent=2))
            else:
                print("Success! Data keys:", data.get("data", {}).keys())
                # print(json.dumps(data, indent=2))
    except Exception as e:
        print("Exception:", e)

asyncio.run(test_lc())
