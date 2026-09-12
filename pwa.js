(function () {
  // ---- Kein Service Worker mehr: Updates sollen sofort vom Server kommen ----
  // Alte Installationen werden entfernt, ohne Browserdaten manuell löschen zu müssen.
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(function (regs) {
      return Promise.all(regs.map(function (reg) { return reg.unregister(); }));
    }).catch(function () {});
  }
  if ('caches' in window) {
    caches.keys().then(function (keys) {
      return Promise.all(keys
        .filter(function (key) { return /^quiz-app-/i.test(key); })
        .map(function (key) { return caches.delete(key); }));
    }).catch(function () {});
  }

  // ---- Styles für die Install-Leiste + Anleitung ----
  var css = document.createElement('style');
  css.textContent =
    '#pwa-bar{position:fixed;left:50%;bottom:20px;transform:translateX(-50%) translateY(140%);' +
    'z-index:99999;display:flex;align-items:center;gap:12px;padding:12px 18px;border-radius:14px;' +
    'background:rgba(17,26,48,.96);border:1px solid #2a3a5f;color:#eef1f8;' +
    'font-family:Inter,system-ui,sans-serif;font-size:14px;font-weight:600;' +
    'box-shadow:0 12px 40px -12px rgba(0,0,0,.7);transition:transform .4s cubic-bezier(.16,1,.3,1);' +
    'max-width:calc(100vw - 32px);}' +
    '#pwa-bar.an{transform:translateX(-50%) translateY(0);}' +
    '#pwa-bar span{line-height:1.4;}' +
    '#pwa-bar button{border:none;border-radius:10px;padding:9px 16px;font-weight:800;font-size:13px;' +
    'cursor:pointer;font-family:inherit;letter-spacing:.3px;white-space:nowrap;}' +
    '#pwa-bar .ja{background:#ff4d4d;color:#fff;}' +
    '#pwa-bar .nein{background:transparent;color:#8792ab;padding:9px 8px;}' +
    '#pwa-howto{position:fixed;inset:0;z-index:100000;display:none;align-items:center;justify-content:center;' +
    'background:rgba(4,8,18,.72);backdrop-filter:blur(4px);padding:20px;' +
    'font-family:Inter,system-ui,sans-serif;}' +
    '#pwa-howto.an{display:flex;}' +
    '#pwa-howto .box{background:#111a30;border:1px solid #2a3a5f;border-radius:18px;padding:24px;' +
    'max-width:420px;width:100%;color:#eef1f8;box-shadow:0 20px 60px -15px rgba(0,0,0,.8);' +
    'animation:pwaRise .35s cubic-bezier(.16,1,.3,1);}' +
    '@keyframes pwaRise{from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:translateY(0);}}' +
    '#pwa-howto h3{margin:0 0 4px;font-size:19px;font-family:Anton,Inter,sans-serif;letter-spacing:.5px;}' +
    '#pwa-howto .sub{color:#8792ab;font-size:13px;margin-bottom:16px;}' +
    '#pwa-howto ol{margin:0;padding-left:20px;line-height:1.7;font-size:14.5px;}' +
    '#pwa-howto ol b{color:#ff6b6b;}' +
    '#pwa-howto .menu-ico{display:inline-block;background:#243149;border-radius:5px;padding:1px 7px;font-weight:800;}' +
    '#pwa-howto .schliessen{margin-top:20px;width:100%;background:#243149;color:#eef1f8;border:none;' +
    'border-radius:11px;padding:12px;font-weight:800;font-size:14px;cursor:pointer;font-family:inherit;}';
  document.head.appendChild(css);

  function bar() {
    var b = document.getElementById('pwa-bar');
    if (b) return b;
    b = document.createElement('div');
    b.id = 'pwa-bar';
    document.body.appendChild(b);
    return b;
  }
  function zeige(b) { requestAnimationFrame(function () { b.classList.add('an'); }); }
  function weg(b) { b.classList.remove('an'); setTimeout(function () { if (b.parentNode) b.remove(); }, 400); }

  // ---- Browser-Erkennung ----
  var ua = navigator.userAgent;
  function istFirefoxBasiert() {
    return /firefox/i.test(ua) || /zen/i.test(ua);
  }
  function istOperaGX() {
    return /OPR\//i.test(ua) || /opera gx/i.test(ua);
  }
  function istOperaNormal() {
    return /OPR\//i.test(ua) || /opera/i.test(ua);
  }
  function laeuftAlsApp() {
    return (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
           window.navigator.standalone === true;
  }

  // ---- Manuelle Anleitung ----
  function zeigeAnleitung() {
    var vorhanden = document.getElementById('pwa-howto');
    if (vorhanden) { vorhanden.classList.add('an'); return; }

    var titel, schritte;
    if (istFirefoxBasiert()) {
      titel = 'In Zen / Firefox installieren';
      schritte =
        '<ol>' +
        '<li>Öffne das Browser-Menü oben rechts (<span class="menu-ico">≡</span> die drei Striche).</li>' +
        '<li>Wähle <b>„Diese Seite als App installieren“</b> oder <b>„Zum Startbildschirm hinzufügen“</b>.</li>' +
        '<li>Bestätigen — fertig. Die Quiz-App liegt dann als eigenes Fenster vor.</li>' +
        '</ol>';
    } else if (istOperaGX() || istOperaNormal()) {
      titel = 'In Opera GX installieren';
      schritte =
        '<ol>' +
        '<li>Schau in die Adressleiste — rechts erscheint ein <b>Installations-Symbol</b> (kleines Kästchen mit Pfeil / Plus).</li>' +
        '<li>Klick darauf und wähle <b>„Installieren“</b>.</li>' +
        '<li>Kein Symbol da? Öffne das Opera-Menü und suche <b>„Als App installieren“</b>.</li>' +
        '</ol>';
    } else {
      titel = 'App installieren';
      schritte =
        '<ol>' +
        '<li>Öffne das Browser-Menü (oben rechts).</li>' +
        '<li>Wähle <b>„App installieren“</b> oder <b>„Zum Startbildschirm hinzufügen“</b>.</li>' +
        '<li>Bestätigen — fertig.</li>' +
        '</ol>';
    }

    var ov = document.createElement('div');
    ov.id = 'pwa-howto';
    ov.innerHTML =
      '<div class="box">' +
      '<h3>' + titel + '</h3>' +
      '<div class="sub">Damit hast du die Quiz-App als eigenes Fenster – ohne Adressleiste.</div>' +
      schritte +
      '<button class="schliessen" id="pwa-howto-zu">Alles klar</button>' +
      '</div>';
    document.body.appendChild(ov);
    ov.classList.add('an');
    ov.addEventListener('click', function (e) {
      if (e.target === ov) ov.classList.remove('an');
    });
    document.getElementById('pwa-howto-zu').onclick = function () { ov.classList.remove('an'); };
  }

  // ---- Auto-Prompt (Chromium: Chrome, Edge, Opera) ----
  var installPrompt = null;
  var autoPromptKam = false;

  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    installPrompt = e;
    autoPromptKam = true;
    if (laeuftAlsApp()) return;

    var b = bar();
    b.innerHTML = '<span>Quiz-App installieren?</span>' +
      '<button class="ja" id="pwa-ja">Installieren</button>' +
      '<button class="nein" id="pwa-nein">Später</button>';
    document.getElementById('pwa-ja').onclick = function () {
      weg(b);
      if (installPrompt) { installPrompt.prompt(); installPrompt = null; }
    };
    document.getElementById('pwa-nein').onclick = function () {
      weg(b);
      merkeAbgelehnt();
    };
    zeige(b);
  });

  window.addEventListener('appinstalled', function () {
    var b = document.getElementById('pwa-bar');
    if (b) weg(b);
    try { localStorage.setItem('pwa_installiert', '1'); } catch (e) {}
  });

  function schonInstalliert() {
    try { return localStorage.getItem('pwa_installiert') === '1'; } catch (e) { return false; }
  }
  function merkeAbgelehnt() {
    try { localStorage.setItem('pwa_spaeter', String(Date.now())); } catch (e) {}
  }
  function kuerzlichAbgelehnt() {
    try {
      var t = parseInt(localStorage.getItem('pwa_spaeter') || '0', 10);
      return t && (Date.now() - t) < 1000 * 60 * 60 * 24 * 3;
    } catch (e) { return false; }
  }

  // ---- Fallback-Leiste für Browser OHNE Auto-Prompt (Zen/Firefox, teils Opera GX) ----
  window.addEventListener('load', function () {
    setTimeout(function () {
      if (laeuftAlsApp() || schonInstalliert() || kuerzlichAbgelehnt()) return;
      if (autoPromptKam) return;

      if (istFirefoxBasiert() || istOperaGX() || istOperaNormal()) {
        var b = bar();
        b.innerHTML = '<span>Quiz-App als App installieren?</span>' +
          '<button class="ja" id="pwa-howto-btn">So geht\'s</button>' +
          '<button class="nein" id="pwa-nein2">Später</button>';
        document.getElementById('pwa-howto-btn').onclick = function () {
          zeigeAnleitung();
        };
        document.getElementById('pwa-nein2').onclick = function () {
          weg(b);
          merkeAbgelehnt();
        };
        zeige(b);
      }
    }, 3500);
  });

  window.KlapsenInstall = function () {
    if (installPrompt) { installPrompt.prompt(); installPrompt = null; }
    else zeigeAnleitung();
  };
})();
