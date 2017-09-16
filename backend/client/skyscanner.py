import aiohttp

from backend.client.settings import settings

API_KEY = settings['skyscanner_api_key']

ROUTES_URL = "http://partners.api.skyscanner.net/apiservices/browseroutes/v1.0/GE/EUR/EN/{0}/{1}/anytime/anytime?apiKey={2}"
SUGGEST_URL = "http://partners.api.skyscanner.net/apiservices/autosuggest/v1.0/GE/EUR/EN/?query={0}&apiKey={1}"
REFERRAL_URL = "http://partners.api.skyscanner.net/apiservices/referral/v1.0/GE/EUR/EN/{0}/{1}/2016-10-18/2016-10-25?apiKey={2}"

