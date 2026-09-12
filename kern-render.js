/* ============================================================
   KERN-RENDER — Karten einmal bauen, danach nur aktualisieren
   ============================================================

   Der Grund fuers nervige Geflacker bei Realtime-Updates: Bisher
   wurde bei JEDER State-Aenderung container.innerHTML = '' gesetzt
   und alles neu gebaut - auch Bilder (Avatare), die dadurch neu
   laden und kurz aufblitzen.

   Dieses Modul haelt eine Karte pro Datensatz (z.B. pro Spieler)
   dauerhaft im DOM. Ein Update aendert nur die Textinhalte/Klassen,
   die sich wirklich geaendert haben - das <img> wird nie neu erzeugt.

   Benutzung (Beispiel Punktetabelle):

     const liste = KernRender.liste(container, {
       schluessel: p => p.name,
       erstellen: p => {
         const el = document.createElement('div');
         el.className = 'score-card';
         el.innerHTML = `<img class="avatar-pic" src="${avatarFor(p.name)}">
                          <div class="nm"></div><div class="sc"></div>`;
         return el;
       },
       aktualisieren: (el, p) => {
         el.querySelector('.nm').textContent = p.name;
         el.querySelector('.sc').textContent = p.score;
         el.classList.toggle('dran', p.istDran);
       }
     });

     liste.render(spielerArray);   // bei jedem State-Update aufrufen

   Das <img> in 'erstellen' wird nur beim ALLERERSTEN Mal gebaut.
   Danach laeuft nur noch 'aktualisieren'.
   ============================================================ */
(function (global) {
  'use strict';

  /**
   * Erzeugt eine verwaltete Liste fuer einen Container.
   * @param {HTMLElement} container
   * @param {object} opts
   * @param {function} opts.schluessel - liefert einen eindeutigen Schluessel pro Element
   * @param {function} opts.erstellen - baut ein neues DOM-Element (nur beim ersten Mal)
   * @param {function} opts.aktualisieren - schreibt Daten in ein bestehendes Element
   * @param {function} [opts.sortieren] - optionale Sortierfunktion (a,b)=>number
   */
  function liste(container, { schluessel, erstellen, aktualisieren, sortieren }) {
    const vorhanden = new Map();  // schluessel -> DOM-Element

    function render(datensaetze) {
      if (!container) return;
      const gesehen = new Set();
      const geordnet = sortieren ? [...datensaetze].sort(sortieren) : datensaetze;

      geordnet.forEach((d, index) => {
        const key = String(schluessel(d));
        gesehen.add(key);
        let el = vorhanden.get(key);

        if (!el) {
          el = erstellen(d);
          el.dataset.kernKey = key;
          vorhanden.set(key, el);
          container.appendChild(el);
        }
        aktualisieren(el, d, index);

        // Reihenfolge im DOM angleichen, ohne das Element neu zu bauen
        const aktuellerPlatz = container.children[index];
        if (aktuellerPlatz !== el) container.insertBefore(el, aktuellerPlatz || null);
      });

      // Elemente entfernen, die nicht mehr im Datensatz vorkommen
      vorhanden.forEach((el, key) => {
        if (!gesehen.has(key)) {
          el.remove();
          vorhanden.delete(key);
        }
      });
    }

    return { render };
  }

  /**
   * Fuer einzelne Textfelder: schreibt nur, wenn sich der Wert
   * geaendert hat (spart Reflow, ermoeglicht saubere CSS-Transitions
   * ohne dass sie bei jedem Tick neu anspringen).
   */
  function textWennGeaendert(el, text) {
    if (!el) return;
    const neu = String(text);
    if (el.textContent !== neu) el.textContent = neu;
  }

  global.KernRender = { liste, textWennGeaendert };
})(typeof window !== 'undefined' ? window : this);
