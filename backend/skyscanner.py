from pprint import pprint

import aiohttp
import asyncio
import json

import itertools

from backend.settings import settings

API_KEY = settings['skyscanner_api_key']

ROUTES_URL = "http://partners.api.skyscanner.net/apiservices/browseroutes/v1.0/GE/EUR/EN/{0}/{1}/anytime/anytime?apiKey={2}"
SUGGEST_URL = "http://partners.api.skyscanner.net/apiservices/autosuggest/v1.0/GE/EUR/EN/?query={0}&apiKey={1}"
REFERRAL_URL = "http://partners.api.skyscanner.net/apiservices/referral/v1.0/GE/EUR/EN/{0}/{1}/2017-09-22/2017-09-24?apiKey={2}"

with open('continent_countries_mapping.json') as data_file:
    CONTINENTS_COUNTRIES_MAP = json.load(data_file)


async def get_url(url, session):
    async with session.get(url) as resp:
        return await resp.json()

async def _get_cheapest_places_from_place_to_countries(from_city, to_countries, num_places):
    urls = map(lambda country: ROUTES_URL.format(from_city, country, API_KEY), to_countries)

    async with aiohttp.ClientSession() as session:
        responses = []
        for url in urls:
            responses.append(get_url(url, session))
        responses = await asyncio.gather(*responses)
        cheapest_places_per_country = [_parse_routes_for_cheapest_destinations(response, num_places) for response in responses]
        cheapest_places = list(itertools.chain.from_iterable(cheapest_places_per_country))
        cheapest_places.sort(key=lambda x: x['price'])
        cheapest_places = cheapest_places[:num_places]
        return cheapest_places


async def _get_cheapest_places_from_place_to_country(from_city, to_country, num_places):
    url = ROUTES_URL.format(from_city, to_country, API_KEY)
    async with aiohttp.ClientSession() as session:
        async with session.get(url) as resp:
            response_dict = await resp.json()
            return _parse_routes_for_cheapest_destinations(response_dict, num_places)


async def _suggest_id(query):
    url = SUGGEST_URL.format(query, API_KEY)
    async with aiohttp.ClientSession() as session:
        async with session.get(url) as resp:
            print(resp.status)
            response_dict = await resp.json()
            print(response_dict)
            return response_dict['Places'][0]['PlaceId']



def _parse_routes_for_cheapest_destinations(route_results, num_results):
    if 'ValidationErrors' in route_results:
        return []
    cheapest_places = []
    all_places = route_results['Places']
    all_routes = [route for route in route_results['Routes'] if 'Price' in route]
    all_routes.sort(key=lambda route: route['Price'])
    all_routes = all_routes[:num_results]

    for route in all_routes:
        destination = _place_for_id(route['DestinationId'], all_places)
        cheapest_places.append({'destination': destination, 'price': route['Price']})

    return cheapest_places

def _place_for_id(destination_id, all_places):
    for place in all_places:
        if destination_id == place['PlaceId']:
            return place


async def get_destinations(from_city, to, num_destinations):
    from_id = await _suggest_id(from_city)

    if to.lower() in CONTINENTS_COUNTRIES_MAP:
        to_countries = CONTINENTS_COUNTRIES_MAP[to.lower()]
        return await _get_cheapest_places_from_place_to_countries(from_id, to_countries, num_destinations)
    else:
        to_id = await _suggest_id(to)
        return await _get_cheapest_places_from_place_to_country(from_id, to_id, num_destinations)


if __name__ == '__main__':
    loop = asyncio.get_event_loop()

    cheapest_places = loop.run_until_complete(get_destinations("Zurich", "Europe", 10))
    pprint(cheapest_places)
