(function () {
  var btn = document.createElement('button');
  btn.setAttribute('aria-label', 'Zurück');
  btn.id = 'ka-zurueck';
  btn.innerHTML =
    '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" ' +
    'stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M19 12H5"></path><path d="M12 19l-7-7 7-7"></path></svg>';

  var css = document.createElement('style');
  css.textContent =
    '#ka-zurueck{' +
      'position:fixed;' +
      'top:calc(10px + env(safe-area-inset-top, 0px));' +
      'left:calc(10px + env(safe-area-inset-left, 0px));' +
      'z-index:99999;' +
      'width:44px;height:44px;' +
      'display:flex;align-items:center;justify-content:center;' +
      'background:rgba(17,26,48,0.85);' +
      'color:#eef1f8;' +
      'border:1px solid #1e2a4a;' +
      'border-radius:50%;' +
      'cursor:pointer;' +
      'padding:0;' +
      'backdrop-filter:blur(4px);' +
      '-webkit-backdrop-filter:blur(4px);' +
      'transition:background 0.15s ease,border-color 0.15s ease;' +
    '}' +
    '#ka-zurueck:hover{background:#16223f;border-color:#ff4d4d;}' +
    '#ka-zurueck:focus-visible{outline:2px solid #ff4d4d;outline-offset:2px;}' +
    '#ka-zurueck svg{display:block;}' +

    'body{padding-left:0;}' +
    '@media (min-width:700px){ body > h1:first-of-type, body > h2:first-of-type { margin-left:60px; } }';

  btn.addEventListener('click', function () {

    // Wer bewusst zurueck/Home geht, klinkt sich aus dem Turnier aus
    // und wird nicht mehr ins naechste Format gezogen - bis er selbst
    // wieder ein Format oeffnet.
    try { if (window.TURNIER && TURNIER.klinkeAus) TURNIER.klinkeAus(); } catch (e) {}

    var kamVonEigenerSeite = document.referrer &&
      document.referrer.indexOf(location.origin) === 0;

    if (kamVonEigenerSeite && history.length > 1) {
      history.back();
    } else {

      location.href = '../';
    }
  });

  function einfuegen() {
    document.head.appendChild(css);
    document.body.appendChild(btn);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', einfuegen);
  } else {
    einfuegen();
  }
})();
