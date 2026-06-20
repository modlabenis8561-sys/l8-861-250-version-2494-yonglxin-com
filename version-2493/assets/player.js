(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var players = Array.prototype.slice.call(document.querySelectorAll(".js-player"));

        players.forEach(function (root) {
            var video = root.querySelector("video");
            var button = root.querySelector(".js-play");
            var initialized = false;
            var hls = null;

            function attachStream() {
                if (initialized || !video) {
                    return;
                }

                initialized = true;
                var stream = video.getAttribute("data-stream");

                if (!stream) {
                    return;
                }

                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = stream;
                    return;
                }

                if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        video.play().catch(function () {});
                    });
                    hls.on(window.Hls.Events.ERROR, function (event, data) {
                        if (!data || !data.fatal) {
                            return;
                        }

                        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                            hls.startLoad();
                        } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                            hls.recoverMediaError();
                        } else {
                            hls.destroy();
                        }
                    });
                } else {
                    video.src = stream;
                }
            }

            function startPlayback() {
                attachStream();

                if (button) {
                    button.classList.add("is-hidden");
                }

                if (video) {
                    video.play().catch(function () {});
                }
            }

            if (button) {
                button.addEventListener("click", startPlayback);
            }

            if (video) {
                video.addEventListener("click", function () {
                    if (!initialized) {
                        startPlayback();
                    }
                });
            }

            window.addEventListener("pagehide", function () {
                if (hls) {
                    hls.destroy();
                }
            });
        });
    });
})();
