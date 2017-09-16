import os
import json

_data_dir = os.path.dirname(os.path.realpath(__file__)) + "/data"
_airport_coords = dict()

with open(_data_dir + "/airports.json") as airport_file:
    _airports_json = json.load(airport_file)
    for airport in _airports_json:
        if "lat" not in airport or "lon" not in airport or "iata" not in airport:
            continue
        coords = (airport["lat"], airport["lon"])
        iata = airport["iata"]
        _airport_coords[iata] = coords


def get_airport_coords(iata_code: str):
    return _airport_coords[iata_code]