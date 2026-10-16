import { useEffect, useRef } from 'react';
import { WebView } from 'react-native-webview';

// Android (and web): an OpenStreetMap map drawn by Leaflet inside a WebView.
// Google Maps on Android needs an API key, which Expo Go does not provide, so its map stays black.
// Follows `position` as it changes.
function buildHtml({ latitude, longitude }) {
  return `<!doctype html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<style>html, body, #map { height: 100%; margin: 0; }</style>
</head>
<body>
<div id="map"></div>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script>
  var map = L.map('map').setView([${latitude}, ${longitude}], 15);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);
  var marker = L.circleMarker([${latitude}, ${longitude}], {
    radius: 9, color: '#ffffff', weight: 3, fillColor: '#1e6fd9', fillOpacity: 1
  }).addTo(map);
  window.setPosition = function (lat, lng) {
    marker.setLatLng([lat, lng]);
    map.panTo([lat, lng]);
  };
</script>
</body>
</html>`;
}

export default function PositionMap({ position, style }) {
  const webViewRef = useRef(null);
  // The page is built once, from the first reading. Later readings are pushed in as a script.
  const html = useRef(buildHtml(position)).current;

  useEffect(() => {
    webViewRef.current?.injectJavaScript(
      `window.setPosition && window.setPosition(${position.latitude}, ${position.longitude}); true;`
    );
  }, [position]);

  return (
    <WebView
      ref={webViewRef}
      style={style}
      originWhitelist={['*']}
      source={{ html }}
      javaScriptEnabled
    />
  );
}
