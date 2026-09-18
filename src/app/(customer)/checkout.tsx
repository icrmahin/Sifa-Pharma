/* eslint-disable react-hooks/set-state-in-effect -- data fetching and derived state sync require setState inside effects */
import { goBack } from '@/utils/navigation';
import React from "react";
import { router } from "expo-router";
import { useState, useEffect } from "react";
import { ScrollView, StyleSheet, Text, View, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useThemeColors } from "../../providers/ThemeProvider";
import Button from "../../components/common/Button";
import EmptyState from "../../components/common/EmptyState";
import Header from "../../components/common/Header";
import Input from "../../components/common/Input";
import LoadingState from "../../components/common/LoadingState";
import ResponsiveContainer from "../../components/common/ResponsiveContainer";
import spacing from "../../constants/spacing";
import typography from "../../constants/typography";
import { useResponsive } from "../../hooks/useResponsive";
import { useAuth } from "../../hooks/useAuth";
import { useCart } from "../../providers/CartProvider";
import { useAddresses } from "../../hooks/useAddresses";
import { useCreateOrder } from "../../hooks/useOrders";
import { formatCurrency } from "../../utils/currency";
import { normalizeError } from "../../utils/errorHandling";
import Icon from "../../components/common/Icon";

export default function CheckoutScreen() {
  const colors = useThemeColors();
  const { items, summary, loading: cartLoading } = useCart();
  const { user } = useAuth();
  const { data: addresses, loading: addressesLoading, create: createAddress, setDefault: setDefaultAddress } = useAddresses();
  const { create: createOrder, loading: orderLoading, error: orderError } = useCreateOrder();
  const { isDesktop } = useResponsive();

  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [address, setAddress] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId) {
      const defaultAddress = addresses.find(a => a.isDefault) || addresses[0];
      setSelectedAddressId(defaultAddress.id);
      setAddress(`${defaultAddress.street}, ${defaultAddress.city}${defaultAddress.county ? `, ${defaultAddress.county}` : ''}${defaultAddress.postalCode ? `, ${defaultAddress.postalCode}` : ''}`);
    }
  }, [addresses, selectedAddressId]);

  const handleSubmit = async () => {
    if (!items.length || submitting || !selectedAddressId) return;
    // Real e-com: user must have phone + address before order; admin path not used here (checkout is customer-only)
    const phone = (user as any)?.phone || ''
    if (!phone || !/^\+?8801[0-9]{9}$/.test(phone)) {
      setError('Please add your Bangladeshi phone (+8801XXXXXXXXX, e.g. +8801865858544) in Account → Profile before ordering. Admin accounts do not place orders.');
      return;
    }
    if (!selectedAddressId) {
      setError('Please select or add a delivery address. User info is required to place order.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await createOrder(selectedAddressId);
      setSuccess(true);
    } catch (nextError) {
      setError(normalizeError(nextError).message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddAddress = async () => {
    const newAddress = await createAddress({
      label: "Home",
      street: address,
      city: "Nairobi",
      county: "Nairobi",
      postalCode: "00100",
      isDefault: true,
    });
    setSelectedAddressId(newAddress.id);
  };

  if (cartLoading || addressesLoading) return <LoadingState label="Loading checkout" />;
  if (!items.length) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <Header title="Checkout" onBack={() => goBack()} />
        <EmptyState title="Your cart is empty" message="Add a medicine before checking out." actionLabel="Browse products" onAction={() => router.replace("/(customer)/(tabs)/products")} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <Header title="Checkout" onBack={() => goBack()} />
      <ScrollView contentContainerStyle={styles.container}>
        <ResponsiveContainer maxWidth={isDesktop ? 960 : 1320}>
          {isDesktop ? (
            <View style={styles.desktopLayout}>
              <View style={styles.formColumn}>
                <Input label="Customer name" value={user?.name ?? "Demo customer"} editable={false} />
                <View style={styles.addressSection}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Delivery Address</Text>
                  {addresses.map((addr) => (
                    <Pressable key={addr.id} style={[styles.addressOption, selectedAddressId === addr.id && styles.addressOptionSelected, { backgroundColor: selectedAddressId === addr.id ? colors.primarySoft : colors.backgroundAlt, borderColor: selectedAddressId === addr.id ? colors.primary : colors.border }]} onPress={() => { setSelectedAddressId(addr.id); setAddress(`${addr.street}, ${addr.city}${addr.county ? `, ${addr.county}` : ''}${addr.postalCode ? `, ${addr.postalCode}` : ''}`); }}>
                      <View style={styles.addressOptionContent}>
                        <Text style={[styles.addressLabel, { color: colors.text }]}>{addr.label}</Text>
                        <Text style={[styles.addressDetail, { color: colors.textMuted }]}>{addr.street}, ${addr.city}${addr.county ? `, ${addr.county}` : ''}</Text>
                      </View>
{selectedAddressId === addr.id && <Icon name="check-circle-outline" size={20} color={colors.primary} />}
                    </Pressable>
                  ))}
                  <Pressable style={[styles.addressOption, styles.addAddressButton, { backgroundColor: colors.backgroundAlt, borderColor: colors.border, borderStyle: 'dashed' }]} onPress={() => router.push("/(customer)/address/edit")}>
<Icon name="add" size={20} color={colors.primary} />
                    <Text style={[styles.addAddressText, { color: colors.primary }]}>Add new address</Text>
                  </Pressable>
                </View>
              </View>
              <View style={styles.summaryColumn}>
                <View style={[styles.summaryBox, { backgroundColor: colors.backgroundAlt, borderColor: colors.border }]}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Order summary</Text>
                  {items.map((item) => (
                    <View key={item.id} style={styles.row}><Text>{item.product.name}</Text><Text>{item.quantity} x {formatCurrency(item.product.price)}</Text></View>
                  ))}
                  <View style={styles.row}><Text>Subtotal</Text><Text>{formatCurrency(summary.subtotal)}</Text></View>
                  <View style={styles.row}><Text>Discount</Text><Text>-{formatCurrency(summary.discount)}</Text></View>
                  <View style={styles.row}><Text>Delivery</Text><Text>{formatCurrency(summary.deliveryFee)}</Text></View>
                  <View style={[styles.row, styles.total, { borderTopColor: colors.border }]}><Text style={[styles.totalText, { color: colors.text }]}>Total</Text><Text style={[styles.totalText, { color: colors.text }]}>{formatCurrency(summary.total)}</Text></View>
                </View>
                <View style={[styles.paymentBox, { backgroundColor: colors.backgroundAlt, borderColor: colors.border }]}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Payment</Text>
                  <Text style={[styles.paymentMethod, { color: colors.textMuted }]}>Cash on Delivery</Text>
                </View>
                {error ? <Text style={[styles.error, { color: colors.danger }]}>{error}</Text> : null}
                {success ? <Text style={[styles.success, { color: colors.success }]}>Order submitted and added to your delivery cycle.</Text> : null}
                <Button title={success ? "View delivery cycle" : "Submit order"} onPress={success ? () => router.replace("/(customer)/delivery-cycle") : handleSubmit} loading={submitting} disabled={success || !selectedAddressId || submitting} fullWidth />
              </View>
            </View>
          ) : (
            <>
              <View style={styles.addressSection}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Delivery Address</Text>
                {addresses.map((addr) => (
                  <Pressable key={addr.id} style={[styles.addressOption, selectedAddressId === addr.id && styles.addressOptionSelected, { backgroundColor: selectedAddressId === addr.id ? colors.primarySoft : colors.backgroundAlt, borderColor: selectedAddressId === addr.id ? colors.primary : colors.border }]} onPress={() => { setSelectedAddressId(addr.id); setAddress(`${addr.street}, ${addr.city}${addr.county ? `, ${addr.county}` : ''}${addr.postalCode ? `, ${addr.postalCode}` : ''}`); }}>
                    <View style={styles.addressOptionContent}>
                      <Text style={[styles.addressLabel, { color: colors.text }]}>{addr.label}</Text>
                      <Text style={[styles.addressDetail, { color: colors.textMuted }]}>{addr.street}, ${addr.city}${addr.county ? `, ${addr.county}` : ''}</Text>
                    </View>
                    {selectedAddressId === addr.id && <Icon name="check-circle-outline" size={20} color={colors.primary} />}
                  </Pressable>
                ))}
                <Pressable style={[styles.addressOption, styles.addAddressButton, { backgroundColor: colors.backgroundAlt, borderColor: colors.border, borderStyle: 'dashed' }]} onPress={() => router.push("/(customer)/address/edit")}>
                  <Icon name="add" size={20} color={colors.primary} />
                  <Text style={[styles.addAddressText, { color: colors.primary }]}>Add new address</Text>
                </Pressable>
              </View>
              <View style={[styles.summaryBox, { backgroundColor: colors.backgroundAlt, borderColor: colors.border }]}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Order summary</Text>
                {items.map((item) => (
                  <View key={item.id} style={styles.row}><Text>{item.product.name}</Text><Text>{item.quantity} x {formatCurrency(item.product.price)}</Text></View>
                ))}
                <View style={styles.row}><Text>Subtotal</Text><Text>{formatCurrency(summary.subtotal)}</Text></View>
                <View style={styles.row}><Text>Discount</Text><Text>-{formatCurrency(summary.discount)}</Text></View>
                <View style={styles.row}><Text>Delivery</Text><Text>{formatCurrency(summary.deliveryFee)}</Text></View>
                <View style={[styles.row, styles.total, { borderTopColor: colors.border }]}><Text style={[styles.totalText, { color: colors.text }]}>Total</Text><Text style={[styles.totalText, { color: colors.text }]}>{formatCurrency(summary.total)}</Text></View>
              </View>
              <View style={[styles.paymentBox, { backgroundColor: colors.backgroundAlt, borderColor: colors.border }]}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Payment</Text>
                <Text style={[styles.paymentMethod, { color: colors.textMuted }]}>Cash on Delivery</Text>
              </View>
              {error ? <Text style={[styles.error, { color: colors.danger }]}>{error}</Text> : null}
              {success ? <Text style={[styles.success, { color: colors.success }]}>Order submitted and added to your delivery cycle.</Text> : null}
              <Button title={success ? "View delivery cycle" : "Submit order"} onPress={success ? () => router.replace("/(customer)/delivery-cycle") : handleSubmit} loading={submitting} disabled={success || !selectedAddressId || submitting} fullWidth />
            </>
          )}
        </ResponsiveContainer>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl },
  desktopLayout: { flexDirection: "row", gap: spacing.xl },
  formColumn: { flex: 1, gap: spacing.lg },
  summaryColumn: { flex: 1, gap: spacing.lg },
  addressSection: { gap: spacing.sm },
  addressOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
  },
  addressOptionSelected: {
    borderWidth: 2,
  },
  addressOptionContent: { flex: 1 },
  addressLabel: { fontWeight: "600", fontSize: 14 },
  addressDetail: { fontSize: 12, marginTop: 2 },
  addAddressButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.lg,
  },
  addAddressText: { fontWeight: "600" },
  summaryBox: { borderRadius: 16, borderWidth: 1, padding: spacing.lg },
  sectionTitle: { fontWeight: "700", fontSize: 14, marginBottom: spacing.md },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: spacing.sm },
  total: { borderTopWidth: 1, borderTopColor: "#D0D6D4", paddingTop: spacing.md, marginTop: spacing.md },
  totalText: { fontWeight: "800", fontSize: 14 },
  paymentBox: { borderRadius: 16, borderWidth: 1, padding: spacing.lg },
  paymentMethod: { fontSize: 12 },
  error: { fontSize: 12, textAlign: "center" },
  success: { fontSize: 12, textAlign: "center" },
});
