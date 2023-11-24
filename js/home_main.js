const video = document.getElementById('video');

video.addEventListener('click', function() {
  if (video.paused) {
    video.play();
  } else {
    video.pause();
  }
});
