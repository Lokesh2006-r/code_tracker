import asyncio
from services.platforms.hackerrank import HackerRankService

async def main():
    print("Testing HackerRank Service...")
    res = await HackerRankService.get_user_profile("tourist")
    print(f"Result: {res}")

if __name__ == "__main__":
    asyncio.run(main())
