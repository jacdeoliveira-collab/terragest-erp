export function gerarMapaIframeHtml(latPadrao = -5.0, lngPadrao = -45.0, zoomPadrao = 7): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    body, html, #map { margin: 0; padding: 0; width: 100%; height: 100%; }
    .leaflet-control-layers { font-size: 11px !important; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var googleHibrido = L.tileLayer('https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
      maxZoom: 20, attribution: 'Google Maps Híbrido'
    });
    var googleRuas = L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
      maxZoom: 20, attribution: 'Google Vias'
    });
    var osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19, attribution: 'OpenStreetMap'
    });

    var map = L.map('map', { center: [${latPadrao}, ${lngPadrao}], zoom: ${zoomPadrao}, layers: [googleHibrido] });
    L.control.layers({
      'Satélite + Rodovias (Híbrido)': googleHibrido,
      'Mapa de Rodovias / Ruas': googleRuas,
      'OpenStreetMap': osm
    }).addTo(map);

    var marker = L.marker([${latPadrao}, ${lngPadrao}], { draggable: true }).addTo(map);

    function notify(lat, lng) {
      window.parent.postMessage({ type: 'TERRAGEST_PIN_CHANGED', lat: lat, lng: lng }, '*');
    }

    map.on('click', function(e) {
      marker.setLatLng(e.latlng);
      notify(e.latlng.lat, e.latlng.lng);
    });

    marker.on('dragend', function(e) {
      var pos = marker.getLatLng();
      notify(pos.lat, pos.lng);
    });

    window.addEventListener('message', function(ev) {
      if (ev.data && ev.data.type === 'SET_CENTER') {
        map.setView([ev.data.lat, ev.data.lng], ev.data.zoom || 15);
        marker.setLatLng([ev.data.lat, ev.data.lng]);
        notify(ev.data.lat, ev.data.lng);
      }
    });
  </script>
</body>
</html>`;
}
