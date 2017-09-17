import configparser
from aiohttp import web
from controller import setup_routes
import asyncio
from weather import run_weather_cache

app = web.Application()
setup_routes(app)
asyncio.ensure_future(run_weather_cache())

config = configparser.ConfigParser()
config.read('settings.ini')
port = int(config['DEFAULT']['Port']) if 'Port' in config['DEFAULT'] else 8080

web.run_app(app, host='0.0.0.0', port=port)
