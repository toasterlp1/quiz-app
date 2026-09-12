/* ============================================================
   QUIZ-APP PUBLIC PLAYER DIRECTORY
   ------------------------------------------------------------
   buzzer and stored in public_players for the active stream.
   ============================================================ */
(function () {
  'use strict';

  const namen = Object.create(null);
  let fertig = false;

  function setzeCrew(rows) {
    Object.keys(namen).forEach(k => delete namen[k]);
    (rows || []).forEach(row => {
      const name = String(row && row.name || '').trim();
      if (name && row.active !== false) namen[name] = true;
    });
    fertig = true;
  }

  function aktuellesFormat() {
    const parts = window.location.pathname.split('/').filter(Boolean);
    const known = ['ausreden','bluff-quiz','blackstories','codenames','emoji','higherlower','hotzone','imposter','millionaer','morph','quizduell','weristdas'];
    return parts.find(p => known.includes(p)) || '';
  }

  async function laden() {
    if (!window.KA_SB) return [];
    let q = window.KA_SB
      .from('public_players')
      .select('name, active')
      .eq('active', true);
    const format = aktuellesFormat();
    if (format) q = q.eq('format', format);
    const { data, error } = await q.order('name', { ascending: true });
    if (!error) setzeCrew(data || []);
    else setzeCrew([]);
    try {
      window.dispatchEvent(new CustomEvent('ka-crew-ready', {
        detail: { names: Object.keys(namen) }
      }));
    } catch (e) {}
    return Object.keys(namen);
  }

  const readyPromise = (async () => {
    if (window.KA_AUTH_READY) await window.KA_AUTH_READY;
    return laden();
  })();

  window.KA_CREW_READY = readyPromise;
  window.KA_CREW = {
    ready: readyPromise,
    names: () => Object.keys(namen),
    isReady: () => fertig
  };
  window.crewNames = () => Object.keys(namen);
  window.avatarFor = () => null;
  window.aktuelleGruppe = () => 'public';
  window.AVATARE = namen;

  // Sofortige Aktualisierung über Supabase Realtime. Der 5-Sekunden-Fallback
  // bleibt aktiv, falls ein Client Realtime nicht empfangen kann.
  try {
    if (window.KA_SB) {
      window.KA_SB.channel('public-player-directory')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'public_players' }, () => laden())
        .subscribe();
    }
  } catch (e) {}
  setInterval(laden, 5000);
})();
