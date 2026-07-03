import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View,
} from 'react-native';
import { Link } from 'expo-router';
import { supabase } from '../../services/supabase';
import type { UserProfile } from '../../types';

export default function RegisterScreen() {
  const scheme = useColorScheme();
  const dark = scheme === 'dark';
  const bg = dark ? '#0F0F1A' : '#F8F7FF';
  const cardBg = dark ? '#1E1E2E' : '#FFFFFF';
  const textColor = dark ? '#E0E0E0' : '#1A1A2E';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!email.trim() || !password) return;
    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    setError('');
    setLoading(true);

    const { data, error: err } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });

    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      const profile: UserProfile = {
        uid: data.user.id,
        email: data.user.email ?? '',
        isPremium: false,
        notificationHour: 9,
        notificationMinute: 0,
        createdAt: Date.now(),
      };
      await supabase.from('profiles').upsert({ id: data.user.id, ...profile });
    }

    setLoading(false);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bg }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inner}
      >
        <Text style={[styles.title, { color: textColor }]}>Créer un compte</Text>
        <Text style={styles.subtitle}>Commencez à réviser gratuitement</Text>

        <View style={[styles.card, { backgroundColor: cardBg }]}>
          <TextInput
            style={[styles.input, { color: textColor, borderColor: dark ? '#333' : '#E0E0E0' }]}
            placeholder="Email"
            placeholderTextColor="#888"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={[styles.input, { color: textColor, borderColor: dark ? '#333' : '#E0E0E0' }]}
            placeholder="Mot de passe (min. 6 caractères)"
            placeholderTextColor="#888"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <TextInput
            style={[styles.input, { color: textColor, borderColor: dark ? '#333' : '#E0E0E0' }]}
            placeholder="Confirmer le mot de passe"
            placeholderTextColor="#888"
            secureTextEntry
            value={confirm}
            onChangeText={setConfirm}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable
            style={[styles.btn, { opacity: loading ? 0.7 : 1 }]}
            onPress={handleRegister}
            disabled={loading}
          >
            <Text style={styles.btnText}>{loading ? 'Création...' : "S'inscrire"}</Text>
          </Pressable>

          <Link href="/auth/login" asChild>
            <Pressable style={styles.link}>
              <Text style={styles.linkText}>Déjà un compte ? Se connecter</Text>
            </Pressable>
          </Link>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { flex: 1, justifyContent: 'center', padding: 24, gap: 8 },
  title: { fontSize: 28, fontWeight: '800', textAlign: 'center' },
  subtitle: { fontSize: 15, color: '#888', textAlign: 'center', marginBottom: 16 },
  card: {
    borderRadius: 20,
    padding: 24,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
  },
  error: { color: '#F44336', fontSize: 13, textAlign: 'center' },
  btn: {
    backgroundColor: '#6C63FF',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginTop: 4,
  },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  link: { alignItems: 'center', padding: 8 },
  linkText: { color: '#6C63FF', fontSize: 14 },
});
