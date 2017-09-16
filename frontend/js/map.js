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
    
    console.log("get");
    $.get('/sample_backend.json', function (data, status, xhr) {
        console.log("got");
        weatherSpots = data.results;
        refreshWeatherData();
    }).fail(function () {
        console.log("cannot get backend data");
    });
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

var weatherSpots = [];

function refreshWeatherData() {
    $('.htmlmarker').remove();
    const html = `
    <div class="htmlmarker">
        <div class="condensed">
            <img class="frog" src="/img/%image"/>
            <div class="info">
                <div class="temperature">%avgtemp</div>
                <div class="price">%price</div>
            </div>
        </div>
        <div class="detailed">
            <div class="toprow">
                <img class="frog big" src="/img/%image"/>
                <div class="toprowdetails">
                    <h5 class="recommendation">%recommend</h5>
                    <div class="skyscanner">
                        <span class="price space-after">%price</span>
                        <a href="%offerlink">book</a>
                    </div>
                </div>
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

    function weather_image(forecast){
        switch(forecast){
            case "Sunny": return 'rain_frog.png';
            default: return 'frog.png';
        }
    }

    weatherSpots.forEach(function(spot) {
        var props = {
            name: spot.name,
            avgtemp: spot.avg_temperature + '°C',
            price: spot.price + "€",
            image: weather_image(spot.forecast),
            forecasts: '',
            temps: '',
            wind: '',
            recommend: spot.activity,
            offerlink: spot.href
        }

        var ncols = spot.temperature.length;
        for(var i = 0; i < 5; i++) {
            props.forecasts += ('<td>' + (i >= ncols ? '' : spot.forecast[i]) + "</td>");
            props.temps += ('<td>' + (i >= ncols ? '' : spot.temperature[i]) + '°C</td>');
            props.wind  += ('<td>' + (i >= ncols ? '' : spot.wind[i]) + "km/h</td>");
        }

        var itemhtml = factory(props);
        var item = $(itemhtml);

        var popup = L.popup({
            closeButton: false,
            autoClose: false,
            closeOnClick: false
        }).setLatLng([spot.lat, spot.long]).setContent(item[0]);
        
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
    });
}



// var mustCenter = false;
// var mustRefreshMarkers = false;

// var centerMarker = null;
// var userLocationGraphic;
// require([
//     "esri/map",
//     "dojo/on",
//     "esri/geometry/Extent",
//     "esri/layers/FeatureLayer",
//     "esri/graphic",
//     "esri/symbols/SimpleLineSymbol",
//     "esri/symbols/SimpleFillSymbol",
//     "esri/symbols/SimpleMarkerSymbol",
//     "esri/symbols/PictureMarkerSymbol",
//     "esri/symbols/TextSymbol",
//     "esri/renderers/SimpleRenderer",
//     "esri/layers/LabelClass",
//     "esri/geometry/Point",
//     "esri/SpatialReference",
//     "dojo/_base/Color",
//     "dojo/domReady!"
// ], function (Map, on, Extent, FeatureLayer, Graphic, SimpleLineSymbol, SimpleFillSymbol, SimpleMarkerSymbol, PictureMarkerSymbol,
//     TextSymbol, SimpleRenderer, LabelClass, Point, SpatialReference, Color) {
//         if (navigator.geolocation) {
//             navigator.geolocation.getCurrentPosition(function (pos) {
//                 center = [pos.coords.longitude, pos.coords.latitude];
//                 if (map) {
//                     recenter();
//                 } else {
//                     mustCenter = true;
//                 }
//             });
//         }

//         function refreshMarkers() {
//             var zoom = map.getZoom();
//             if (zoom == -1) {
//                 zoom = 9;
//             }
//             console.log("zoom ->", zoom);
//             var markerSize = (zoom - 9.0) * 10;
//             markerSize = Math.min(40, Math.max(20, markerSize)); // clamp

//             var symbol = new PictureMarkerSymbol("../img/marker.svg", markerSize, markerSize);
//             userLocationGraphic.setSymbol(symbol);
//             userLocationGraphic.setGeometry(new Point(center[0], center[1]));
//             userLocationGraphic.draw();
//         }

//         function recenter() {
//             console.log("recenter");
//             map.centerAt(center);

//             refreshMarkers();
//         }

//         map = new Map("map", {
//             basemap: "topo",
//             center: center,
//             zoom: 9,
//             minZoom: 3,
//             showLabels: true,
//             showAttribution: false
//         });

//         userLocationGraphic = new Graphic();
//         on.once(map, "load", function () {
//             // $('#map_root').css({width: '100%', height: '100%'});
//             this.graphics.add(userLocationGraphic);
//             if (mustCenter) {
//                 setTimeout(function () {
//                     mustCenter = false;
//                     recenter();
//                 }, 500);
//             }
//         });
//         on(map, "zoom-end", function (anchor, extent, level, zoom) {
//             refreshMarkers();
//         });
//         on(map, "extent-change", function() {
//             refreshWeatherData();
//         });


        

        
//     });
