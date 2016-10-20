// mbta.js

var map;
var curCoords = {lat:42.3591782, lng:-71.049571};
var stops = [
    ['South Station',42.352271,-71.05524200000001], //0
    ['Andrew',42.330154,-71.057655],//1
    ['Porter Square',42.373362,-71.118956],//2
    ['Harvard Square',42.373362,-71.118956],//3
    ['JFK/UMass',42.320685,-71.052391],//4
    ['Savin Hill',42.31129,-71.053331],//5
    ['Park Street',42.35639457,-71.0624242],//6
    ['Broadway',42.342622,-71.056967],//7
    ['North Quincy',42.275275,-71.029583],//8
    ['Shawmut',42.29312584,-71.06573796000001],//9
    ['Davis',42.39674,-71.121815],//10
    ['Alewife',42.395428,-71.142483],//11
    ['Kendall/MIT',42.36249079,-71.08617653],//12
    ['Charles/MGH',42.361166,-71.070628],//13
    ['Downtown Crossing',42.355518,-71.060225],//14
    ['Quincy Center',42.251809,-71.005409],//15
    ['Quincy Adams',42.233391,-71.007153],//16
    ['Ashmont',42.284652,-71.06448899999999],//17
    ['Wollaston',42.2665139,-71.0203369],//18
    ['Fields Corner',42.300093,-71.061667],//19
    ['Central Square',42.365486,-71.103802],//20
    ['Braintree',42.2078543,-71.0011385],//21
];

var pathOrder = [17,9,19,5,4,1,7,0,14,6,13,12,20,3,2,10,11,10,2,3,20,12,13,6,14,0,7,1,4,8,18,15,16,21];

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: curCoords,
        zoom: 12
    });
}
initMap();


function getCurCoords(){
    if (navigator.geolocation){
        navigator.geolocation.getCurrentPosition(function(curPos){
            curCoords.lat =  curPos.coords.latitude;
            curCoords.lng =  curPos.coords.longitude;
            console.log(curCoords);
            placeMarker('Me',curCoords,'#0099FF');
        });
    }
    else {
        alert("Couldn't get your location");
    }
}

function placeMarker(mTitle,coords,color){
    newMarker = new google.maps.Marker({
        position: coords,
        title: mTitle,
        icon: {
            path: "M-6,0a6,6 0 1,0 12,0a6,6 0 1,0 -12,0",
            fillColor: color,
            fillOpacity: 1,
            strokeColor: '',
            strokeWeight: 0
            },
        });
    newMarker.setMap(map);
}

getCurCoords();

function markStops(){
    for (var i = stops.length - 1; i >= 0; i--) {
        curStop = stops[i];
        stopCoord = {lat:curStop[1],lng:curStop[2]};
        placeMarker(curStop[0],stopCoord,'#FF0000');
    }
}

function getStopCoord(stopNum){
    console.log('stopNum: ' + stopNum + ' is '+stops[stopNum]);
    stop = stops[stopNum];
    return {lat:stop[1],lng:stop[2]};
}

function createTPath(){
    var path = [];
    for (var i = pathOrder.length - 1; i >= 0; i--) {
        path.push(getStopCoord(pathOrder[i]));
    }
    var tPath = new google.maps.Polyline({
    path: path,
    geodesic: true,
    strokeColor: '#FF0000',
    strokeOpacity: 1.0,
    strokeWeight: 2
  });

  tPath.setMap(map);
}

markStops();
createTPath();