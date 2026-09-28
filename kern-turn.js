
(function (global) {
  'use strict';

  
  function turnAnzeige(slot) {
    if (!slot) return { aktualisieren(){}, verstecken(){} };

    slot.innerHTML = `
      <div class="kern-turn" id="kernTurnPille">
        <img id="kernTurnAvatar" alt="">
        <span class="kern-turn-name" id="kernTurnName"></span>
      </div>
    `;
    const pille = slot.querySelector('#kernTurnPille');
    const img = slot.querySelector('#kernTurnAvatar');
    const nameEl = slot.querySelector('#kernTurnName');

    function aktualisieren({ name, avatarUrl, suffix = "'S TURN" }) {
      if (!name) { verstecken(); return; }
      if (avatarUrl && img.getAttribute('src') !== avatarUrl) img.src = avatarUrl;
      img.style.display = avatarUrl ? '' : 'none';
      KernRender.textWennGeaendert(nameEl, `${name.toUpperCase()} `);
      let suf = nameEl.querySelector('.kern-turn-suffix');
      if (!suf) {
        suf = document.createElement('span');
        suf.className = 'kern-turn-suffix';
        nameEl.appendChild(suf);
      }
      KernRender.textWennGeaendert(suf, suffix);
      pille.classList.add('zeigen');
    }

    function verstecken() { pille.classList.remove('zeigen'); }

    return { aktualisieren, verstecken };
  }

  
  function buzzListe(slot, { titel = 'REIHENFOLGE' } = {}) {
    if (!slot) return { aktualisieren(){} };

    slot.innerHTML = `
      <div class="kern-buzzorder">
        <div class="kern-buzzorder-titel">${titel}</div>
        <div class="kern-buzzorder-liste" id="kernBuzzListe"></div>
      </div>
    `;
    const listeEl = slot.querySelector('#kernBuzzListe');

    const verwaltet = KernRender.liste(listeEl, {
      schluessel: eintrag => eintrag.name,
      erstellen: () => {
        const el = document.createElement('div');
        el.className = 'kern-buzzorder-item';
        el.innerHTML = `<span class="kern-buzzorder-nr"></span><span class="kern-buzzorder-name"></span>`;
        return el;
      },
      aktualisieren: (el, eintrag) => {
        KernRender.textWennGeaendert(el.querySelector('.kern-buzzorder-nr'), eintrag.nr + '.');
        KernRender.textWennGeaendert(el.querySelector('.kern-buzzorder-name'), eintrag.name);
        el.classList.toggle('aktiv', eintrag.aktiv);
        el.classList.toggle('raus', eintrag.raus);
      }
    });

    function aktualisieren(reihenfolge, aktiverName, rausListe) {
      const raus = rausListe || [];
      const datensaetze = (reihenfolge || []).map((name, i) => ({
        name, nr: i + 1, aktiv: name === aktiverName, raus: raus.includes(name)
      }));
      verwaltet.render(datensaetze);
      slot.style.display = '';
      listeEl.classList.toggle('ist-leer', datensaetze.length===0);
    }

    return { aktualisieren };
  }

  global.KernTurn = { turnAnzeige, buzzListe };
})(typeof window !== 'undefined' ? window : this);
