import asyncio
import json
from aiohttp import web
import airports
import skyscanner
from weather import get_weather
import statistics

from pprint import pformat

with open('data/destinations.json') as data_file:
    saved_destinations = json.load(data_file)
    DESTINATIONS = []
    for type, type_destinations in saved_destinations.items():
        for destination in type_destinations:
            destination['type'] = type
            DESTINATIONS.append(destination)


def build_json_entry(weather, coords, name, url, price, activity):
    days = [i["day"] for i in weather["forecasts"] if "day" in i]

    day_temps = [d["temp"] for d in days]
    feels_like = [d["wc"] for d in days]
    wind = [d["wspd"] for d in days]
    phrase = [d["phrase_32char"] for d in days]
    icon_code = [d["icon_code"] for d in days]

    entry = {
        'lat': coords[0],
        'lon': coords[1],
        "avg_temperature": statistics.mean(day_temps),
        "temperature": day_temps,
        "feelslike": feels_like,
        "wind": wind,
        "icon_code": icon_code,
        "forecast": phrase,
        "activity": activity,
        "name": name,
        "href": url,
        "price": price
    }
    return entry


async def destinations(request: web.Request):
    print("got request")
    params = request.rel_url.query
    print(f'URL params:\n{pformat(params)}')
    lat = float(params['lat'])
    lon = float(params['lon'])

    nearest_airport = airports.get_nearest_airport(lat, lon)
    print(f'Nearest airport: {nearest_airport.iata}')

    print('Checking cheapest flights...')

    cheapest_flight_destinations = await skyscanner.get_destinations(nearest_airport.iata, 'Europe', 20)

    print(f'found {len(cheapest_flight_destinations)} flight destinations')

    print('Getting weather information...')

    weather_requests = []
    coords_list = []
    for destination in cheapest_flight_destinations:
        coords = airports.get_airport_coords(destination['destination']['IataCode'])
        coords_list.append(coords)
        weather_requests.append(get_weather(*coords))
    weather_responses = await asyncio.gather(*weather_requests)

    result_json = []
    for flight, weather, coords in zip(cheapest_flight_destinations, weather_responses, coords_list):
        entry = build_json_entry(weather, coords, name=flight['destination']['CityName'], url=flight['booking_url'],
                                 price=flight['price'], activity='culture')
        result_json.append(entry)

    print('Handle different type destinations...')
    nearest_destination_airports = [airports.get_nearest_airport(destination['latitude'], destination['longitude'])
                                    for destination in DESTINATIONS]

    print('Getting weather information...')
    weather_requests = []
    coords_list = []
    for destination in DESTINATIONS:
        coords = (destination['latitude'], destination['longitude'])
        coords_list.append(coords)
        weather_requests.append(get_weather(*coords))

    weather_responses = await asyncio.gather(*weather_requests)

    other_flights = await skyscanner.get_flight_information_for_destinations(nearest_airport.iata,
                                                                             nearest_destination_airports)

    for destination, flight, weather, coords in zip(DESTINATIONS, other_flights, weather_responses, coords_list):
        if flight:
            price = flight['price']
            url = flight['booking_url']
        else:
            price = None
            url = None
        entry = build_json_entry(weather, coords, name=destination['name'], url=url, price=price,
                                 activity=destination['type'])
        result_json.append(entry)

    print('Done')
    return web.json_response(result_json)


def setup_routes(app):
    app.router.add_get('/destinations', destinations)
