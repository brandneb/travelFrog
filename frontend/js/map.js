var center = [48.125042, 11.568607];
var mustCenter = false;

var map = null;
var centerMarker = null;
var userLocationGraphic;
require([
    "esri/map",
    "dojo/on",
    "esri/geometry/Extent",
    "esri/layers/FeatureLayer",
    "esri/graphic",
    "esri/symbols/SimpleLineSymbol",
    "esri/symbols/SimpleFillSymbol",
    "esri/symbols/SimpleMarkerSymbol",
    "esri/symbols/PictureMarkerSymbol",
    "esri/symbols/TextSymbol",
    "esri/renderers/SimpleRenderer",
    "esri/layers/LabelClass",
    "esri/geometry/Point",
    "dojo/_base/Color",
    "dojo/domReady!"
], function (Map, on, Extent, FeatureLayer, Graphic, SimpleLineSymbol, SimpleFillSymbol, SimpleMarkerSymbol, PictureMarkerSymbol,
    TextSymbol, SimpleRenderer, LabelClass, Point, Color) {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (pos) {
                center = [pos.coords.longitude, pos.coords.latitude];
                if (map) {
                    recenter();
                } else {
                    mustCenter = true;
                }
            });
        }

        function refreshMarkers() {
            var zoom = map.getZoom();
            if(zoom == -1) {
                zoom = 11;
            }
            console.log("zoom ->", zoom);
            var markerSize = (zoom - 9.0) * 10;
            markerSize = Math.min(40, Math.max(20, markerSize)); // clamp
            
            var symbol = new PictureMarkerSymbol("../img/marker.svg", markerSize, markerSize);
            userLocationGraphic.setSymbol(symbol);
            userLocationGraphic.setGeometry(new Point(center[0], center[1]));
            userLocationGraphic.draw();
        }
        
        function recenter() {
            console.log("recenter");
            map.centerAt(center);

            refreshMarkers();
        }

        map = new Map("map", {
            basemap: "topo",
            center: center,
            zoom: 11,
            minZoom: 3,
            showLabels: true,
            showAttribution: false
        });

        userLocationGraphic = new Graphic();
        on.once(map, "load", function () {
            this.graphics.add(userLocationGraphic);
            if (mustCenter) {
                setTimeout(function () {
                    mustCenter = false;
                    recenter();
                }, 500);
            }
        });
        on(map, "zoom-end", function(anchor, extent, level, zoom) {
            refreshMarkers();
        });
    });