import { router } from "expo-router";
import { goBack } from '@/utils/navigation';
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useThemeColors } from "../../../providers/ThemeProvider";
import Header from "../../../components/common/Header";
import spacing from "../../../constants/spacing";
import typography from "../../../constants/typography";
import type { NotificationItem } from "../../../types/notification";
import { formatDateTime } from "../../../utils/date";

const mockNotifications: NotificationItem[] = [];

export default function CustomerNotificationsScreen() {
  const colors = useThemeColors();
  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <Header title="Notifications" onBack={() => goBack()} />
      <ScrollView contentContainerStyle={styles.container}>
        {mockNotifications.map((notification) => (
          <View key={notification.id} style={[styles.card, { backgroundColor: colors.backgroundAlt, borderColor: colors.border }]}>
            <Text style={[styles.title, { color: colors.text }]}>{notification.title}</Text>
            <Text style={[styles.body, { color: colors.textMuted }]}>{notification.body}</Text>
            <Text style={[styles.time, { color: colors.primary }]}>{formatDateTime(notification.createdAt)}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  card: { borderRadius: 16, borderWidth: 1, padding: spacing.lg },
  title: { fontSize: 14, fontWeight: "700", marginBottom: spacing.xs },
  body: { fontSize: 12 },
  time: { marginTop: spacing.sm, fontSize: 12 },
});
