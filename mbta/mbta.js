// mbta.js

var map;
var allInfoWindows = [];
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

//yes I knoe this is probably not the best way to do this
var stopDict = {
    'South Station':0,
    'Andrew':1,
    'Porter Square':2,
    'Harvard Square':3,
    'JFK/UMass':4,
    'Savin Hill':5,
    'Park Street':6,
    'Broadway':7,
    'North Quincy':8,
    'Shawmut':9,
    'Davis':10,
    'Alewife':11,
    'Kendall/MIT':12,
    'Charles/MGH':13,
    'Downtown Crossing':14,
    'Quincy Center':15,
    'Quincy Adams':16,
    'Ashmont':17,
    'Wollaston':18,
    'Fields Corner':19,
    'Central Square':20,
    'Braintree':21,
};

var schedules = [];

var pathOrder = [17,9,19,5,4,1,7,0,14,6,13,12,20,3,2,10,11,10,2,3,20,12,13,6,14,0,7,1,4,8,18,15,16,21];

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: curCoords,
        zoom: 12
    });
}
initMap();

function addScheduleItem(timeLeft,stationName,destination){
    var stopIndex = stopDict[stationName];
    if (typeof schedules[stopIndex] == 'undefined')
        schedules[stopIndex] = [];
    var newScheduleArray = schedules[stopIndex];
    var newETA = Math.floor((timeLeft/60));
    var newItemString = "To " + destination + " arriving in " + newETA + " minutes";
    if (newETA == 0) {
        newItemString = "Train to " + destination + " arriving now";
    }
    if (newETA < 0) {
        newItemString = "Train to " + destination + " boarding now";
    }
    var newItem = {schedString:newItemString,ETA:newETA};
    var i = 0;
    for (; i<newScheduleArray.length; i++) {
        var comparisonItem = newScheduleArray[i];
        if(comparisonItem.ETA < newETA)
            break;
    }
    newScheduleArray.splice(i,0,newItem);
    schedules[stopIndex] = newScheduleArray;
}

function getScheduleForStation(stationName){
    var stopIndex = stopDict[stationName];
    if (typeof schedules[stopIndex] === 'undefined')
        return 'No upcoming trains for ' + stationName;
    var items = schedules[stopIndex];
    if (items.length == 0)
        return 'No upcoming trains for ' + stationName;
    var schedHTML = "<h1 class='mapHeader'>"+stationName + "</h1>";
    for (var i = items.length - 1; i >= 0; i--) {
         item = items[i];
         schedHTML = schedHTML + "<hr>" + item.schedString + "<br>" ;
     } 
     return schedHTML;
}

function generateScheduleErrors(error){
    for (var i = stops.length - 1; i >= 0; i--) {
        schedules[i] = [{schedString:'<i>Could not load schedule due to '+error+"</i>",ETA:100000}];

    }
}

function updateSchedule(){
    var myRequest = new XMLHttpRequest();
    myRequest.addEventListener('load',function(){
        if (this.status >= 400){
            generateScheduleErrors(this.status);
        }
        else {
             var parsed = JSON.parse(this.responseText);
            var trips = parsed.TripList.Trips;
            var curTime = parsed.TripList.CurrentTime;
            schedules = [];
            for (var i = trips.length - 1; i >= 0; i--) {
                var train = trips[i];
                var destination = train.Destination;
                var preds = train.Predictions;
                    for (var j = preds.length - 1; j >= 0; j--) {
                        var prediction = preds[j];
                        var station = prediction.Stop;
                        if (typeof stopDict[station] !== 'undefined')
                            addScheduleItem(prediction.Seconds,station,destination);
                    }
            }
            for (var i = stops.length - 1; i >= 0; i--) {
                stops[i]
            }
        } 
        markStops();

    });
    myRequest.open('GET','https://rocky-taiga-26352.herokuapp.com/redline.json');
    myRequest.send();
}

updateSchedule();

function getCurCoords(){
    if (navigator.geolocation){
        navigator.geolocation.getCurrentPosition(function(curPos){
            curCoords.lat =  curPos.coords.latitude;
            curCoords.lng =  curPos.coords.longitude;
            drawLineToClosestStop();
            placeMarker(curCoords,false);
        });
    }
    else {
        alert("Couldn't get your location");
    }
}

function placeMarker(coords,isStop,index){
    if (isStop)
        color = '#FF0000';
    else
        color = '#0099FF';

    var infoString;
    var markStop;
    var mTitle;
    if (isStop){
        markStop = stops[index];
        infoString = markStop[0];
        mTitle = markStop[0];
    }
    else{
        mTitle = "You Are Here";
        infoString = closestStopInfo();
    }
    var infoWindow = new google.maps.InfoWindow({
        content: infoString
    });

    var newMarker = new google.maps.Marker({
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
    
    allInfoWindows.push(infoWindow);
    if (isStop){
        markStop.push(infoWindow)
        stop[index] = markStop;
        infoWindow.setContent(getScheduleForStation(mTitle));

    }

    newMarker.addListener('click', function(){
        closeAllInfoWindows();
        infoWindow.open(map,newMarker);
    });
}

function closeAllInfoWindows(){
    for (var i = allInfoWindows.length - 1; i >= 0; i--) {
        allInfoWindows[i].close();
    }
}

getCurCoords();

function markStops(){
    for (var i = stops.length - 1; i >= 0; i--) {
        curStop = stops[i];
        stopCoord = {lat:curStop[1],lng:curStop[2]};
        placeMarker(stopCoord,true,i);
    }
}

function getStopCoord(stopNum){
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

function distBetweenCoords(coord1,coord2){
    var lat1 = coord1.lat;
    var lat2 = coord2.lat;
    var lon1 = coord1.lng;
    var lon2 = coord2.lng;

    var R = 6371e3; // metres
    var φ1 = toRadians(lat1);
    var φ2 = toRadians(lat2);
    var Δφ = toRadians(lat2-lat1);
    var Δλ = toRadians(lon2-lon1);

    var a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ/2) * Math.sin(Δλ/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    var d = R * c;

    return d/1609.34;
    /*var dLat = coord1.lat - coord2.lat;
    var dLon = coord1.lng - coord2.lng;
    return Math.sqrt((dLon*dLon)+(dLat*dLat));*/
}

function toRadians(degrees){
    return degrees*Math.PI/180;
}

function indexOfClosestStop(){
    var minIndex = 0;
    var minDist = distBetweenCoords(curCoords,getStopCoord(0));
    for (var i = 1; i < stops.length; i++){
        var curDist = distBetweenCoords(curCoords,getStopCoord(i));
        if (curDist < minDist) {
            minDist = curDist;
            minIndex = i;
        }
    }
    return minIndex;
}

function drawLineToClosestStop(){
    var minIndex = indexOfClosestStop();
    var bluePath = new google.maps.Polyline({
    path: [curCoords,getStopCoord(minIndex)],
    geodesic: true,
    strokeColor: '#0000FF',
    strokeOpacity: 1.0,
    strokeWeight: 2
  });
  bluePath.setMap(map);
}

function closestStopInfo(){
    var minIndex = indexOfClosestStop();
    var minDist = distBetweenCoords(curCoords,getStopCoord(minIndex));
    var closestName = stops[minIndex][0];
    return "The Nearest Red Line Station is:<br>" 
        + closestName + "<br>Located " + minDist.toFixed(2) + " miles away.";
}

createTPath();