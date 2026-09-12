/* ============================================================
   KERN-PUNKTE — eine Punktevergabe-Funktion fuer alle Formate
   ============================================================

   Ersetzt die elf verschiedenen Handschriften ("+= 1", "+ currentPoints()",
   "state.players[x].score += ..." usw). Egal ob Punkte fest sind
   (Quizduell: richtig = 1 Punkt) oder von der eingefrorenen Zeit
   abhaengen (Wer ist das?: je frueher gebuzzert, desto mehr Punkte) -
   dieselbe Funktion, unterschiedliche Parameter.

   Unterstuetzt zwei Spieler-Datenformen, weil beide in der App
   vorkommen:
     - Objekt:  state.players = { "säule": { score: 3 }, ... }
     - Array:   state.players = [ { name:"säule", score:3 }, ... ]

   Benutzung:
     KernPunkte.vergeben(state, 'säule', 3);            // +3 Punkte
     KernPunkte.vergeben(state, 'säule', -1);            // -1 Punkt
     KernPunkte.punktzahlFuerZeit(gesamtMs, verstrichenMs, {max:5, min:1});
   ============================================================ */
(function (global) {
  'use strict';

  function istArray(players) { return Array.isArray(players); }

  /** Liest die aktuelle Punktzahl eines Spielers, unabhaengig vom Format. */
  function punktzahl(state, name) {
    if (!state || !state.players) return 0;
    if (istArray(state.players)) {
      const p = state.players.find(x => x.name === name);
      return p ? (p.score || p.punkte || 0) : 0;
    }
    const p = state.players[name];
    if (p == null) return 0;
    return typeof p === 'number' ? p : (p.score || p.punkte || 0);
  }

  /**
   * Vergibt (oder zieht ab bei negativem Wert) Punkte an einen
   * Spieler. Legt das Punktefeld an, falls es fehlt. Mutiert state
   * direkt - der Aufrufer speichert danach.
   */
  function vergeben(state, name, delta) {
    if (!state || !name || !state.players) return;
    if (istArray(state.players)) {
      const p = state.players.find(x => x.name === name);
      if (!p) return;
      if (p.score != null) p.score = (p.score || 0) + delta;
      else p.punkte = (p.punkte || 0) + delta;
      return;
    }
    const p = state.players[name];
    if (p == null) {
      state.players[name] = delta;
    } else if (typeof p === 'number') {
      state.players[name] = p + delta;
    } else {
      p.score = (p.score || 0) + delta;
    }
  }

  /**
   * Zeitbasierte Punktzahl: linear von 'max' (bei 0 verstrichener
   * Zeit) auf 'min' (bei gesamtMs verstrichener Zeit) absteigend,
   * in ganzen Stufen gerundet. Wird typischerweise mit
   * KernTimer.verstrichen() kombiniert - und WEIL diese Zeit beim
   * Buzzern eingefroren ist, "verrutscht" die Punktzahl nach dem
   * Buzz nicht mehr.
   */
  function punktzahlFuerZeit(gesamtMs, verstrichenMs, { max = 5, min = 1 } = {}) {
    if (gesamtMs <= 0) return min;
    const t = Math.max(0, Math.min(1, verstrichenMs / gesamtMs));
    const wert = max - (max - min) * t;
    return Math.max(min, Math.round(wert));
  }

  global.KernPunkte = { punktzahl, vergeben, punktzahlFuerZeit };
})(typeof window !== 'undefined' ? window : this);
