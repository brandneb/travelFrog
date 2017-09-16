import aiohttp
import asyncio

from backend.settings import settings

API_KEY = settings['bluemix_api_key']


_weather = {}
_activity_weather = {}

_grid_top_left = settings['weather_top_left']
_grid_bot_right = settings['weather_bottom_right']
_grid_dim = settings['weather_grid_dimensions']
_grid_cell_width = (_grid_top_left[0] - _grid_bot_right[0]) / _grid_dim[0]
_grid_cell_height = (_grid_top_left[1] - _grid_bot_right[1]) / _grid_dim[1]


def _build_request_url(lat, long) -> str:
    return f"https://api.weather.com/v1/geocode/{lat}/{long}/forecast/daily/5day.json?apiKey={API_KEY}&units=e"


def _grid_to_coords(row, col):
    return _grid_top_left[0] + row * _grid_cell_height, _grid_top_left[1] + col * _grid_cell_width


async def _get_weather_at(session, lat, long):
    async with session.get(_build_request_url(lat, long)) as resp:
        return await resp.text()


async def _extract_activity_weather():
    pass


async def _get_weather(session):
    global _weather
    _weather = dict()
    print("refreshing weather cache")
    for row in range(_grid_dim[0]):
        print(f"requesting grid row {row}")
        requests = []
        for col in range(_grid_dim[1]):
            requests.append(_get_weather_at(session, *_grid_to_coords(row, col)))
        await asyncio.gather(*requests)
    print("done refreshing weather cache")


async def run_weather_cache():
    async with aiohttp.ClientSession() as session:
        while asyncio.get_event_loop().is_running():
            await _get_weather(session)
            await _extract_activity_weather()
            await asyncio.sleep(settings['weather_refresh_interval_s'])


def get_activity_weather():
    return _activity_weather
