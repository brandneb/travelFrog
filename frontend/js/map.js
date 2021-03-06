var center = [47.389832, 8.515901];
var map = null;
var userMarker = null;
var located = false;

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

function activityInsurance(activity) {
    if(activity == "skiing" || activity == "surfing") {
        return '<i class="material-icons">warning</i>Make sure to get &nbsp<a class="teal-text lighten-3" href="https://www.zurich.ch/en/private-customers/vehicles-and-travel/travel-insurance?WT.srch=1&WT.mc_id=z_rt_ch_se_gadw_gadw-869332546_gadw-g-_gadw-42271286045_gadw-203877147771_best%20travel%20insurance%20cover-b" target="_blank">insurance</a>&nbsp when you go ' + activity + '.';
    }
    return 'Risk level: Safe travels, do you need &nbsp<a class="teal-text lighten-3" href="https://www.zurich.ch/en/private-customers/vehicles-and-travel/travel-insurance?WT.srch=1&WT.mc_id=z_rt_ch_se_gadw_gadw-869332546_gadw-g-_gadw-42271286045_gadw-203877147771_best%20travel%20insurance%20cover-b" target="_blank"> insurance?</a>';
}


var weatherSpots = [];
var activeWeatherSpots = [];
var popups = [];
var popupContents = [];

function refreshWeatherData() {
    activeWeatherSpots = [];
    popups = [];
    popupContents = [];

    $('.htmlmarker').remove();
    const html = `
    <div class="htmlmarker" data-activity="%activity">
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
                <span class="detail-risk">
                    %insurance
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
            avgtemp: Math.round(spot.avg_temperature * 10) / 10 + '°C',
            price: spot.price + " CHF",
            image: weather_image(spot.activity),
            forecasts: '',
            temps: '',
            wind: '',
            recommend: activityTitle(spot),
            activity: spot.activity,
            offerlink: spot.href
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
        props.insurance = activityInsurance(spot.activity)

        var itemhtml = factory(props);
        var item = $(itemhtml);

        var popup = L.popup({
            closeButton: false,
            autoClose: false,
            closeOnClick: false
        }).setLatLng([spot.lat, spot.lon]).setContent(item[0]);
        
        map.addLayer(popup);
        
        item.hover(function() {
            popup.bringToFront();
        });

        item.parents('.leaflet-popup').click(function () {
            var expanded = $(this).hasClass('expanded');
            if(expanded) {
                $(this).removeClass('expanded');
                $(this).find('.condensed').show();
                $(this).find('.detailed').hide();
            } else {
                popup.bringToFront();
                $(this).find('.condensed').hide();
                $(this).find('.detailed').fadeIn();
                $(this).addClass('expanded');
            }
        });

        activeWeatherSpots.push(spot);
        popups.push(popup);
        popupContents.push(item);
    });
}

function requestData() {    
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
}

if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (pos) {
        located = true;
        center = [pos.coords.latitude, pos.coords.longitude];
        if (map) {
            recenter();
        } else {
            mustCenter = true;
        }

        requestData();
    });
}

setTimeout(function() {
    if(!located) {
        recenter();
        requestData(); // request with default center
    }
}, 2000);

function collapseAll() {
    console.log('hi');
    $('.leaflet-popup.expanded').click();
}

function filterActivities(menu, who) {
    console.log("show only", who);

    var active = $(menu).parent().hasClass('active');
    $('li.filtermenu').removeClass('active');
    $('#filtermatching').removeClass('active');
    if(!active) {
        $(menu).parent().addClass('active');
    }

    for(var i = 0; i < activeWeatherSpots.length; i++) {
        spot = activeWeatherSpots[i];
        item = popupContents[i];
        popupDom = item.parents('.leaflet-popup');

        if(active) {
            popupDom.removeClass('gone');
        } else if(spot.activity != who) {
            popupDom.addClass('gone');
        } else {
            popupDom.removeClass('gone');
        }
    }
}

function filterMatches() {
    var active = $('#filtermatching').hasClass('active');
    $('#filtermatching').toggleClass('active');
    $('li.filtermenu').removeClass('active');

    var ordered = activeWeatherSpots.map(function(spot) {
        return spot.rating;
    });
    ordered.sort();
    ordered.reverse();
    var threshold = ordered[Math.min(15, ordered.length - 1)];
    
    for(var i = 0; i < activeWeatherSpots.length; i++) {
        spot = activeWeatherSpots[i];
        item = popupContents[i];
        popupDom = item.parents('.leaflet-popup');

        if(active) {
            popupDom.removeClass('gone');
        } else if(spot.rating < threshold) {
            popupDom.addClass('gone');
        } else {
            popupDom.removeClass('gone');
        }
    }
}
