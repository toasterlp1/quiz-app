
(function (global) {
  'use strict';

  
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

        const aktuellerPlatz = container.children[index];
        if (aktuellerPlatz !== el) container.insertBefore(el, aktuellerPlatz || null);
      });

      vorhanden.forEach((el, key) => {
        if (!gesehen.has(key)) {
          el.remove();
          vorhanden.delete(key);
        }
      });
    }

    return { render };
  }

  
  function textWennGeaendert(el, text) {
    if (!el) return;
    const neu = String(text);
    if (el.textContent !== neu) el.textContent = neu;
  }

  global.KernRender = { liste, textWennGeaendert };
})(typeof window !== 'undefined' ? window : this);
