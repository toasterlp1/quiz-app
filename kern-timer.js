/* ============================================================
   KERN-TIMER — ein Timer mit echtem Einfrieren beim Buzzern
   ============================================================

   Der bisherige Bug (Wer ist das?): Der Balken zeigte "ZEIT
   ANGEHALTEN" an, aber die verstrichene Zeit wurde stur aus der
   Startzeit weiterberechnet - kosmetischer Stopp, keine echte
   Pause. Punkte sanken weiter, das Bild wurde weiter scharf.

   Dieses Modul rechnet NIE direkt mit Date.now() minus Startzeit.
   Es nutzt IMMER den "Bezugszeitpunkt": entweder state.frozenAt
   (wenn eingefroren) oder die aktuelle Zeit. Damit ist ein
   Einfrieren strukturell unmoeglich zu vergessen - jede Stelle,
   die die verstrichene Zeit braucht, geht ueber dieselbe Funktion.

   Benutzung:
     const elapsed = KernTimer.verstrichen(state);      // ms seit Start
     const rest    = KernTimer.rest(state, gesamtMs);   // ms bis Ende
     const anteil  = KernTimer.anteil(state, gesamtMs); // 0..1

   Fuers Ring-Rendering (Farbe/Puls), siehe kern-timer-ring in
   kern-render.js - der nutzt diese Funktionen als Basis.
   ============================================================ */
(function (global) {
  'use strict';

  /**
   * Referenzzeitpunkt "jetzt" fuer alle Zeitberechnungen dieses
   * States. Ist frozenAt gesetzt, ist "jetzt" für IMMER dieser
   * Zeitpunkt - komplett unabhaengig davon, wie lange seither
   * vergangen ist. Das ist der ganze Trick.
   */
  function bezugszeit(state) {
    if (state && state.frozenAt != null) return state.frozenAt;
    return Date.now();
  }

  /** Verstrichene Zeit seit revealStartedAt/startedAt, in Millisekunden. */
  function verstrichen(state, startFeld = 'revealStartedAt') {
    if (!state || !state[startFeld]) return 0;
    return Math.max(0, bezugszeit(state) - state[startFeld]);
  }

  /** Verbleibende Zeit bis zu einer festen Dauer (z.B. Countdown-Timer). */
  function rest(state, gesamtMs, startFeld = 'timerStartedAt') {
    if (!state) return 0;
    if (state.timerEnde != null) {
      // Countdown-Variante (timerEnde-Zeitstempel statt Dauer)
      return Math.max(0, state.timerEnde - bezugszeit(state));
    }
    const el = verstrichen(state, startFeld);
    return Math.max(0, gesamtMs - el);
  }

  /** Anteil 0..1 der verstrichenen Zeit (fuer Blur/Fortschrittsbalken). */
  function anteil(state, gesamtMs, startFeld = 'revealStartedAt') {
    if (!gesamtMs) return 0;
    return Math.max(0, Math.min(1, verstrichen(state, startFeld) / gesamtMs));
  }

  /**
   * Timer einfrieren (z.B. beim Buzzern manuell, falls nicht schon
   * ueber KernBuzz.buzzern passiert). Mutiert state direkt.
   */
  function einfrieren(state) {
    if (state && state.frozenAt == null) state.frozenAt = Date.now();
  }

  /**
   * Timer wieder freigeben (z.B. nach "Falsch", damit die Zeit fuer
   * den naechsten Buzzer weiterlaeuft - aber OHNE die Pause
   * anzurechnen: die verstrichene Pause wird auf den Startzeitpunkt
   * aufaddiert, damit es nahtlos weitergeht statt einen Sprung zu
   * machen).
   */
  function freigeben(state, startFeld = 'revealStartedAt') {
    if (!state || state.frozenAt == null) return;
    const pause = Date.now() - state.frozenAt;
    if (state[startFeld]) state[startFeld] += pause;
    if (state.timerEnde != null) state.timerEnde += pause;
    state.frozenAt = null;
  }

  global.KernTimer = { bezugszeit, verstrichen, rest, anteil, einfrieren, freigeben };
})(typeof window !== 'undefined' ? window : this);
