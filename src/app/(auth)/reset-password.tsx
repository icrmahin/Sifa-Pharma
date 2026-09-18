import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useThemeColors } from "../../providers/ThemeProvider";
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Header from '../../components/common/Header';
import spacing from '../../constants/spacing';
import { supabase } from '../../lib/supabase';

export default function ResetPasswordScreen() {
  const colors = useThemeColors();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setHasSession(!!session)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setHasSession(!!session)
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleUpdate = async () => {
    setError(null);
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!hasSession) {
      setError('No recovery session. Please open the reset link from your email (sifapharma://reset-password) on this device.');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      router.replace('/(auth)/login');
    } catch (e: any) {
      setError(e.message || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <Header title="New password" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>Choose a new secure password to complete the reset.{!hasSession ? ' No valid recovery session detected — open the email link on this device (sifapharma://).' : ''}</Text>
        <View style={styles.form}>
          <Input label="New password" value={password} onChangeText={setPassword} secureTextEntry />
          <Input label="Confirm password" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />
        </View>
        {error ? <Text style={[styles.error, { color: colors.danger }]}>{error}</Text> : null}
        <Button title={loading ? 'Updating...' : 'Update password'} onPress={handleUpdate} loading={loading} disabled={loading} fullWidth />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flexGrow: 1, padding: spacing.xxl, gap: spacing.xl },
  subtitle: { fontSize: 12, lineHeight: 18 },
  error: { fontSize: 12, textAlign: 'center' },
  form: { gap: spacing.md },
});