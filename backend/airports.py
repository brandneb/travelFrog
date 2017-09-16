import os
import json
import kdtree

_data_dir = os.path.dirname(os.path.realpath(__file__)) + "/data"
_coords_by_iata = dict()
_nearest_airport_index = kdtree.create(dimensions=2)


class IataCoord(object):
    def __init__(self, coords, iata):
        self.coords = coords
        self.iata = iata

    def __len__(self):
        return len(self.coords)

    def __getitem__(self, i):
        return self.coords[i]


with open(_data_dir + "/airports.json") as airport_file:
    _airports_json = json.load(airport_file)
    for airport in _airports_json:
        if "lat" not in airport or "lon" not in airport or "iata" not in airport:
            continue
        coords = (float(airport["lat"]), float(airport["lon"]))
        iata = airport["iata"]
        _coords_by_iata[iata] = coords
        _nearest_airport_index.add(IataCoord(coords, iata))


def get_airport_coords(iata_code: str):
    return _coords_by_iata[iata_code]


def get_nearest_airport(lat, lon) -> IataCoord:
    node = _nearest_airport_index.search_nn((lat, lon))[0]
    return node.data
