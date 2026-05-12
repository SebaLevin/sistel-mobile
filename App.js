import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import RootNavigator from './navigation/RootNavigator';
import { isAuthenticated } from './lib/auth';

export default function App() {
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const ok = await isAuthenticated();
        setAuthed(ok);
        console.log('[bootstrap] token presente:', ok);
      } catch (err) {
        console.error('[bootstrap] error checking auth', err);
        setAuthed(false);
      } finally {
        setReady(true);
      }
    })();
  }, []);

  if (!ready) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <RootNavigator initialRouteName={authed ? 'Buscar' : 'Inicio'} />;
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
