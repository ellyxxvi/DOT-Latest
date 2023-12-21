const token = localStorage.getItem('access_token');
if (!token) {
  // If not logged in, hide the recommended iframe
  const recommendedIframe = document.getElementById('recommendedIframe');
  if (recommendedIframe) {
    recommendedIframe.style.display = 'none';
  }
}
const video = document.getElementById('video');

video.addEventListener('click', function () {
  if (video.paused) {
    video.play();
  } else {
    video.pause();
  }
});
