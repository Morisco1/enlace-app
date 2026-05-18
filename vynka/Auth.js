import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { supabase } from './supabase';

export default function Auth({ onLogin }) {
  const [modo, setModo] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verPassword, setVerPassword] = useState(false);
  const [cargando, setCargando] = useState(false);

  const login = async () => {
    if (!email || !password) { alert('Completá todos los campos'); return; }
    setCargando(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setCargando(false);
    if (error) alert('Error: ' + error.message);
    else onLogin();
  };

  const registro = async () => {
    if (!email || !password) { alert('Completá todos los campos'); return; }
    if (password.length < 6) { alert('La contraseña debe tener al menos 6 caracteres'); return; }
    setCargando(true);
    const { error } = await supabase.auth.signUp({ email, password });
    setCargando(false);
    if (error) alert('Error: ' + error.message);
    else { alert('¡Listo! Revisá tu email para confirmar tu cuenta'); setModo('login'); }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#0D0D12' }}>
        <ScrollView contentContainerStyle={{ padding: 24, flexGrow: 1, justifyContent: 'center' }}>
          
          <Image 
            source={require('./assets/logo-auth.png')} 
            style={{ width: 180, height: 180, alignSelf: 'center', marginBottom: 16 }} 
            resizeMode="contain"
          />
          <Text style={{ color: '#A0A0A0', fontSize: 14, textAlign: 'center', marginBottom: 40 }}>donde los vínculos comienzan</Text>

          {/* Tabs */}
          <View style={{ flexDirection: 'row', backgroundColor: '#1A1A24', borderRadius: 12, padding: 4, marginBottom: 24 }}>
            <TouchableOpacity onPress={() => setModo('login')}
              style={{ flex: 1, padding: 10, borderRadius: 10, backgroundColor: modo === 'login' ? '#FF5722' : 'transparent', alignItems: 'center' }}>
              <Text style={{ color: modo === 'login' ? '#fff' : '#A0A0A0', fontWeight: 'bold' }}>Entrar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModo('registro')}
              style={{ flex: 1, padding: 10, borderRadius: 10, backgroundColor: modo === 'registro' ? '#FF5722' : 'transparent', alignItems: 'center' }}>
              <Text style={{ color: modo === 'registro' ? '#fff' : '#A0A0A0', fontWeight: 'bold' }}>Registrarse</Text>
            </TouchableOpacity>
          </View>

          {/* Email */}
          <Text style={{ color: '#A0A0A0', fontSize: 13, marginBottom: 8 }}>Email</Text>
          <TextInput value={email} onChangeText={setEmail} placeholder="tu@email.com" placeholderTextColor="#ffffff44"
            keyboardType="email-address" autoCapitalize="none"
            style={{ backgroundColor: '#1A1A24', borderWidth: 1, borderColor: '#2A2A3A', borderRadius: 12, padding: 12, color: '#fff', fontSize: 14, marginBottom: 16 }} />

          {/* Contraseña con ojo */}
          <Text style={{ color: '#A0A0A0', fontSize: 13, marginBottom: 8 }}>Contraseña</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A1A24', borderWidth: 1, borderColor: '#2A2A3A', borderRadius: 12, marginBottom: 24 }}>
            <TextInput value={password} onChangeText={setPassword} placeholder="Mínimo 6 caracteres" placeholderTextColor="#ffffff44"
              secureTextEntry={!verPassword}
              style={{ flex: 1, padding: 12, color: '#fff', fontSize: 14 }} />
            <TouchableOpacity onPress={() => setVerPassword(!verPassword)} style={{ padding: 12 }}>
              <Text style={{ fontSize: 20 }}>{verPassword ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={modo === 'login' ? login : registro}
            style={{ backgroundColor: '#FF5722', borderRadius: 12, padding: 14, alignItems: 'center' }}>
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>
              {cargando ? 'Cargando...' : modo === 'login' ? 'Entrar ✨' : 'Crear cuenta ✨'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}