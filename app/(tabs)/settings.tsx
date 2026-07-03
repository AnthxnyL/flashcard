import React, { useState } from 'react';
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import { supabase } from '../../services/supabase';
import { useAuthStore } from '../../store/authStore';
import { useNotifications } from '../../hooks/useNotifications';

export default function SettingsScreen() {
  const scheme = useColorScheme();
  const dark = scheme === 'dark';
  const user = useAuthStore((s) => s.user);
  const { reschedule } = useNotifications();

  const bg = dark ? '#0F0F1A' : '#F8F7FF';
  const cardBg = dark ? '#1E1E2E' : '#FFFFFF';
  const textColor = dark ? '#E0E0E0' : '#1A1A2E';

  const [notifHour, setNotifHour] = useState(user?.notificationHour ?? 9);
  const [notifEnabled, setNotifEnabled] = useState(true);

  const handleHourChange = async (delta: number) => {
    const newHour = (notifHour + delta + 24) % 24;
    setNotifHour(newHour);
    if (user) {
      await supabase
        .from('profiles')
        .update({ notificationHour: newHour })
        .eq('id', user.uid);
      await reschedule(newHour, user.notificationMinute ?? 0);
    }
  };

  const handleLogout = () => {
    Alert.alert('Déconnexion', 'Voulez-vous vraiment vous déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Déconnexion',
        style: 'destructive',
        onPress: () => supabase.auth.signOut(),
      },
    ]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bg }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: textColor }]}>Paramètres</Text>

        {user && (
          <View style={[styles.section, { backgroundColor: cardBg }]}>
            <Text style={styles.sectionTitle}>Compte</Text>
            <View style={styles.row}>
              <Text style={[styles.rowLabel, { color: textColor }]}>Email</Text>
              <Text style={styles.rowValue}>{user.email}</Text>
            </View>
            <View style={styles.row}>
              <Text style={[styles.rowLabel, { color: textColor }]}>Abonnement</Text>
              <View style={[styles.badge, { backgroundColor: user.isPremium ? '#6C63FF' : '#E0E0E0' }]}>
                <Text style={[styles.badgeText, { color: user.isPremium ? '#fff' : '#888' }]}>
                  {user.isPremium ? '⭐ Premium' : 'Gratuit'}
                </Text>
              </View>
            </View>
          </View>
        )}

        <View style={[styles.section, { backgroundColor: cardBg }]}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.row}>
            <Text style={[styles.rowLabel, { color: textColor }]}>Rappel quotidien</Text>
            <Switch
              value={notifEnabled}
              onValueChange={setNotifEnabled}
              trackColor={{ true: '#6C63FF' }}
            />
          </View>
          {notifEnabled && (
            <View style={styles.row}>
              <Text style={[styles.rowLabel, { color: textColor }]}>Heure</Text>
              <View style={styles.hourPicker}>
                <Pressable style={styles.hourBtn} onPress={() => handleHourChange(-1)}>
                  <Text style={styles.hourBtnText}>−</Text>
                </Pressable>
                <Text style={[styles.hourValue, { color: textColor }]}>
                  {String(notifHour).padStart(2, '0')}:00
                </Text>
                <Pressable style={styles.hourBtn} onPress={() => handleHourChange(1)}>
                  <Text style={styles.hourBtnText}>+</Text>
                </Pressable>
              </View>
            </View>
          )}
        </View>

        {!user?.isPremium && (
          <View style={[styles.premiumCard, { backgroundColor: '#6C63FF' }]}>
            <Text style={styles.premiumTitle}>Passer à Premium ⭐</Text>
            <Text style={styles.premiumDesc}>
              Decks illimités · Statistiques avancées · Export JSON
            </Text>
            <Pressable style={styles.premiumBtn}>
              <Text style={{ color: '#6C63FF', fontWeight: '800', fontSize: 15 }}>
                Découvrir Premium
              </Text>
            </Pressable>
          </View>
        )}

        <Pressable style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Déconnexion</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, gap: 16 },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 8 },
  section: {
    borderRadius: 16,
    padding: 16,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: '#888', letterSpacing: 1, textTransform: 'uppercase' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowLabel: { fontSize: 15 },
  rowValue: { fontSize: 14, color: '#888' },
  badge: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 3 },
  badgeText: { fontSize: 12, fontWeight: '700' },
  hourPicker: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  hourBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#6C63FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hourBtnText: { color: '#fff', fontSize: 20, lineHeight: 24, fontWeight: '700' },
  hourValue: { fontSize: 18, fontWeight: '700', minWidth: 60, textAlign: 'center' },
  premiumCard: {
    borderRadius: 20,
    padding: 24,
    gap: 8,
    alignItems: 'center',
  },
  premiumTitle: { color: '#fff', fontSize: 20, fontWeight: '800' },
  premiumDesc: { color: 'rgba(255,255,255,0.8)', fontSize: 13, textAlign: 'center' },
  premiumBtn: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginTop: 8,
  },
  logoutBtn: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F44336',
    alignItems: 'center',
    marginTop: 8,
  },
  logoutText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
