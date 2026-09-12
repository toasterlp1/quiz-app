/*
  Eingabeschutz
  -------------
  Problem: Realtime-Updates von Supabase zeichnen die Seite neu.
  Wer gerade tippt, verliert seinen Text mitten im Satz - der Klassiker
  ist Bluff-Quiz, wo jede fremde Luege das eigene Eingabefeld leert.

  Loesung: Wir merken uns vor jedem Neuzeichnen, was in den Feldern
  stand und wo der Cursor war, und stellen es danach wieder her.
  Felder, die gerade den Fokus haben, werden zusaetzlich geschuetzt.

  Einbinden nach den anderen Skripten:
    <script src="../eingabeschutz.js"></script>

  Danach laeuft es von selbst. Kein Aufruf noetig.
*/
(function () {
  'use strict';

  // Merkt sich Feldinhalte anhand einer stabilen Kennung
  function kennung(el) {
    if (el.id) return 'id:' + el.id;
    if (el.name) return 'name:' + el.name;
    // Fallback: Position unter gleichartigen Geschwistern
    var typ = el.tagName + '[' + (el.type || '') + ']';
    var gleiche = document.querySelectorAll(el.tagName);
    for (var i = 0; i < gleiche.length; i++) {
      if (gleiche[i] === el) return typ + '#' + i;
    }
    return null;
  }

  function istEingabe(el) {
    if (!el || !el.tagName) return false;
    var t = el.tagName;
    if (t === 'TEXTAREA') return true;
    if (t === 'SELECT') return true;
    if (t !== 'INPUT') return false;
    var typ = (el.type || 'text').toLowerCase();
    // Knoepfe und Checkboxen brauchen keinen Schutz
    return ['text', 'search', 'url', 'tel', 'email', 'password', 'number'].indexOf(typ) >= 0;
  }

  function sammle() {
    var stand = {};
    var felder = document.querySelectorAll('input, textarea, select');
    for (var i = 0; i < felder.length; i++) {
      var el = felder[i];
      if (!istEingabe(el)) continue;
      var k = kennung(el);
      if (!k) continue;
      stand[k] = {
        wert: el.value,
        start: (typeof el.selectionStart === 'number') ? el.selectionStart : null,
        ende: (typeof el.selectionEnd === 'number') ? el.selectionEnd : null,
        fokus: document.activeElement === el
      };
    }
    return stand;
  }

  function stelleWiederHer(stand) {
    if (!stand) return;
    var felder = document.querySelectorAll('input, textarea, select');
    for (var i = 0; i < felder.length; i++) {
      var el = felder[i];
      if (!istEingabe(el)) continue;
      var k = kennung(el);
      if (!k || !stand[k]) continue;
      var alt = stand[k];

      // Nur zurueckschreiben, wenn das Feld jetzt leer ist oder
      // der Nutzer aktiv daran war. Sonst wuerden wir eine bewusste
      // Aenderung durch das Programm ueberschreiben.
      var lohntSich = alt.fokus || (alt.wert && !el.value);
      if (!lohntSich) continue;

      if (el.value !== alt.wert) el.value = alt.wert;

      if (alt.fokus) {
        try {
          el.focus({ preventScroll: true });
          if (alt.start !== null && el.setSelectionRange) {
            el.setSelectionRange(alt.start, alt.ende);
          }
        } catch (e) { /* select-Elemente koennen keine Selection setzen */ }
      }
    }
  }

  // innerHTML abfangen: vorher sichern, nachher wiederherstellen.
  // Wir haengen uns an den Prototyp, damit es unabhaengig davon greift,
  // wie die einzelnen Seiten ihre Render-Funktionen genannt haben.
  var deskriptor = Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML');
  if (!deskriptor || !deskriptor.set) return;

  var originalSetter = deskriptor.set;
  var originalGetter = deskriptor.get;

  Object.defineProperty(Element.prototype, 'innerHTML', {
    configurable: true,
    enumerable: deskriptor.enumerable,
    get: originalGetter,
    set: function (html) {
      // Nur sichern, wenn ueberhaupt jemand tippt - sonst unnoetige Arbeit
      var aktiv = document.activeElement;
      var jemandTippt = istEingabe(aktiv) && this.contains(aktiv);

      var stand = null;
      if (jemandTippt) stand = sammle();

      originalSetter.call(this, html);

      if (stand) {
        // Nach dem Neuzeichnen sind die Elemente neu - erst im
        // naechsten Frame ist das DOM stabil.
        var self = this;
        requestAnimationFrame(function () { stelleWiederHer(stand); });
      }
    }
  });

  window.Eingabeschutz = {
    sammle: sammle,
    stelleWiederHer: stelleWiederHer
  };
})();
