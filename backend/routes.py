from aiohttp import web
from backend.weather import get_activity_weather


async def activity_weather(request):
    return web.json_response(text=get_activity_weather())


def setup_routes(app):
    app.router.add_get('/weather', activity_weather)
