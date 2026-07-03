import React, { useEffect } from 'react';
import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSession } from '../../hooks/useSession';
import { FlipCard } from '../../components/FlipCard';
import { ProgressBar } from '../../components/ProgressBar';
import type { ReviewQuality } from '../../types';

const ANSWER_BUTTONS: { label: string; quality: ReviewQuality; color: string }[] = [
  { label: '❌ Oublié', quality: 0, color: '#F44336' },
  { label: '😕 Difficile', quality: 2, color: '#FFA851' },
  { label: '🙂 Bien', quality: 4, color: '#4CAF50' },
  { label: '⭐ Parfait', quality: 5, color: '#6C63FF' },
];

export default function SessionScreen() {
  const { deckId } = useLocalSearchParams<{ deckId: string }>();
  const router = useRouter();
  const scheme = useColorScheme();
  const dark = scheme === 'dark';
  const bg = dark ? '#0F0F1A' : '#F8F7FF';
  const textColor = dark ? '#E0E0E0' : '#1A1A2E';

  const { start, flip, answer, currentCard, isFlipped, sessionStats, isDone, queue } = useSession(
    deckId ?? '',
  );

  useEffect(() => {
    start();
  }, [deckId]);

  if (isDone || (!currentCard && sessionStats.total === 0 && queue.length === 0)) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: bg }]}>
        <View style={styles.done}>
          <Text style={styles.doneIcon}>🎉</Text>
          <Text style={[styles.doneTitle, { color: textColor }]}>Session terminée !</Text>
          <Text style={styles.doneSub}>
            {sessionStats.correct} / {sessionStats.total} correctes
          </Text>
          <Pressable style={styles.doneBtn} onPress={() => router.back()}>
            <Text style={styles.doneBtnText}>Retour au deck</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (!currentCard) return null;

  const done = sessionStats.total;
  const total = done + queue.length;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bg }]}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.closeBtn}>
          <Text style={styles.closeBtnText}>✕</Text>
        </Pressable>
        <View style={styles.progressWrap}>
          <ProgressBar current={done} total={total} />
        </View>
      </View>

      <View style={styles.cardWrap}>
        <FlipCard
          front={currentCard.front}
          back={currentCard.back}
          isFlipped={isFlipped}
          onFlip={flip}
        />
        {!isFlipped && (
          <Text style={styles.tapHint}>Appuyez pour révéler la réponse</Text>
        )}
      </View>

      {isFlipped && (
        <View style={styles.buttons}>
          {ANSWER_BUTTONS.map((btn) => (
            <Pressable
              key={btn.quality}
              style={[styles.answerBtn, { backgroundColor: btn.color }]}
              onPress={() => answer(btn.quality)}
            >
              <Text style={styles.answerBtnText}>{btn.label}</Text>
            </Pressable>
          ))}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
    gap: 12,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: { fontSize: 16, color: '#888' },
  progressWrap: { flex: 1 },
  cardWrap: { flex: 1, paddingHorizontal: 20, justifyContent: 'center', gap: 16 },
  tapHint: { textAlign: 'center', color: '#aaa', fontSize: 14, marginTop: 12 },
  buttons: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    gap: 10,
  },
  answerBtn: {
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  answerBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  done: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16, padding: 24 },
  doneIcon: { fontSize: 72 },
  doneTitle: { fontSize: 28, fontWeight: '800' },
  doneSub: { fontSize: 18, color: '#888' },
  doneBtn: {
    backgroundColor: '#6C63FF',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 40,
    marginTop: 16,
  },
  doneBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
