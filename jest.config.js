module.exports = {
  preset: 'jest-expo',
  setupFiles: ['./jest.setup.js'],
  // expo-modules-core is installed inside expo/node_modules (expo-doctor forbids installing it directly),
  // so tell Jest to look there when jest-expo asks for it.
  modulePaths: ['<rootDir>/node_modules/expo/node_modules'],
  // Packages in node_modules that ship modern syntax and must be transformed before Node can run them.
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|react-redux|@reduxjs/toolkit|immer|redux|reselect|redux-thunk|redux-persist|react-native-paper)',
  ],
};
