(function (global) {
    function mount(options) {
        var video = document.getElementById(options.videoId);
        var button = document.getElementById(options.buttonId);
        var source = options.src;
        var hls = null;
        var prepared = false;

        if (!video || !source) {
            return;
        }

        function hideButton() {
            if (button) {
                button.classList.add("is-hidden");
            }
        }

        function showButton() {
            if (button && video.paused && video.currentTime === 0) {
                button.classList.remove("is-hidden");
            }
        }

        function prepare() {
            if (prepared) {
                return;
            }
            prepared = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
                return;
            }

            if (global.Hls && global.Hls.isSupported()) {
                hls = new global.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                hls.on(global.Hls.Events.MANIFEST_PARSED, function () {
                    if (!video.paused) {
                        return;
                    }
                    video.play().catch(function () {
                        showButton();
                    });
                });
                hls.on(global.Hls.Events.ERROR, function (event, data) {
                    if (!data || !data.fatal) {
                        return;
                    }
                    if (data.type === global.Hls.ErrorTypes.NETWORK_ERROR) {
                        hls.startLoad();
                    } else if (data.type === global.Hls.ErrorTypes.MEDIA_ERROR) {
                        hls.recoverMediaError();
                    } else {
                        hls.destroy();
                    }
                });
                return;
            }

            video.src = source;
        }

        function start() {
            prepare();
            hideButton();
            var attempt = video.play();
            if (attempt && typeof attempt.catch === "function") {
                attempt.catch(function () {
                    showButton();
                });
            }
        }

        if (button) {
            button.addEventListener("click", start);
        }
        video.addEventListener("click", function () {
            if (video.paused) {
                start();
            }
        });
        video.addEventListener("play", hideButton);
        video.addEventListener("ended", showButton);
        window.addEventListener("pagehide", function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    global.SitePlayer = {
        mount: mount
    };
})(window);
