from aiohttp import web
from backend.weather import get_weather


async def weather_endpoint(request):
    return web.json_response(text=get_weather())


def setup_routes(app):
    app.router.add_get('/weather', weather_endpoint)
