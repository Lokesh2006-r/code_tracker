import httpx
from datetime import datetime, timezone

class ContestService:
    @staticmethod
    async def get_upcoming():
        contests = []
        now = datetime.now(timezone.utc).timestamp()
        
        # 1. Codeforces (API)
        try:
             async with httpx.AsyncClient() as client:
                res = await client.get("https://codeforces.com/api/contest.list?gym=false", timeout=5.0)
                if res.status_code == 200:
                    data = res.json()
                    if data["status"] == "OK":
                        for c in data["result"]:
                            if c["phase"] == "BEFORE":
                                contests.append({
                                    "id": f"cf-{c['id']}",
                                    "name": c["name"],
                                    "platform": "Codeforces",
                                    "start_time": c["startTimeSeconds"],
                                    "duration": c["durationSeconds"],
                                    "url": f"https://codeforces.com/contest/{c['id']}"
                                })
        except Exception as e:
            print(f"CF Contest Error: {e}")

        # 2. LeetCode (GraphQL)
        try:
            query = """
            {
                topTwoContests {
                    title
                    startTime
                    titleSlug
                }
            }
            """
            async with httpx.AsyncClient() as client:
                res = await client.post("https://leetcode.com/graphql", json={"query": query}, timeout=5.0)
                data = res.json()
                if "data" in data and "topTwoContests" in data["data"]:
                     for c in data["data"]["topTwoContests"]:
                         # Check if future
                         if c["startTime"] > now:
                             contests.append({
                                "id": f"lc-{c['titleSlug']}",
                                "name": c["title"],
                                "platform": "LeetCode",
                                "start_time": c["startTime"],
                                "duration": 5400, # 1 hr 30 mins standard usually
                                "url": f"https://leetcode.com/contest/{c['titleSlug']}"
                             })
        except Exception as e:
             print(f"LC Contest Error: {e}")

        # 3. AtCoder (Kenkoooo)
        try:
             async with httpx.AsyncClient() as client:
                res = await client.get("https://kenkoooo.com/atcoder/resources/contests.json", timeout=5.0)
                if res.status_code == 200:
                    data = res.json()
                    for c in data:
                        start = c["start_epoch_second"]
                        if start > now:
                            contests.append({
                                "id": c["id"],
                                "name": c["title"],
                                "platform": "AtCoder",
                                "start_time": start,
                                "duration": c["duration_second"],
                                "url": f"https://atcoder.jp/contests/{c['id']}"
                            })
        except Exception as e:
             print(f"AtCoder Contest Error: {e}")

        # 4. CodeChef (Mock/Scrape - API is hard, mocking scheduled for now or skipping)
        # CodeChef usually has Starters every Wednesday at 8PM IST.
        # We can try to fetch from a public calendar proxy if available, but for now let's skip to keep it reliable.
        # Or simpler:
        try:
            # CodeChefs "upcoming" api often accessible via:
            async with httpx.AsyncClient() as client:
                # This is a common public endpoint for some tools, or we check main site.
                # Actually, clist is best but we avoid auth.
                # Let's try a direct scrape of a known json if exists? No.
                # We will omit CodeChef for this MVP step unless we find a stable unchecked endpoint.
                pass
        except:
            pass

        # Sort by start time
        contests.sort(key=lambda x: x["start_time"])
        return contests[:10] # Return top 10
