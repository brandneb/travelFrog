import aiohttp
import asyncio

from backend.settings import settings

API_KEY = settings['bluemix_api_key']

_weather = {}


def _chunks(list, chunk_len):
    """Yield successive chun_len-sized chunks from list."""
    for i in range(0, len(list), chunk_len):
        yield list[i:i + chunk_len]


def _build_request_url(lat, lon) -> str:
    return f"https://api.weather.com/v1/geocode/{lat}/{lon}/forecast/daily/5day.json?apiKey={API_KEY}&units=e"


async def _get_weather_at(lat, lon, session):
    async with session.get(_build_request_url(lat, lon)) as resp:
        return await resp.json()


async def _init_location(lat, lon):
    global _weather
    async with aiohttp.ClientSession() as session:
        _weather.append(await _get_weather_at(lat, lon, session))


async def _get_weather_all_locations(session):
    global _weather
    _weather = []
    print("refreshing weather cache")
    for chunk in _chunks(_locations, settings['weather_parallel_requests']):
        requests = map(lambda loc: _get_weather_at(loc.lat, loc.lon, session), chunk)
        _weather.extend(await asyncio.gather(*requests))
    print("done refreshing weather cache")


async def run_weather_cache():
    async with aiohttp.ClientSession() as session:
        while asyncio.get_event_loop().is_running():
            await _get_weather_all_locations(session)
            await asyncio.sleep(settings['weather_refresh_interval_s'])


def get_weather(lat, lon):
    if (lat, lon) in _weather:
        return _weather[(lat, lon)]

    _locations[(lat, lon)] = name
    asyncio.ensure_future(_init_location(lat, lon))

