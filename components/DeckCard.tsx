import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Deck } from '../types';

interface DeckCardProps {
  deck: Deck;
  dueCount: number;
  onPress: () => void;
  onLongPress?: () => void;
}

export function DeckCard({ deck, dueCount, onPress, onLongPress }: DeckCardProps) {
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => [styles.container, { opacity: pressed ? 0.85 : 1 }]}
    >
      <View style={[styles.accent, { backgroundColor: deck.color }]} />
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>
          {deck.title}
        </Text>
        {deck.description ? (
          <Text style={styles.desc} numberOfLines={1}>
            {deck.description}
          </Text>
        ) : null}
        <View style={styles.footer}>
          <Text style={styles.meta}>{deck.cardCount} carte{deck.cardCount !== 1 ? 's' : ''}</Text>
          {dueCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{dueCount} à réviser</Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  accent: {
    width: 6,
  },
  body: {
    flex: 1,
    padding: 16,
    gap: 4,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1A1A2E',
  },
  desc: {
    fontSize: 13,
    color: '#888',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  meta: {
    fontSize: 12,
    color: '#aaa',
  },
  badge: {
    backgroundColor: '#6C63FF',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
});
