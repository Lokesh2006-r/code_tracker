import httpx
from bs4 import BeautifulSoup
import asyncio
import re

async def test():
    url = "https://www.codechef.com/users/gennady.korotkevich"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }
    async with httpx.AsyncClient() as client:
        response = await client.get(url, headers=headers)
        soup = BeautifulSoup(response.content, "html.parser")
        
        text = soup.get_text()
        
        # Regex for total solved
        # Usually "Total Problems Solved: 432"
        match_solved = re.search(r"Total Problems Solved:?\s*(\d+)", text, re.IGNORECASE)
        if match_solved:
            print("REGEX SOLVED:", match_solved.group(1))
        else:
            print("REGEX SOLVED: Not found")

        # Regex for contests
        match_contest = re.search(r"Contests Participated:?\s*(\d+)", text, re.IGNORECASE)
        # Or "No. of Contests Participated"
        if not match_contest:
             match_contest = re.search(r"No\. of Contests Participated\s*(\d+)", text, re.IGNORECASE) # Removing colon matching if needed?
        
        # The previous output showed "No. of Contests Participated: 102"
        # Let's try to match that
        
        if match_contest:
            print("REGEX CONTEST:", match_contest.group(1))
        else:
            # Try finding the specific element from previous run
            # "No. of Contests Participated" content
            tags = soup.find_all(string=re.compile("Contests Participated"))
            for t in tags:
                print("TAG Found:", t.strip())

asyncio.run(test())
