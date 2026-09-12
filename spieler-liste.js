// ============================================================
// spieler-liste.js — public player directory
// ============================================================
(function () {
  function fuelleDropdown({ selectElement, sb, format }) {
    if (!selectElement) return { aktualisiere: async () => {} };
    let letzteListe = '';

    async function aktualisiere() {
      const { data } = await sb.from('public_players')
        .select('name').eq('format', format).eq('active', true)
        .order('name', { ascending: true });
      const namen = (data || []).map(r => r.name);
      const key = namen.join('|');
      if (key === letzteListe) return;
      letzteListe = key;
      const bisher = selectElement.value;
      selectElement.innerHTML = '<option value="">— wähle deinen Namen —</option>' +
        namen.map(n => `<option value="${String(n).replace(/"/g,'&quot;')}">${String(n).replace(/[&<>]/g,'')}</option>`).join('');
      if (bisher && namen.includes(bisher)) selectElement.value = bisher;
    }
    aktualisiere();
    return { aktualisiere };
  }
  window.SpielerListe = { fuelleDropdown };
})();