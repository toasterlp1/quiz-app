
(function (global) {
  'use strict';

  
  function stufe(state) {
    return (state && state.aufdeckStufe) || 0;
  }

  
  function stufeHoch(state, schritt = 1) {
    if (!state) return;
    state.aufdeckStufe = stufe(state) + schritt;
  }

  
  function stufeSetzen(state, wert) {
    if (state) state.aufdeckStufe = wert;
  }

  
  function istFertig(state, maxStufe) {
    return stufe(state) >= maxStufe;
  }

  
  function zuruecksetzen(state) {
    if (!state) return;
    state.aufdeckStufe = 0;
    state.gelöst = false;
  }

  global.KernAufdecken = { stufe, stufeHoch, stufeSetzen, istFertig, zuruecksetzen };
})(typeof window !== 'undefined' ? window : this);
