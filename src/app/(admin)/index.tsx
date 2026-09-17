import { router } from "expo-router";
import type { ReactNode } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AdminHeader from "../../components/admin/AdminHeader";
import AdminStatCard from "../../components/admin/AdminStatCard";
import InventoryStatus from "../../components/admin/InventoryStatus";
import Button from "../../components/common/Button";
import EmptyState from "../../components/common/EmptyState";
import ResponsiveContainer from "../../components/common/ResponsiveContainer";
import StatusBadge from "../../components/common/StatusBadge";
import Icon from "../../components/common/Icon";
import { useThemeColors } from "../../providers/ThemeProvider";
import { useResponsive } from "../../hooks/useResponsive";
import config from "../../constants/config";
import sizes from "../../constants/sizes";
import spacing from "../../constants/spacing";
import typography from "../../constants/typography";
import { formatCurrency } from "../../utils/currency";
import { formatShortDate } from "../../utils/date";
import type { IconName } from "../../components/common/Icon";

type StatusTone = "success" | "warning" | "danger" | "info";

const QUICK_ACTIONS: { label: string; meta: string; route: string; icon: IconName }[] = [
  { label: "Add product", meta: "New medicine", route: "/(admin)/products/add", icon: "add-circle" },
  { label: "Manage orders", meta: "Review queue", route: "/(admin)/orders", icon: "receipt-long" },
  { label: "Inventory", meta: "Stock levels", route: "/(admin)/inventory", icon: "inventory" },
  { label: "Customers", meta: "Records", route: "/(admin)/customers", icon: "people" },
];

function toneForStatus(status: string): StatusTone {
  if (status === "DELIVERED") return "success";
  if (status === "PENDING") return "warning";
  if (status === "CANCELLED" || status === "RETURNED") return "danger";
  return "info";
}

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

type AttentionRowData = {
  key: string;
  icon: IconName;
  title: string;
  meta: string;
  status: ReactNode;
  actionLabel: string;
  onPress: () => void;
};

function SectionHead({
  index,
  title,
  linkLabel,
  onLink,
  colors,
}: {
  index: string;
  title: string;
  linkLabel?: string;
  onLink?: () => void;
  colors: ReturnType<typeof useThemeColors>;
}) {
  return (
    <View style={styles.sectionHead}>
      <Text style={[styles.sectionIndex, { color: colors.textMuted }]}>{index}</Text>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
      <View style={[styles.sectionRule, { backgroundColor: colors.borderLight }]} />
      {linkLabel && onLink ? (
        <Pressable
          accessibilityRole="link"
          accessibilityLabel={linkLabel}
          onPress={onLink}
        >
          <Text style={[styles.sectionLink, { color: colors.primary }]}>{linkLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function ActionChip({ label, colors }: { label: string; colors: ReturnType<typeof useThemeColors> }) {
  return (
    <View style={[styles.actionChip, { borderColor: colors.borderLight, backgroundColor: colors.background }]}>
      <Text style={[styles.actionChipText, { color: colors.primary }]}>{label}</Text>
    </View>
  );
}

export default function AdminDashboardScreen() {
  const colors = useThemeColors();
  const user = { name: "Admin" } as { name: string };
  const { isMobile, isTablet, isWide } = useResponsive();
  const isCompact = isMobile;

  // frontend-only placeholder dashboard — empty typed data keeps UI intact
  const dashboard = {
    pendingOrders: 0,
    processingOrders: 0,
    activeProducts: 0,
    lowStockProducts: 0,
    attentionOrders: [] as Array<{ id: string; orderNumber: string; customerName: string; total: number }>,
    pendingReturns: [] as Array<{ id: string; productName: string; customerName: string; quantity: number }>,
    lowStockBatches: [] as Array<{ id: string; productName: string; batchNumber: string; quantity: number; status: "healthy" | "low" | "out_of_stock"; expiryDate?: string }>,
    expiringBatches: [] as Array<{ id: string; productName: string; batchNumber: string; quantity: number; status: "healthy" | "low" | "out_of_stock"; expiryDate?: string }>,
    recentOrders: [] as Array<{ id: string; orderNumber: string; customerName: string; total: number; status: string; createdAt: string }>,
    recentActivity: [] as Array<{ id: string; action: string; actor: string; recordType: string; timestamp: string }>,
  };

  const {
    pendingOrders,
    processingOrders,
    activeProducts,
    lowStockProducts,
    attentionOrders,
    pendingReturns,
    lowStockBatches,
    expiringBatches,
    recentOrders,
    recentActivity,
  } = dashboard;

  const openRow = (href: string) => router.push(href as never);
  const openOrder = (orderId: string) =>
    router.push({ pathname: "/(admin)/orders/[orderId]", params: { orderId } });
  const openReturn = (returnId: string) =>
    router.push({
      pathname: "/(admin)/returns/[returnId]",
      params: { returnId },
    });

  const attention: AttentionRowData[] = [
    ...attentionOrders.map((order) => ({
      key: order.id,
      icon: "pending-actions" as IconName,
      title: `Order ${order.orderNumber} pending`,
      meta: `${order.customerName} · ${formatCurrency(order.total)}`,
      status: <StatusBadge label="Pending" tone="warning" />,
      actionLabel: "Review",
      onPress: () => openOrder(order.id),
    })),
    ...lowStockBatches.map((item) => ({
      key: item.id,
      icon: "warning" as IconName,
      title: item.productName,
      meta: `Batch ${item.batchNumber} · Qty ${item.quantity}`,
      status: <InventoryStatus status={item.status} />,
      actionLabel: "Restock",
      onPress: () => openRow("/(admin)/inventory"),
    })),
    ...pendingReturns.map((entry) => ({
      key: entry.id,
      icon: "assignment-return" as IconName,
      title: entry.productName,
      meta: `${entry.customerName} · Qty ${entry.quantity}`,
      status: <StatusBadge label="Pending" tone="warning" />,
      actionLabel: "Decide",
      onPress: () => openReturn(entry.id),
    })),
  ];

  const snapshot = [
    ...lowStockBatches,
    ...expiringBatches.filter(
      (entry) => !lowStockBatches.some((item) => item.id === entry.id),
    ),
  ].slice(0, 5);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <AdminHeader
        title="Dashboard"
        subtitle={`${greeting()}, ${user?.name ?? "Admin"}`}
        action={
          <Button
            title="Add product"
            onPress={() => router.push("/(admin)/products/add")}
          />
        }
      />
      <ScrollView contentContainerStyle={styles.scroll}>
        <ResponsiveContainer sidebarAware maxWidth={isWide ? 1200 : 960}>
          <View style={styles.page}>
          {/* Key statistics */}
          <SectionHead index="01" title="Summary" colors={colors} />
          <View style={styles.grid}>
            {[
              {
                label: "Pending orders",
                value: pendingOrders,
                detail: "Awaiting review",
                accent: "gold" as const,
                icon: "pending-actions" as IconName,
              },
              {
                label: "Processing",
                value: processingOrders,
                detail: "Being fulfilled",
                accent: "neutral" as const,
                icon: "sync" as IconName,
              },
              {
                label: "Low-stock",
                value: lowStockProducts,
                detail: `Below ${config.lowStockThreshold} units`,
                accent: "gold" as const,
                icon: "warning" as IconName,
              },
              {
                label: "Active products",
                value: activeProducts,
                detail: "In the catalogue",
                accent: "green" as const,
                icon: "verified" as IconName,
              },
            ].map((stat) => (
              <View
                key={stat.label}
                style={[styles.statCell, !isCompact && styles.statCellWide]}
              >
                <AdminStatCard
                  label={stat.label}
                  value={stat.value}
                  detail={stat.detail}
                  accent={stat.accent}
                  icon={stat.icon}
                />
              </View>
            ))}
          </View>

          {/* Actionable items */}
          <SectionHead index="02" title="Needs attention" colors={colors} />
          <View
            style={[
              styles.panel,
              {
                backgroundColor: colors.backgroundAlt,
                borderColor: colors.borderLight,
              },
            ]}
          >
            {attention.length === 0 ? (
              <View style={styles.inlineNote}>
                <Text style={[styles.inlineNoteText, { color: colors.success }]}>
                  Nothing needs your attention right now.
                </Text>
              </View>
            ) : (
              attention.map((item, index) => (
                <View key={item.key}>
                  <Pressable
                    style={({ pressed }) => [
                      styles.listRow,
                      pressed && styles.pressed,
                    ]}
                    android_ripple={{ color: colors.ripple.primary }}
                    accessibilityRole="button"
                    accessibilityLabel={`${item.actionLabel} ${item.title}`}
                    onPress={item.onPress}
                  >
                    <View
                      style={[
                        styles.iconTile,
                        {
                          borderColor: colors.borderLight,
                          backgroundColor: colors.background,
                        },
                      ]}
                    >
                      <Icon name={item.icon} size={18} color={colors.primary} />
                    </View>
                    <View style={styles.listMain}>
                      <Text style={[styles.listTitle, { color: colors.text }]} numberOfLines={1}>
                        {item.title}
                      </Text>
                      <Text style={[styles.listMeta, { color: colors.textMuted }]} numberOfLines={1}>
                        {item.meta}
                      </Text>
                    </View>
                    {item.status}
                    <ActionChip label={item.actionLabel} colors={colors} />
                  </Pressable>
                  {index < attention.length - 1 ? (
                    <View style={[styles.hairline, { backgroundColor: colors.borderSoft }]} />
                  ) : null}
                </View>
              ))
            )}
          </View>

          {/* Fast paths */}
          <SectionHead index="03" title="Quick actions" colors={colors} />
          <View style={styles.actionGrid}>
            {QUICK_ACTIONS.map((action) => (
              <Pressable
                key={action.label}
                style={({ pressed }) => [
                  styles.actionTile,
                  {
                    backgroundColor: colors.backgroundAlt,
                    borderColor: colors.borderLight,
                  },
                  !isCompact && styles.actionTileWide,
                  pressed && styles.pressed,
                ]}
                android_ripple={{ color: colors.ripple.primary }}
                accessibilityRole="button"
                accessibilityLabel={action.label}
                onPress={() => openRow(action.route)}
              >
                <View
                  style={[
                    styles.iconTile,
                    {
                      borderColor: colors.borderLight,
                      backgroundColor: colors.background,
                    },
                  ]}
                >
                  <Icon name={action.icon} size={18} color={colors.primary} />
                </View>
                <Text style={[styles.actionLabel, { color: colors.text }]}>{action.label}</Text>
                <Text style={[styles.actionMeta, { color: colors.textMuted }]}>{action.meta}</Text>
              </Pressable>
            ))}
          </View>

          {/* Two columns on wide screens */}
          <View style={[styles.body, isWide && styles.bodyWide]}>
            <View style={[styles.bodyCol, isWide && styles.bodyColLeft]}>
              <SectionHead
                index="04"
                title="Recent orders"
                linkLabel="View all"
                onLink={() => openRow("/(admin)/orders")}
                colors={colors}
              />
              <View
                style={[
                  styles.panel,
                  {
                    backgroundColor: colors.backgroundAlt,
                    borderColor: colors.borderLight,
                  },
                ]}
              >
                {recentOrders.length === 0 ? (
                  <EmptyState
                    title="No recent orders"
                    message="New customer orders will appear here."
                  />
                ) : (
                  recentOrders.map((order, index) => (
                    <View key={order.id}>
                      <Pressable
                        style={({ pressed }) => [
                          styles.listRow,
                          pressed && styles.pressed,
                        ]}
                        android_ripple={{ color: colors.ripple.primary }}
                        accessibilityRole="button"
                        accessibilityLabel={`Review order ${order.orderNumber}`}
                        onPress={() => openOrder(order.id)}
                      >
                        <View style={styles.listMain}>
                          <Text style={[styles.listTitle, { color: colors.text }]} numberOfLines={1}>
                            {order.orderNumber} · {formatCurrency(order.total)}
                          </Text>
                          <Text style={[styles.listMeta, { color: colors.textMuted }]} numberOfLines={1}>
                            {order.customerName} · {formatShortDate(order.createdAt)}
                          </Text>
                        </View>
                        <StatusBadge
                          label={order.status}
                          tone={toneForStatus(order.status)}
                        />
                        <Icon name="chevron-right" size={16} color={colors.textMuted} />
                      </Pressable>
                      {index < recentOrders.length - 1 ? (
                        <View style={[styles.hairline, { backgroundColor: colors.borderSoft }]} />
                      ) : null}
                    </View>
                  ))
                )}
              </View>
            </View>

            <View style={[styles.bodyCol, isWide && styles.bodyColRight]}>
              <SectionHead
                index="05"
                title="Inventory snapshot"
                linkLabel="Manage"
                onLink={() => openRow("/(admin)/inventory")}
                colors={colors}
              />
              <View
                style={[
                  styles.panel,
                  {
                    backgroundColor: colors.backgroundAlt,
                    borderColor: colors.borderLight,
                  },
                ]}
              >
                {snapshot.length === 0 ? (
                  <View style={styles.inlineNote}>
                    <Text style={[styles.inlineNoteText, { color: colors.success }]}>
                      All stock levels are healthy.
                    </Text>
                  </View>
                ) : (
                  snapshot.map((item, index) => {
                    const isExpiring = expiringBatches.some(
                      (entry) => entry.id === item.id,
                    );
                    return (
                      <View key={item.id}>
                        <Pressable
                          style={({ pressed }) => [
                            styles.listRow,
                            pressed && styles.pressed,
                          ]}
                          android_ripple={{ color: colors.ripple.primary }}
                          accessibilityRole="button"
                          accessibilityLabel={`Review ${item.productName} stock`}
                          onPress={() => openRow("/(admin)/inventory")}
                        >
                          <View style={styles.listMain}>
                            <Text style={[styles.listTitle, { color: colors.text }]} numberOfLines={1}>
                              {item.productName}
                            </Text>
                            <Text style={[styles.listMeta, { color: colors.textMuted }]} numberOfLines={1}>
                              {isExpiring && item.expiryDate
                                ? `Batch ${item.batchNumber} · Qty ${item.quantity} · Exp ${formatShortDate(item.expiryDate)}`
                                : `Batch ${item.batchNumber} · Qty ${item.quantity}`}
                            </Text>
                          </View>
                          <InventoryStatus status={item.status} />
                          <Icon name="chevron-right" size={16} color={colors.textMuted} />
                        </Pressable>
                        {index < snapshot.length - 1 ? (
                          <View style={[styles.hairline, { backgroundColor: colors.borderSoft }]} />
                        ) : null}
                      </View>
                    );
                  })
                )}
              </View>

              <SectionHead
                index="06"
                title="Recent activity"
                linkLabel="Audit log"
                onLink={() => openRow("/(admin)/audit")}
                colors={colors}
              />
              <View
                style={[
                  styles.panel,
                  {
                    backgroundColor: colors.backgroundAlt,
                    borderColor: colors.borderLight,
                  },
                ]}
              >
                {recentActivity.length === 0 ? (
                  <EmptyState
                    title="No activity yet"
                    message="Admin actions will be recorded here."
                  />
                ) : (
                  recentActivity.map((entry, index) => (
                    <View key={entry.id}>
                      <View style={styles.listRow}>
                        <View style={styles.listMain}>
                          <Text style={[styles.listTitle, { color: colors.text }]} numberOfLines={1}>
                            {entry.action}
                          </Text>
                          <Text style={[styles.listMeta, { color: colors.textMuted }]} numberOfLines={1}>
                            {entry.actor} · {entry.recordType}
                          </Text>
                        </View>
                        <Text style={[styles.rowDate, { color: colors.textMuted }]}>
                          {formatShortDate(entry.timestamp)}
                        </Text>
                      </View>
                      {index < recentActivity.length - 1 ? (
                        <View style={[styles.hairline, { backgroundColor: colors.borderSoft }]} />
                      ) : null}
                    </View>
                  ))
                )}
              </View>
            </View>
          </View>

          </View>
        </ResponsiveContainer>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scroll: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  page: { width: "100%", alignSelf: "center", gap: spacing.lg },
  pageTablet: { maxWidth: 860 },
  pageWide: { maxWidth: 1120 },

  sectionHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  sectionIndex: {
    fontSize: typography.caption2,
    fontWeight: "700",
    letterSpacing: 0.8,
  },
  sectionTitle: {
    fontSize: typography.footnote,
    fontWeight: "700",
    letterSpacing: typography.letterSpacing.tight,
  },
  sectionRule: { flex: 1, height: 1 },
  sectionLink: {
    fontSize: typography.footnote,
    fontWeight: "600",
  },

  grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  statCell: { flexGrow: 1, flexBasis: "46%" },
  statCellWide: { flexBasis: "22%" },

  actionGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  actionTile: {
    flexGrow: 1,
    flexBasis: "46%",
    minHeight: 68,
    borderRadius: sizes.borderRadius.md,
    borderWidth: 1,
    padding: spacing.md,
    gap: spacing.xs,
    justifyContent: "center",
  },
  actionTileWide: { flexBasis: "23%" },
  iconTile: {
    width: 28,
    height: 28,
    borderRadius: sizes.borderRadius.sm,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  actionLabel: {
    fontSize: typography.footnote,
    fontWeight: "600",
  },
  actionMeta: { fontSize: typography.caption2 },

  body: { flexDirection: "column", gap: spacing.lg },
  bodyWide: { flexDirection: "row", alignItems: "flex-start" },
  bodyCol: { flexDirection: "column", gap: spacing.lg, minWidth: 0 },
  bodyColLeft: { flex: 1.6 },
  bodyColRight: { flex: 1 },

  panel: {
    borderRadius: sizes.borderRadius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  listRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    minHeight: 44,
  },
  listMain: { flex: 1, gap: spacing.xs },
  listTitle: {
    fontSize: typography.footnote,
    fontWeight: "700",
  },
  listMeta: { fontSize: typography.caption2 },
  rowDate: {
    fontSize: typography.caption2,
    letterSpacing: 0.2,
  },
  actionChip: {
    borderWidth: 1,
    borderRadius: sizes.borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  actionChipText: {
    fontSize: typography.caption2,
    fontWeight: "700",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  inlineNote: { paddingVertical: spacing.md, alignItems: "flex-start" },
  inlineNoteText: {
    fontSize: typography.footnote,
    fontWeight: "600",
  },
  pressed: { opacity: 0.6, transform: [{ scale: 0.99 }] },
  hairline: { height: 1 },
});
