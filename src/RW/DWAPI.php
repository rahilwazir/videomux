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

require_once 'Dailymotion.php';

class DWAPI extends YTAPI
{
    private $_full_response = array();

    private $_api = null;

    public function __construct($ids)
    {
        $this->_api = new Dailymotion();
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

                $result = $this->_api->get('/video/' . $id, array(
                    'fields' => array('title', 'views_total', 'thumbnail_120_url', 'created_time', 'duration')
                ));

                $entry = $result;

                $this->_full_response[] = array(
                    'title' => $entry['title'],
                    'thumbnail' => $entry['thumbnail_120_url'],
                    'duration' =>  $this->dhms($entry['duration']),
                    'published_on' =>  $this->time_elapsed_string($entry['created_time']),
                    'views' => $entry['views_total'] . ' views',
                );
            }
        }
    }

    public function getVideos()
    {
        return $this->_full_response;
    }

}