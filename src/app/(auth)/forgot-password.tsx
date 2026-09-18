import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Linking from 'expo-linking';
import { useThemeColors } from "../../providers/ThemeProvider";
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Header from '../../components/common/Header';
import spacing from '../../constants/spacing';
import { supabase } from '../../lib/supabase';
import { goBack } from '@/utils/navigation';

export default function ForgotPasswordScreen() {
  const colors = useThemeColors();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    setError(null);
    if (!email.trim()) {
      setError('Email is required.');
      return;
    }
    setLoading(true);
    try {
      const redirectTo = Linking.createURL('reset-password');
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo });
      if (error) throw error;
      setSent(true);
    } catch (e: any) {
      setError(e.message || 'Failed to send reset link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <Header title="Reset password" onBack={() => goBack()} />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>Enter the email address associated with your account and we&apos;ll send a reset link. On Android the link opens via sifapharma://reset-password for the standalone app.</Text>
        <Input label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        {error ? <Text style={[styles.error, { color: colors.danger }]}>{error}</Text> : null}
        {sent ? <Text style={[styles.success, { color: colors.primary }]}>Reset link sent. Check your email (and spam). On device it will open the app via sifapharma://reset-password.</Text> : null}
        <Button title={loading ? 'Sending...' : 'Send reset link'} onPress={handleSend} loading={loading} disabled={loading} fullWidth />
        {sent ? <Text style={[styles.link, { color: colors.primary }]} onPress={() => router.push('/(auth)/login')}>Back to sign in</Text> : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flexGrow: 1, padding: spacing.xxl, gap: spacing.xl },
  subtitle: { fontSize: 12, lineHeight: 18 },
  error: { fontSize: 12, textAlign: 'center' },
  success: { fontSize: 12, textAlign: 'center', lineHeight: 18 },
  link: { fontSize: 12, fontWeight: '600', textAlign: 'center', marginTop: spacing.md },
});