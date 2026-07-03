import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, useColorScheme, View } from 'react-native';
import { useDeckStore } from '../../store/deckStore';
import { useAuthStore } from '../../store/authStore';
import { usePremium } from '../../hooks/usePremium';
import { isDue } from '../../services/sm2';

export default function StatsScreen() {
  const scheme = useColorScheme();
  const dark = scheme === 'dark';
  const user = useAuthStore((s) => s.user);
  const { decks, cards } = useDeckStore();
  const { isPremium } = usePremium();

  const bg = dark ? '#0F0F1A' : '#F8F7FF';
  const cardBg = dark ? '#1E1E2E' : '#FFFFFF';
  const textColor = dark ? '#E0E0E0' : '#1A1A2E';

  const myDecks = decks.filter((d) => d.userId === user?.uid);
  const myCards = cards.filter((c) => myDecks.some((d) => d.id === c.deckId));
  const dueCards = myCards.filter(isDue);
  const reviewed = myCards.filter((c) => c.lastReviewDate !== null);
  const mastered = myCards.filter((c) => c.interval >= 21);

  const stats = [
    { label: 'Decks créés', value: myDecks.length, icon: '📚' },
    { label: 'Cartes totales', value: myCards.length, icon: '🃏' },
    { label: 'À réviser', value: dueCards.length, icon: '⏰' },
    { label: 'Déjà révisées', value: reviewed.length, icon: '✅' },
    { label: 'Maîtrisées (≥21j)', value: mastered.length, icon: '⭐' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bg }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: textColor }]}>Statistiques</Text>

        <View style={styles.grid}>
          {stats.map((s) => (
            <View key={s.label} style={[styles.statCard, { backgroundColor: cardBg }]}>
              <Text style={styles.statIcon}>{s.icon}</Text>
              <Text style={[styles.statValue, { color: textColor }]}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {!isPremium && (
          <View style={[styles.premiumBanner, { backgroundColor: cardBg }]}>
            <Text style={styles.premiumIcon}>🔒</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.premiumTitle, { color: textColor }]}>
                Statistiques avancées
              </Text>
              <Text style={styles.premiumDesc}>
                Courbe de mémoire, heatmap, export JSON — disponibles en Premium.
              </Text>
            </View>
          </View>
        )}

        {myCards.length > 0 && (
          <View style={[styles.section, { backgroundColor: cardBg }]}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>Progression par deck</Text>
            {myDecks.map((deck) => {
              const deckCards = myCards.filter((c) => c.deckId === deck.id);
              const done = deckCards.filter((c) => !isDue(c)).length;
              const pct = deckCards.length > 0 ? done / deckCards.length : 0;
              return (
                <View key={deck.id} style={styles.deckRow}>
                  <View style={[styles.deckDot, { backgroundColor: deck.color }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.deckName, { color: textColor }]}>{deck.title}</Text>
                    <View style={styles.barTrack}>
                      <View style={[styles.barFill, { width: `${pct * 100}%`, backgroundColor: deck.color }]} />
                    </View>
                  </View>
                  <Text style={styles.pctText}>{Math.round(pct * 100)}%</Text>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, gap: 16 },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statCard: {
    width: '47%',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  statIcon: { fontSize: 28 },
  statValue: { fontSize: 32, fontWeight: '800' },
  statLabel: { fontSize: 12, color: '#888', textAlign: 'center' },
  premiumBanner: {
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#6C63FF30',
  },
  premiumIcon: { fontSize: 28 },
  premiumTitle: { fontSize: 15, fontWeight: '700', marginBottom: 2 },
  premiumDesc: { fontSize: 12, color: '#888', lineHeight: 18 },
  section: {
    borderRadius: 16,
    padding: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  deckRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  deckDot: { width: 10, height: 10, borderRadius: 5 },
  deckName: { fontSize: 13, fontWeight: '600', marginBottom: 4 },
  barTrack: { height: 6, backgroundColor: '#E0E0E0', borderRadius: 3, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 3 },
  pctText: { fontSize: 12, color: '#888', width: 36, textAlign: 'right' },
});
