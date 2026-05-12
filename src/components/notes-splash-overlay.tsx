import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, useColorScheme, View } from 'react-native';

export function NotesSplashOverlay() {
  const scheme = useColorScheme();
  const [visible, setVisible] = useState(true);
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleY = useRef(new Animated.Value(18)).current;
  const noteScale = useRef(new Animated.Value(0.86)).current;
  const noteOpacity = useRef(new Animated.Value(0)).current;
  const lineOneScale = useRef(new Animated.Value(0)).current;
  const lineTwoScale = useRef(new Animated.Value(0)).current;
  const pencilX = useRef(new Animated.Value(-22)).current;
  const pencilOpacity = useRef(new Animated.Value(0)).current;
  const overlayOpacity = useRef(new Animated.Value(1)).current;

  const isDark = scheme === 'dark';
  const palette = isDark ? darkPalette : lightPalette;

  useEffect(() => {
    const hideTimer = setTimeout(() => setVisible(false), 2300);

    Animated.sequence([
      Animated.parallel([
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 360,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(titleY, {
          toValue: 0,
          duration: 360,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(noteOpacity, {
          toValue: 1,
          duration: 240,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(noteScale, {
          toValue: 1,
          friction: 7,
          tension: 90,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(lineOneScale, {
          toValue: 1,
          duration: 260,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.delay(110),
          Animated.timing(lineTwoScale, {
            toValue: 1,
            duration: 260,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.delay(90),
          Animated.parallel([
            Animated.timing(pencilOpacity, {
              toValue: 1,
              duration: 160,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }),
            Animated.timing(pencilX, {
              toValue: 18,
              duration: 520,
              easing: Easing.inOut(Easing.cubic),
              useNativeDriver: true,
            }),
          ]),
        ]),
      ]),
      Animated.delay(520),
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 340,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) {
        clearTimeout(hideTimer);
        setVisible(false);
      }
    });

    return () => clearTimeout(hideTimer);
  }, [
    lineOneScale,
    lineTwoScale,
    noteOpacity,
    noteScale,
    overlayOpacity,
    pencilOpacity,
    pencilX,
    titleOpacity,
    titleY,
  ]);

  if (!visible) {
    return null;
  }

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.overlay,
        {
          backgroundColor: palette.background,
          opacity: overlayOpacity,
        },
      ]}>
      <Animated.View
        style={[
          styles.brandBlock,
          {
            opacity: titleOpacity,
            transform: [{ translateY: titleY }],
          },
        ]}>
        <Text style={[styles.appName, { color: palette.text }]}>Notes</Text>
        <Text style={[styles.tagline, { color: palette.muted }]}>Capture the thought.</Text>
      </Animated.View>

      <Animated.View
        style={[
          styles.noteCard,
          {
            backgroundColor: palette.card,
            borderColor: palette.border,
            opacity: noteOpacity,
            transform: [{ scale: noteScale }],
          },
        ]}>
        <View style={[styles.noteFold, { borderTopColor: palette.fold }]} />
        <View style={styles.dotRow}>
          <View style={[styles.dot, { backgroundColor: '#F59E0B' }]} />
          <View style={[styles.dot, { backgroundColor: '#10B981' }]} />
          <View style={[styles.dot, { backgroundColor: '#6366F1' }]} />
        </View>

        <Animated.View
          style={[
            styles.noteLine,
            styles.noteLineLong,
            {
              backgroundColor: palette.line,
              transform: [{ scaleX: lineOneScale }],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.noteLine,
            styles.noteLineShort,
            {
              backgroundColor: palette.lineSoft,
              transform: [{ scaleX: lineTwoScale }],
            },
          ]}
        />

        <Animated.View
          style={[
            styles.pencil,
            {
              backgroundColor: palette.pencil,
              opacity: pencilOpacity,
              transform: [{ translateX: pencilX }, { rotateZ: '-12deg' }],
            },
          ]}>
          <View style={styles.pencilTip} />
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
}

const lightPalette = {
  background: '#F6F4EF',
  card: '#FFFFFF',
  text: '#1F2933',
  muted: '#697586',
  border: '#E2DDD2',
  fold: '#ECE8DF',
  line: '#1F2933',
  lineSoft: '#9AA3AF',
  pencil: '#355C7D',
};

const darkPalette = {
  background: '#111315',
  card: '#1B1F23',
  text: '#F4F1EA',
  muted: '#A7B0BA',
  border: '#303841',
  fold: '#252B31',
  line: '#F4F1EA',
  lineSoft: '#7E8894',
  pencil: '#D6A35D',
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2000,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  brandBlock: {
    alignItems: 'center',
    marginBottom: 34,
  },
  appName: {
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: 0,
  },
  tagline: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 8,
  },
  noteCard: {
    width: 168,
    height: 132,
    borderWidth: 1,
    borderRadius: 24,
    padding: 18,
    overflow: 'hidden',
  },
  noteFold: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 0,
    height: 0,
    borderTopWidth: 38,
    borderLeftWidth: 38,
    borderLeftColor: 'transparent',
  },
  dotRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 22,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  noteLine: {
    height: 9,
    borderRadius: 5,
    transformOrigin: 'left center',
  },
  noteLineLong: {
    width: 112,
    marginBottom: 12,
  },
  noteLineShort: {
    width: 82,
  },
  pencil: {
    position: 'absolute',
    right: 26,
    bottom: 22,
    width: 48,
    height: 10,
    borderRadius: 5,
  },
  pencilTip: {
    position: 'absolute',
    right: -8,
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderTopWidth: 5,
    borderBottomWidth: 5,
    borderLeftColor: '#F4F1EA',
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
  },
});
