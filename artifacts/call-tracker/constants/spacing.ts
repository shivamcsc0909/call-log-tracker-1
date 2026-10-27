const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
  screenH: 20,
} as const;

export const typography = {
  display: { fontSize: 32, fontFamily: "Inter_700Bold", letterSpacing: -1, lineHeight: 40 },
  heading: { fontSize: 28, fontFamily: "Inter_700Bold", letterSpacing: -0.6, lineHeight: 36 },
  sectionTitle: { fontSize: 20, fontFamily: "Inter_600SemiBold", letterSpacing: -0.4, lineHeight: 28 },
  title: { fontSize: 16, fontFamily: "Inter_600SemiBold", letterSpacing: -0.2, lineHeight: 24 },
  body: { fontSize: 14, fontFamily: "Inter_400Regular", letterSpacing: 0, lineHeight: 22 },
  bodyMedium: { fontSize: 14, fontFamily: "Inter_500Medium", letterSpacing: 0, lineHeight: 22 },
  bodySemiBold: { fontSize: 14, fontFamily: "Inter_600SemiBold", letterSpacing: 0, lineHeight: 22 },
  caption: { fontSize: 12, fontFamily: "Inter_400Regular", letterSpacing: 0.1, lineHeight: 18 },
  captionMedium: { fontSize: 12, fontFamily: "Inter_500Medium", letterSpacing: 0.1, lineHeight: 18 },
  label: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 0.5, lineHeight: 16 },
  cardValue: { fontSize: 32, fontFamily: "Inter_700Bold", letterSpacing: -0.8, lineHeight: 38 },
} as const;

export const shadow = {
  none: {},
  xs: {
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  sm: {
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  md: {
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  lg: {
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
  },
} as const;

export default spacing;
