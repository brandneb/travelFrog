var center = [11.568607, 48.125042];
var map = null;
var userMarker = null;

$(document).ready(function() {
    map = L.map('map').setView(center, 6);
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox.streets',
        accessToken: 'pk.eyJ1IjoiYnJhbmRuZXJiIiwiYSI6ImNpdTQzYWZqNjAwMjQyeXFqOWR2a2tnZ2MifQ.LrcRwH1Vm-JsYR1zBb0Q9Q'
    }).addTo(map);
});

function recenter() {
    console.log("recenter");
    map.panTo(center);

    if(userMarker == null) {
        var myIcon = L.icon({
            iconUrl: '/img/marker.svg',
            iconSize: [40, 60],
            iconAnchor: [20, 60],
            popupAnchor: [0, -60]
        });

        userMarker = L.marker(center, {icon: myIcon}).addTo(map);
    } else {
        userMarker.setLatLng(center);
    }
}

function activityTitle(spot) {
    var activity = spot.activity;
    var location = spot.name;

    var activityTitles = {
        'surfing': 'Go surfing around', 
        'beach': 'Enjoy the sunshine in', 
        'culture': 'Explore', 
        'camping': 'Set up a tent in', 
        'hiking': 'Hike around',
        'skiing': 'Ski down towards'
    }

    if(activity in activityTitles) {
        return activityTitles[activity] + ' ' + location;
    }

    return 'Visit ' + location;
}

var weatherSpots = [];

function refreshWeatherData() {
    $('.htmlmarker').remove();
    const html = `
    <div class="htmlmarker">
        <div class="condensed">
            <img class="frog" src="/assets/%image"/>
            <div class="info">
                <div class="temperature">%avgtemp</div>
                <div class="price">%price</div>
            </div>
        </div>
        <div class="detailed">
            <div class="toprow">
                <img class="frog big" src="/assets/%image"/>
                <div class="toprowdetails">
                    <h5 class="recommendation">%recommend</h5>
                </div>
            </div>
            <div class="skyscanner">
                <a class="waves-effect waves-light btn teal lighten-3" href="%offerlink" target="_blank">
                <span class="detail-price">book for %price</span></a>
            </div>
            <div class="skyscanner">
                <span class="detail-risk">Risk level: Safe travels, do you need &nbsp<a class="teal-text lighten-3" href="%offerlink" target="_blank"> insurance?</a>
                </span>
            </div>
            <table class="tight equal centered">
                <thead>
                <tr>
                    <th/>
                    <th>Fr</th>
                    <th>Sat</th>
                    <th>Sun</th>
                    <th>Mon</th>
                    <th>Tue</th>
                </thead>
                <tbody>
                <tr>
                    <td class="right-align">Weather</td>
                    %forecasts
                </tr>
                <tr>
                    <td class="right-align">Temp.</td>
                    %temps
                </tr>
                <tr>
                    <td class="right-align">Wind</td>
                    %wind
                </tr>
                </tbody>
            </table>
        </div>
    </div>
    `; 

    function factory(props) {
        var base = html;
        for(var prop in props) {
            base = base.split("%" + prop).join(props[prop]);
        }
        return base;
    }

    function weather_image(activity){
        var things = [ "surfing", "beach", "culture", "camping", "hiking", "skiing"];
        if(things.indexOf(activity.toLowerCase()) != -1) {
            return `${activity.toLowerCase()}_frog.png`;
        }
        return 'frog.png'
    }

    weatherSpots.forEach(function(spot) {
        if(spot.price == null) {
            return;
        }

        var props = {
            name: spot.name,
            avgtemp: spot.avg_temperature + '°C',
            price: spot.price + " CHF",
            image: weather_image(spot.activity),
            forecasts: '',
            temps: '',
            wind: '',
            recommend: activityTitle(spot),
            offerlink: "https://www.zurich.ch/en/private-customers/vehicles-and-travel/travel-insurance?WT.srch=1&WT.mc_id=z_rt_ch_se_gadw_gadw-869332546_gadw-g-_gadw-42271286045_gadw-203877147771_best%20travel%20insurance%20cover-b"
        }

        function officialIcon(codeInt) {
            return '/img/weather/' + String(codeInt).padStart(2, '0') + '.svg'
        }

        var maxWindSpeed = 60;
        var maxTemperature = 40;

        var ncols = spot.temperature.length;
        for(var i = 0; i < 5; i++) {
            props.forecasts += ('<td>' + (i >= ncols ? '' : `<img class="official-weather" src="${officialIcon(spot.icon_code[i])}" alt="${spot.forecast[i]}"`) + "</td>");
            props.temps += ('<td>' + (i >= ncols ? '' : `<div class="bottle-outer temp"><div class="bottle-inner" style="height: ${Math.min(100, spot.temperature[i] / maxTemperature * 100)}%"></div><div class="valign-wrapper align-center vfill">${spot.temperature[i]}°C</div></div>`) + '</td>');
            props.wind  += ('<td>' + (i >= ncols ? '' : `<div class="bottle-outer wind"><div class="bottle-inner" style="height: ${Math.min(100, spot.wind[i] / maxWindSpeed * 100)}%"></div><div class="valign-wrapper align-center vfill">${spot.wind[i]}km/h</div></div>`) + "</td>");
        }

        var itemhtml = factory(props);
        var item = $(itemhtml);

        var popup = L.popup({
            closeButton: false,
            autoClose: false,
            closeOnClick: false
        }).setLatLng([spot.lat, spot.lon]).setContent(item[0]);
        
        item.click(function () {
            var expanded = $(this).parents('.leaflet-popup').hasClass('expanded');
            if(expanded) {
                $(this).parents('.leaflet-popup').removeClass('expanded');
                $(this).children('.condensed').show();
                $(this).children('.detailed').hide();
            } else {
                popup.bringToFront();
                $(this).children('.condensed').hide();
                $(this).children('.detailed').fadeIn();
                $(this).parents('.leaflet-popup').addClass('expanded');
            }
        });

        map.addLayer(popup);
    });
}

if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (pos) {
        center = [pos.coords.latitude, pos.coords.longitude];
        if (map) {
            recenter();
        } else {
            mustCenter = true;
        }

        var url = `${window.location.protocol}//${window.location.hostname}:30889/destinations?lat=${center[0]}&lon=${center[1]}`;
        console.log("get", url);
        var req = $.get(url, function (data, status, xhr) {
            console.log("got");
            weatherSpots = data;
            refreshWeatherData();
        });
        req.fail(function () {
            console.log("cannot get backend data", req.statusText);
        });
    });
}
