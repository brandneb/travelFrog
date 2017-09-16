import asyncio

from pprint import pprint, pformat

from aiohttp import web

import airports
from skyscanner import get_destinations


async def bene_endpoint(request: web.Request):
    # magic
    params = request.rel_url.query
    print(f'URL params:\n{pformat(params)}')
    if 'longitude' not in params or 'latitude' not in params:
        longitude = float('8.564572')
        latitude = float('47.451542')
    else:
        longitude = params['longitude']
        latitude = params['latitude']

    nearest_airport = airports.get_nearest_airport(longitude, latitude)
    print(f'Nearest airport: {nearest_airport}')

    cheapest_flight_destinations = await get_destinations(nearest_airport, 'Europe', 20)
    flight_destinations_coords = []
    for destination in cheapest_flight_destinations:
        coords = airports.get_airport_coords(destination['destination']['IataCode'])
        name = destination['destination']['CityName']
        price = destination['price']
        # TODO get URL
        flight_destinations_coords.append({'long': coords[0], 'lat': coords[1], 'name': name, 'href': '', 'price': price})

    # TODO get weather information

    pprint(flight_destinations_coords)

    return web.json_response(text=str(flight_destinations_coords))


def setup_routes(app):
    app.router.add_get('/weather', bene_endpoint)
