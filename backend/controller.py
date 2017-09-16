import asyncio

from pprint import pprint, pformat

from aiohttp import web

import airports
import skyscanner


async def destinations(request: web.Request):
    params = request.rel_url.query
    print(f'URL params:\n{pformat(params)}')
    lon = params['lon']
    lat = params['lat']

    nearest_airport = airports.get_nearest_airport(lon, lat)
    print(f'Nearest airport: {nearest_airport}')

    cheapest_flight_destinations = await skyscanner.get_destinations(nearest_airport, 'Europe', 20)
    flight_destinations_coords = []
    for destination in cheapest_flight_destinations:
        coords = airports.get_airport_coords(destination['destination']['IataCode'])
        name = destination['destination']['CityName']
        price = destination['price']
        # TODO get URL
        flight_destinations_coords.append({
            'long': coords[0],
            'lat': coords[1],
            'name': name,
            'href': '',
            'price': price
        })

    # TODO get weather information

    pprint(flight_destinations_coords)

    return web.json_response(text=str(flight_destinations_coords))


def setup_routes(app):
    app.router.add_get('/destinations', destinations)


print(airports.get_nearest_airport(47.398261, 8.512857))
