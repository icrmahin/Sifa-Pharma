import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useThemeColors } from "../../providers/ThemeProvider";
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Header from '../../components/common/Header';
import spacing from '../../constants/spacing';
import typography from '../../constants/typography';

export default function ResetPasswordScreen() {
  const colors = useThemeColors();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <Header title="New password" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>Choose a new secure password to complete the reset.</Text>
        <View style={styles.form}>
          <Input label="New password" value={password} onChangeText={setPassword} secureTextEntry />
          <Input label="Confirm password" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />
        </View>
        <Button title="Update password" onPress={() => router.replace('/(auth)/welcome')} fullWidth />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flexGrow: 1, padding: spacing.xxl, gap: spacing.xl },
  subtitle: { fontSize: 12 },
  form: { gap: spacing.md },
});