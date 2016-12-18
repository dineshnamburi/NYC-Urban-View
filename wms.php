<?php
error_reporting(E_ALL);
ini_set('display_errors', 'on');
$request = ms_newowsrequestobj();

foreach ($_GET as $k=>$v) {
     $request->setParameter($k, $v);
}

ms_ioinstallstdouttobuffer();
$oMap = ms_newMapobj("urbanview.map");


//neighbourhoods layer
$new_layer =ms_newlayerobj($oMap);
$new_layer->set("type", MS_LAYER_POLYGON);
$new_layer->set("dump", 1);
$new_layer->set("status", 1);
$new_layer->set("name","nypp");
//$new_layer->set("template","infotemplate.html");
$new_layer->setMetaData("wms_name","urbanview");
$new_layer->setMetaData("wms_extent","913154.843600 120114.582600 1067382.510900 272932.046000");
$new_layer->setMetaData("gml_include_items","all");
$new_layer->setMetaData("gml_featureid","precinct");
$new_layer->setMetaData("wms_feature_info_mime_type","text/html");
$new_class = ms_newClassObj($new_layer);
$new_style = ms_newStyleObj($new_class);
//$new_style->color->setRGB(255,204,0);
$new_style-> outlinecolor->setRGB(0, 0, 0);





$new_layer->setConnectionType(MS_POSTGIS);
$new_layer->set("connection","user=root password=root dbname=nycurbanview host=localhost");
$data="geom from (select * from nycuhf42 order by gid) as foo using unique uhfcode using SRID=3857";
$new_layer->set("data",$data) ;

//schools layer

$new_layer1 =ms_newlayerobj($oMap);
$new_layer1->set("type", MS_LAYER_POLYGON);
$new_layer1->set("dump", 1);
$new_layer1->set("status", 1);
$new_layer1->set("name","schools");
//$new_layer->set("template","infotemplate.html");
$new_layer1->setMetaData("wms_name","urbanview");
$new_layer1->setMetaData("wms_extent","913154.843600 120114.582600 1067382.510900 272932.046000");
$new_layer1->setMetaData("gml_include_items","all");
$new_layer1->setMetaData("gml_featureid","precinct");
$new_layer1->setMetaData("wms_feature_info_mime_type","text/html");
$new_class1 = ms_newClassObj($new_layer1);
$new_style1 = ms_newStyleObj($new_class1);
//$new_style1->color->setRGB(255,204,0);
$new_style1->outlinecolor->setRGB(255, 0, 0);
$new_layer1->setConnectionType(MS_POSTGIS);
$new_layer1->set("connection","user=root password=root dbname=nycurbanview host=localhost");
$data="geom from (select gid,ST_Buffer(geom,100) as geom from schools order by gid) as foo using unique gid using SRID=3857";
$new_layer1->set("data",$data) ;

//Crime data layer

$new_layer2 =ms_newlayerobj($oMap);
$new_layer2->set("type", MS_LAYER_POLYGON);
$new_layer2->set("dump", 1);
$new_layer2->set("status", 1);
$new_layer2->set("name","crime");
//$new_layer->set("template","infotemplate.html");
$new_layer2->setMetaData("wms_name","urbanview");
$new_layer2->setMetaData("wms_extent","913154.843600 120114.582600 1067382.510900 272932.046000");
$new_layer2->setMetaData("gml_include_items","all");
$new_layer2->setMetaData("gml_featureid","precinct");
$new_layer2->setMetaData("wms_feature_info_mime_type","text/html");
$new_class2 = ms_newClassObj($new_layer2);
$new_class2->setExpression('[precinct] > 50');
$new_style2 = ms_newStyleObj($new_class2);
$new_style2->color->setRGB(255,204,0);
$new_style2->outlinecolor->setRGB(255, 0, 0);
$new_layer2->setConnectionType(MS_POSTGIS);
$new_layer2->set("connection","user=root password=root dbname=nycurbanview host=localhost");
$data="geom from (select * from nypp order by gid) as foo using unique gid using SRID=3857";
$new_layer2->set("data",$data) ;



$oMap->owsdispatch($request);
$contenttype = ms_iostripstdoutbuffercontenttype();
if ($contenttype == 'image/png')
{
   header('Content-type: image/png');
   ms_iogetStdoutBufferBytes();
}
else
{
	$buffer = ms_iogetstdoutbufferstring();
	echo $buffer;
}
ms_ioresethandlers();


?>
