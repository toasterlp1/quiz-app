/*
  Skaliert Host-Seiten mit fest verdrahteter Buehne (1920x1080) so,
  dass sie vollstaendig auf den Bildschirm passen.

  Betrifft nur Modi, deren Layout auf absolute Pixelpositionen
  gebaut ist und sich daher nicht per CSS umbrechen laesst.
  Auf grossen Schirmen passiert nichts.
*/
(function () {
  var BREITE = 1920;
  var HOEHE = 1080;
  var GRENZE = 1100; // ab dieser Fensterbreite nicht mehr skalieren

  function passtSchon() {
    // Auf grossen Schirmen nichts tun.
    if (window.innerWidth >= GRENZE) return true;
    // Im Hochformat greift die CSS-Anpassung (Layout bricht um).
    // Skaliert wuerde die Buehne dort auf ~20 Prozent schrumpfen
    // und waere unlesbar. Also nur im Querformat skalieren.
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

    // Rand ausgleichen, damit die Buehne mittig sitzt
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
