import React, { useRef, useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useDeckStore } from '../../store/deckStore';
import { isDue } from '../../services/sm2';

export default function DeckDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const scheme = useColorScheme();
  const dark = scheme === 'dark';
  const router = useRouter();

  const { decks, getCardsByDeck, addCard, deleteCard } = useDeckStore();
  const deck = decks.find((d) => d.id === id);
  const cards = getCardsByDeck(id ?? '');
  const dueCount = cards.filter(isDue).length;

  const bg = dark ? '#0F0F1A' : '#F8F7FF';
  const cardBg = dark ? '#1E1E2E' : '#FFFFFF';
  const textColor = dark ? '#E0E0E0' : '#1A1A2E';

  const [showModal, setShowModal] = useState(false);
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const backInputRef = useRef<TextInput>(null);

  const handleAdd = async () => {
    if (!front.trim() || !back.trim() || !id) return;
    await addCard(id, front.trim(), back.trim());
    setFront('');
    setBack('');
    setShowModal(false);
  };

  const handleDelete = (cardId: string) => {
    Alert.alert('Supprimer', 'Supprimer cette carte ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: () => deleteCard(cardId) },
    ]);
  };

  if (!deck) return null;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bg }]}>
      <View style={[styles.header, { borderBottomColor: dark ? '#2a2a3e' : '#eee' }]}>
        <View style={[styles.colorDot, { backgroundColor: deck.color }]} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.deckTitle, { color: textColor }]}>{deck.title}</Text>
          {deck.description ? (
            <Text style={styles.deckDesc}>{deck.description}</Text>
          ) : null}
        </View>
      </View>

      <View style={styles.actions}>
        <Pressable
          style={[
            styles.studyBtn,
            { opacity: dueCount === 0 ? 0.5 : 1 },
          ]}
          disabled={dueCount === 0}
          onPress={() => router.push(`/session/${id}`)}
        >
          <Text style={styles.studyBtnText}>
            {dueCount === 0 ? '✅ Tout révisé' : `▶ Réviser (${dueCount})`}
          </Text>
        </Pressable>
        <Pressable style={styles.addCardBtn} onPress={() => setShowModal(true)}>
          <Text style={styles.addCardBtnText}>+ Carte</Text>
        </Pressable>
      </View>

      <FlatList
        data={cards}
        keyExtractor={(c) => c.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🃏</Text>
            <Text style={[styles.emptyText, { color: textColor }]}>Aucune carte</Text>
            <Text style={styles.emptyHint}>Appuyez sur "+ Carte" pour commencer</Text>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            style={[styles.cardItem, { backgroundColor: cardBg }]}
            onLongPress={() => handleDelete(item.id)}
          >
            <View style={[styles.dueIndicator, { backgroundColor: isDue(item) ? '#6C63FF' : '#4CAF50' }]} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.cardFront, { color: textColor }]}>{item.front}</Text>
              <Text style={styles.cardBack}>{item.back}</Text>
            </View>
            <Text style={styles.intervalText}>
              {item.repetition === 0 ? 'Nouveau' : `${item.interval}j`}
            </Text>
          </Pressable>
        )}
      />

      <Modal visible={showModal} transparent animationType="slide" onRequestClose={() => setShowModal(false)}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <Pressable style={styles.overlay} onPress={() => setShowModal(false)}>
            <Pressable onPress={() => {}} style={[styles.sheet, { backgroundColor: cardBg }]}>
              <View style={styles.sheetHandle} />
              <Text style={[styles.sheetTitle, { color: textColor }]}>Nouvelle carte</Text>
              <TextInput
                style={[styles.input, { color: textColor, borderColor: dark ? '#333' : '#E0E0E0' }]}
                placeholder="Recto (question)"
                placeholderTextColor="#888"
                multiline
                value={front}
                onChangeText={setFront}
                autoFocus
                returnKeyType="next"
                blurOnSubmit={false}
                onSubmitEditing={() => backInputRef.current?.focus()}
              />
              <TextInput
                ref={backInputRef}
                style={[styles.input, { color: textColor, borderColor: dark ? '#333' : '#E0E0E0' }]}
                placeholder="Verso (réponse)"
                placeholderTextColor="#888"
                multiline
                value={back}
                onChangeText={setBack}
                returnKeyType="done"
              />
              <View style={styles.sheetActions}>
                <Pressable style={styles.cancelBtn} onPress={() => setShowModal(false)}>
                  <Text style={{ color: '#888', fontWeight: '600' }}>Annuler</Text>
                </Pressable>
                <Pressable
                  style={[styles.createBtn, { opacity: front.trim() && back.trim() ? 1 : 0.5 }]}
                  onPress={handleAdd}
                  disabled={!front.trim() || !back.trim()}
                >
                  <Text style={{ color: '#fff', fontWeight: '700' }}>Ajouter</Text>
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
    alignItems: 'center',
    gap: 12,
    padding: 20,
    borderBottomWidth: 1,
  },
  colorDot: { width: 14, height: 14, borderRadius: 7 },
  deckTitle: { fontSize: 20, fontWeight: '800' },
  deckDesc: { fontSize: 13, color: '#888', marginTop: 2 },
  actions: { flexDirection: 'row', gap: 10, padding: 16 },
  studyBtn: {
    flex: 1,
    backgroundColor: '#6C63FF',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  studyBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  addCardBtn: {
    backgroundColor: '#E8E6FF',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    paddingHorizontal: 18,
  },
  addCardBtnText: { color: '#6C63FF', fontWeight: '700', fontSize: 15 },
  list: { paddingHorizontal: 16, paddingBottom: 20 },
  cardItem: {
    flexDirection: 'row',
    borderRadius: 12,
    marginBottom: 8,
    overflow: 'hidden',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  dueIndicator: { width: 4, alignSelf: 'stretch' },
  cardFront: { fontSize: 14, fontWeight: '600', padding: 12, paddingBottom: 2 },
  cardBack: { fontSize: 12, color: '#888', paddingHorizontal: 12, paddingBottom: 12 },
  intervalText: { fontSize: 11, color: '#aaa', paddingRight: 12 },
  empty: { alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyIcon: { fontSize: 48 },
  emptyText: { fontSize: 18, fontWeight: '700' },
  emptyHint: { fontSize: 13, color: '#888' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40, gap: 12 },
  sheetHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#DDD', alignSelf: 'center', marginBottom: 8 },
  sheetTitle: { fontSize: 20, fontWeight: '800', marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    minHeight: 72,
    textAlignVertical: 'top',
  },
  sheetActions: { flexDirection: 'row', gap: 12, marginTop: 4 },
  cancelBtn: { flex: 1, padding: 14, borderRadius: 12, alignItems: 'center', backgroundColor: '#f0f0f0' },
  createBtn: { flex: 1, padding: 14, borderRadius: 12, alignItems: 'center', backgroundColor: '#6C63FF' },
});
