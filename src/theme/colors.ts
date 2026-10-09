type Role = 'client' | 'admin' | 'agent';

const CURRENT_ROLE: Role = 'client';

const themeConfigs: Record<Role, any> = {
  client: {
    // Logo colors
    primary: '#001F5B',
    primaryDark: '#0088E8',
    primaryLight: '#E5F4FF',

    // App backgrounds
    bg: '#F5F8FC',
    bgInput: '#F1F5F9',
    bgSurface: '#FFFFFF',
    bgSecondaryBtn: '#E6F3FF',

    // Borders
    inputBorder: '#D7E1EA',
    inputBorderFocused: '#0088E8',

    // Icons
    icon: '#0088E8',
    checkboxActive: '#0088E8',

    // Text
    textLink: '#0068C9',
    textDark: '#001020',
    textBody: '#334155',
    textSecondary: '#64748B',
    textMuted: '#94A3B8',

    white: '#FFFFFF',

    // Status
    error: '#B91C1C',
    success: '#10B981',

    divider: '#E2E8F0',
    decorLine: '#E6EEF5',

    badgeSuccessBg: '#DCFCE7',
    badgeSuccessText: '#10B981',

    // Auth
    authtext: '#0068C9',

    // Buttons
    btnPrimary: '#0088E8',

    // Banner
    firstbann: '#F0F7FF',
  },

  admin: {
    primary: '#7C3AED',
    primaryDark: '#5B21B6',
    primaryLight: '#A78BFA',

    bg: '#F5F3FF',
    bgInput: '#F3F0FF',
    bgSurface: '#FFFFFF',
    bgSecondaryBtn: '#EDE9FE',

    icon: '#7C3AED',
    checkboxActive: '#7C3AED',
    inputBorderFocused: '#7C3AED',

    textLink: '#7C3AED',
    textDark: '#1E1B4B',
    textBody: '#312E81',
    textSecondary: '#6366F1',
    textMuted: '#94A3B8',

    white: '#FFFFFF',

    error: '#B91C1C',
    success: '#10B981',

    divider: '#E5E7EB',
    decorLine: '#F3F4F6',

    badgeSuccessBg: '#DCFCE7',
    badgeSuccessText: '#10B981',

    btnPrimary: '#7C3AED',
  },

  agent: {
    primary: '#10B981',
    primaryDark: '#047857',
    primaryLight: '#6EE7B7',

    bg: '#F0FDF4',
    bgInput: '#ECFDF5',
    bgSurface: '#FFFFFF',
    bgSecondaryBtn: '#DCFCE7',

    icon: '#10B981',
    checkboxActive: '#10B981',
    inputBorderFocused: '#10B981',

    textLink: '#10B981',
    textDark: '#064E3B',
    textBody: '#065F46',
    textSecondary: '#10B981',
    textMuted: '#6EE7B7',

    white: '#FFFFFF',

    error: '#B91C1C',
    success: '#059669',

    divider: '#D1FAE5',
    decorLine: '#ECFDF5',

    badgeSuccessBg: '#DCFCE7',
    badgeSuccessText: '#059669',

    btnPrimary: '#10B981',
  },
};

const selectedTheme = themeConfigs[CURRENT_ROLE];

const Colors = {
  primary: selectedTheme.primary,
  primaryDark: selectedTheme.primaryDark,
  primaryLight: selectedTheme.primaryLight,

  icon: selectedTheme.icon,

  // Main app background
  bg: selectedTheme.bg,

  // Secondary background
  bgSecondaryBox: 'rgba(230, 238, 245, 0.55)',

  // Input
  bgInput: selectedTheme.bgInput,

  // Cards / surfaces
  bgSurface: selectedTheme.bgSurface,

  // Secondary buttons
  bgSecondaryBtn: selectedTheme.bgSecondaryBtn,

  white: selectedTheme.white,

  // Text
  textDark: selectedTheme.textDark,
  textBody: selectedTheme.textBody,
  textSecondary: selectedTheme.textSecondary,
  textMuted: selectedTheme.textMuted,
  textLink: selectedTheme.textLink,
  textWhite: '#FFFFFF',

  // Borders
  inputBorder: selectedTheme.inputBorder,
  inputBorderFocused: selectedTheme.inputBorderFocused,

  // Status
  error: selectedTheme.error,
  success: selectedTheme.success,

  checkboxBorder: '#B8C5D1',
  checkboxActive: selectedTheme.checkboxActive,

  divider: selectedTheme.divider,
  decorLine: selectedTheme.decorLine,
  decorLineDark: '#C8D5E2',

  badgeSuccessBg: selectedTheme.badgeSuccessBg,
  badgeSuccessText: selectedTheme.badgeSuccessText,

  authtext: selectedTheme.authtext,

  btnPrimary: selectedTheme.btnPrimary,

  firstbann: selectedTheme.firstbann,

  // ─────────────────────────────
  // Utility Colors
  // ─────────────────────────────

  successLight: '#E8F5E9',
  successBorder: '#C8E6C9',
  successDark: '#2E7D32',

  warningBg: '#FFF7ED',
  warningLight: '#FFE5D1',
  warningBorder: '#FFEDD5',
  warningText: '#E67E22',
  warningDark: '#92400E',

  infoBg: '#F0F7FF',
  infoLight: '#D1E3FF',
  infoDark: '#0068C9',

  borderLight: '#EDF2F7',

  // Don't use orange for shadow
  shadow: '#001020',

  overlay: 'rgba(0, 16, 32, 0.5)',

  bgLightest: '#FAFCFF',

  // ─────────────────────────────
  // Alert Modal Colors
  // ─────────────────────────────

  alert: {
    success: {
      icon: '#00875A',
      background: '#E3FCEF',
      border: '#00875A',
    },

    error: {
      icon: '#DE350B',
      background: '#FFEBE6',
      border: '#DE350B',
    },

    warning: {
      icon: '#FF8B00',
      background: '#FFF4E6',
      border: '#FF8B00',
    },

    info: {
      icon: '#0068C9',
      background: '#E6F2FF',
      border: '#0068C9',
    },
  },
};

export default Colors;