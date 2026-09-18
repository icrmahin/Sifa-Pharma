import { ScrollView, StyleSheet, Text, View, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useThemeColors } from "../../../providers/ThemeProvider";
import Header from "../../../components/common/Header";
import LoadingState from "../../../components/common/LoadingState";
import ErrorState from "../../../components/common/ErrorState";
import EmptyState from "../../../components/common/EmptyState";
import { goBack } from '@/utils/navigation';
import spacing from "../../../constants/spacing";
import { useNotifications } from "../../../hooks/useNotifications";
import { formatDateTime } from "../../../utils/date";

export default function CustomerNotificationsScreen() {
  const colors = useThemeColors();
  const { items, loading, error, reload, markAsRead, markAllRead } = useNotifications();

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <Header title="Notifications" onBack={() => goBack()} />
        <LoadingState label="Loading notifications" />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <Header title="Notifications" onBack={() => goBack()} />
        <ErrorState message={error} onRetry={reload} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <Header title="Notifications" onBack={() => goBack()} />
      <ScrollView contentContainerStyle={styles.container}>
        {items.length > 0 ? (
          <Pressable onPress={() => markAllRead()}>
            <Text style={[styles.markAll, { color: colors.primary }]}>Mark all read</Text>
          </Pressable>
        ) : null}
        {items.length === 0 ? (
          <EmptyState title="No notifications" message="Order updates and offers will appear here." />
        ) : (
          items.map((notification) => (
            <Pressable key={notification.id} onPress={() => markAsRead(notification.id)}>
              <View style={[styles.card, { backgroundColor: colors.backgroundAlt, borderColor: colors.border, opacity: notification.read ? 0.7 : 1 }]}>
                <Text style={[styles.title, { color: colors.text }]}>{notification.title}{!notification.read ? ' · New' : ''}</Text>
                <Text style={[styles.body, { color: colors.textMuted }]}>{notification.body}</Text>
                <Text style={[styles.time, { color: colors.primary }]}>{formatDateTime(notification.createdAt)}</Text>
              </View>
            </Pressable>
          ))
        )}
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
  markAll: { fontSize: 12, fontWeight: '700', textAlign: 'right' },
});
