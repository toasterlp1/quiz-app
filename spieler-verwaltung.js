// ============================================================
// spieler-verwaltung.js — Streamer-friendly player management
// ============================================================
(function () {
  function escapeHtml(s) {
    const d = document.createElement('div');
    d.textContent = String(s == null ? '' : s);
    return d.innerHTML;
  }

  async function ladeNamen(sb, format) {
    const { data } = await sb.from('public_players')
      .select('name').eq('format', format).eq('active', true)
      .order('name', { ascending: true });
    return (data || []).map(r => r.name);
  }

  async function entferne(sb, format, name) {
    await sb.rpc('deactivate_public_player', { p_name: name, p_format: format });
  }

  async function hinzufuegen(sb, format, name) {
    return sb.rpc('register_public_player', { p_name: name, p_format: format });
  }

  function einbauen({ container, sb, format }) {
    if (!container) return;

    container.innerHTML = `
      <div class="sv-box" style="background:var(--panel2,#16213f);border:1px solid var(--line,#232b45);border-radius:14px;padding:16px;margin-top:14px;">
        <div style="font-size:12px;letter-spacing:1.5px;text-transform:uppercase;color:var(--muted,#7f8bab);font-weight:800;margin-bottom:10px;">Mitspieler</div>
        <div style="display:flex;gap:8px;margin-bottom:12px;">
          <input id="sv-input" type="text" maxlength="32" placeholder="Name eingeben…" style="flex:1;padding:10px 12px;border-radius:10px;border:1px solid var(--line,#232b45);background:rgba(255,255,255,.05);color:var(--text,#eaf0ff);font-size:14px;">
          <button id="sv-add" style="padding:10px 16px;border-radius:10px;border:none;background:#3ddc84;color:#04150c;font-weight:700;cursor:pointer;">Hinzufügen</button>
        </div>
        <div id="sv-liste" style="display:flex;flex-wrap:wrap;gap:8px;"></div>
      </div>`;

    const input = container.querySelector('#sv-input');
    const addBtn = container.querySelector('#sv-add');
    const liste = container.querySelector('#sv-liste');

    async function render() {
      const namen = await ladeNamen(sb, format);
      liste.innerHTML = namen.length
        ? namen.map(n => `
          <span style="display:flex;align-items:center;gap:6px;background:rgba(255,255,255,.06);border:1px solid var(--line,#232b45);border-radius:999px;padding:6px 8px 6px 14px;font-size:13px;font-weight:600;">
            ${escapeHtml(n)}
            <button data-entfernen="${escapeHtml(n)}" aria-label="Spieler entfernen" style="background:none;border:none;color:#ff5470;cursor:pointer;font-size:15px;line-height:1;padding:2px;">✕</button>
          </span>`).join('')
        : '<span style="color:var(--muted,#7f8bab);font-size:13px;">Noch niemand eingetragen.</span>';

      liste.querySelectorAll('[data-entfernen]').forEach(btn => {
        btn.onclick = async () => {
          await entferne(sb, format, btn.dataset.entfernen);
          render();
        };
      });
    }

    async function hinzufuegenClick() {
      const name = String(input.value || '').replace(/[\u0000-\u001f\u007f]/g, '').trim().replace(/\s+/g,' ').slice(0,32);
      if (!name) return;
      const { error } = await hinzufuegen(sb, format, name);
      if (error) { console.error(error); return; }
      input.value = '';
      render();
    }

    addBtn.onclick = hinzufuegenClick;
    input.addEventListener('keydown', e => { if (e.key === 'Enter') hinzufuegenClick(); });
    render();
    try {
      sb.channel('player-manager-' + format)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'public_players', filter: 'format=eq.' + format }, () => render())
        .subscribe();
    } catch (e) {}
    return { render };
  }

  window.SpielerVerwaltung = { einbauen };
})();
