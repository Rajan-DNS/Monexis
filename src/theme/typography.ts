const Typography = {
  appName: 'DNS NextGen',

  h1: 20,
  h2: 20,
  h3: 20,
  body: 16,
  small: 12,
  caption: 12,
  button: 16,
  inputText: 16,

  regular: '400' as const,
  medium: '500' as const,
  semiBold: '600' as const,
  bold: '700' as const,
  extraBold: '800' as const,
};

export const Poppins = {
  // regular: 'NotoSerif-Regular',
  // medium: 'NotoSerif-Medium',
  // semiBold: 'NotoSerif-SemiBold',
  // bold: 'NotoSerif-Bold',
  regular: 'Poppins-Regular',
  medium: 'Poppins-Medium',
  semiBold: 'Poppins-SemiBold',
  bold: 'Poppins-Bold',
  extraBold: 'Poppins-ExtraBold',
};

export const MeaCulpa = {
  regular: 'MeaCulpa-Regular',
};

export const PinyonScript = {
  regular: 'PinyonScript-Regular',
};
export const NotoSerif = {
  regular: 'NotoSerif-Regular',
  medium: 'NotoSerif-Medium',
  semiBold: 'NotoSerif-SemiBold',
  bold: 'NotoSerif-Bold',
};

export default {
  ...Typography,
  Poppins,
  MeaCulpa,
  PinyonScript,
  NotoSerif,
};
