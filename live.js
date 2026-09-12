/*
  Live-Verbindung
  ---------------
  Haelt eine Supabase-Realtime-Verbindung am Leben und faellt
  automatisch auf Abfragen zurueck, wenn sie abbricht.

  Warum es das braucht:
  Bisher hat jede Seite ihren Kanal abonniert, ohne zu pruefen, ob
  er wirklich steht. Bricht er ab - Handy sperrt den Bildschirm,
  WLAN wechselt, Supabase startet neu - kommt einfach nichts mehr
  an. Gemerkt hat das niemand, deshalb lief ueberall zusaetzlich
  ein Timer alle 1-2 Sekunden mit.

  Was dieses Modul macht:
  - meldet den Kanal an und ueberwacht seinen Zustand
  - verbindet nach einem Abbruch neu, mit wachsendem Abstand
  - laesst waehrenddessen ein Notfall-Polling laufen
  - schaltet das Polling ab, sobald Realtime wieder steht
  - laedt beim Zurueckkehren auf den Tab sofort neu

  Nutzung:
    KA_LIVE.start({
      client:  sb,
      tabelle: 'mo_state',
      beiAenderung: (neuerState) => { ... },
      laden:   async () => { ... },     // Vollabgleich
      anzeige: (verbunden) => { ... }   // optional
    });
*/
(function () {
  'use strict';

  var POLL_NOTFALL_MS = 2000;   // solange Realtime haengt
  var POLL_RUHE_MS    = 15000;  // Sicherheitsnetz wenn alles laeuft
  var NEUVERSUCH_MS   = [1000, 2000, 4000, 8000, 15000, 30000];

  function starte(cfg) {
    if (!cfg || !cfg.client || !cfg.tabelle) {
      console.warn('KA_LIVE: client und tabelle werden gebraucht');
      return null;
    }

    var sb = cfg.client;
    var kanal = null;
    var pollTimer = null;
    var neuTimer = null;
    var versuch = 0;
    var verbunden = false;
    var beendet = false;
    var letzteLadung = 0;

    function melde(zustand) {
      if (verbunden === zustand) return;
      verbunden = zustand;
      if (typeof cfg.anzeige === 'function') {
        try { cfg.anzeige(zustand); } catch (e) {}
      }
      // Polling-Takt an die Lage anpassen
      setzePolling(zustand ? POLL_RUHE_MS : POLL_NOTFALL_MS);
    }

    async function ladeJetzt(grund) {
      // Doppelte Ladungen im selben Moment vermeiden
      var jetzt = Date.now();
      if (jetzt - letzteLadung < 250) return;
      letzteLadung = jetzt;
      if (typeof cfg.laden === 'function') {
        try { await cfg.laden(grund); }
        catch (e) { console.warn('KA_LIVE: Laden fehlgeschlagen', e); }
      }
    }

    function setzePolling(ms) {
      if (pollTimer) clearInterval(pollTimer);
      if (beendet) return;
      pollTimer = setInterval(function () { ladeJetzt('poll'); }, ms);
    }

    function planeNeuverbindung() {
      if (beendet || neuTimer) return;
      var wartezeit = NEUVERSUCH_MS[Math.min(versuch, NEUVERSUCH_MS.length - 1)];
      versuch++;
      neuTimer = setTimeout(function () {
        neuTimer = null;
        verbinde();
      }, wartezeit);
    }

    function verbinde() {
      if (beendet) return;
      if (kanal) {
        try { sb.removeChannel(kanal); } catch (e) {}
        kanal = null;
      }

      var name = 'ka_' + cfg.tabelle + '_' + Math.random().toString(36).slice(2, 8);
      kanal = sb.channel(name)
        .on('postgres_changes',
            { event: '*', schema: 'public', table: cfg.tabelle },
            function (payload) {
              if (typeof cfg.beiAenderung === 'function') {
                try {
                  var neu = payload && payload.new ? (payload.new.state || payload.new) : null;
                  cfg.beiAenderung(neu, payload);
                } catch (e) { console.warn('KA_LIVE: beiAenderung', e); }
              } else {
                ladeJetzt('realtime');
              }
            })
        .subscribe(function (status) {
          if (status === 'SUBSCRIBED') {
            versuch = 0;
            melde(true);
            ladeJetzt('verbunden');   // Stand nachziehen, der waehrend der Luecke kam
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
            melde(false);
            planeNeuverbindung();
          }
        });
    }

    // Zurueck auf dem Tab: sofort nachziehen. Handys frieren
    // Hintergrund-Tabs ein, dabei geht die Verbindung oft verloren.
    function beiSichtbar() {
      if (document.visibilityState === 'visible') {
        ladeJetzt('sichtbar');
        if (!verbunden) verbinde();
      }
    }
    function beiOnline() {
      ladeJetzt('online');
      if (!verbunden) verbinde();
    }
    function beiPageShow(e) {
      // Back/Forward-Cache stellt eine eingefrorene Seite wieder her. Der alte
      // Realtime-Kanal kann dabei bereits tot sein, obwohl die UI noch so aussieht.
      if (e && e.persisted) {
        ladeJetzt('pageshow');
        if (!verbunden) verbinde();
      }
    }
    document.addEventListener('visibilitychange', beiSichtbar);
    window.addEventListener('online', beiOnline);
    window.addEventListener('pageshow', beiPageShow);

    verbinde();
    setzePolling(POLL_NOTFALL_MS);
    ladeJetzt('start');

    return {
      istVerbunden: function () { return verbunden; },
      neuLaden: function () { return ladeJetzt('manuell'); },
      beenden: function () {
        beendet = true;
        if (pollTimer) clearInterval(pollTimer);
        if (neuTimer) clearTimeout(neuTimer);
        document.removeEventListener('visibilitychange', beiSichtbar);
        window.removeEventListener('online', beiOnline);
        window.removeEventListener('pageshow', beiPageShow);
        if (kanal) { try { sb.removeChannel(kanal); } catch (e) {} }
      }
    };
  }

  window.KA_LIVE = { start: starte };
})();
