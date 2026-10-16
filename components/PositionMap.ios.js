import { useEffect, useRef } from 'react';
import MapView, { Marker } from 'react-native-maps';

// Apple Maps on iOS: no API key needed. Follows `position` as it changes.
export default function PositionMap({ position, style }) {
  const mapRef = useRef(null);

  useEffect(() => {
    mapRef.current?.animateToRegion(
      {
        latitude: position.latitude,
        longitude: position.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      },
      500
    );
  }, [position]);

  return (
    <MapView
      ref={mapRef}
      style={style}
      initialRegion={{
        latitude: position.latitude,
        longitude: position.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }}
    >
      <Marker
        coordinate={{ latitude: position.latitude, longitude: position.longitude }}
        title="You are here"
      />
    </MapView>
  );
}
