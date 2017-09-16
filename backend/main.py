from aiohttp import web
from backend.routes import setup_routes
import asyncio
from backend.weather import run_weather_cache

app = web.Application()
setup_routes(app)
asyncio.ensure_future(run_weather_cache())

web.run_app(app, host='127.0.0.1', port=8080)