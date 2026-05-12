import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  useWindowDimensions,
  View,
  ViewStyle,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { NoteStatus, useNotes } from '@/context/notes-context';

const headerImage = require('@/assets/images/logo-glow.png');

const lightPalette = {
  background: '#F5F7FB',
  surface: '#FFFFFF',
  text: '#17202A',
  muted: '#64748B',
  border: '#E3E8EF',
  primary: '#2563EB',
  primaryText: '#FFFFFF',
  field: '#FFFFFF',
  fieldMuted: '#EEF2F7',
  overlay: 'rgba(15, 23, 42, 0.42)',
  dangerSoft: '#FFE4E6',
  danger: '#BE123C',
  doneSoft: '#DCFCE7',
  done: '#15803D',
  pendingSoft: '#FEF3C7',
  pending: '#B45309',
};

const darkPalette = {
  background: '#0D1117',
  surface: '#151B23',
  text: '#F8FAFC',
  muted: '#94A3B8',
  border: '#273241',
  primary: '#60A5FA',
  primaryText: '#0D1117',
  field: '#111827',
  fieldMuted: '#202A36',
  overlay: 'rgba(0, 0, 0, 0.46)',
  dangerSoft: '#3D1F2A',
  danger: '#FDA4AF',
  doneSoft: '#143525',
  done: '#86EFAC',
  pendingSoft: '#3B2D11',
  pending: '#FCD34D',
};

export default function NoteEditorScreen() {
  const scheme = useColorScheme();
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { addNote, deleteNote, selectedNote, selectedNoteId, selectNote, updateNote } = useNotes();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [saveStatus, setSaveStatus] = useState('Ready to write');
  const [noteStatus, setNoteStatus] = useState<NoteStatus>('pending');

  const isDark = scheme === 'dark';
  const isTablet = width >= 720;
  const palette = isDark ? darkPalette : lightPalette;
  const isEditing = Boolean(selectedNote);
  const canSave = title.trim().length > 0 || body.trim().length > 0;

  useEffect(() => {
    if (selectedNote) {
      setTitle(selectedNote.title);
      setBody(selectedNote.body);
      setNoteStatus(selectedNote.status);
      setSaveStatus('Editing saved note');
      return;
    }

    setTitle('');
    setBody('');
    setNoteStatus('pending');
    setSaveStatus('New note');
  }, [selectedNote]);

  const dynamicStyles = useMemo(
    () =>
      StyleSheet.create({
        screen: {
          backgroundColor: palette.background,
        },
        content: {
          maxWidth: isTablet ? 820 : 540,
          paddingHorizontal: isTablet ? 34 : 20,
          paddingTop: Platform.OS === 'web' ? 88 : Math.max(insets.top, 14) + 8,
          paddingBottom: insets.bottom + 34,
        },
        hero: {
          height: isTablet ? Math.min(260, height * 0.28) : Math.min(220, height * 0.26),
        },
        heroOverlay: {
          backgroundColor: palette.overlay,
        },
        panel: {
          backgroundColor: palette.surface,
          borderColor: palette.border,
        },
        titleInput: {
          color: palette.text,
          backgroundColor: palette.fieldMuted,
        },
        bodyInput: {
          color: palette.text,
          backgroundColor: palette.field,
          minHeight: isTablet ? 360 : Math.max(260, height * 0.34),
        },
        primaryButton: {
          backgroundColor: palette.primary,
        },
        dangerButton: {
          backgroundColor: palette.dangerSoft,
          borderColor: palette.dangerSoft,
        },
        activeDoneStatus: {
          backgroundColor: palette.doneSoft,
          borderColor: palette.doneSoft,
        },
        activePendingStatus: {
          backgroundColor: palette.pendingSoft,
          borderColor: palette.pendingSoft,
        },
      }),
    [height, insets.bottom, insets.top, isTablet, palette]
  );
  const dynamicTextStyles = useMemo(
    () =>
      StyleSheet.create({
        buttonText: {
          color: palette.primaryText,
        },
        dangerText: {
          color: palette.danger,
        },
        doneText: {
          color: palette.done,
        },
        pendingText: {
          color: palette.pending,
        },
      }),
    [palette]
  );

  const panelStyle: StyleProp<ViewStyle> = StyleSheet.compose(
    styles.panel as ViewStyle,
    dynamicStyles.panel as ViewStyle
  );

  function goBack() {
    router.push('/');
  }

  function startNewNote() {
    selectNote(null);
    setTitle('');
    setBody('');
    setNoteStatus('pending');
    setSaveStatus('New note');
  }

  function saveNote() {
    if (!canSave) {
      setSaveStatus('Add a title or a few words first');
      return;
    }

    if (selectedNoteId) {
      updateNote(selectedNoteId, { title, body, status: noteStatus });
      setSaveStatus('Updated just now');
      return;
    }

    addNote({ title, body, status: noteStatus });
    setSaveStatus('Saved just now');
  }

  function confirmDelete() {
    if (!selectedNote) {
      startNewNote();
      return;
    }

    const remove = () => {
      deleteNote(selectedNote.id);
      setSaveStatus('Note deleted');
      router.push('/');
    };

    if (Platform.OS === 'web') {
      remove();
      return;
    }

    Alert.alert('Delete note?', `"${selectedNote.title}" will be removed from the list.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: remove },
    ]);
  }

  return (
    <SafeAreaView style={[styles.screen, dynamicStyles.screen]} edges={['left', 'right']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
        style={styles.keyboardView}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.content, dynamicStyles.content]}>
          <ImageBackground
            source={headerImage}
            resizeMode="cover"
            style={[styles.hero, dynamicStyles.hero]}>
            <View style={[styles.heroOverlay, dynamicStyles.heroOverlay]}>
              <Pressable
                accessibilityRole="button"
                onPress={goBack}
                style={({ pressed }) =>
                  StyleSheet.flatten([
                    styles.backButton,
                    { backgroundColor: palette.surface },
                    pressed && styles.buttonPressed,
                  ])
                }>
                <Text style={[styles.backButtonText, { color: palette.text }]}>Back</Text>
              </Pressable>

              <View style={styles.heroCopy}>
                <Text style={styles.heroKicker}>{isEditing ? 'Edit note' : 'Draft space'}</Text>
                <Text style={styles.heroTitle}>
                  {isEditing
                    ? 'Tune the note without losing the thought.'
                    : 'Write it down while it is fresh.'}
                </Text>
              </View>
            </View>
          </ImageBackground>

          <View style={panelStyle}>
            <View style={styles.editorTopRow}>
              <View>
                <Text style={[styles.modeTitle, { color: palette.text }]}>
                  {isEditing ? 'Update note' : 'Create note'}
                </Text>
                <Text style={[styles.statusText, { color: palette.muted }]}>{saveStatus}</Text>
              </View>

              <Pressable
                accessibilityRole="button"
                onPress={startNewNote}
                style={({ pressed }) =>
                  StyleSheet.flatten([
                    styles.smallButton,
                    { borderColor: palette.border },
                    pressed && styles.buttonPressed,
                  ])
                }>
                <Text style={[styles.smallButtonText, { color: palette.text }]}>New</Text>
              </Pressable>
            </View>

            <View style={[styles.editorMeta, { backgroundColor: palette.fieldMuted }]}>
              <Text style={[styles.metaText, { color: palette.muted }]}>
                {title.trim().length || 0} title chars
              </Text>
              <View style={[styles.metaDot, { backgroundColor: palette.border }]} />
              <Text style={[styles.metaText, { color: palette.muted }]}>
                {body.trim() ? body.trim().split(/\s+/).length : 0} words
              </Text>
            </View>

            <Text style={[styles.label, { color: palette.muted }]}>Status</Text>
            <View style={styles.statusSelector}>
              <Pressable
                accessibilityRole="button"
                onPress={() => setNoteStatus('pending')}
                style={({ pressed }) =>
                  StyleSheet.flatten([
                    styles.statusOption,
                    { borderColor: palette.border },
                    noteStatus === 'pending' && dynamicStyles.activePendingStatus,
                    pressed && styles.buttonPressed,
                  ])
                }>
                <Text
                  style={[
                    styles.statusOptionText,
                    { color: palette.muted },
                    noteStatus === 'pending' && dynamicTextStyles.pendingText,
                  ]}>
                  Pending
                </Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                onPress={() => setNoteStatus('done')}
                style={({ pressed }) =>
                  StyleSheet.flatten([
                    styles.statusOption,
                    { borderColor: palette.border },
                    noteStatus === 'done' && dynamicStyles.activeDoneStatus,
                    pressed && styles.buttonPressed,
                  ])
                }>
                <Text
                  style={[
                    styles.statusOptionText,
                    { color: palette.muted },
                    noteStatus === 'done' && dynamicTextStyles.doneText,
                  ]}>
                  Done
                </Text>
              </Pressable>
            </View>

            <Text style={[styles.label, { color: palette.muted }]}>Title</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Note title"
              placeholderTextColor={palette.muted}
              style={[styles.titleInput, dynamicStyles.titleInput]}
            />

            <Text style={[styles.label, { color: palette.muted }]}>Body</Text>
            <TextInput
              value={body}
              onChangeText={setBody}
              placeholder="Start writing..."
              placeholderTextColor={palette.muted}
              multiline
              textAlignVertical="top"
              style={[styles.bodyInput, dynamicStyles.bodyInput]}
            />

            <View style={styles.actions}>
              <Pressable
                accessibilityRole="button"
                onPress={goBack}
                style={({ pressed }) =>
                  StyleSheet.flatten([
                    styles.secondaryButton,
                    { borderColor: palette.border },
                    pressed && styles.buttonPressed,
                  ])
                }>
                <Text style={[styles.secondaryButtonText, { color: palette.text }]}>Back</Text>
              </Pressable>

              {isEditing && (
                <Pressable
                  accessibilityRole="button"
                  onPress={confirmDelete}
                  style={({ pressed }) =>
                    StyleSheet.flatten([
                      styles.dangerButton,
                      dynamicStyles.dangerButton,
                      pressed && styles.buttonPressed,
                    ])
                }>
                  <Text style={[styles.dangerButtonText, dynamicTextStyles.dangerText]}>Delete</Text>
                </Pressable>
              )}

              <Pressable
                accessibilityRole="button"
                onPress={saveNote}
                style={({ pressed }) =>
                  StyleSheet.flatten([
                    styles.primaryButton,
                    dynamicStyles.primaryButton,
                    !canSave && styles.disabledButton,
                    pressed && styles.buttonPressed,
                  ])
                }>
                <Text style={[styles.buttonText, dynamicTextStyles.buttonText]}>
                  {isEditing ? 'Update' : 'Save note'}
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    width: '100%',
    alignSelf: 'center',
  },
  hero: {
    width: '100%',
    borderRadius: 28,
    overflow: 'hidden',
    marginBottom: 16,
  },
  heroOverlay: {
    flex: 1,
    padding: 18,
    justifyContent: 'space-between',
  },
  backButton: {
    minWidth: 74,
    minHeight: 40,
    borderRadius: 20,
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '800',
  },
  heroCopy: {
    maxWidth: 390,
  },
  heroKicker: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '900',
    letterSpacing: 0,
  },
  panel: {
    borderWidth: 1,
    borderRadius: 28,
    padding: 18,
    shadowColor: '#0F172A',
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 2,
  },
  editorTopRow: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 18,
  },
  modeTitle: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 0,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '700',
  },
  smallButton: {
    minWidth: 68,
    minHeight: 38,
    borderWidth: 1,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  smallButtonText: {
    fontSize: 13,
    fontWeight: '900',
  },
  editorMeta: {
    minHeight: 40,
    borderRadius: 20,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 18,
  },
  metaText: {
    fontSize: 12,
    fontWeight: '800',
  },
  metaDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  label: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  statusSelector: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
  },
  statusOption: {
    flex: 1,
    minHeight: 46,
    borderWidth: 1,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusOptionText: {
    fontSize: 14,
    fontWeight: '900',
  },
  titleInput: {
    minHeight: 58,
    borderWidth: 0,
    borderRadius: 18,
    paddingHorizontal: 16,
    fontSize: 19,
    fontWeight: '900',
    marginBottom: 18,
  },
  bodyInput: {
    borderWidth: 0,
    borderRadius: 22,
    padding: 16,
    fontSize: 16,
    lineHeight: 24,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 18,
  },
  secondaryButton: {
    flex: 1,
    minHeight: 52,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dangerButton: {
    flex: 1,
    minHeight: 52,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    flex: 1.35,
    minHeight: 52,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '800',
  },
  dangerButtonText: {
    color: '#B91C1C',
    fontSize: 15,
    fontWeight: '900',
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '900',
  },
  disabledButton: {
    opacity: 0.46,
  },
  buttonPressed: {
    opacity: 0.78,
    transform: [{ scale: 0.99 }],
  },
});
