/* ============================================================
   KERN-AUFDECKEN — ein Zustands-Automat fuers Aufdecken
   ============================================================

   Ersetzt die fuenf verschiedenen Woerter, die dasselbe meinten:
   revealStep, solved, aufgedeckt, revealed, phase==='resolved'.

   Die Idee: JEDES Format hat eine Aufdecken-Stufe (aufdeckStufe,
   eine ganze Zahl ab 0), aber was diese Stufe optisch bedeutet,
   entscheidet das Format selbst:
     - Morph:      0 = nichts, 1 = eine Person, 2 = beide (fertig)
     - Wer ist das: 0 = unscharf, wird kontinuierlich schaerfer
                    bis geloest = fertig
     - Emoji:      0..5 = so viele Emojis aufgedeckt, 5 = fertig
     - Quizduell:  0 = Frage offen, 1 = Antwort gezeigt (fertig)

   Das Modul selbst kennt nur: "Stufe hoch", "ist es fertig", und
   "zuruecksetzen fuer die naechste Runde". Das Aussehen bleibt
   beim jeweiligen Format.

   Benutzung:
     KernAufdecken.stufeHoch(state);                 // eine Stufe weiter
     KernAufdecken.istFertig(state, maxStufe);        // true/false
     KernAufdecken.zuruecksetzen(state);               // neue Runde
   ============================================================ */
(function (global) {
  'use strict';

  /** Aktuelle Aufdeck-Stufe (0 = noch nichts gezeigt). */
  function stufe(state) {
    return (state && state.aufdeckStufe) || 0;
  }

  /** Eine Stufe weiter (z.B. naechste Person/naechstes Emoji zeigen). */
  function stufeHoch(state, schritt = 1) {
    if (!state) return;
    state.aufdeckStufe = stufe(state) + schritt;
  }

  /** Direkt auf eine bestimmte Stufe springen (z.B. "alles zeigen"). */
  function stufeSetzen(state, wert) {
    if (state) state.aufdeckStufe = wert;
  }

  /** Ist die maximale Stufe erreicht (= vollstaendig aufgedeckt/geloest)? */
  function istFertig(state, maxStufe) {
    return stufe(state) >= maxStufe;
  }

  /** Fuer die naechste Runde/Frage zuruecksetzen. */
  function zuruecksetzen(state) {
    if (!state) return;
    state.aufdeckStufe = 0;
    state.gelöst = false;
  }

  global.KernAufdecken = { stufe, stufeHoch, stufeSetzen, istFertig, zuruecksetzen };
})(typeof window !== 'undefined' ? window : this);
