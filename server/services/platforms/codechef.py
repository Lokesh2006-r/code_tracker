import re
import httpx
from bs4 import BeautifulSoup

class CodeChefService:
    @staticmethod
    async def get_user_profile(username: str):
        url = f"https://www.codechef.com/users/{username}"
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(url, headers=headers, timeout=15.0)
                if response.status_code != 200:
                    return None
                
                soup = BeautifulSoup(response.content, "html.parser")
                text_content = soup.get_text()

                # Basic Rating
                rating_header = soup.find("div", class_="rating-header")
                rating_val = 0
                if rating_header:
                    rating_tag = rating_header.find("div", class_="rating-number")
                    if rating_tag:
                         rating_val = int(rating_tag.text.strip())
                
                # Stars
                stars = 0
                star_tag = soup.find("span", class_="rating")
                if star_tag:
                    if "★" in star_tag.text:
                        stars_text = star_tag.text.replace("★", "").strip()
                        if stars_text.isdigit():
                            stars = int(stars_text)
                
                # Global Rank
                global_rank = 0
                ranks = soup.find("div", class_="rating-ranks")
                if ranks:
                    global_rank_tag = ranks.find("a", href=lambda x: x and "global" in x)
                    if global_rank_tag:
                        global_rank = int(global_rank_tag.text.strip())

                # Max Rating
                max_rating = 0
                max_rating_header = soup.find("div", class_="rating-header")
                if max_rating_header:
                    small_tag = max_rating_header.find("small")
                    if small_tag:
                         match_max = re.search(r"Highest Rating (\d+)", small_tag.text)
                         if match_max:
                             max_rating = int(match_max.group(1))

                # Country Rank
                country_rank = 0
                ranks = soup.find("div", class_="rating-ranks")
                if ranks:
                    country_rank_tag = ranks.find("a", href=lambda x: x and "country" in x)
                    if country_rank_tag:
                        country_rank = int(country_rank_tag.text.strip())

                # Division (Inferred from Rating if not explicitly found, but let's try scraping)
                # Div 1: 2000+, Div 2: 1600-1999, Div 3: <1600 (Approx rules, or scrape div tag)
                division = "N/A"
                if rating_val >= 2000:
                    division = "Div 1"
                elif rating_val >= 1600:
                    division = "Div 2"
                elif rating_val > 0:
                    division = "Div 3"
                elif rating_val == 0:
                     division = "Unrated"

                # Total Solved (Regex)
                solved = 0
                match_solved = re.search(r"Total Problems Solved:?\s*(\d+)", text_content, re.IGNORECASE)
                if match_solved:
                    solved = int(match_solved.group(1))

                # Contests Participated (Regex)
                contests = 0
                match_contest = re.search(r"No\.? of Contests Participated:?\s*(\d+)", text_content, re.IGNORECASE)
                if not match_contest:
                     match_contest = re.search(r"Contests Participated:?\s*(\d+)", text_content, re.IGNORECASE)
                if match_contest:
                    contests = int(match_contest.group(1))

                return {
                    "platform": "CodeChef",
                    "username": username,
                    "rating": rating_val,
                    "stars": stars,
                    "global_rank": global_rank,
                    "country_rank": country_rank,
                    "max_rating": max_rating,
                    "division": division,
                    "solved": solved,
                    "contests": contests
                }
            except Exception as e:
                print(f"Error fetching CodeChef for {username}: {e}")
                return None
