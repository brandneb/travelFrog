from pprint import pprint

import aiohttp
import asyncio
import json

import itertools

import configparser

config = configparser.ConfigParser()
config.read('settings.ini')
API_KEY = config['DEFAULT']['SkyscannerAPIKey']

ROUTES_URL = "http://partners.api.skyscanner.net/apiservices/browseroutes/v1.0/CH/CHF/EN/{0}/{1}/anytime/anytime?apiKey={2}"
DATES_URL = "http://partners.api.skyscanner.net/apiservices/browsedates/v1.0/CH/CHF/EN/{0}/{1}/anytime/anytime?apiKey={2}"
SUGGEST_URL = "http://partners.api.skyscanner.net/apiservices/autosuggest/v1.0/CH/CHF/EN/?query={0}&apiKey={1}"
REFERRAL_URL = "http://partners.api.skyscanner.net/apiservices/referral/v1.0/CH/CHF/EN/{0}/{1}/2017-09-22/2017-09-24?apiKey={2}"
BOOKING_URL = "https://www.skyscanner.ch/transport/flights/{0}/{1}/170922/170924"

with open('data/continent_countries_mapping.json') as data_file:
    CONTINENTS_COUNTRIES_MAP = json.load(data_file)


async def get_url_json(url, session):
    async with session.get(url) as resp:
        return await resp.json()


async def _get_cheapest_places_from_place_to_countries(from_city, to_countries, num_places, with_url):
    urls = map(lambda country: ROUTES_URL.format(from_city, country, API_KEY), to_countries)

    async with aiohttp.ClientSession() as session:
        responses = []
        for url in urls:
            responses.append(get_url_json(url, session))
        responses = await asyncio.gather(*responses)
        cheapest_places_per_country = [await _parse_routes_for_cheapest_destinations(response, num_places, with_url)
                                       for response in responses]
        cheapest_places = list(itertools.chain.from_iterable(cheapest_places_per_country))
        cheapest_places.sort(key=lambda x: x['price'])
        cheapest_places = cheapest_places[:num_places]
        return cheapest_places


async def _get_cheapest_places_from_place_to_country(from_city, to_country, num_places, with_url):
    url = ROUTES_URL.format(from_city, to_country, API_KEY)
    async with aiohttp.ClientSession() as session:
        async with session.get(url) as resp:
            response_dict = await resp.json()
            return _parse_routes_for_cheapest_destinations(response_dict, num_places, with_url)


async def _get_flight_information_for_destinations(from_city, to_cities, with_url):
    urls = map(lambda city: DATES_URL.format(from_city, city.iata, API_KEY), to_cities)

    async with aiohttp.ClientSession() as session:
        responses = []
        for url in urls:
            responses.append(get_url_json(url, session))
        responses = await asyncio.gather(*responses)
        places = [_parse_dates(response, with_url) for response in responses]
        return places


async def _suggest_id(query):
    url = SUGGEST_URL.format(query, API_KEY)
    async with aiohttp.ClientSession() as session:
        async with session.get(url) as resp:
            response_dict = await resp.json()
            return response_dict['Places'][0]['PlaceId']


async def _parse_routes_for_cheapest_destinations(route_results, num_results, with_url):
    if 'ValidationErrors' in route_results:
        return []
    cheapest_places = []
    all_places = route_results['Places']
    all_routes = [route for route in route_results['Routes'] if 'Price' in route]
    all_routes.sort(key=lambda route: route['Price'])
    all_routes = all_routes[:num_results]

    for route in all_routes:
        destination = _place_for_id(route['DestinationId'], all_places)
        if with_url:
            origin = _place_for_id(route['OriginId'], all_places)
            origin_iata = origin['IataCode']
            destination_iata = destination['IataCode']
            booking_url = BOOKING_URL.format(origin_iata, destination_iata)
            cheapest_places.append({'destination': destination, 'price': route['Price'], 'booking_url': booking_url})
        else:
            cheapest_places.append({'destination': destination, 'price': route['Price']})

    return cheapest_places


def _parse_dates(dates_result, with_url):
    if 'ValidationErrors' in dates_result or len(dates_result['Quotes']) == 0:
        return None
    quote = dates_result['Quotes'][0]
    all_places = dates_result['Places']

    destination_id = quote['OutboundLeg']['DestinationId']
    destination = _place_for_id(destination_id, all_places)
    price = quote['MinPrice']
    if with_url:
        origin_id = quote['OutboundLeg']['OriginId']
        origin = _place_for_id(origin_id, all_places)
        origin_iata = origin['IataCode']
        destination_iata = destination['IataCode']
        booking_url = BOOKING_URL.format(origin_iata, destination_iata)
        return {'destination': destination, 'price': price, 'booking_url': booking_url}
    else:
        return {'destination': destination, 'price': price}


def _place_for_id(destination_id, all_places):
    for place in all_places:
        if destination_id == place['PlaceId']:
            return place


async def _get_referral_url(from_id, to_id):
    url = REFERRAL_URL.format(from_id, to_id, API_KEY)
    async with aiohttp.ClientSession() as session:
        async with session.get(url, allow_redirects=False) as resp:
            return resp.headers['Location']


async def get_destinations(from_city, to, num_destinations, with_url=True):
    # TODO maybe not needed
    from_id = await _suggest_id(from_city)

    if to.lower() in CONTINENTS_COUNTRIES_MAP:
        to_countries = CONTINENTS_COUNTRIES_MAP[to.lower()]
        return await _get_cheapest_places_from_place_to_countries(from_id, to_countries, num_destinations, with_url)
    else:
        to_id = await _suggest_id(to)
        return await _get_cheapest_places_from_place_to_country(from_id, to_id, num_destinations, with_url)


async def get_flight_information_for_destinations(from_city, to_cities, with_url=True):
    return await _get_flight_information_for_destinations(from_city, to_cities, with_url)


async def get_booking_url(from_city, to_city):
    from_id = await _suggest_id(from_city)
    to_id = await _suggest_id(to_city)

    return await _get_referral_url(from_id, to_id)


if __name__ == '__main__':
    loop = asyncio.get_event_loop()

    booking_url = loop.run_until_complete(get_booking_url("Zurich", "London"))
    print(booking_url)
    cheapest_places = loop.run_until_complete(get_destinations("Zurich", "Europe", 10))
    pprint(cheapest_places)
