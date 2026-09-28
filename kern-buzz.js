
(function (global) {
  'use strict';

  const ERLAUBTE_TABELLEN = [
    'wid_state', 'mo_state', 'er_state', 'hz_state', 'cd_state',
    'wwm_state', 'quiz_state', 'ak_state', 'bl_state'
  ];

  
  async function buzzern({ sb, tabelle, name, timerEinfrieren = true }) {
    if (!ERLAUBTE_TABELLEN.includes(tabelle)) {
      console.error('kern-buzz: unbekannte Tabelle', tabelle);
      return null;
    }
    if (!sb || !name) return null;

    const { data, error } = await sb.rpc('kern_buzzern', {
      p_tabelle: tabelle, p_name: name, p_frozen: !!timerEinfrieren
    });

    if (!error) return data;

    console.warn('kern-buzz: RPC nicht verfuegbar, nutze Rueckfall:', error.message);
    const { data: d } = await sb.from(tabelle).select('state').eq('id', 1).single();
    if (!d || !d.state) return null;
    const s = d.state;
    s.buzzQueue = s.buzzQueue || [];
    s.buzzedOut = s.buzzedOut || [];
    if (!s.buzzQueue.includes(name) && !s.buzzedOut.includes(name)) {
      s.buzzQueue.push(name);
    }
    if (timerEinfrieren && s.frozenAt == null) {
      s.frozenAt = Date.now();
    }
    await sb.from(tabelle).update({ state: s, updated_at: new Date().toISOString() }).eq('id', 1);
    return s;
  }

  
  function aktiverBuzzer(state) {
    if (!state) return null;
    const queue = state.buzzQueue || [];
    const raus = state.buzzedOut || [];
    return queue.find(n => !raus.includes(n)) || null;
  }

  
  function reihenfolge(state) {
    return (state && state.buzzQueue) || [];
  }

  
  function weiterOhne(state, name) {
    if (!state) return;
    state.buzzedOut = state.buzzedOut || [];
    if (!state.buzzedOut.includes(name)) state.buzzedOut.push(name);
  }

  
  function zuruecksetzen(state) {
    if (!state) return;
    state.buzzQueue = [];
    state.buzzedOut = [];
    state.frozenAt = null;
  }

  global.KernBuzz = { buzzern, aktiverBuzzer, reihenfolge, weiterOhne, zuruecksetzen };
})(typeof window !== 'undefined' ? window : this);
