/**
 * VidemoMux
 * @author Rw
 * @year 2014
 * @type {*}
 */

//// global variable for the player
//var player;
//
//// this function gets called when API is ready to use
//function onYouTubePlayerAPIReady() {
//    // create the global player from the specific iframe (#video)
//    player = new YT.Player('main-video', {
//        videoId: 'M7lc1UVf-VE',
//        events: {
//            // call this function when player is ready to use
//            'onReady': onPlayerReady
//        }
//    });
//}
//
//function onPlayerReady(event) {
//    alert('1');
//}

var VideoMux = (function() {
    var Defaults = {
        dailyMotion: {
            apiKey: '4aceae9bfc754d138c05'
        },

        youTube: {

        },

        videoOptions: {
            mainWidth: '680',
            mainHeight: '403',
            mainVideoElem: 'main-video',
            videoIndex: 0,
            totalVideosLength: 0
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
                finalSetup = {
                    elem: Defaults.videoOptions.mainVideoElem,
                    width: Defaults.videoOptions.mainWidth,
                    height: Defaults.videoOptions.mainHeight
                };

            $(document).on('submit', 'form[name="video-inputs"]', function (e) {
                e.preventDefault();

                var data = $(this).serializeArray(),
                    vidID, StartTime, EndTime, startTimeInput, endTimeInput,
                    videoData = {}, startTimeData = {}, endTimeData = {},
                    _i = 0, _x = 0, _y = 0;

                $.each(data, function (e, x) {

                    // process video url
                    if ( e % 3 === 0 ) {
                        if ( $.trim(x.value) !== '' ) {
                            var YT_ID = self.utils.extract_YT_ID(x.value);
                            var DM_ID = self.utils.extract_DM_ID(x.value);

                            if ( YT_ID || DM_ID ) {
                                $('input[name=' + x.name + ']').removeClass('error');

                                if ( YT_ID ) vidID = YT_ID;

                                if ( DM_ID ) vidID = DM_ID;

                                videoData[_i] = vidID; _i++;

                            } else {
                                $('input[name=' + x.name + ']').addClass('error');
                            }

                        } else {
                            if ( e == 0 ) $('input[name=' + x.name + ']').addClass('error');
                        }
                    }

                    // process start time
                    if ( e % 3 === 1 ) {
                        if ( $.trim(x.value) !== '' ) {
                            var strtTime = parseInt(x.value); startTimeInput = x.name;

                            if ( !isNaN(strtTime) ) {
                                StartTime = strtTime;
                                startTimeData[_x] = x.value;

                                $('input[name=' + x.name + ']').removeClass('error');
                            } else {
                                $('input[name=' + x.name + ']').addClass('error');
                                startTimeData[_x] = 0;
                            }
                        } else {
                            startTimeData[_x] = 0;
                        }
                        _x++;
                    }

                    // process end time
                    if ( e % 3 === 2 ) {
                        if ( $.trim(x.value) !== '' ) {
                            var endTime = parseInt(x.value); endTimeInput = x.name;

                            if ( !isNaN(endTime) ) {
                                $('input[name=' + x.name + ']').removeClass('error');

                                if ( StartTime < endTime && typeof startTimeInput !== "undefined" ) {
                                    EndTime = endTime,
                                    endTimeData[_y] = x.value;
                                } else {
                                    $('input[name=' + startTimeInput + ']').addClass('error');
                                    endTimeData[_y] = 0;
                                }

                            } else {
                                $('input[name=' + x.name + ']').addClass('error');
                                endTimeData[_y] = 0;
                            }
                        } else {
                            endTimeData[_y] = 0;
                        }
                        _y++;
                    }

                }); //end each loop

                // console.log(startTimeData, endTimeData);

                $.each(videoData, function (e, x) {
                    var _index = parseInt(e, 10);

                    if ( _index === 0 ) {
                        $('.right-side').empty();

                        finalSetup.ID = x,
                        finalSetup.start = startTimeData[_index],
                        finalSetup.stop = endTimeData[_index];

                        if ( x.length === 11 ) {
                            self.initYT(finalSetup);
                        } else if ( x.indexOf('x') === 0 ) {
                            self.initDM(finalSetup);
                        }
                    }

                    var output = '';

                    output += '<a href="#" class="content clearfix">';
                    output += '<img src="images/v1.jpg" alt=""/>';
                    output += '<div class="fright video-details"><h3>Sniper Elite V2 WalkThrough.</h3>';
                    output += '<span>192 Views,</span>';
                    output += '<span>2 Months ago</span></div>';
                    output += '<input type="hidden" name="url" value="' + x + '">';
                    output += '<input type="hidden" name="start" value="' + (startTimeData[_index] || '') + '">';
                    output += '<input type="hidden" name="end" value="' + (endTimeData[_index] || '') + '">';
                    output += '</a>';

                    $('.right-side').append(output);

                });

                Defaults.videoOptions.totalVideosLength = $('.right-side .content').length - 1;
            });

            $(document).on('click', '.content', function(e) {
                e.preventDefault();

                Defaults.videoOptions.videoIndex = $(this).index();

                finalSetup.ID = $(this).find('input[name=url]').val(),
                finalSetup.start = $(this).find('input[name=start]').val(),
                finalSetup.stop = $(this).find('input[name=end]').val();

                if ( finalSetup.ID.length === 11 ) {
                    self.initYT(finalSetup);
                } else if ( finalSetup.ID.indexOf('x') === 0 ) {
                    self.initDM(finalSetup);
                }
            })

        },

        initYT: function (obj) {

            var params = { allowScriptAccess: "always" }, atts = { id: 'YT_VID', name: 'YT_VID' },
                url = 'https://www.youtube.com/v/' + obj.ID + '?enablejsapi=1&playerapiid=ytplayer&version=3&start=' + (obj.start || 0) + '&autoplay=1' + ((obj.stop > obj.start) ? '&end=' + obj.stop : '');

            // $( '.main-vid' ).empty().append('<iframe width="' + obj.width + '" height="' + obj.height + '" src="' + url + '" frameborder="0" allowfullscreen id="' + obj.elem + '"></iframe>');

            var player;

            window.onYouTubePlayerAPIReady = function() {
                player = new YT.Player(obj.elem, {
                    videoId: obj.ID,
                    height: obj.height,
                    width: obj.width,
                    playerVars: {
                        start: (obj.start || 0),
                        end: (obj.stop || 0),
                        autplay: 1
                    },
                    events: {
                        'onReady': onPlayerReady
                    }
                });
            }

            window.onPlayerReady = function(event) {
                alert('1');
            }

            // Inject YouTube API script
            var tag = document.createElement('script');
            tag.src = "https://www.youtube.com/player_api";
            var firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

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
                }
            }), playIterator = 0, stopTime = obj.stop, startTime = obj.start;

            $(player).on('apiready seeking timeupdate seeked play', function(e) {
                var player = e.target,
                    currentTime = parseInt(player.currentTime) + 1;

                switch ( e.type ) {
                    case 'play':
                    case 'apiready':
                        player.play();
                        if (playIterator == 0) {
                            e.target.seek(startTime);
                        }
                        break;

                    case 'seeking':
                    case 'timeupdate':
                    case 'seeked':
                        if ( stopTime !== -1 && stopTime > 0 ) {
                            if ( currentTime >= stopTime ) {
                                player.pause();
                                if ( Defaults.videoOptions.videoIndex == Defaults.videoOptions.totalVideosLength ) {
                                    $('.right-side .content').eq(0).trigger('click');
                                    Defaults.videoOptions.videoIndex = 0;
                                } else {
                                    Defaults.videoOptions.videoIndex++;
                                    $('.right-side .content').eq(Defaults.videoOptions.videoIndex).trigger('click');
                                }
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
