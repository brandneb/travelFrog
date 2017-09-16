import aiohttp
import asyncio

from backend.settings import settings

API_KEY = settings['bluemix_api_key']


__weather = {}
__activity_weather = {}

__grid_top_left = settings['weather_top_left']
__grid_bot_right = settings['weather_bottom_right']
__grid_dim = settings['weather_grid_dimensions']
__grid_cell_width = (__grid_top_left[0] - __grid_bot_right[0]) / __grid_dim[0]
__grid_cell_height = (__grid_top_left[1] - __grid_bot_right[1]) / __grid_dim[1]


def __build_request_url(lat, long) -> str:
    return f"https://api.weather.com/v1/geocode/{lat}/{long}/forecast/daily/5day.json?apiKey={API_KEY}&units=e"


def __grid_to_coords(x, y):
    return __grid_top_left[0] + x * __grid_cell_width, __grid_top_left[1] + y * __grid_cell_height


async def __get_weather_at(session, lat, long):
    async with session.get(__build_request_url(lat, long)) as resp:
        return await resp.text()


async def __extract_activity_weather():
    pass


async def __get_weather(session):
    global __weather
    __weather = dict()
    print("refreshing weather cache")
    for y in range(__grid_dim[1]):
        print(f"requesting grid row {y}")
        requests = []
        for x in range(__grid_dim[0]):
            requests.append(__get_weather_at(session, *__grid_to_coords(x, y)))
        await asyncio.gather(*requests)
    print("done refreshing weather cache")


async def run_weather_cache():
    async with aiohttp.ClientSession() as session:
        while asyncio.get_event_loop().is_running():
            await __get_weather(session)
            await __extract_activity_weather()
            await asyncio.sleep(settings['weather_refresh_interval_s'])


def get_activity_weather():
    return __activity_weather
