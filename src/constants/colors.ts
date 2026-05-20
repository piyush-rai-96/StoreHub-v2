// Impact UI Color Theme — aligned with impact-ui@3.7.20 compiled palette
// Source of truth: src/styles/impact-typography.css --ia-color-* tokens
// Keep export shape stable so call-sites require no changes.
export const IA_COLORS = {
  // Primary Brand Colors — cornflower blue family
  primary: {
    main: '#4F6CF5',
    dark: '#3B58E2',
    light: '#EEF1FE',
    pressed: '#2A45C9',
    border: '#BAC4FA',
    info: '#5B72F6',
  },

  // Secondary Colors
  secondary: {
    gray: '#60697D',
    lightGray: '#F5F7FC',
    border: '#DEE3EF',
  },

  // Status Colors — Impact UI semantic palette
  status: {
    success: '#108431',
    successSoft: '#C4E8D5',
    successBg: '#ECFDF3',
    warning: '#FBBF24',
    warningText: '#92400E',
    warningBg: '#FFF7E6',
    error: '#EC4C5C',
    errorStrong: '#D62F2D',
    errorBg: '#FCEEEE',
    info: '#5B72F6',
  },

  // Neutral Colors — Impact UI neutral ramp
  neutral: {
    50: '#F5F7FC',
    100: '#EFF1F6',
    200: '#DEE3EF',
    300: '#C8CEDC',
    400: '#B4BAC7',
    500: '#60697D',
    600: '#60697D',
    700: '#1A2744',
    800: '#1A2744',
    900: '#1A2744',
  },

  // Background & Surface
  background: {
    primary: '#FFFFFF',
    secondary: '#F5F7FC',
    tertiary: '#EFF1F6',
    dark: '#1A2744',
  },

  // Text Colors — Impact UI text ramp
  text: {
    primary: '#1A2744',
    secondary: '#60697D',
    tertiary: '#B4BAC7',
    light: '#B4BAC7',
    inverse: '#FFFFFF',
  },
} as const;

// Gradient definitions — Impact UI brand gradients
export const IA_GRADIENTS = {
  primary: 'linear-gradient(135deg, #4F6CF5 0%, #3B58E2 100%)',
  secondary: 'linear-gradient(135deg, #60697D 0%, #1A2744 100%)',
  accent: 'linear-gradient(135deg, #4F6CF5 0%, #5B72F6 100%)',
  success: 'linear-gradient(135deg, #108431 0%, #0B832F 100%)',
  warning: 'linear-gradient(135deg, #FBBF24 0%, #92400E 100%)',
  error: 'linear-gradient(135deg, #EC4C5C 0%, #D62F2D 100%)',
} as const;
