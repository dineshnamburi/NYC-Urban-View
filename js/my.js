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
        alert(123);
    }});
});

if(gup('q')!=null){
	var x = document.getElementsByClassName("leaflet-pelias-input");
	x[0].value = gup('q');
}

//ratings

var el = document.querySelector('#el');

// current rating, or initial rating
var currentRating = 2;

// max rating, i.e. number of stars you want
var maxRating= 5;

// callback to run after setting the rating


// rating instance
var myRating = rating(el, currentRating, maxRating);
//myRating.setRating(3, false);

});