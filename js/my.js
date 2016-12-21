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
		var mk1 = L.marker(latlong);
		mk1.addTo(map);
		ajx(latlong[1],latlong[0]);

		
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
		if(gup('layer') == 'crash'){
			//crime layer 
			L.tileLayer.wms("wms.php", {
layers: 'crash',
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

	var geocoder = L.control.geocoder('mapzen-dWt4MWC',options)
	geocoder.addTo(map);
	geocoder.on('select', function (e) {
		console.log('You’ve selected', e.latlng);
		if(mk1){
			map.removeLayer(mk1);
		}
		
		ajx(e.latlng.lng,e.latlng.lat);
	});
	function ajx(lng,lat){
		var shape_for_db = '{"type":"Feature","properties":{},"geometry":{"type":"Point","coordinates":['+lng+','+lat+']}}';
		$.ajax({type:"POST",data:shape_for_db,url: "dynamic.php", success: function(result){
				var arr = JSON.parse(result);
				var air = arr[0];
				var crime = arr[1];
				var crash = arr[3];
				var sch = arr[2][0][0];
				console.log(arr[0]);
				console.log(arr[1]);
				console.log(arr[2][0][0]);
				var air_rate =crime_rate=crash_rate= 0;
				for(var i=0;i<air.length;i++){
					var tmp = air[i];
					air_rate = air_rate+(parseFloat(air[i][1]) * parseFloat(air[i][2]));
					//console.log(parseFloat(air[i][1]) * parseFloat(air[i][2]));
				}
				for(var i=0;i<crime.length;i++){
					var tmp = crime[i];
					crime_rate = crime_rate+(parseFloat(crime[i][1])*parseFloat(crime[i][2]));
				}
				for(var i=0;i<crash.length;i++){
					var tmp = crash[i];
					crash_rate = crash_rate+(parseFloat(crash[i][1])*parseFloat(crash[i][2]));
				}
				
				$('#cq').html(crime_rate.toFixed(1));
				$('#aq').html(air_rate.toFixed(1));
				$('#sq').html(sch);
				$('#rq').html(crash_rate.toFixed(1));
				if(crime_rate <= 1.2404){crime_rate=5;myRating2.setRating(5, false);}
				else if(crime_rate > 1.2404 && crime_rate <= 1.4803){crime_rate=4;myRating2.setRating(4, false);}
				else if(crime_rate > 1.4803 && crime_rate <= 1.6483){crime_rate=3;myRating2.setRating(3, false);}
				else if(crime_rate > 1.6483 && crime_rate <= 1.4803){crime_rate=2;myRating2.setRating(2, false);}
				else if(crime_rate > 2.4154 && crime_rate <= 12.3481){crime_rate=1;myRating2.setRating(1, false);}
				
				if(crash_rate <= 50){crash_rate=5;myRating4.setRating(5, false);}
				else if(crash_rate > 50 && crash_rate <= 100){crash_rate=4;myRating4.setRating(4, false);}
				else if(crash_rate > 100 && crash_rate <= 150){crash_rate=3;myRating4.setRating(3, false);}
				else if(crash_rate > 150 && crash_rate <= 200){crash_rate=2;myRating4.setRating(2, false);}
				else if(crash_rate > 200){crash_rate=1;myRating4.setRating(1, false);}
				
				
				if(air_rate <= 30){air_rate=3;myRating3.setRating(3, false);}
				else if(air_rate > 30 && air_rate <= 40){air_rate=2;myRating3.setRating(2, false);}
				else if(air_rate >  40){air_rate=1;myRating3.setRating(1, false);}
				
				if(sch <= 5){sch=1;myRating1.setRating(1, false);}
				else if(sch > 5 && sch <= 10){sch=2;myRating1.setRating(2, false);}
				else if(sch > 10 && sch <= 15){sch=3;myRating1.setRating(3, false);}
				else if(sch > 15 && sch <= 20){sch=4;myRating1.setRating(4, false);}
				else if(sch > 20){sch=5;myRating1.setRating(5, false);}
				var total = air_rate+sch+crime_rate+crash_rate;
				total=total/4;
				$('#ovr').html(total.toFixed(1));
				console.log(air_rate);
				console.log(crime_rate);
				console.log(crash_rate);console.log(sch);console.log(total);
			}});
		
	}
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


var drawControlEditOnly = new L.Control.Draw({
    edit: {
        featureGroup: drawnItems
    },
    draw: false
});
	map.on('draw:created', function (e) {
		if(mk1){
				map.removeLayer(mk1);
		}
		
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
				var crash = arr[3];
				var sch = arr[2][0][0];
				console.log(arr[0]);
				console.log(arr[1]);
				console.log(arr[2][0][0]);
				var air_rate =crime_rate=crash_rate= 0;
				for(var i=0;i<air.length;i++){
					var tmp = air[i];
					air_rate = air_rate+(parseFloat(air[i][1]) * parseFloat(air[i][2]));
					//console.log(parseFloat(air[i][1]) * parseFloat(air[i][2]));
				}
				for(var i=0;i<crime.length;i++){
					var tmp = crime[i];
					crime_rate = crime_rate+(parseFloat(crime[i][1])*parseFloat(crime[i][2]));
				}
				for(var i=0;i<crash.length;i++){
					var tmp = crash[i];
					crash_rate = crash_rate+(parseFloat(crash[i][1])*parseFloat(crash[i][2]));
				}
				
				$('#cq').html(crime_rate.toFixed(1));
				$('#aq').html(air_rate.toFixed(1));
				$('#sq').html(sch);
				$('#rq').html(crash_rate.toFixed(1));
				if(crime_rate <= 1.2404){crime_rate=5;myRating1.setRating(5, false);}
				else if(crime_rate > 1.2404 && crime_rate <= 1.4803){crime_rate=4;myRating2.setRating(4, false);}
				else if(crime_rate > 1.4803 && crime_rate <= 1.6483){crime_rate=3;myRating2.setRating(3, false);}
				else if(crime_rate > 1.6483 && crime_rate <= 1.4803){crime_rate=2;myRating2.setRating(2, false);}
				else if(crime_rate > 2.4154 && crime_rate <= 12.3481){crime_rate=1;myRating2.setRating(1, false);}
				
				if(crash_rate <= 50){crash_rate=5;myRating4.setRating(5, false);}
				else if(crash_rate > 50 && crash_rate <= 100){crash_rate=4;myRating4.setRating(4, false);}
				else if(crash_rate > 100 && crash_rate <= 150){crash_rate=3;myRating4.setRating(3, false);}
				else if(crash_rate > 150 && crash_rate <= 200){crash_rate=2;myRating4.setRating(2, false);}
				else if(crash_rate > 200){crash_rate=1;myRating4.setRating(1, false);}
				
				
				if(air_rate <= 30){air_rate=3;myRating3.setRating(3, false);}
				else if(air_rate > 30 && air_rate <= 40){air_rate=2;myRating3.setRating(2, false);}
				else if(air_rate >  40){air_rate=1;myRating3.setRating(1, false);}
				
				if(sch <= 5){sch=1;myRating1.setRating(1, false);}
				else if(sch > 5 && sch <= 10){sch=2;myRating1.setRating(2, false);}
				else if(sch > 10 && sch <= 15){sch=3;myRating1.setRating(3, false);}
				else if(sch > 15 && sch <= 20){sch=4;myRating1.setRating(4, false);}
				else if(sch > 20){sch=5;myRating1.setRating(5, false);}
				var total = air_rate+sch+crime_rate+crash_rate;
				total=total/4;
				$('#ovr').html(total.toFixed(1));
				console.log(air_rate);
				console.log(crime_rate);
				console.log(crash_rate);
			}});
			map.removeControl(drawControl)
			drawControlEditOnly.addTo(map)
	});
	map.on("draw:deleted", function(e) {
    check = Object.keys(drawnItems._layers).length;
    if (check === 0){
       map.removeControl(drawControlEditOnly);
       drawControl.addTo(map);
    };
});
	if(gup('q')!=null){
		var x = document.getElementsByClassName("leaflet-pelias-input");
		x[0].value = gup('q');
	}

	//ratings

	var el1 = document.querySelector('#el1');
	var el2 = document.querySelector('#el2');
	var el3 = document.querySelector('#el3');
	var el4 = document.querySelector('#el4');

	// current rating, or initial rating
	var currentRating = 0;

	// max rating, i.e. number of stars you want
	var maxRating= 5;

	// callback to run after setting the rating


	// rating instance
	var myRating1 = rating(el1, currentRating, maxRating);
	var myRating2 = rating(el2, currentRating, maxRating);
	var myRating3 = rating(el3, currentRating, maxRating);
	var myRating4 = rating(el4, currentRating, maxRating);


});