/* Accelera map helper — d3-geo on Natural Earth 110m. Ink/grey land, one accent. */
window.AcceleraMap = (function () {
  const INK = '#0a0a0a', ACC = '#7BF076', UP = '#d4f5d1', G1 = '#eeeef0', G2 = '#e0e0e4', G3 = '#c6c6cb', G4 = '#9a9a9e', W = '#fff';
  const URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-110m.json';
  let cache;
  async function countries() {
    if (!cache) cache = fetch(URL).then(r => r.json()).then(t => topojson.feature(t, t.objects.countries).features);
    return cache;
  }
  // Numeric ISO ids (world-atlas uses UN M49 codes)
  const ID = { ES: '724', PT: '620', FR: '250', DE: '276', IT: '380', NL: '528', GB: '826', IE: '372', BE: '056', CH: '756', AT: '040', DK: '208', SE: '752', NO: '578', FI: '246', PL: '616', CZ: '203', GR: '300', US: '840', IL: '376', MX: '484', BR: '076', AR: '032', CL: '152', CO: '170', MA: '504', TR: '792', IN: '356', SG: '702', AU: '036', JP: '392', KR: '410', CA: '124', RO: '642', HU: '348' };
  // Explicit bounds as MultiPoint (SW, NE) — never fit to features (overseas territories break the fit) and never to a Polygon (spherical winding can invert it)
  const BBOX = { europe: {type:'MultiPoint',coordinates:[[-11,35],[26,60]]}, spain: {type:'MultiPoint',coordinates:[[-9.5,35.8],[3.5,44]]}, iberia: {type:'MultiPoint',coordinates:[[-10,35.8],[4,44]]} };
  const rampMoic = v => v == null ? W : v < 1.05 ? G1 : v < 1.2 ? G2 : v < 1.5 ? UP : v < 2 ? ACC : INK;
  function svg(sel, w, h) {
    return d3.select(sel).append('svg').attr('viewBox', `0 0 ${w} ${h}`).attr('width', '100%').style('display', 'block').style('overflow', 'visible');
  }
  function land(g, feats, path, fill) {
    g.append('g').selectAll('path').data(feats).join('path').attr('d', path)
      .attr('fill', d => (typeof fill === 'function' ? fill(d) : fill) || G1)
      .attr('stroke', W).attr('stroke-width', 0.6).attr('stroke-linejoin', 'round');
  }
  return { BBOX, INK, ACC, UP, G1, G2, G3, G4, W, ID, countries, rampMoic, svg, land };
})();
