from .platforms.leetcode import LeetCodeService
from .platforms.codeforces import CodeforcesService
from .platforms.codechef import CodeChefService
from .platforms.hackerrank import HackerRankService
import asyncio

class PlatformAggregator:
    @staticmethod
    async def verify_profile(handles: dict):
        results = {}
        tasks = []
        platforms = []

        if handles.get("leetcode"):
            tasks.append(LeetCodeService.get_user_profile(handles["leetcode"]))
            platforms.append("leetcode")
            
        if handles.get("codeforces"):
            tasks.append(CodeforcesService.get_user_profile(handles["codeforces"]))
            platforms.append("codeforces")

        if handles.get("codechef"):
            tasks.append(CodeChefService.get_user_profile(handles["codechef"]))
            platforms.append("codechef")
            
        if handles.get("hackerrank"):
            tasks.append(HackerRankService.get_user_profile(handles["hackerrank"]))
            platforms.append("hackerrank")
            
        if not tasks:
            return {}
            
        resolved = await asyncio.gather(*tasks, return_exceptions=True)
        
        for i, res in enumerate(resolved):
            if isinstance(res, Exception):
                print(f"Error in platform {platforms[i]}: {res}")
                continue
            if res:
                results[platforms[i]] = res
        
        return results
