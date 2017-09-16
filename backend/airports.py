import os
import json
from math import radians, cos, sin, asin, sqrt

_data_dir = os.path.dirname(os.path.realpath(__file__)) + "/data"
_airport_coords = dict()

with open(_data_dir + "/airports.json") as airport_file:
    _airports_json = json.load(airport_file)
    for airport in _airports_json:
        if "lat" not in airport or "lon" not in airport or "iata" not in airport:
            continue
        coords = (airport["lon"], airport["lat"])
        iata = airport["iata"]
        _airport_coords[iata] = coords


def get_airport_coords(iata_code: str):
    return _airport_coords[iata_code]


def get_nearest_airport(longitude, latitude):
    nearest_iata = None
    nearest_distance = None
    for iata, coords in _airport_coords.items():
        d = haversine(longitude, latitude, coords[0], coords[1])
        if not nearest_distance or d < nearest_distance:
            nearest_iata = iata
            nearest_distance = d

    return nearest_iata


# https://stackoverflow.com/a/15737218
def haversine(lon1, lat1, lon2, lat2):
    """
    Calculate the great circle distance between two points
    on the earth (specified in decimal degrees)
    """
    # convert decimal degrees to radians
    lon1, lat1, lon2, lat2 = map(radians, [lon1, lat1, lon2, lat2])
    # haversine formula
    dlon = lon2 - lon1
    dlat = lat2 - lat1
    a = sin(dlat / 2) ** 2 + cos(lat1) * cos(lat2) * sin(dlon / 2) ** 2
    c = 2 * asin(sqrt(a))
    km = 6367 * c
    return km
