/**
 * VidemoMux
 * @author Rw
 * @year 2014
 * @type {*}
 */

var VideoMux = (function() {
    var VIDEO_SERVICE = ['youtube', 'dailytion'];

    var Defaults = {
        vimeo: {

        },

        dailyMotion: {
            apiKey: '4aceae9bfc754d138c05',
            elem: 'DM_player',
            startTime: 10,
            stopTime: 20,
            ID: "xctlec"
        },

        youTube: {
            elem: 'YT_player',
            startTime: 10,
            stopTime: 20,
            ID: "GUNHbU7LnM4"
        },

        videoOptions: {
            mainWidth: '680',
            mainHeight: '403',
            mainVideoElem: 'main-video'
        }
    };

    return {
        utils: {
            extract_YT_ID: function (value) {
                var match = value.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/);
                if ( match && match[2].length==11 ){
                    return match[2];
                }

                return false;
            },

            extract_DM_ID: function getDailyMotionId(value) {
                var m = value.match(/^.+dailymotion.com\/((video|hub)\/([^_]+))?[^#]*(#video=([^_&]+))?/);
                return m ? m[5] || m[3] : false;
            }
        },

        init: function() {
            var self = this,
                IDS = {};

            $(document).on('submit', 'form[name="video-inputs"]', function (e) {
                e.preventDefault()

                var data = $(this).serializeArray();
                $.each(data, function (e, x) {
                    // process video url
                    if ( x.name.indexOf('video') !== -1 ) {
                        if ( $.trim(x.value) !== '' ) {
                            var YT_ID = self.utils.extract_YT_ID(x.value);
                            var DM_ID = self.utils.extract_DM_ID(x.value);

                            if ( YT_ID || DM_ID ) {
                                $('input[name=' + x.name + ']').removeClass('error');

                                if ( YT_ID ) {
                                    self.initYT({
                                        elem: '#' + Defaults.videoOptions.mainVideoElem,
                                        ID: new String(YT_ID).valueOf(),
                                        width: Defaults.videoOptions.mainWidth,
                                        height: Defaults.videoOptions.mainHeight
                                    });
                                } else if ( DM_ID ) {
                                    self.initDM({
                                        elem: Defaults.videoOptions.mainVideoElem,
                                        ID: new String(DM_ID).valueOf(),
                                        width: Defaults.videoOptions.mainWidth,
                                        height: Defaults.videoOptions.mainHeight
                                    });
                                }

                            } else {
                                $('input[name=' + x.name + ']').addClass('error');
                            }

                        } else {
                            $('input[name=' + x.name + ']').addClass('error');
                        }
                    }

                    // process start/end time                    
                    if ( x.name.indexOf('srttime') !== -1 || x.name.indexOf('endtime') !== -1 ) {

                    }
                });
            });

            // initialize Daily Motion
            /*this.initDM({
             elem: Defaults.dailyMotion.elem || 'player',
             start: Defaults.dailyMotion.startTime || 0,
             stop: Defaults.dailyMotion.stopTime || -1,
             ID: new String(Defaults.dailyMotion.ID || "x1b4bhs").valueOf()
             });*/

            /*this.initYT({
             elem: Defaults.youTube.elem || 'player',
             start: Defaults.youTube.startTime || 0,
             stop: Defaults.youTube.stopTime || -1,
             ID: new String(Defaults.youTube.ID || "GUNHbU7LnM4").valueOf()
             });*/
        },

        initYT: function (obj) {

            var params = { allowScriptAccess: "always" }, atts = { id: 'YT_VID' },
                url = 'https://www.youtube.com/v/' + obj.ID + '?enablejsapi=1&playerapiid=ytplayer&version=3&start=0&autoplay=1';

            // swfobject.embedSWF(url, obj.elem, '640', '480', '8', null, null, params, atts);

            $( obj.elem ).html('<iframe width="' + obj.width + '" height="' + obj.height + '" src="' + url + '" frameborder="0" allowfullscreen id="video"></iframe>');

            /*$(document).on('click', '.onclick', function(e) {
             e.preventDefault();
             swfobject.embedSWF(url, obj.elem, '640', '480', '8', null, null, params, atts);
             });*/

            var player = new YT.Player( 'video', {
                events: {
                    'onReady': onPlayerReady
                }
            });

            function onPlayerReady(event) {
                // call methods on ready
            }
        },

        initDM: function(obj) {
            DM.init({
                apiKey: Defaults.dailyMotion.apiKey

            });

            var player = DM.player(obj.elem, {
                video: obj.ID,
                width: obj.width,
                height: obj.height,
                params: {
                    autplay: 1,
                    html: 0
                },
            }), playIterator = 0, stopTime = obj.stop, startTime = obj.start;

            $(player).on('apiready seeking timeupdate seeked play', function(e) {
                var player = e.target,
                    currentTime = parseInt(player.currentTime) + 1;

                switch ( e.type ) {
                    case 'play':
                    case 'apiready':
                        player.play();
                        if (playIterator == 0) {
                            console.log(startTime);
                            e.target.seek(startTime);
                        }
                        break;

                    case 'seeking':
                    case 'timeupdate':
                    case 'seeked':
                        if ( stopTime !== -1 && stopTime > 0 ) {
                            if ( currentTime >= stopTime ) {
                                player.pause();
                            }
                        }
                        playIterator = 1;
                        break;

                    default:
                        break;
                }
            });
        }
    };

})().init();
