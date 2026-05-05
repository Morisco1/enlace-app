import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { supabase } from './supabase';

export default function Auth({ onLogin }) {
  const [modo, setModo] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(false);

  const login = async () => {
    if (!email || !password) { Alert.alert('Completá todos los campos'); return; }
    setCargando(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setCargando(false);
    if (error) Alert.alert('Error', error.message);
    else onLogin();
  };

  const registro = async () => {
    if (!email || !password) { Alert.alert('Completá todos los campos'); return; }
    if (password.length < 6) { Alert.alert('La contraseña debe tener al menos 6 caracteres'); return; }
    setCargando(true);
    const { error } = await supabase.auth.signUp({ email, password });
    setCargando(false);
    if (error) Alert.alert('Error', error.message);
    else {
      Alert.alert('¡Listo!', 'Revisá tu email para confirmar tu cuenta');
      setModo('login');
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#08080F' }}>
        <ScrollView contentContainerStyle={{ padding: 24, flexGrow: 1, justifyContent: 'center' }}>
          <Text style={{ fontSize: 60, textAlign: 'center', marginBottom: 16 }}>💫</Text>
          <Text style={{ color: '#FF6B9D', fontSize: 32, fontWeight: 'bold', textAlign: 'center', letterSpacing: 4, marginBottom: 8 }}>VYNKA</Text>
          <Text style={{ color: '#ffffff55', fontSize: 14, textAlign: 'center', marginBottom: 40 }}>donde los vínculos comienzan</Text>

          {/* Tabs login/registro */}
          <View style={{ flexDirection: 'row', backgroundColor: '#ffffff0A', borderRadius: 12, padding: 4, marginBottom: 24 }}>
            <TouchableOpacity onPress={() => setModo('login')}
              style={{ flex: 1, padding: 10, borderRadius: 10, backgroundColor: modo === 'login' ? '#FF6B9D' : 'transparent', alignItems: 'center' }}>
              <Text style={{ color: modo === 'login' ? '#000' : '#ffffff55', fontWeight: 'bold' }}>Entrar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModo('registro')}
              style={{ flex: 1, padding: 10, borderRadius: 10, backgroundColor: modo === 'registro' ? '#FF6B9D' : 'transparent', alignItems: 'center' }}>
              <Text style={{ color: modo === 'registro' ? '#000' : '#ffffff55', fontWeight: 'bold' }}>Registrarse</Text>
            </TouchableOpacity>
          </View>

          <Text style={{ color: '#ffffff77', fontSize: 13, marginBottom: 8 }}>Email</Text>
          <TextInput value={email} onChangeText={setEmail} placeholder="tu@email.com" placeholderTextColor="#ffffff44"
            keyboardType="email-address" autoCapitalize="none"
            style={{ backgroundColor: '#ffffff0A', borderWidth: 1, borderColor: '#ffffff22', borderRadius: 12, padding: 12, color: '#fff', fontSize: 14, marginBottom: 16 }} />

          <Text style={{ color: '#ffffff77', fontSize: 13, marginBottom: 8 }}>Contraseña</Text>
          <TextInput value={password} onChangeText={setPassword} placeholder="Mínimo 6 caracteres" placeholderTextColor="#ffffff44"
            secureTextEntry
            style={{ backgroundColor: '#ffffff0A', borderWidth: 1, borderColor: '#ffffff22', borderRadius: 12, padding: 12, color: '#fff', fontSize: 14, marginBottom: 24 }} />

          <TouchableOpacity onPress={modo === 'login' ? login : registro}
            style={{ backgroundColor: '#FF6B9D', borderRadius: 12, padding: 14, alignItems: 'center' }}>
            <Text style={{ color: '#000', fontWeight: 'bold', fontSize: 16 }}>
              {cargando ? 'Cargando...' : modo === 'login' ? 'Entrar ✨' : 'Crear cuenta ✨'}
            </Text>
          </TouchableOpacity>

          {modo === 'login' && (
            <TouchableOpacity style={{ marginTop: 16, alignItems: 'center' }}>
              <Text style={{ color: '#ffffff44', fontSize: 13 }}>¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}