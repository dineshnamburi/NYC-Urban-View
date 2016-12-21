<?php
error_reporting(E_ALL);
ini_set('display_errors', 'on');

$data = file_get_contents('php://input');
//print $data;
//$polygon = CJSON::decode($str);
$polygon = json_decode($data);
//var_dump($polygon);
//print $polygon['polygon']['geometry']['coordinates'][0];
$shape = $polygon->{'geometry'}->{'type'};
if($shape == 'Polygon'){
$coordinates = $polygon->{'geometry'}->{'coordinates'}[0];
//var_dump ();
//$query = "select uhfcode from nycuhf42 where st_contains(geom,(SELECT ST_Transform(ST_GeomFromText('POLYGON((";

$query1 = "select uhfcode,quality_rate,(st_area(st_intersection(b.gom, geom))/st_area(b.gom)) as weight from nycuhf42,(SELECT ST_Transform(ST_GeomFromText('POLYGON((";

$query2 = "select precinct,crime_rate,(st_area(st_intersection(b.gom, geom))/st_area(b.gom)) as weight from nypp,(SELECT ST_Transform(ST_GeomFromText('POLYGON((";

$query3 = "select count(*) as schools from (SELECT count(gid) as schools from schools,(SELECT ST_Transform(ST_GeomFromText('POLYGON((";

$query4 = "select precinct,no_of_crashes,(st_area(st_intersection(b.gom, geom))/st_area(b.gom)) as weight from nypp,(SELECT ST_Transform(ST_GeomFromText('POLYGON((";

$coors = "";
foreach($coordinates as $item) {
	//echo $item;
	$coors = $coors.$item[0]." ".$item[1].",";
	
}
$coors = substr($coors, 0, -1);
$query1 = $query1 .$coors. "))',4326),3857) as gom) as b where st_intersects(geom,b.gom);";
$query2 = $query2 .$coors. "))',4326),3857) as gom) as b where st_intersects(geom,b.gom);";
$query3 = $query3 .$coors. "))',4326),3857) as gom) as b where st_contains(b.gom,geom) or st_touches(b.gom,geom) group by gid) as rs;";
$query4 = $query4 .$coors. "))',4326),3857) as gom) as b where st_intersects(geom,b.gom);";

}
else if($shape == 'Point'){
	$coordinates = $polygon->{'geometry'}->{'coordinates'};
//var_dump ();
$query1 = "select uhfcode,quality_rate,1 as weight from nycuhf42,(SELECT ST_Transform(ST_PointFromText('POINT(".$coordinates[0]." ".$coordinates[1].")',4326),3857) as gom) as b where st_intersects(geom,b.gom);";

$query2 = "select precinct,crime_rate,1 as weight from nypp,(SELECT ST_Transform(ST_PointFromText('POINT(".$coordinates[0]." ".$coordinates[1].")',4326),3857) as gom) as b where st_intersects(geom,b.gom);";

$query3 = "select count(*) as schools from (SELECT count(gid) as schools from schools,(SELECT ST_Buffer(ST_Transform(ST_PointFromText('POINT(".$coordinates[0]." ".$coordinates[1].")',4326),3857),1609) as gom) as b where st_contains(b.gom,geom) or st_touches(b.gom,geom) group by gid) as rs;";

$query4 = "select precinct,no_of_crashes,1 as weight from nypp,(SELECT ST_Transform(ST_PointFromText('POINT(".$coordinates[0]." ".$coordinates[1].")',4326),3857) as gom) as b where st_intersects(geom,b.gom);";
}


//db

function exc($query) {
	$host        = "host=127.0.0.1";
	$port        = "port=5432";
	$dbname      = "dbname=nycurbanview";
	$credentials = "user=root password=root";
	$db = pg_connect( "$host $port $dbname $credentials"  );
	if(!$db){
		echo "Error : Unable to open database\n";
	}
	else {
		$ret = pg_query($db, $query);
		if(!$ret){
			echo pg_last_error($db);
			exit;
		}
		$myarray = array();
		while($row = pg_fetch_row($ret)){
			$myarray[] = $row;
		}
		return json_encode($myarray);
		
	}
	pg_close($db);
}

$final_output = "[".exc($query1).",".exc($query2).",".exc($query3).",".exc($query4)."]";
print $final_output;
?>