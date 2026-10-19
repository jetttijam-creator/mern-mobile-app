import { LogBox } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider } from 'react-native-paper';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import RootNavigator from './navigation/RootNavigator';
import ErrorBoundary from './components/ErrorBoundary';
import { AuthProvider } from './context/AuthContext';
import { PersistGate } from 'redux-persist/integration/react';
import SplashScreen from './components/SplashScreen';
import { persistor, store } from './store';
import { paperTheme } from './theme';
import { configureNotificationHandler } from './lib/notifications';

// expo-notifications warns on every start in Expo Go on Android that remote push needs a development build.
// Local notifications still work there, so hide that one message.
LogBox.ignoreLogs(['[expo-notifications] Push notifications (remote notifications) are unavailable']);

configureNotificationHandler();

export default function App() {
  return (
    <Provider store={store}>
      <PaperProvider theme={paperTheme}>
        <StatusBar style="dark" />
        <ErrorBoundary>
          <PersistGate loading={<SplashScreen />} persistor={persistor}>
            <AuthProvider>
              <NavigationContainer>
                <RootNavigator />
              </NavigationContainer>
            </AuthProvider>
          </PersistGate>
        </ErrorBoundary>
      </PaperProvider>
    </Provider>
  );
}
