/* eslint-disable react-hooks/set-state-in-effect -- data fetching and derived state sync require setState inside effects */
import { useState, useEffect } from "react";
import { router } from "expo-router";
import { ScrollView, StyleSheet, Text, View, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useThemeColors } from "../../../providers/ThemeProvider";
import Header from "../../../components/common/Header";
import Input from "../../../components/common/Input";
import Button from "../../../components/common/Button";
import LoadingState from "../../../components/common/LoadingState";
import spacing from "../../../constants/spacing";
import typography from "../../../constants/typography";
import { useAddresses } from "../../../hooks/useAddresses";
import type { Address } from "../../../types/address";

interface RouteParams {
  addressId?: string;
}

export default function EditAddressScreen({ route }: { route: { params: RouteParams } }) {
  const colors = useThemeColors();
  const { addressId } = route.params;
  const { data: addresses, loading, create, update } = useAddresses();
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [county, setCounty] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [label, setLabel] = useState("Home");
  const [isDefault, setIsDefault] = useState(false);
  const [saving, setSaving] = useState(false);
  const isEditing = !!addressId;

  useEffect(() => {
    if (isEditing) {
      const address = addresses.find(a => a.id === addressId);
      if (address) {
        setAddress(address.street);
        setCity(address.city);
        setCounty(address.county || "");
        setPostalCode(address.postalCode || "");
        setLabel(address.label);
        setIsDefault(Boolean(address.isDefault));
      }
    }
  }, [addresses, addressId, isEditing]);

  const handleSave = async () => {
    if (!address.trim() || !city.trim()) {
      Alert.alert("Missing fields", "Please enter street address and city");
      return;
    }

    setSaving(true);
    try {
      if (isEditing) {
        await update(addressId!, { street: address, city, county, postalCode, label, isDefault });
      } else {
        await create({ street: address, city, county, postalCode, label, isDefault });
      }
      router.back();
    } catch (err) {
      Alert.alert("Error", err instanceof Error ? err.message : "Failed to save address");
    } finally {
      setSaving(false);
    }
  };

  if (isEditing) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <Header title="Edit Address" onBack={() => router.back()} />
        <ScrollView contentContainerStyle={styles.container}>
          <Input label="Street Address" value={address} onChangeText={setAddress} placeholder="Enter your street address" />
          <Input label="City" value={city} onChangeText={setCity} placeholder="Enter city" />
          <Input label="County" value={county} onChangeText={setCounty} placeholder="Enter county" />
          <Input label="Postal Code" value={postalCode} onChangeText={setPostalCode} placeholder="Enter postal code" />
          <Input label="Label" value={label} onChangeText={setLabel} placeholder="e.g. Home, Office" />
          <View style={[styles.checkboxRow, { gap: spacing.sm }]}>
            <Text style={[styles.checkboxLabel, { color: colors.text }]}>Set as default</Text>
            <input
              type="checkbox"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              style={styles.checkbox}
            />
          </View>
          <View style={[styles.box, { backgroundColor: colors.backgroundAlt, borderColor: colors.border }]}>
            <Text style={[styles.info, { color: colors.textMuted }]}>Changes will be saved on submit</Text>
          </View>
          <Button title={saving ? "Saving..." : "Save Address"} onPress={handleSave} fullWidth disabled={saving} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <Header title="Add Address" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.container}>
        <Input label="Street Address" value={address} onChangeText={setAddress} placeholder="Enter your street address" />
        <Input label="City" value={city} onChangeText={setCity} placeholder="Enter city" />
        <Input label="County" value={county} onChangeText={setCounty} placeholder="Enter county" />
        <Input label="Postal Code" value={postalCode} onChangeText={setPostalCode} placeholder="Enter postal code" />
        <Input label="Label" value={label} onChangeText={setLabel} placeholder="e.g. Home, Office" />
        <View style={[styles.checkboxRow, { gap: spacing.sm }]}>
          <Text style={[styles.checkboxLabel, { color: colors.text }]}>Set as default</Text>
          <input
            type="checkbox"
            checked={isDefault}
            onChange={(e) => setIsDefault(e.target.checked)}
            style={styles.checkbox}
          />
        </View>
        <View style={[styles.box, { backgroundColor: colors.backgroundAlt, borderColor: colors.border }]}>
          <Text style={[styles.info, { color: colors.textMuted }]}>Address details will appear here</Text>
        </View>
        <Button title={saving ? "Saving..." : "Save Address"} onPress={handleSave} fullWidth disabled={saving} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  checkboxRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  checkboxLabel: { fontSize: 14, fontWeight: "500" },
  checkbox: { width: 20, height: 20 },
  box: { borderRadius: 16, borderWidth: 1, padding: spacing.lg },
  info: { fontSize: 12 },
});
