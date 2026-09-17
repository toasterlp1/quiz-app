
(function () {
  'use strict';

  (function cleanupLegacyQuizAppCache() {
    try {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations()
          .then(function (regs) {
            return Promise.all(regs.map(function (reg) { return reg.unregister(); }));
          })
          .catch(function () {});
      }
      if ('caches' in window) {
        caches.keys()
          .then(function (keys) {
            return Promise.all(keys
              .filter(function (key) { return /^quiz-app-/i.test(key); })
              .map(function (key) { return caches.delete(key); }));
          })
          .catch(function () {});
      }
    } catch (e) {}
  })();

  const KA_URL = "https://dazabcxqplkvcyeiesgd.supabase.co";
  const KA_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRhemFiY3hxcGxrdmN5ZWllc2dkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE4NTQ0NzksImV4cCI6MjA5NzQzMDQ3OX0.N3Dca8Quii4M8nFYLHjzBslby_tBUCyH1-WnPfYW01Y";

  if (!window.supabase) {
    console.error('Quiz-App: supabase-js fehlt.');
    return;
  }

  const client = window.supabase.createClient(KA_URL, KA_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  });

  window.KA_SB = client;
  window.KA_USER = {
    id: null,
    name: null,
    role: 'public',
    active: true,
    inSession: true
  };

  window.KA_AUTH_READY = Promise.resolve(true);

  function isValidShowSession(value) {
    return /^[A-Za-z0-9_-]{32,128}$/.test(String(value || '').trim());
  }

  function currentFormatFromPath() {
    const known = new Set(['ausreden','bluff-quiz','blackstories','emoji','higherlower','hotzone','imposter','millionaer','morph','quizduell','weristdas']);
    return location.pathname.split('/').filter(Boolean).find(part => known.has(part)) || '';
  }

  const PLAYER_SESSION_KEYS = {
    emoji: ['er_name'],
    weristdas: ['wid_name'],
    morph: ['mo_name'],
    hotzone: ['hz_name'],
    millionaer: ['wwm_name'],
    'bluff-quiz': ['bl_name'],
    ausreden: ['ak_name','ar_name'],
    quizduell: ['quizduell_player_name','quizduell_pid','quiz_name'],
    higherlower: [],
    blackstories: [],
    imposter: []
  };

  function hasStoredPlayerForFormat(fmt) {
    try {
      if (sessionStorage.getItem('ka_current_player_' + fmt)) return true;
      if (sessionStorage.getItem('ka_player_' + fmt)) return true;
      return (PLAYER_SESSION_KEYS[fmt] || []).some(key => !!sessionStorage.getItem(key));
    } catch (e) { return false; }
  }

  function clearStoredPlayerForFormat(fmt) {
    try {
      sessionStorage.removeItem('ka_current_player_' + fmt);
      sessionStorage.removeItem('ka_player_' + fmt);
      (PLAYER_SESSION_KEYS[fmt] || []).forEach(key => sessionStorage.removeItem(key));
    } catch (e) {}
  }

  function bindPlayerStorageToShowSession(fmt, session) {
    if (!fmt || !isValidShowSession(session)) return false;
    const markerKey = 'ka_player_session_' + fmt;
    try {
      const previous = String(sessionStorage.getItem(markerKey) || '').trim();
      const hasIdentity = hasStoredPlayerForFormat(fmt);
      const stale = hasIdentity && (!previous || previous !== session);
      sessionStorage.setItem(markerKey, session);
      if (!stale) return false;

      clearStoredPlayerForFormat(fmt);
      window.dispatchEvent(new CustomEvent('ka:player-session-invalidated', {
        detail: { format: fmt, previousSession: previous || null, session }
      }));
      return true;
    } catch (e) { return false; }
  }

  async function fetchSharedShowSession(fmt) {
    if (!fmt) return '';
    try {
      const { data, error } = await client.rpc('get_camera_session', { p_format: fmt });
      if (error) throw error;
      return String(data || '').trim();
    } catch (e) {
      console.warn('Quiz-App: gemeinsame Kamera-Session konnte nicht geladen werden:', e);
      return '';
    }
  }

  async function setupShowSession() {
    const fmt = currentFormatFromPath();
    if (!fmt) return '';

    let session = await fetchSharedShowSession(fmt);

    if (!isValidShowSession(session)) {
      const params = new URLSearchParams(location.search);
      const fromUrl = String(params.get('session') || '').trim();
      if (isValidShowSession(fromUrl)) session = fromUrl;
    }

    if (!isValidShowSession(session)) return '';

    try { localStorage.setItem('ka_show_session', session); } catch (e) {}
    window.KA_SHOW_SESSION = session;

    const playerSessionWasStale = bindPlayerStorageToShowSession(fmt, session);

    const params = new URLSearchParams(location.search);
    if (params.get('session') !== session) {
      params.set('session', session);
      const next = location.pathname + '?' + params.toString() + location.hash;
      history.replaceState(null, '', next);
    }

    const decorateLinks = () => {
      document.querySelectorAll('a[href]').forEach(a => {
        const raw = a.getAttribute('href');
        if (!raw || raw.startsWith('#') || raw.startsWith('mailto:') || raw.startsWith('javascript:')) return;
        try {
          const url = new URL(raw, location.href);
          if (url.origin !== location.origin) return;
          if (!url.pathname.includes('/' + fmt + '/')) return;
          url.searchParams.set('session', session);
          a.href = url.href;
        } catch (e) {}
      });
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', decorateLinks, { once: true });
    } else {
      decorateLinks();
    }

    window.dispatchEvent(new CustomEvent('ka:show-session-ready', { detail: { session, format: fmt } }));

    if (playerSessionWasStale) {
      setTimeout(() => location.reload(), 0);
    }
    return session;
  }

  window.KA_SHOW_SESSION_READY = setupShowSession();

  (function startShowSessionWatchdog() {
    const fmt = currentFormatFromPath();
    if (!fmt) return;

    let checking = false;
    let stopped = false;
    let timer = null;

    async function check(reason) {
      if (checking || stopped || document.visibilityState === 'hidden') return;
      checking = true;
      try {
        const known = String(window.KA_SHOW_SESSION || '').trim();
        const fresh = await fetchSharedShowSession(fmt);
        if (!isValidShowSession(fresh) || !isValidShowSession(known) || fresh === known) return;

        bindPlayerStorageToShowSession(fmt, fresh);
        try { localStorage.setItem('ka_show_session', fresh); } catch (e) {}
        window.KA_SHOW_SESSION = fresh;
        window.dispatchEvent(new CustomEvent('ka:show-session-changed', {
          detail: { format: fmt, previousSession: known, session: fresh, reason: reason || 'watchdog' }
        }));

        const params = new URLSearchParams(location.search);
        params.set('session', fresh);
        const next = location.pathname + '?' + params.toString() + location.hash;
        history.replaceState(null, '', next);
        stopped = true;
        location.reload();
      } finally {
        checking = false;
      }
    }

    function schedule() {
      if (timer) clearInterval(timer);
      timer = setInterval(() => check('interval'), 12000);
    }

    function onVisible() {
      if (document.visibilityState === 'visible') check('visible');
    }
    function onOnline() { check('online'); }
    function onPageShow(e) {
      if (e && e.persisted) {
        schedule();
        check('pageshow');
      }
    }

    Promise.resolve(window.KA_SHOW_SESSION_READY).then(() => {
      if (stopped) return;
      schedule();
      check('ready');
    }).catch(() => schedule());

    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('online', onOnline);
    window.addEventListener('pageshow', onPageShow);
  })();

  window.KA_PUBLIC = {
    normalizeName(name) {
      return String(name == null ? '' : name)
        .replace(/[\u0000-\u001f\u007f]/g, '')
        .trim()
        .replace(/\s+/g, ' ')
        .slice(0, 32);
    },
    async registerPlayer(name, format) {
      const clean = this.normalizeName(name);
      const fmt = String(format || '').trim().slice(0, 40);
      if (!clean || clean.length < 1 || !fmt) {
        return { ok: false, error: new Error('Ungültiger Name oder Format.') };
      }
      const { data, error } = await client.rpc('register_public_player', {
        p_name: clean,
        p_format: fmt
      });
      if (error) {
        console.error('Quiz-App: Spieler konnte nicht registriert werden:', error);
        return { ok: false, error };
      }
      const fresh = !!(data && data.fresh === true);
      try {
        const showSession = window.KA_SHOW_SESSION_READY && typeof window.KA_SHOW_SESSION_READY.then === 'function'
          ? await window.KA_SHOW_SESSION_READY
          : String(window.KA_SHOW_SESSION || '');
        if (isValidShowSession(showSession)) {
          sessionStorage.setItem('ka_player_session_' + fmt, showSession);
        }

        const participantKey = 'ka_camera_participant_id_' + fmt;
        let participantId = String(sessionStorage.getItem(participantKey) || '').trim();
        if (!/^[A-Za-z0-9:_-]{8,128}$/.test(participantId)) {
          participantId = 'p_' + crypto.randomUUID();
          sessionStorage.setItem(participantKey, participantId);
        }
        sessionStorage.setItem('ka_current_player_'+fmt, JSON.stringify({ name: clean, format: fmt, participantId, fresh }));
        localStorage.removeItem('ka_current_player');
      } catch (e) {}
      return { ok: !!(data && data.ok !== false), data };
    }
  };
})();
