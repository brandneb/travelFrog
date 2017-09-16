import asyncio
from aiohttp import web
import airports
import skyscanner
from weather import get_weather
import statistics

from pprint import pprint, pformat


async def destinations(request: web.Request):
    params = request.rel_url.query
    print(f'URL params:\n{pformat(params)}')
    lat = float(params['lat'])
    lon = float(params['lon'])

    nearest_airport = airports.get_nearest_airport(lat, lon)
    print(f'Nearest airport: {nearest_airport.iata}')

    cheapest_flight_destinations = await skyscanner.get_destinations(nearest_airport.iata, 'Europe', 20)

    print(f'found {len(cheapest_flight_destinations)} flight destinations')

    weather_requests = []
    coords_list = []
    for destination in cheapest_flight_destinations:
        coords = airports.get_airport_coords(destination['destination']['IataCode'])
        coords_list.append(coords)
        weather_requests.append(get_weather(*coords))
    weather_responses = await asyncio.gather(*weather_requests)


    result_json = []
    for flight, weather, coords in zip(cheapest_flight_destinations, weather_responses, coords_list):
        # pprint(weather)
        days = [i["day"] for i in weather["forecasts"] if "day" in i]

        day_temps = [d["temp"] for d in days]
        feels_like = [d["wc"] for d in days]
        wind = [d["wspd"] for d in days]
        phrase = [d["phrase_32char"] for d in days]

        entry = {
            'lat': coords[0],
            'lon': coords[1],
            'name': flight['destination']['CityName'],
            "avg_temperature": statistics.mean(day_temps),
            "temperature": day_temps,
            "feelslike": feels_like,
            "wind": wind,
            "forecast": phrase,
            "activity": "a beach day",
            "name": destination['destination']['CityName'],
            "href": destination['booking_url'],
            "price": destination['price']
        }
        result_json.append(entry)

    return web.json_response(result_json)


def setup_routes(app):
    app.router.add_get('/destinations', destinations)

