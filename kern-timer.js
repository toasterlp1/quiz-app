
(function (global) {
  'use strict';

  
  function bezugszeit(state) {
    if (state && state.frozenAt != null) return state.frozenAt;
    return Date.now();
  }

  
  function verstrichen(state, startFeld = 'revealStartedAt') {
    if (!state || !state[startFeld]) return 0;
    return Math.max(0, bezugszeit(state) - state[startFeld]);
  }

  
  function rest(state, gesamtMs, startFeld = 'timerStartedAt') {
    if (!state) return 0;
    if (state.timerEnde != null) {
      return Math.max(0, state.timerEnde - bezugszeit(state));
    }
    const el = verstrichen(state, startFeld);
    return Math.max(0, gesamtMs - el);
  }

  
  function anteil(state, gesamtMs, startFeld = 'revealStartedAt') {
    if (!gesamtMs) return 0;
    return Math.max(0, Math.min(1, verstrichen(state, startFeld) / gesamtMs));
  }

  
  function einfrieren(state) {
    if (state && state.frozenAt == null) state.frozenAt = Date.now();
  }

  
  function freigeben(state, startFeld = 'revealStartedAt') {
    if (!state || state.frozenAt == null) return;
    const pause = Date.now() - state.frozenAt;
    if (state[startFeld]) state[startFeld] += pause;
    if (state.timerEnde != null) state.timerEnde += pause;
    state.frozenAt = null;
  }

  global.KernTimer = { bezugszeit, verstrichen, rest, anteil, einfrieren, freigeben };
})(typeof window !== 'undefined' ? window : this);
