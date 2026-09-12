/* ============================================================
   KERN-KORREKTUR — freier Eingriff fuer den Spielleiter
   ============================================================

   Ole: "es soll einfach bei jeden Format auch platz geben, dass
   ich immer sachen wirklich frei noch so anpassen kann von punkten
   und so weiter" - Zeit draufpacken, Punkte manuell korrigieren.

   Dieses Modul baut ein kleines, einklappbares Panel, das JEDES
   Format am Ende seines Spielleiter-Bildschirms einbinden kann,
   ohne die eigentliche Steuerung (richtig/falsch/aufdecken) zu
   ueberladen. Es liegt bewusst UNTEN und ist standardmaessig
   eingeklappt - fuer den Alltag unsichtbar, aber eine Sekunde
   entfernt, wenn mal jemand mault "das war doch richtig!".

   Benutzung (im Spielleiter, nach dem Laden des Panels):

     KernKorrektur.einbauen({
       container: document.getElementById('korrekturPanel'),
       spieler: () => Object.keys(state.players || {}),   // oder Team-Namen
       aufPunkteAendern: (name, delta) => {
         KernPunkte.vergeben(state, name, delta);
         speichern();
       },
       aufZeitAendern: (sekunden) => {
         if(state.timerEnde) state.timerEnde += sekunden*1000;
         speichern();
       }
     });
   ============================================================ */
(function (global) {
  'use strict';

  function einbauen({ container, spieler, aufPunkteAendern, aufZeitAendern }) {
    if (!container) return;

    container.innerHTML = `
      <button class="kk-toggle" type="button">
        <span class="kk-icon">⚙</span> Manuell anpassen
      </button>
      <div class="kk-body" hidden>
        ${aufZeitAendern ? `
        <div class="kk-row">
          <span class="kk-lbl">Zeit</span>
          <button class="kk-chip" data-zeit="-10">−10s</button>
          <button class="kk-chip" data-zeit="10">+10s</button>
          <button class="kk-chip" data-zeit="30">+30s</button>
        </div>` : ''}
        ${spieler ? `<div class="kk-punkte" id="kkPunkteListe"></div>` : ''}
      </div>
    `;

    const toggle = container.querySelector('.kk-toggle');
    const body = container.querySelector('.kk-body');
    toggle.addEventListener('click', () => {
      body.hidden = !body.hidden;
      toggle.classList.toggle('offen', !body.hidden);
    });

    if (aufZeitAendern) {
      container.querySelectorAll('[data-zeit]').forEach(btn => {
        btn.addEventListener('click', () => aufZeitAendern(parseInt(btn.dataset.zeit, 10)));
      });
    }

    if (spieler && aufPunkteAendern) {
      const liste = container.querySelector('#kkPunkteListe');
      const namen = typeof spieler === 'function' ? spieler() : spieler;
      liste.innerHTML = namen.map(name => `
        <div class="kk-punkte-row">
          <span class="kk-name">${name}</span>
          <button class="kk-chip kk-minus" data-name="${name}" data-delta="-1">−1</button>
          <button class="kk-chip kk-plus" data-name="${name}" data-delta="1">+1</button>
        </div>
      `).join('');
      liste.querySelectorAll('button[data-name]').forEach(btn => {
        btn.addEventListener('click', () => {
          aufPunkteAendern(btn.dataset.name, parseInt(btn.dataset.delta, 10));
        });
      });
    }
  }

  global.KernKorrektur = { einbauen };
})(typeof window !== 'undefined' ? window : this);
