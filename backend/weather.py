import aiohttp
import asyncio
from itertools import islice

from backend.settings import settings

API_KEY = settings['bluemix_api_key']

_weather_map = {}


def _key_chunks(dict, chunk_size):
    it = iter(dict)
    for i in range(0, len(dict), chunk_size):
        yield [k for k in islice(it, chunk_size)]


def _build_request_url(lat, lon) -> str:
    return f"https://api.weather.com/v1/geocode/{lat}/{lon}/forecast/daily/5day.json?apiKey={API_KEY}&units=e"


async def _get_weather_at(lat, lon, session):
    async with session.get(_build_request_url(lat, lon)) as resp:
        return await resp.json()


async def _get_weather_map(session):
    global _weather_map
    print("refreshing weather cache")
    for chunk in _key_chunks(_weather_map, settings['weather_parallel_requests']):
        requests = map(lambda coord: _get_weather_at(coord[0], coord[1], session), chunk)
        weather_chunk = await asyncio.gather(*requests)
        for i, coord in enumerate(chunk):
            _weather_map[coord] = weather_chunk[i]
    print("done refreshing weather cache")


async def run_weather_cache():
    async with aiohttp.ClientSession() as session:
        while asyncio.get_event_loop().is_running():
            await _get_weather_map(session)
            await asyncio.sleep(settings['weather_refresh_interval_s'])


async def get_weather(lat, lon):
    if (lat, lon) in _weather_map:
        return _weather_map[(lat, lon)]

    async with aiohttp.ClientSession() as session:
        weather = _get_weather_at(lat, lon, session)
        _weather_map[(lat, lon)] = weather
        return weather
