
(function (global) {
  'use strict';

  function istArray(players) { return Array.isArray(players); }

  
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

  
  function punktzahlFuerZeit(gesamtMs, verstrichenMs, { max = 5, min = 1 } = {}) {
    if (gesamtMs <= 0) return min;
    const t = Math.max(0, Math.min(1, verstrichenMs / gesamtMs));
    const wert = max - (max - min) * t;
    return Math.max(min, Math.round(wert));
  }

  global.KernPunkte = { punktzahl, vergeben, punktzahlFuerZeit };
})(typeof window !== 'undefined' ? window : this);
