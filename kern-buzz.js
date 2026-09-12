/* ============================================================
   KERN-BUZZ — eine Buzz-Reihenfolge fuer alle Formate
   ============================================================

   Ersetzt die bisherigen Einzelloesungen (buzz_anhaengen-RPC pro
   Format, direkte State-Updates bei Hotzone, cd_buzz fuer ChatDuell).
   Ein Format bindet dieses Skript ein und ruft KernBuzz.buzzern() auf -
   den Rest (Reihenfolge, doppelte Buzzes verhindern, Zeit einfrieren)
   erledigt dieses Modul.

   WICHTIG: Die Atomaritaet (kein doppeltes Buzzern bei Gleichzeitig-
   keit) kommt aus einer generischen SQL-Funktion "kern_buzzern", die
   einmalig in Supabase angelegt wird (siehe sql/kern.sql). Ist sie
   nicht erreichbar, greift ein Rueckfall, der zumindest funktioniert,
   aber theoretisch bei exakt gleichzeitigem Buzzern selten Vorrang
   verlieren kann - deshalb: SQL unbedingt einspielen.

   Benutzung (im Buzzer):
     KernBuzz.buzzern({ sb, tabelle:'wid_state', name:myName, timerEinfrieren:true });

   Benutzung (im Spielleiter/Host, zum Lesen):
     const dran = KernBuzz.aktiverBuzzer(state);       // Name oder null
     const reihenfolge = KernBuzz.reihenfolge(state);  // Array aller Buzzes in Reihenfolge
     KernBuzz.weiterOhne(state, name)                  // markiert 'name' als erledigt/raus

   State-Felder, die dieses Modul benutzt (im JSON-State der Tabelle):
     buzzQueue   string[]  - wer gebuzzert hat, in Reihenfolge
     buzzedOut   string[]  - wer schon abgehandelt ist (falsch oder erledigt)
     frozenAt    number|null - Zeitstempel (ms), wann die Zeit eingefroren wurde
   ============================================================ */
(function (global) {
  'use strict';

  const ERLAUBTE_TABELLEN = [
    'wid_state', 'mo_state', 'er_state', 'hz_state', 'cd_state',
    'wwm_state', 'quiz_state', 'ak_state', 'bl_state'
  ];

  /**
   * Buzzert fuer 'name' in der angegebenen Tabelle. Atomar ueber die
   * SQL-Funktion kern_buzzern; faellt auf einen Read-Modify-Write
   * zurueck, wenn die Funktion (noch) nicht existiert.
   *
   * @param {object} opts
   * @param {object} opts.sb - Supabase-Client
   * @param {string} opts.tabelle - z.B. 'wid_state'
   * @param {string} opts.name - Spielername
   * @param {boolean} [opts.timerEinfrieren=true] - Zeit beim ersten Buzz einfrieren?
   * @returns {Promise<object|null>} neuer State oder null bei Fehler
   */
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

    // Rueckfall: Read-Modify-Write. Bei exakter Gleichzeitigkeit kann
    // hier in seltenen Faellen eine Reihenfolge-Praezedenz verloren
    // gehen - deshalb nur als Absicherung, nicht als Regelfall.
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

  /** Wer ist gerade aktiv dran (erster in der Queue, der nicht schon raus ist)? */
  function aktiverBuzzer(state) {
    if (!state) return null;
    const queue = state.buzzQueue || [];
    const raus = state.buzzedOut || [];
    return queue.find(n => !raus.includes(n)) || null;
  }

  /** Komplette Reihenfolge der Buzzes (fuer Anzeige "Buzz Order"). */
  function reihenfolge(state) {
    return (state && state.buzzQueue) || [];
  }

  /**
   * Markiert 'name' als erledigt (falsch geantwortet oder fertig
   * behandelt) - der/die naechste in der Queue wird aktiv.
   * Mutiert das uebergebene state-Objekt direkt (Aufrufer speichert).
   */
  function weiterOhne(state, name) {
    if (!state) return;
    state.buzzedOut = state.buzzedOut || [];
    if (!state.buzzedOut.includes(name)) state.buzzedOut.push(name);
  }

  /** Setzt Buzz-Reihenfolge und Einfrieren komplett zurueck (neue Frage/Runde). */
  function zuruecksetzen(state) {
    if (!state) return;
    state.buzzQueue = [];
    state.buzzedOut = [];
    state.frozenAt = null;
  }

  global.KernBuzz = { buzzern, aktiverBuzzer, reihenfolge, weiterOhne, zuruecksetzen };
})(typeof window !== 'undefined' ? window : this);
