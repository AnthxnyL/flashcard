import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View, useColorScheme } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

interface FlipCardProps {
  front: string;
  back: string;
  isFlipped: boolean;
  onFlip: () => void;
}

export function FlipCard({ front, back, isFlipped, onFlip }: FlipCardProps) {
  const scheme = useColorScheme();
  const dark = scheme === 'dark';
  const rotate = useSharedValue(0);

  useEffect(() => {
    rotate.value = withTiming(isFlipped ? 1 : 0, { duration: 400 });
  }, [isFlipped]);

  const frontStyle = useAnimatedStyle(() => ({
    transform: [{ rotateY: `${interpolate(rotate.value, [0, 1], [0, 180])}deg` }],
    backfaceVisibility: 'hidden',
  }));

  const backStyle = useAnimatedStyle(() => ({
    transform: [{ rotateY: `${interpolate(rotate.value, [0, 1], [180, 360])}deg` }],
    backfaceVisibility: 'hidden',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  }));

  const cardBg = dark ? '#1E1E2E' : '#FFFFFF';
  const textColor = dark ? '#E0E0E0' : '#1A1A2E';

  return (
    <Pressable onPress={onFlip} style={styles.container}>
      <Animated.View style={[styles.card, { backgroundColor: cardBg }, frontStyle]}>
        <View style={styles.label}>
          <Text style={styles.labelText}>QUESTION</Text>
        </View>
        <Text style={[styles.text, { color: textColor }]}>{front}</Text>
      </Animated.View>

      <Animated.View style={[styles.card, { backgroundColor: '#6C63FF' }, backStyle]}>
        <View style={styles.label}>
          <Text style={[styles.labelText, { color: 'rgba(255,255,255,0.7)' }]}>RÉPONSE</Text>
        </View>
        <Text style={[styles.text, { color: '#FFFFFF' }]}>{back}</Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 280,
  },
  card: {
    flex: 1,
    borderRadius: 20,
    padding: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  text: {
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 32,
  },
  label: {
    position: 'absolute',
    top: 16,
    left: 20,
  },
  labelText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: '#6C63FF',
    opacity: 0.6,
  },
});
