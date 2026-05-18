// MapaComponente.js
import React from 'react';
import { View, Text } from 'react-native';

let MapView, Marker, PROVIDER_GOOGLE;

try {
  const maps = require('react-native-maps');
  MapView = maps.default;
  Marker = maps.Marker;
  PROVIDER_GOOGLE = maps.PROVIDER_GOOGLE;
} catch (e) {}

const MapaFallback = ({ style, children }) => (
  <View style={[style, { backgroundColor: '#0D0118', alignItems: 'center', justifyContent: 'center' }]}>
    <Text style={{ color: '#A08CC0', fontSize: 13 }}>🗺️ Mapa no disponible en Expo Go</Text>
    <Text style={{ color: '#7C3AED', fontSize: 11, marginTop: 4 }}>Usá un development build</Text>
    {children}
  </View>
);

const MarkerFallback = () => null;

export const MapViewSafe = MapView || MapaFallback;
export const MarkerSafe = Marker || MarkerFallback;
export const PROVIDER_GOOGLE_SAFE = PROVIDER_GOOGLE || null;