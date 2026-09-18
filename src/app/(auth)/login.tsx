import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useThemeColors } from '../../providers/ThemeProvider';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Header from '../../components/common/Header';
import spacing from '../../constants/spacing';
import { useAuth } from '../../hooks/useAuth';

export default function LoginScreen() {
  const colors = useThemeColors();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError(null);
    if (!email.trim() || !password) {
      setError('Email and password are required.');
      return;
    }
    setLoading(true);
    try {
      await login({ email: email.trim(), password });
      router.replace('/');
    } catch (e: any) {
      setError(e.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <Header title="Sign in" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>Use your email and password to sign in. Google sign-in is not configured in production.</Text>
        <Input label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        <Input label="Password" value={password} onChangeText={setPassword} secureTextEntry />
        {error ? <Text style={[styles.error, { color: colors.danger }]}>{error}</Text> : null}
        <Button title={loading ? 'Signing in...' : 'Sign in'} onPress={handleLogin} loading={loading} disabled={loading} fullWidth />
        <View style={styles.links}>
          <Text style={[styles.link, { color: colors.primary }]} onPress={() => router.push('/(auth)/forgot-password')}>Forgot password?</Text>
          <Text style={[styles.link, { color: colors.primary }]} onPress={() => router.push('/(auth)/register')}>Create account</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flexGrow: 1, padding: spacing.xxl, gap: spacing.lg },
  subtitle: { fontSize: 12, lineHeight: 18 },
  error: { fontSize: 12, textAlign: 'center' },
  links: { gap: spacing.sm, alignItems: 'center', marginTop: spacing.md },
  link: { fontSize: 12, fontWeight: '600' },
});
