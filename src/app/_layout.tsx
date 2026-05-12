import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import React from 'react';
import { useColorScheme } from 'react-native';

import AppTabs from '@/components/app-tabs';
import { NotesSplashOverlay } from '@/components/notes-splash-overlay';
import { NotesProvider } from '@/context/notes-context';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <NotesProvider>
        <NotesSplashOverlay />
        <AppTabs />
      </NotesProvider>
    </ThemeProvider>
  );
}
