import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useThemeColors } from '../../providers/ThemeProvider';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Header from '../../components/common/Header';
import spacing from '../../constants/spacing';
import { useAuth } from '../../hooks/useAuth';
import { goBack } from '@/utils/navigation';

export default function RegisterScreen() {
  const colors = useThemeColors();
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isAdminEmail = (em: string) => ['icrmahin@gmail.com','hibbullah82026@gmail.com'].includes(em.trim().toLowerCase())

  const handleRegister = async () => {
    setError(null);
    if (!name.trim() || !email.trim() || !password) {
      setError('Name, email and password are required.');
      return;
    }
    const adminLike = isAdminEmail(email)
    if (!adminLike && !phone.trim()) {
      setError('Phone (+880...) is required for customer. Example +8801865858544. Admin can leave empty.');
      return;
    }
    if (phone.trim() && !/^\+?8801[0-9]{9}$/.test(phone.trim())) {
      setError('Phone must be Bangladeshi format +8801XXXXXXXXX (e.g. +8801865858544).');
      return;
    }
    setLoading(true);
    try {
      await register({ name: name.trim(), phone: phone.trim() || '', email: email.trim(), password, confirmPassword: password });
      router.replace('/');
    } catch (e: any) {
      const msg = e.message || 'Registration failed.';
      if (msg.toLowerCase().includes('account created') || msg.toLowerCase().includes('check your email')) {
        setError(msg + ' After confirming via sifapharma:// link, sign in.');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <Header title="Create account" onBack={() => goBack()} />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>Create account. Customers: phone +880... required (e.g. +8801865858544). Admins (icrmahin@gmail.com, Hibbullah82026@gmail.com) can leave phone empty.</Text>
        <Input label="Full name" value={name} onChangeText={setName} />
        <Input label="Phone (+880... optional for admin)" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        <Input label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        <Input label="Password" value={password} onChangeText={setPassword} secureTextEntry />
        {error ? <Text style={[styles.error, { color: colors.danger }]}>{error}</Text> : null}
        <Button title={loading ? 'Creating...' : 'Create account'} onPress={handleRegister} loading={loading} disabled={loading} fullWidth />
        <Text style={[styles.link, { color: colors.primary }]} onPress={() => router.push('/(auth)/login')}>Already have an account? Sign in</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flexGrow: 1, padding: spacing.xxl, gap: spacing.lg },
  subtitle: { fontSize: 12, lineHeight: 18 },
  error: { fontSize: 12, textAlign: 'center' },
  link: { fontSize: 12, fontWeight: '600', textAlign: 'center', marginTop: spacing.md },
});
