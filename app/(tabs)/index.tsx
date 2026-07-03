import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useDecks } from '../../hooks/useDecks';
import { usePremium } from '../../hooks/usePremium';
import { useAuthStore } from '../../store/authStore';
import { DeckCard } from '../../components/DeckCard';
import { DeckSkeleton } from '../../components/SkeletonLoader';

const DECK_COLORS = ['#6C63FF', '#FF6584', '#43C59E', '#FFA851', '#4FC3F7', '#BA68C8'];

export default function DecksScreen() {
  const scheme = useColorScheme();
  const dark = scheme === 'dark';
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { myDecks, isLoading, addDeck, deleteDeck, getDueCount } = useDecks();
  const { canAddDeck, remaining, limit } = usePremium();

  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(DECK_COLORS[0]);

  const bg = dark ? '#0F0F1A' : '#F8F7FF';
  const cardBg = dark ? '#1E1E2E' : '#FFFFFF';
  const textColor = dark ? '#E0E0E0' : '#1A1A2E';

  const handleCreate = async () => {
    if (!title.trim() || !user) return;
    await addDeck(title.trim(), description.trim(), color, user.uid);
    setTitle('');
    setDescription('');
    setColor(DECK_COLORS[0]);
    setShowModal(false);
  };

  const handleAdd = () => {
    if (!canAddDeck) {
      Alert.alert(
        'Limite atteinte',
        `Le plan gratuit est limité à ${limit} decks. Passez à Premium pour en créer plus !`,
        [{ text: 'OK' }],
      );
      return;
    }
    setShowModal(true);
  };

  const handleDelete = (id: string, title: string) => {
    Alert.alert('Supprimer', `Supprimer le deck "${title}" et toutes ses cartes ?`, [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: () => deleteDeck(id) },
    ]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bg }]}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: textColor }]}>
            Bonjour{user?.email ? ` 👋` : ''} !
          </Text>
          <Text style={styles.subtitle}>
            {myDecks.length} deck{myDecks.length !== 1 ? 's' : ''}
            {!canAddDeck ? '' : ` · encore ${remaining} gratuit${remaining > 1 ? 's' : ''}`}
          </Text>
        </View>
        <Pressable style={styles.fab} onPress={handleAdd}>
          <Text style={styles.fabText}>+</Text>
        </Pressable>
      </View>

      {isLoading ? (
        <>
          <DeckSkeleton />
          <DeckSkeleton />
          <DeckSkeleton />
        </>
      ) : myDecks.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>📚</Text>
          <Text style={[styles.emptyText, { color: textColor }]}>Aucun deck pour l'instant</Text>
          <Text style={styles.emptyHint}>Appuyez sur + pour créer votre premier deck</Text>
        </View>
      ) : (
        <FlatList
          data={myDecks}
          keyExtractor={(d) => d.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <DeckCard
              deck={item}
              dueCount={getDueCount(item.id)}
              onPress={() => router.push(`/deck/${item.id}`)}
              onLongPress={() => handleDelete(item.id, item.title)}
            />
          )}
        />
      )}

      <Modal visible={showModal} transparent animationType="slide" onRequestClose={() => setShowModal(false)}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <Pressable style={styles.overlay} onPress={() => setShowModal(false)}>
            <Pressable onPress={() => {}} style={[styles.sheet, { backgroundColor: cardBg }]}>
              <View style={styles.sheetHandle} />
              <Text style={[styles.sheetTitle, { color: textColor }]}>Nouveau deck</Text>

              <TextInput
                style={[styles.input, { color: textColor, borderColor: dark ? '#333' : '#E0E0E0' }]}
                placeholder="Titre du deck"
                placeholderTextColor="#888"
                value={title}
                onChangeText={setTitle}
                autoFocus
                returnKeyType="next"
              />
              <TextInput
                style={[styles.input, { color: textColor, borderColor: dark ? '#333' : '#E0E0E0' }]}
                placeholder="Description (optionnel)"
                placeholderTextColor="#888"
                value={description}
                onChangeText={setDescription}
                returnKeyType="done"
              />

              <Text style={[styles.colorLabel, { color: textColor }]}>Couleur</Text>
              <View style={styles.colors}>
                {DECK_COLORS.map((c) => (
                  <Pressable
                    key={c}
                    style={[
                      styles.colorDot,
                      { backgroundColor: c },
                      color === c && styles.colorDotSelected,
                    ]}
                    onPress={() => setColor(c)}
                  />
                ))}
              </View>

              <View style={styles.sheetActions}>
                <Pressable style={styles.cancelBtn} onPress={() => setShowModal(false)}>
                  <Text style={{ color: '#888', fontWeight: '600' }}>Annuler</Text>
                </Pressable>
                <Pressable
                  style={[styles.createBtn, { opacity: title.trim() ? 1 : 0.5 }]}
                  onPress={handleCreate}
                  disabled={!title.trim()}
                >
                  <Text style={{ color: '#fff', fontWeight: '700' }}>Créer</Text>
                </Pressable>
              </View>
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  greeting: { fontSize: 24, fontWeight: '800' },
  subtitle: { fontSize: 13, color: '#888', marginTop: 2 },
  fab: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#6C63FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabText: { color: '#fff', fontSize: 28, lineHeight: 32, fontWeight: '300' },
  list: { paddingHorizontal: 20, paddingBottom: 20 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 8 },
  emptyIcon: { fontSize: 56 },
  emptyText: { fontSize: 18, fontWeight: '700' },
  emptyHint: { fontSize: 14, color: '#888' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    gap: 12,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#DDD',
    alignSelf: 'center',
    marginBottom: 8,
  },
  sheetTitle: { fontSize: 20, fontWeight: '800', marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  colorLabel: { fontSize: 13, fontWeight: '600', marginTop: 4 },
  colors: { flexDirection: 'row', gap: 12 },
  colorDot: { width: 32, height: 32, borderRadius: 16 },
  colorDotSelected: { borderWidth: 3, borderColor: '#fff', shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 4, elevation: 4 },
  sheetActions: { flexDirection: 'row', gap: 12, marginTop: 8 },
  cancelBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  createBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#6C63FF',
  },
});
