$(document).ready(function(){
function gup( name, url ) {
	if (!url) url = location.href;
	name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
	var regexS = "[\\?&]"+name+"=([^&#]*)";
	var regex = new RegExp( regexS );
	var results = regex.exec( url );
	return results == null ? null : results[1];
}
console.log(gup('latlong'));
if(gup('latlong')!=null){
	var latlong = gup('latlong');
	latlong = latlong.split(',');
	var map = L.map('map',{crs: L.CRS.EPSG3857}).setView(latlong, 11.5);
	L.marker(latlong).addTo(map);

	
}
else{
	var map = L.map('map',{crs: L.CRS.EPSG3857}).setView([40.7128, -74.0059], 11.5);
}

var options = {
bounds: false,
position: 'topright',
expanded: true
};

//base layer osm
L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

if(gup('layer') != null){
	if(gup('layer') == 'schools'){
		//schools layer
		L.tileLayer.wms("wms.php", {
layers: 'schools',
format: 'image/png',
transparent: true,
		}).addTo(map);
	}
	
	if(gup('layer') == 'crime'){
		//crime layer 
		L.tileLayer.wms("wms.php", {
layers: 'problem2',
format: 'image/png',
transparent: true
		}).addTo(map);
	}
	if(gup('layer') == 'air'){
		//pollution layer
		L.tileLayer.wms("wms.php", {
layers: 'air',
format: 'image/png',
transparent: true
		}).addTo(map);
	}
}

L.control.geocoder('mapzen-dWt4MWC',options).addTo(map);


//leaflet draw
var drawnItems = new L.FeatureGroup();
map.addLayer(drawnItems);

var drawControl = new L.Control.Draw({
edit: {
featureGroup: drawnItems
	},
	draw : {
		position : 'topleft',
		polyline : false,
		rectangle : false,
		circle : true,
polygon: {
			// polygon draw options here
		},
	}});
map.addControl(drawControl);

map.on('draw:created', function (e) {
	var type = e.layerType,
	layer = e.layer;
	drawnItems.addLayer(layer);
	var shape = layer.toGeoJSON()
	var shape_for_db = JSON.stringify(shape);
	console.log(shape_for_db);
	//console.info(layer);
	
	 $.ajax({type:"POST",data:shape_for_db,url: "dynamic.php", success: function(result){
        var arr = JSON.parse(result);
		var air = arr[0];
		var crime = arr[1];
		var sch = arr[2][0][0];
		console.log(arr[0]);
		console.log(arr[1]);
		console.log(arr[2][0][0]);
		var air_rate =crime_rate= 0;
		for(var i=0;i<air.length;i++){
			var tmp = air[i];
			air_rate = air_rate+(parseFloat(air[i][1]) * parseFloat(air[i][2]));
			//console.log(parseFloat(air[i][1]) * parseFloat(air[i][2]));
		}
		for(var i=0;i<crime.length;i++){
			var tmp = crime[i];
			crime_rate = crime_rate+(parseFloat(crime[i][1])*parseFloat(crime[i][2]));
		}
		
		
		if(crime_rate <= 1.2404){myRating1.setRating(5, false);crime_rate=5;}
		else if(crime_rate > 1.2404 && crime_rate <= 1.4803){myRating2.setRating(4, false);crime_rate=4;}
		else if(crime_rate > 1.4803 && crime_rate <= 1.6483){myRating2.setRating(3, false);crime_rate=3;}
		else if(crime_rate > 1.6483 && crime_rate <= 1.4803){myRating2.setRating(2, false);crime_rate=2;}
		else if(crime_rate > 2.4154 && crime_rate <= 12.3481){myRating2.setRating(1, false);crime_rate=1;}
		
		if(air_rate <= 30){myRating3.setRating(3, false);air_rate=3;}
		else if(air_rate > 30 && air_rate <= 40){myRating3.setRating(2, false);air_rate=2;}
		else if(air_rate >  40){myRating3.setRating(1, false);air_rate=1;}
		
		if(sch <= 5){myRating1.setRating(1, false);sch=1;}
		else if(sch > 5 && sch <= 10){myRating1.setRating(2, false);sch=2;}
		else if(sch > 10 && sch <= 15){myRating1.setRating(3, false);sch=3;}
		else if(sch > 15 && sch <= 20){myRating1.setRating(4, false);sch=4;}
		else if(sch > 20){myRating1.setRating(5, false);sch=5;}
		var total = air_rate+sch+crime_rate;
		total=total/3;
		$('#ovr').html(total.toFixed(1));
		console.log(air_rate);
		console.log(crime_rate);
    }});
});

if(gup('q')!=null){
	var x = document.getElementsByClassName("leaflet-pelias-input");
	x[0].value = gup('q');
}

//ratings

var el1 = document.querySelector('#el1');
var el2 = document.querySelector('#el2');
var el3 = document.querySelector('#el3');

// current rating, or initial rating
var currentRating = 2;

// max rating, i.e. number of stars you want
var maxRating= 5;

// callback to run after setting the rating


// rating instance
var myRating1 = rating(el1, currentRating, maxRating);
var myRating2 = rating(el2, currentRating, maxRating);
var myRating3 = rating(el3, currentRating, maxRating);
myRating1.setRating(5, false);

});