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
        <img class="frog" src="/assets/%image"/>
        <div class="condensed info">
            <div class="strong">%forecast</div>
            <div>%avgtemp</div>
            <div>%price</div>
        </div>
        <div class="detailed">
        <table>
            <tbody>
            <tr>
                <td>Temperature</td>
                %temps
            </tr>
            <tr>
                <td>Feels like</td>
                %feels
            </tr>
            <tr>
                <td>Jonathan</td>
                %wind
            </tr>
            <tr>
                <td class="center" colspan="%ncols">%recommend</td>
            </tr>
            <tr>
                <td class="center" colspan="%ncols"><a href="%offerlink" target="_blank">View Details</a></td>
            </tr>
            </tbody>
        </table>
        </div>
    </div>
    `; 

    function factory(props) {
        var base = html;
        for(var prop in props) {
            base = base.replace("%" + prop, props[prop]);
        }
        return base;
    }

    function weather_image(forecast){
        switch(forecast){
            case "Sunny": return 'sunny_frog.png';
            default: return 'frog.png';
        }
    }

    weatherSpots.forEach(function(spot) {
        var props = {
            name: spot.name,
            forecast: spot.forecast,
            avgtemp: spot.avg_temperature + '°C',
            price: spot.price + "€",
            image: weather_image(spot.forecast),
            temps: '',
            feels: '',
            wind: '',
            recommend: 'Ideal for ' + spot.activity,
            offerlink: spot.href
        }

        var ncols = spot.temperature.length;
        props.ncols = ncols + 1; // headings are a column too
        for(var i = 0; i < ncols; i++) {
            props.temps += ('<td>' + spot.temperature[i] + '°C</td>');
            props.feels += ('<td>' + spot.feelslike[i] + "°C</td>");
            props.wind  += ('<td>' + spot.wind[i] + "km/h</td>");
        }

        var itemhtml = factory(props);
        var item = $(itemhtml);
        item.hover(function () {
            $(this).children('.detailed').fadeIn();
            $(this).parents('.leaflet-popup').addClass('expanded');
          },
          function () {
            $(this).children('.detailed').fadeOut();
            $(this).parents('.leaflet-popup').removeClass('expanded');
          });
        // todo setup interactivity

        var popup = L.popup({
            closeButton: false,
            autoClose: false
        }).setLatLng([spot.lat, spot.long]).setContent(item[0]);
        item.parent('.leaflet-popup')
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
