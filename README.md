# TravelFrog

![TravelFrog Logo](frontend/assets/frog.png)

TravelFrog recommends you your best available upcoming trips, depending on the weather conditions and your travel interests.

You like to go surfing next weekend? 
TravelFrog gives you hints for possible places to rock your surfboard only if they got good wind conditions.
Wanna go hiking without getting wet feet?
No problem, TravelFrog got you!
Also no matter if you want to go skiing or just do a great city trip, within seconds TravelFrog will show you the perfect destinations and direct you to booking a flight?

[TRY IT](http://169.51.12.70:31839)!
## Screenshots

## Technical Details
### Backend
The server and the client functionality is based on [aiohttp](http://aiohttp.readthedocs.io).
We provide an interface for the frontend to query different vacation destinations based on an origin destination.
The weather information that is needed to rate and select destinations is queried from the [IBM Bluemix Weather Company API](https://console.bluemix.net/docs/services/Weather/index.html).
The [*Skyscanner* API](http://business.skyscanner.net) provides us with flight information.

### Frontend and Design
The Frontend design is based on [Materialized](http://materializecss.com) and [jQuery](http://jquery.com) as a JavaScript library is used.
In order to represent the map view, we relied on the [Leaflet](http://leafletjs.com).

We put a lot of emphasis on our own design:
The TravelFrog builds an emotional bridge to our customer and we used TravelFrog throughout the product.
With the usage of our own assets, TravelFrog shows the traveler the activities and the weather conditions at specific destinations.

![Surfing Frog](frontend/assets/surfing_frog_100.png) ![Culture Frog](frontend/assets/culture_frog_100.png) ![Rain Frog](frontend/assets/rain_frog_100.png)

### Hosting
In order to automatically scale the frontend, as well as the backend, we hosted TravelFrog on [IBM Bluemix](https://console.bluemix.net).
You can try it [here](http://169.51.12.70:31839). 
