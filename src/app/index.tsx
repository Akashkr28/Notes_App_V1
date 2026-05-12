import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  FlatList,
  GestureResponderEvent,
  Platform,
  Pressable,
  StyleProp,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  useColorScheme,
  useWindowDimensions,
  View,
  ViewStyle,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { Note, NoteStatus, useNotes } from '@/context/notes-context';

const lightPalette = {
  background: '#F5F7FB',
  surface: '#FFFFFF',
  surfaceMuted: '#EEF2F7',
  text: '#17202A',
  muted: '#64748B',
  border: '#E3E8EF',
  input: '#FFFFFF',
  placeholder: '#8C96A3',
  primary: '#2563EB',
  primarySoft: '#DBEAFE',
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
  surfaceMuted: '#202A36',
  text: '#F8FAFC',
  muted: '#94A3B8',
  border: '#273241',
  input: '#111827',
  placeholder: '#7E8894',
  primary: '#60A5FA',
  primarySoft: '#1E3A5F',
  dangerSoft: '#3D1F2A',
  danger: '#FDA4AF',
  doneSoft: '#143525',
  done: '#86EFAC',
  pendingSoft: '#3B2D11',
  pending: '#FCD34D',
};

export default function NotesListScreen() {
  const systemScheme = useColorScheme();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { deleteNote, notes, selectNote, toggleNoteStatus } = useNotes();
  const [search, setSearch] = useState('');
  const [forceDark, setForceDark] = useState(systemScheme === 'dark');
  const switchProgress = useRef(new Animated.Value(systemScheme === 'dark' ? 1 : 0)).current;

  const isTablet = width >= 720;
  const isDark = forceDark;
  const palette = isDark ? darkPalette : lightPalette;

  useEffect(() => {
    Animated.timing(switchProgress, {
      toValue: isDark ? 1 : 0,
      duration: 260,
      useNativeDriver: false,
    }).start();
  }, [isDark, switchProgress]);

  const filteredNotes = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return notes;
    }

    return notes.filter((note) => {
      const searchable = `${note.title} ${note.body} ${note.date} ${note.status}`.toLowerCase();
      return searchable.includes(query);
    });
  }, [notes, search]);

  const dynamicStyles = useMemo(
    () =>
      StyleSheet.create({
        screen: {
          backgroundColor: palette.background,
        },
        shell: {
          maxWidth: isTablet ? 860 : 520,
          paddingHorizontal: isTablet ? 32 : 20,
          paddingTop: Platform.OS === 'web' ? 88 : Math.max(insets.top, 16) + 8,
        },
        searchInput: {
          backgroundColor: palette.input,
          color: palette.text,
        },
        searchBar: {
          backgroundColor: palette.input,
          borderColor: palette.border,
        },
        card: {
          backgroundColor: palette.surface,
          borderColor: palette.border,
          width: isTablet ? '48%' : '100%',
        },
        actionButton: {
          backgroundColor: palette.surfaceMuted,
          borderColor: palette.border,
        },
        editButton: {
          backgroundColor: palette.primarySoft,
          borderColor: palette.primarySoft,
        },
        deleteButton: {
          backgroundColor: palette.dangerSoft,
          borderColor: palette.dangerSoft,
        },
        statusButton: {
          backgroundColor: palette.surfaceMuted,
          borderColor: palette.border,
        },
        listContent: {
          paddingBottom: insets.bottom + 92,
        },
      }),
    [insets.bottom, insets.top, isTablet, palette]
  );
  const dynamicTextStyles = useMemo(
    () =>
      StyleSheet.create({
        title: {
          color: palette.text,
        },
        secondaryText: {
          color: palette.muted,
        },
        primaryText: {
          color: palette.primary,
        },
      }),
    [palette]
  );

  const shellStyle: StyleProp<ViewStyle> = StyleSheet.compose(
    styles.shell as ViewStyle,
    dynamicStyles.shell as ViewStyle
  );
  const listContentStyle = StyleSheet.flatten([styles.listContent, dynamicStyles.listContent]);
  const switchTrackColor = switchProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ['#C9C1B4', '#60717D'],
  });
  const switchThumbTranslate = switchProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 20],
  });

  function openEditor(noteId: string | null) {
    selectNote(noteId);
    router.push('/explore');
  }

  function confirmDelete(note: Note) {
    const remove = () => deleteNote(note.id);

    if (Platform.OS === 'web') {
      remove();
      return;
    }

    Alert.alert('Delete note?', `"${note.title}" will be removed from the list.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: remove },
    ]);
  }

  function handleActionPress(event: GestureResponderEvent, action: () => void) {
    event.stopPropagation();
    action();
  }

  function getStatusColors(status: NoteStatus) {
    return status === 'done'
      ? { backgroundColor: palette.doneSoft, color: palette.done }
      : { backgroundColor: palette.pendingSoft, color: palette.pending };
  }

  function renderNote({ item }: { item: Note }) {
    const statusColors = getStatusColors(item.status);

    return (
      <Pressable
        onPress={() => openEditor(item.id)}
        style={({ pressed }) =>
          StyleSheet.flatten([dynamicStyles.card, styles.card, pressed && styles.cardPressed])
        }>
        <View style={[styles.cardAccent, { backgroundColor: item.accent }]} />
        <View style={styles.cardBody}>
          <View style={styles.cardTopRow}>
            <View style={styles.cardTitleGroup}>
              <View style={[styles.cardDot, { backgroundColor: item.accent }]} />
              <Text style={[styles.cardTitle, { color: palette.text }]} numberOfLines={1}>
                {item.title}
              </Text>
            </View>
            <Text style={[styles.date, { color: palette.muted }]}>{item.date}</Text>
          </View>
          <View style={styles.statusRow}>
            <View style={[styles.statusPill, { backgroundColor: statusColors.backgroundColor }]}>
              <View style={[styles.statusDot, { backgroundColor: statusColors.color }]} />
              <Text style={[styles.statusText, { color: statusColors.color }]}>
                {item.status === 'done' ? 'Done' : 'Pending'}
              </Text>
            </View>
          </View>
          <Text style={[styles.preview, { color: palette.muted }]} numberOfLines={2}>
            {item.body}
          </Text>

          <View style={styles.cardActions}>
            <Pressable
              accessibilityRole="button"
              onPress={(event) => handleActionPress(event, () => openEditor(item.id))}
              style={({ pressed }) =>
                StyleSheet.flatten([
                  styles.actionButton,
                  dynamicStyles.editButton,
                  pressed && styles.actionPressed,
                ])
              }>
              <Text style={[styles.actionText, dynamicTextStyles.primaryText]}>Edit</Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              onPress={(event) => handleActionPress(event, () => toggleNoteStatus(item.id))}
              style={({ pressed }) =>
                StyleSheet.flatten([
                  styles.actionButton,
                  dynamicStyles.statusButton,
                  pressed && styles.actionPressed,
                ])
              }>
              <Text style={[styles.actionText, { color: palette.text }]}>
                Mark {item.status === 'done' ? 'pending' : 'done'}
              </Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              onPress={(event) => handleActionPress(event, () => confirmDelete(item))}
              style={({ pressed }) =>
                StyleSheet.flatten([
                  styles.actionButton,
                  dynamicStyles.deleteButton,
                  pressed && styles.actionPressed,
                ])
              }>
              <Text style={[styles.deleteText, { color: palette.danger }]}>Delete</Text>
            </Pressable>
          </View>
        </View>
      </Pressable>
    );
  }

  return (
    <SafeAreaView style={[styles.screen, dynamicStyles.screen]} edges={['left', 'right']}>
      <View style={shellStyle}>
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={[styles.secondaryText, dynamicTextStyles.secondaryText]}>
              Personal workspace
            </Text>
            <Text style={[styles.title, dynamicTextStyles.title]}>Notes</Text>
          </View>

          <View style={[styles.themeControl, { backgroundColor: palette.surfaceMuted }]}>
            <Text style={[styles.themeLabel, { color: palette.text }]}>
              {isDark ? 'Dark' : 'Light'}
            </Text>
            <Pressable
              accessibilityRole="switch"
              accessibilityState={{ checked: isDark }}
              onPress={() => setForceDark((current) => !current)}
              style={styles.switchPressable}>
              <Animated.View
                style={[
                  styles.customSwitch,
                  { backgroundColor: switchTrackColor },
                ]}>
                <Animated.View
                  style={[
                    styles.customSwitchThumb,
                    { transform: [{ translateX: switchThumbTranslate }] },
                  ]}
                />
              </Animated.View>
              <Switch
                value={isDark}
                onValueChange={setForceDark}
                thumbColor={isDark ? '#F4F1EA' : '#FFFFFF'}
                trackColor={{ false: '#C9C1B4', true: '#4C5B66' }}
                style={styles.hiddenSwitch}
              />
            </Pressable>
          </View>
        </View>

        <View
          style={[styles.summaryPanel, { backgroundColor: palette.surface, borderColor: palette.border }]}>
          <View>
            <Text style={[styles.summaryLabel, { color: palette.muted }]}>Library</Text>
            <Text style={[styles.summaryValue, { color: palette.text }]}>
              {notes.length} {notes.length === 1 ? 'note' : 'notes'}
            </Text>
          </View>
          <View style={[styles.summaryDivider, { backgroundColor: palette.border }]} />
          <View style={styles.summaryMiddle}>
            <Text style={[styles.summaryLabel, { color: palette.muted }]}>Showing</Text>
            <Text style={[styles.summaryValue, { color: palette.text }]}>{filteredNotes.length}</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={() => openEditor(null)}
            style={({ pressed }) =>
              StyleSheet.flatten([
                styles.newButton,
                { backgroundColor: palette.primary },
                pressed && styles.actionPressed,
              ])
            }>
            <Text style={styles.newButtonIcon}>+</Text>
            <Text style={styles.newButtonText}>New</Text>
          </Pressable>
        </View>

        <View style={[styles.searchBar, dynamicStyles.searchBar]}>
          <Text style={[styles.searchIcon, { color: palette.muted }]}>Search</Text>
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Title, date, or words inside a note"
            placeholderTextColor={palette.placeholder}
            style={[styles.searchInput, dynamicStyles.searchInput]}
            returnKeyType="search"
          />
        </View>

        <FlatList
          data={filteredNotes}
          key={isTablet ? 'tablet' : 'phone'}
          keyExtractor={(item) => item.id}
          renderItem={renderNote}
          numColumns={isTablet ? 2 : 1}
          columnWrapperStyle={isTablet ? styles.tabletColumns : undefined}
          contentContainerStyle={listContentStyle}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={[styles.emptyState, { borderColor: palette.border }]}>
              <Text style={[styles.emptyTitle, { color: palette.text }]}>No notes found</Text>
              <Text style={[styles.emptyCopy, { color: palette.muted }]}>
                Try another word or clear the search field.
              </Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  shell: {
    flex: 1,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    marginBottom: 18,
  },
  headerText: {
    flex: 1,
  },
  secondaryText: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 4,
  },
  title: {
    fontSize: 38,
    fontWeight: '900',
    letterSpacing: 0,
  },
  themeControl: {
    width: 122,
    height: 44,
    borderRadius: 22,
    paddingLeft: 14,
    paddingRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  themeLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  switchPressable: {
    width: 48,
    height: 28,
  },
  customSwitch: {
    width: 48,
    height: 28,
    borderRadius: 14,
    padding: 3,
    justifyContent: 'center',
  },
  customSwitchThumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
  },
  hiddenSwitch: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 48,
    height: 28,
    opacity: 0,
  },
  summaryPanel: {
    minHeight: 78,
    borderWidth: 1,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 14,
    shadowColor: '#0F172A',
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 2,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 3,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '900',
  },
  summaryDivider: {
    width: 1,
    alignSelf: 'stretch',
  },
  summaryMiddle: {
    flex: 1,
  },
  searchBar: {
    minHeight: 54,
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  searchIcon: {
    fontSize: 12,
    fontWeight: '900',
  },
  searchInput: {
    flex: 1,
    minHeight: 48,
    borderWidth: 0,
    paddingHorizontal: 0,
    fontSize: 16,
  },
  newButton: {
    minHeight: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 18,
  },
  newButtonIcon: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    marginTop: -1,
  },
  newButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  listContent: {
    gap: 14,
  },
  tabletColumns: {
    gap: 14,
  },
  card: {
    minHeight: 150,
    borderWidth: 1,
    borderRadius: 24,
    overflow: 'hidden',
    flexDirection: 'row',
    shadowColor: '#0F172A',
    shadowOpacity: 0.07,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  cardPressed: {
    transform: [{ scale: 0.99 }],
    opacity: 0.86,
  },
  cardAccent: {
    width: 6,
  },
  cardBody: {
    flex: 1,
    padding: 18,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 12,
  },
  cardTitleGroup: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0,
    flex: 1,
  },
  date: {
    fontSize: 12,
    fontWeight: '700',
  },
  preview: {
    fontSize: 15,
    lineHeight: 23,
  },
  statusRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  statusPill: {
    minHeight: 28,
    borderRadius: 14,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '900',
  },
  cardActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 16,
  },
  actionButton: {
    minHeight: 36,
    borderWidth: 1,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  actionPressed: {
    opacity: 0.76,
    transform: [{ scale: 0.98 }],
  },
  actionText: {
    fontSize: 12,
    fontWeight: '900',
  },
  deleteText: {
    fontSize: 12,
    fontWeight: '900',
  },
  emptyState: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 6,
  },
  emptyCopy: {
    fontSize: 14,
    textAlign: 'center',
  },
});
