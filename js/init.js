/**
 * VidemoMux
 * @author Rw
 * @year 2014
 */


var VideoMux = (function(w, $) {

    w.ytplayer = undefined, w.ytplayerTarget = undefined, w.ytplayerTargetData = undefined, w.dmplayer = undefined;

    Defaults = {
        dailyMotion: {
            apiKey: '4aceae9bfc754d138c05',
            elem: 'DM_player'
        },

        youTube: {
            elem: 'YT_player'
        },

        videoOptions: {
            mainWidth: '680',
            mainHeight: '403',
            mainVideoElem: 'main-video',
            videoIndex: 0,
            totalVideosLength: 0,
            YT_CALLS: 0,
            DM_CALLS: 0
        }
    };

    w.onYouTubeIframeAPIReady = function() {
        ytplayer = new YT.Player(Defaults.youTube.elem, {
            height: Defaults.videoOptions.mainHeight,
            width: Defaults.videoOptions.mainWidth,
            playerVars: {
                autoplay: 0
            },
            events: {
                'onReady': loadVideo,
                'onStateChange': stateChange
            }
        });
    };

    w.loadVideo = function(e) {
        w.ytplayerTarget = e.target;
        console.log(w.ytplayerTarget);
    };

    w.triggerNextVideo = function() {
        if ( Defaults.videoOptions.videoIndex >= Defaults.videoOptions.totalVideosLength ) {
            Defaults.videoOptions.videoIndex = 0;
            $('.right-side .content').eq(Defaults.videoOptions.videoIndex).trigger('click');
        } else {
            ++Defaults.videoOptions.videoIndex;
            $('.right-side .content').eq(Defaults.videoOptions.videoIndex).trigger('click');
        }
    };

    w.stateChange = function(event) {
        ytplayerTargetData = event;

        switch (ytplayerTargetData.data) {
            case 0:
                triggerNextVideo();
                break;
            default:
                break;
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
                    width: Defaults.videoOptions.mainWidth,
                    height: Defaults.videoOptions.mainHeight
                };

            $(document).on('submit', 'form[name="video-inputs"]', function (e) {
                e.preventDefault();

                var data = $(this).serializeArray(),
                    vidID, StartTime, EndTime, startTimeInput, endTimeInput,
                    videoData = {}, startTimeData = {}, endTimeData = {},
                    _i = 0, _x = 0, _y = 0;

                // collecting videos
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

                var ytVideos = '', dmVideos = '';

                for (var i in videoData) {
                    if ( videoData[i].length == 11 ) {
                        ytVideos += videoData[i] + ',';
                    } else if (videoData[i].indexOf('x') === 0) {
                        dmVideos += videoData[i] + ',';
                    }
                }

                // get video meta data
                $.ajax({
                    type: 'post',
                    url: 'src/RW/apicall.php',
                    data: {
                        ytvideoIds: ytVideos || '',
                        dmvideoIds: dmVideos || ''
                    },
                    beforeSend: function () {
                        $('.preloader').removeClass('disable');
                        $('.video-context').children(':not(.preloader)').addClass('disable');
                    },
                    success: function (data) {
                        if (data){
                            try {
                                var result = JSON.parse(data),
                                    youtubeData = result.youtube,
                                    dailymotionData = result.dailymotion,
                                    yti = 0,
                                    dmi = 0;

                                // compiling videos
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

                                    if (x.length === 11 && youtubeData[yti] ) {
                                        output += '<a href="#" class="content' + ((_index === 0) ? ' current' : '') + ' clearfix">';
                                        output += '<div class="thumbnail"><img src="'+ youtubeData[yti].thumbnail + '" alt="' + youtubeData[yti].title + '"/>' +
                                            '<span class="duration">' + youtubeData[yti].duration + '</span></span></div>';
                                        output += '<div class="fright video-details"><h3>' + youtubeData[yti].title + '</h3>';
                                        output += '<span>' + youtubeData[yti].views + '</span>';
                                        output += '<span>' + youtubeData[yti].published_on + '</span></div>';
                                        output += '<input type="hidden" name="url" value="' + x + '">';
                                        output += '<input type="hidden" name="start" value="' + (startTimeData[_index] || '') + '">';
                                        output += '<input type="hidden" name="end" value="' + (endTimeData[_index] || '') + '">';
                                        output += '</a>';
                                        yti++;
                                    } else if (x.indexOf('x') === 0 && dailymotionData[dmi]) {
                                        output += '<a href="#" class="content' + ((_index === 0) ? ' current' : '') + ' clearfix">';
                                        output += '<div class="thumbnail"><img src="'+ dailymotionData[dmi].thumbnail + '" alt="' + dailymotionData[dmi].title + '"/>' +
                                            '<span class="duration">' + dailymotionData[dmi].duration + '</span></span></div>';
                                        output += '<div class="fright video-details"><h3>' + dailymotionData[dmi].title + '</h3>';
                                        output += '<span>' + dailymotionData[dmi].views + '</span>';
                                        output += '<span>' + dailymotionData[dmi].published_on + '</span></div>';
                                        output += '<input type="hidden" name="url" value="' + x + '">';
                                        output += '<input type="hidden" name="start" value="' + (startTimeData[_index] || '') + '">';
                                        output += '<input type="hidden" name="end" value="' + (endTimeData[_index] || '') + '">';
                                        output += '</a>';
                                        dmi++;
                                    }

                                    $('.right-side').append(output);
                                });

                            } catch(e) {
                                console.log(e + ', Please try again.'); //error in the above string(in this case,yes)!
                            }

                            Defaults.videoOptions.totalVideosLength = $('.right-side .content').length - 1;

                            $('.video-context').children().removeClass('disable').addClass('enable');
                            $('.preloader').removeClass('enable').addClass('disable');
                        }
                    }
                }); // end of ajax
            });

            $(document).on('click', '.content', function(e) {
                e.preventDefault();

                try {
                    w.ytplayerTarget.stopVideo();
                    dmplayer.pause();
                } catch (e) {

                }

                Defaults.videoOptions.videoIndex = $(this).index();
                finalSetup.ID = $(this).find('input[name=url]').val(),
                finalSetup.start = $(this).find('input[name=start]').val(),
                finalSetup.stop = $(this).find('input[name=end]').val();

                if ( finalSetup.ID.length === 11 ) {
                    self.initYT(finalSetup);
                } else if ( finalSetup.ID.indexOf('x') === 0 ) {
                    self.initDM(finalSetup);
                }

                $('.content').removeClass('current').eq(Defaults.videoOptions.videoIndex).addClass('current');
            });

        },

        initYT: function (obj) {
            var element = Defaults.youTube.elem;

            $('#youtube').removeClass('disable');
            $('#daily-motion').addClass('disable');

            var setup = {};

            setup.videoId = obj.ID,
            setup.startSeconds = (obj.start || 0);

            if ( obj.stop > obj.start ) {
                setup.endSeconds = obj.stop;
            }

            w.ytplayerTarget.loadVideoById(setup);
        },

        initDM: function(obj) {
            var self = this,
                element = (obj.elem || Defaults.dailyMotion.elem);

            $('#youtube').addClass('disable');
            $('#daily-motion').removeClass('disable');

            DM.init({
                apiKey: Defaults.dailyMotion.apiKey

            });

            var dmplayer = DM.player(element, {
                video: obj.ID,
                width: obj.width,
                height: obj.height,
                params: {
                    autplay: 1,
                    html: 0
                }
            }), playIterator = 0, stopTime = obj.stop, startTime = obj.start;

            $(dmplayer).on('apiready seeking timeupdate seeked play pause', function(e) {
                var dmplayer = e.target,
                    currentTime = parseInt(dmplayer.currentTime) + 1;

                switch ( e.type ) {
                    case 'play':
                    case 'apiready':
                        dmplayer.play();
                        if (playIterator == 0) {
                            e.target.seek(startTime);
                        }
                        break;

                    case 'seeking':
                    case 'timeupdate':
                    case 'seeked':
                        if ( stopTime !== -1 && stopTime > 0 ) {
                            if ( currentTime >= stopTime ) {
                                dmplayer.pause();
                            }
                        }
                        playIterator = 1;
                        break;
                    case 'pause':
                        triggerNextVideo();
                    default:
                        break;
                }
            });
        }
    };

})(window, jQuery).init();

// Inject YouTube API script
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];

firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);