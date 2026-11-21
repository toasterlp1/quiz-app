
(function () {
  var BREITE = 1920;
  var HOEHE = 1080;
  var GRENZE = 1100; // ab dieser Fensterbreite nicht mehr skalieren

  function passtSchon() {
    if (window.innerWidth >= GRENZE) return true;
    if (window.innerHeight > window.innerWidth) return true;
    return false;
  }

  function anwenden() {
    var body = document.body;
    if (!body) return;

    if (passtSchon()) {
      body.style.transform = '';
      body.style.width = '';
      body.style.height = '';
      body.style.transformOrigin = '';
      document.documentElement.style.overflow = '';
      return;
    }

    var faktor = Math.min(
      window.innerWidth / BREITE,
      window.innerHeight / HOEHE
    );

    body.style.transformOrigin = 'top left';
    body.style.transform = 'scale(' + faktor + ')';
    body.style.width = BREITE + 'px';
    body.style.height = HOEHE + 'px';

    var restX = window.innerWidth - BREITE * faktor;
    var restY = window.innerHeight - HOEHE * faktor;
    body.style.marginLeft = (restX > 0 ? restX / 2 : 0) + 'px';
    body.style.marginTop = (restY > 0 ? restY / 2 : 0) + 'px';

    document.documentElement.style.overflow = 'hidden';
    document.documentElement.style.background = getComputedStyle(body).backgroundColor || '#0b0e14';
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', anwenden);
  } else {
    anwenden();
  }
  window.addEventListener('resize', anwenden);
  window.addEventListener('orientationchange', function () {
    setTimeout(anwenden, 120);
  });
})();
