import asyncio
from aiohttp import web
import airports
import skyscanner
from weather import get_weather

from pprint import pprint, pformat


async def destinations(request: web.Request):
    params = request.rel_url.query
    print(f'URL params:\n{pformat(params)}')
    lon = params['lon']
    lat = params['lat']

    nearest_airport = airports.get_nearest_airport(lon, lat)
    print(f'Nearest airport: {nearest_airport}')

    cheapest_flight_destinations = await skyscanner.get_destinations(nearest_airport.iata, 'Europe', 20)

    weather_requests = []
    for destination in cheapest_flight_destinations:
        coords = airports.get_airport_coords(destination['destination']['IataCode'])
        weather_requests.append(get_weather(*coords))
    weather_responses = await asyncio.gather(*weather_requests)


    flight_destinations_coords = []
    for destination in cheapest_flight_destinations:
        coords = airports.get_airport_coords(destination['destination']['IataCode'])
        name = destination['destination']['CityName']
        price = destination['price']
        # TODO get URL
        flight_destinations_coords.append({
            'lat': coords[0],
            'lon': coords[1],
            'name': name,
            'href': '',
            'price': price
        })



    return web.json_response(flight_destinations_coords)


def setup_routes(app):
    app.router.add_get('/destinations', destinations)

