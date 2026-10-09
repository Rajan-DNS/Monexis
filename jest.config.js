module.exports = {
  preset: '@react-native/jest-preset',
  transformIgnorePatterns: [
    'node_modules/(?!(react-redux|@reduxjs/toolkit)/)',
  ],
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
};
