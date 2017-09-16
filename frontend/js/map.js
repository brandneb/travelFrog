var center = [11.568607, 48.125042];
var map = null;
var userMarker = null;

$(document).ready(function() {
    map = L.map('map').setView(center, 8);
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

var weatherSpots = [];

function refreshWeatherData() {
    // if(map.extent == undefined) {
    //     mustRefreshMarkers = true;
    //     setTimeout(function() {refreshWeatherData();}, 500);
    //     return;
    // } else {
    //     mustRefreshMarkers = false;
    // }

    // $('.htmlmarker').remove();
    // const html = '<div class="htmlmarker">%1</div>';

    // weatherSpots.forEach(function(spot) {
    //     var itemhtml = html.replace("%1", spot.name);
    //     var item = $(itemhtml);

    //     var pt = new Point(spot.long, spot.lat);
    //     pt.setSpatialReference(new SpatialReference(102100));
    //     var point = map.toScreen(pt);
    //     console.log(spot.name, "->", point.x, point.y);
    //     item.css({
    //         left: point.x,
    //         top: point.y
    //     });

    //     $('#map').append(item);
    // });
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

console.log("get");
$.get('/sample_backend.json', function (data, status, xhr) {
    console.log("got");
    weatherSpots = data.results;
    refreshWeatherData();
}).fail(function () {
    console.log("cannot get backend data");
});


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
