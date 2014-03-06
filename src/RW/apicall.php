<?php
date_default_timezone_set('GMT');

require_once 'YTAPI.php';
require_once 'DWAPI.php';

$yt = new YTAPI(filter_input(0, 'ytvideoIds'));
$dm = new DWAPI(filter_input(0, 'dmvideoIds'));

echo json_encode(array_merge(
    array('youtube' => $yt->getVideos()),
    array('dailymotion' => $dm->getVideos())
));

exit;