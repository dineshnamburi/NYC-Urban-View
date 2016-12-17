<?php
error_reporting(E_ALL);
ini_set('display_errors', 'on');
$request = ms_newowsrequestobj();

foreach ($_GET as $k=>$v) {
     $request->setParameter($k, $v);
}

ms_ioinstallstdouttobuffer();
$oMap = ms_newMapobj("proj2.map");

$new_layer =ms_newlayerobj($oMap);
$new_layer->set("type", MS_LAYER_POLYGON);
$new_layer->set("dump", 1);
$new_layer->set("status", 1);
$new_layer->set("name","nypp");
//$new_layer->set("template","infotemplate.html");
$new_layer->setMetaData("wms_name","nypp");
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
$data="geom from (select * from nycuhf42 order by uhfcode) as foo using unique uhfcode using SRID=3857";
$new_layer->set("data",$data) ;

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
