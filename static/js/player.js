window.audioContext = new (window.AudioContext || window.webkitAudioContext)();

window.onload = function() {
    var players = document.getElementsByClassName('player');
    var volumeBar = document.getElementsByClassName('volume')[0];

    for (var i = 0; i < players.length; i++) {
        (function() {
            var player = players[i];
            var audio = player.getElementsByClassName('audio')[0];
            var playButton = player.getElementsByClassName('play')[0];
            var pauseButton = player.getElementsByClassName('pause')[0];
            var stopButton = player.getElementsByClassName('stop')[0];
            var seekBar = player.getElementsByClassName('seek')[0];

            playButton.addEventListener('click', function() {
                audio.play();
            });

            pauseButton.addEventListener('click', function() {
                audio.pause();
            });

            stopButton.addEventListener('click', function() {
                audio.pause();
                audio.currentTime = 0;
            });

            audio.addEventListener('timeupdate', function() {
                var position = audio.currentTime / audio.duration;
                seekBar.value = position * 100;
            });

            seekBar.addEventListener('input', function() {
                var seekTime = audio.duration * (seekBar.value / 100);
                audio.currentTime = seekTime;
            });
        })();
    }

    volumeBar.addEventListener('input', function() {
        for (var i = 0; i < players.length; i++) {
            var player = players[i];
            var audio = player.getElementsByClassName('audio')[0];
            audio.volume = volumeBar.value;
        }
    });
}