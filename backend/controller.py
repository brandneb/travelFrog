from aiohttp import web
from backend.weather import get_weather


async def bene_endpoint(request: web.Request):
    # magic
    return web.json_response(text=get_activity_weather())


def setup_routes(app):
    app.router.add_get('/weather', bene_endpoint)
