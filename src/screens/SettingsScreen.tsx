import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { C } from '../constants/theme';

interface SettingRowProps {
  icon: string;
  iconColor: string;
  label: string;
  sub?: string;
  toggle?: boolean;
  value?: boolean;
  onToggle?: (v: boolean) => void;
  onPress?: () => void;
  danger?: boolean;
}

function SettingRow({ icon, iconColor, label, sub, toggle, value, onToggle, onPress, danger }: SettingRowProps) {
  return (
    <TouchableOpacity style={styles.settingRow} onPress={onPress} activeOpacity={toggle ? 1 : 0.7}>
      <View style={[styles.settingIcon, { backgroundColor: iconColor + '18' }]}>
        <Ionicons name={icon as any} size={18} color={iconColor} />
      </View>
      <View style={styles.settingInfo}>
        <Text style={[styles.settingLabel, danger && { color: C.red }]}>{label}</Text>
        {sub && <Text style={styles.settingSub}>{sub}</Text>}
      </View>
      {toggle
        ? <Switch
            value={value}
            onValueChange={onToggle}
            trackColor={{ false: C.border, true: C.green }}
            thumbColor={C.white}
          />
        : <Ionicons name="chevron-forward" size={16} color={C.border} />
      }
    </TouchableOpacity>
  );
}

function SectionHeader({ title }: { title: string }) {
  return <Text style={styles.sectionHeader}>{title}</Text>;
}

export default function SettingsScreen() {
  const [realTimeProtection, setRealTimeProtection] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [autoBlock, setAutoBlock] = useState(false);
  const [safeSearch, setSafeSearch] = useState(true);
  const [vpnDetection, setVpnDetection] = useState(false);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Profile card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>🛡️</Text>
          </View>
          <View>
            <Text style={styles.profileName}>LinkGuard India</Text>
            <Text style={styles.profileStatus}>✓ Free Plan  ·  v1.0.0</Text>
          </View>
        </View>

        <SectionHeader title="PROTECTION" />
        <View style={styles.card}>
          <SettingRow icon="shield-checkmark" iconColor={C.green} label="Real-time Protection"
            sub="Scan all links automatically" toggle value={realTimeProtection} onToggle={setRealTimeProtection} />
          <SettingRow icon="ban" iconColor={C.red} label="Auto-block Threats"
            sub="Block high-risk links without asking" toggle value={autoBlock} onToggle={setAutoBlock} />
          <SettingRow icon="search" iconColor={C.blue} label="Safe Search"
            sub="Filter unsafe search results" toggle value={safeSearch} onToggle={setSafeSearch} />
          <SettingRow icon="eye-off" iconColor={C.amber} label="VPN Detection"
            sub="Alert when URLs come from VPNs" toggle value={vpnDetection} onToggle={setVpnDetection} />
        </View>

        <SectionHeader title="NOTIFICATIONS" />
        <View style={styles.card}>
          <SettingRow icon="notifications" iconColor={C.blue} label="Push Notifications"
            sub="Alerts for threats and blocks" toggle value={notifications} onToggle={setNotifications} />
          <SettingRow icon="mail" iconColor={C.amber} label="Weekly Report"
            sub="Summary of blocked threats" onPress={() => {}} />
        </View>

        <SectionHeader title="ABOUT" />
        <View style={styles.card}>
          <SettingRow icon="information-circle" iconColor={C.blue} label="About LinkGuard"
            sub="Built for India's internet users" onPress={() => {}} />
          <SettingRow icon="document-text" iconColor={C.muted} label="Privacy Policy" onPress={() => {}} />
          <SettingRow icon="star" iconColor={C.amber} label="Rate the App" onPress={() => {}} />
          <SettingRow icon="share-social" iconColor={C.green} label="Share LinkGuard" onPress={() => {}} />
        </View>

        <SectionHeader title="DANGER ZONE" />
        <View style={styles.card}>
          <SettingRow icon="trash" iconColor={C.red} label="Clear History" danger onPress={() => {}} />
        </View>

        <Text style={styles.footer}>LinkGuard India  ·  Protecting since 2026</Text>
        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  header: {
    paddingHorizontal: 16, paddingVertical: 13,
    backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: C.border,
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: C.dark },
  profileCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: C.dark, margin: 14, borderRadius: 16,
    padding: 16,
  },
  avatar: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { fontSize: 24 },
  profileName: { fontSize: 16, fontWeight: '700', color: '#fff' },
  profileStatus: { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  sectionHeader: {
    fontSize: 10, fontWeight: '700', color: C.muted,
    letterSpacing: 0.8, paddingHorizontal: 16, marginBottom: 6, marginTop: 4,
  },
  card: {
    backgroundColor: C.white, marginHorizontal: 14, marginBottom: 14,
    borderRadius: 14, overflow: 'hidden',
    borderWidth: 1, borderColor: C.border,
  },
  settingRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 14, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: C.line,
  },
  settingIcon: { width: 34, height: 34, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  settingInfo: { flex: 1 },
  settingLabel: { fontSize: 14, fontWeight: '600', color: C.dark },
  settingSub: { fontSize: 11, color: C.muted, marginTop: 1 },
  footer: { textAlign: 'center', fontSize: 11, color: C.muted, marginTop: 8 },
});
