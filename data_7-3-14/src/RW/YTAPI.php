<?php
/**
 * Videomux
 *
 * @package
 *
 * @author Rw
 * @copyright 2014
 * @version 1.2
 * @access public
 */
class YTAPI
{
    private $_full_response = array();

    public function __construct($ids)
    {
        $this->totalIds($ids);
    }

    /**
     * Collecting video id
     * @param string $str
     * @return array
     */
    public function totalIds($str = '')
    {
        if ($str) {
            $str = preg_replace('/\s+/', '', rtrim($str, ','));
            $ids = explode(',', $str);

            foreach ($ids as $id) {
                $response = $this->getUrl('https://gdata.youtube.com/feeds/api/videos/' . $id . '?alt=json');

                $entry = $response['entry'];

                $this->_full_response[] = array(
                    'title' => $entry['title']['$t'],
                    'thumbnail' => $entry['media$group']['media$thumbnail'][1]['url'],
                    'duration' =>  $this->dhms($entry['media$group']['yt$duration']['seconds']),
                    'published_on' =>  $this->time_elapsed_string($entry['published']['$t']),
                    'views' => $entry['yt$statistics']['viewCount'] . ' views',
                );
            }
        }
    }

    public function getVideos()
    {
        return $this->_full_response;
    }

    public function time_elapsed_string($ptime)
    {
        if ( !is_numeric($ptime) ) {
            $ptime = strtotime($ptime);
        }

        $etime = time() - $ptime;

        if ($etime < 1)
        {
            return '0 seconds';
        }

        $a = array(12 * 30 * 24 * 60 * 60 => 'year',
            30 * 24 * 60 * 60 => 'month',
            24 * 60 * 60 => 'day',
            60 * 60 => 'hour',
            60 => 'minute',
            1 => 'second'
        );

        foreach ($a as $secs => $str)
        {
            $d = $etime / $secs;
            if ($d >= 1)
            {
                $r = round($d);
                return $r . ' ' . $str . ($r > 1 ? 's' : '') . ' ago';
            }
        }
    }

    public function dhms($time_str)
    {
        $str = '';

        if ($time_str > 86400)
        {
            $days = floor($time_str / (60 * 60 * 24));
            $time_str -= $days * (60 * 60 * 24);
            $str .= "{$days}:";
        }

        if ($time_str > 3600)
        {
            $hours = floor($time_str / (60 * 60));
            $time_str -= $hours * (60 * 60);
            $str .= "{$hours}:";
        }

        $minutes = floor($time_str / 60);
        $time_str -= $minutes * 60;
        $str .= "{$minutes}:";

        $seconds = floor($time_str);
        $time_str -= $seconds;
        $str .= "{$seconds}";

        return trim($str);
    }

    /**
     * Insert URL for dpad api
     * @param string $url
     * @return type Object
     */
    public function getUrl($url)
    {
        //  Initiate curl
        $ch = curl_init();

        // Disable SSL verification
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

        // Will return the response, if false it print the response
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

        // Set the url
        curl_setopt($ch, CURLOPT_URL, $url);

        // Execute
        $result = curl_exec($ch);

        return json_decode($result, true);
    }

    static function archiveVideo($id, $title = null, $width = "100%", $height = "468px")
    {
        $output = '<iframe title="' . $title . '" class="youtube-player" type="text/html" width="' . $width . '" height="' . $height . '" src="http://www.youtube.com/embed/' . $id . '" frameborder="0" allowFullScreen></iframe>';

        return $output;
    }

}