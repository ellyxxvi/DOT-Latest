document.getElementById('playButton').addEventListener('click', function() {
    var video = document.getElementById('video');
    video.play();
    this.style.display = 'none'; 
});
