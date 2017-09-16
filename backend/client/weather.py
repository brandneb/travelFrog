import aiohttp

from backend.client.settings import settings

API_KEY = settings['bluemix_api_key']
# http://api.weather.com/v1/geocode/34.063/-84.217/forecast/intraday/5day.json?apiKey=

async with aiohttp.ClientSession() as session:
    async with session.get('https://api.github.com/events') as resp:
        print(resp.status)
        print(await resp.text())