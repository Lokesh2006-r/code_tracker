import httpx
import asyncio
import re

async def test_codeforces_scrape(username="tourist"):
    async with httpx.AsyncClient() as client:
        # CF "Problems solved" is often: <div class="_UserActivityFrame_counterValue">X</div>
        # But this is inside "Yearly" stats? No, "All time" stats.
        url = f"https://codeforces.com/profile/{username}"
        res = await client.get(url, follow_redirects=True)
        text = res.text
        
        # Regex search for the number followed by "problems solved"
        # It might be: 6474 <span ...>problems solved</span>
        # Or: 6474 problems solved
        matches = re.search(r"(\d+)\s+(?:<[^>]+>)?problems solved", text, re.IGNORECASE)
        if matches:
            print(f"CF Scrape: {matches.group(1)}")
        else:
            print("CF Scrape: Not found via regex")

async def test_hackerrank_api(username="tourist"):
    async with httpx.AsyncClient() as client:
        headers = {"User-Agent": "Mozilla/5.0"}
        # Try finding a total count
        # Maybe badges?
        # https://www.hackerrank.com/rest/hackers/{username}/badges
        # https://www.hackerrank.com/rest/hackers/{username}/scores_histogram -> gives list of scores per track
        
        # Checking scores_histogram
        url = f"https://www.hackerrank.com/rest/hackers/{username}/scores_histogram"
        res = await client.get(url, headers=headers)
        if res.status_code == 200:
            data = res.json()
            # print(data) 
            # It's usually like: {'algorithms': {'solved': 100, ...}, 'data-structures': ...}
            # Or list of models?
            # Let's inspect known fields
            total_solved = 0
            if isinstance(data, dict):
                 # Sum up 'solved' keys?
                 pass
            print(f"HR Histogram Keys: {data.keys() if isinstance(data, dict) else 'List'}")
            
        # Try getting badges again
        url2 = f"https://www.hackerrank.com/rest/hackers/{username}/badges"
        res2 = await client.get(url2, headers=headers)
        if res2.status_code == 200:
             print(f"HR Badges: {len(res2.json()['models'])}")

async def run():
    print("--- CF Scrape ---")
    await test_codeforces_scrape("tourist")
    print("\n--- HR API ---")
    await test_hackerrank_api("tourist")

if __name__ == "__main__":
    asyncio.run(run())
