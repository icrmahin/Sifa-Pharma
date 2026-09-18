import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useThemeColors } from "../../providers/ThemeProvider";
import Button from "../../components/common/Button";
import AppLogo from "../../components/common/AppLogo";
import spacing from "../../constants/spacing";

export default function WelcomeScreen() {
  const colors = useThemeColors();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.brandWrap}>
          <AppLogo size={88} />
          <Text style={[styles.brand, { color: colors.text }]}>Sifa-Pharma</Text>
        </View>
        <View style={styles.hero}>
          <Text style={[styles.title, { color: colors.text }]}>Your pharmacy, simplified.</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>Browse essentials, manage orders, and keep your care plan on track with a clear and trusted mobile experience.</Text>
        </View>
        <View style={styles.featureList}>
          <Text style={[styles.feature, { color: colors.text }]}>• Fast product discovery</Text>
          <Text style={[styles.feature, { color: colors.text }]}>• 24-hour delivery cycle</Text>
          <Text style={[styles.feature, { color: colors.text }]}>• Clear order tracking</Text>
        </View>
        <View style={styles.actions}>
          <Button title="Sign in with Email" onPress={() => router.push('/(auth)/login')} fullWidth />
          <Button title="Create account" variant="secondary" onPress={() => router.push('/(auth)/register')} fullWidth />
          <Text style={[styles.note, { color: colors.textMuted }]}>Google sign-in is not configured in this build. Use email and password.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flexGrow: 1, justifyContent: "center", padding: spacing.xxl, gap: spacing.xxl },
  brandWrap: { alignItems: "center", gap: spacing.md },
  brand: { fontSize: 24, fontWeight: "600" },
  hero: { gap: spacing.md },
  title: { fontSize: 24, fontWeight: "800", lineHeight: 36 },
  subtitle: { fontSize: 14, lineHeight: 26 },
  featureList: { gap: spacing.sm },
  feature: { fontSize: 12 },
  actions: { gap: spacing.md },
  note: { fontSize: 11, textAlign: 'center', lineHeight: 16 },
});