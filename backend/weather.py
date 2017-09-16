import aiohttp
import asyncio

from backend.settings import settings

API_KEY = settings['bluemix_api_key']
# http://api.weather.com/v1/geocode/34.063/-84.217/forecast/intraday/5day.json?apiKey=

__weather = {}


def __build_request_url(lat, long) -> str:
    return f"https://api.weather.com/v1/geocode/{lat}/{long}/forecast/daily/5day.json?apiKey=626505b9091f4982a505b9091f798235&units=e"


async def run_weather_cache():
    global __weather
    async with aiohttp.ClientSession() as session:
        while True:
            print("getting weather")
            async with session.get(__build_request_url("34.063", "-83.217")) as resp:
                __weather = await resp.text()

            await asyncio.sleep(settings['weather_refresh_interval_s'])


def get_weather():
    return __weather
