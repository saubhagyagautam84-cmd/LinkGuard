import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, StatusBar, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import LinkCard from '../components/LinkCard';
import WarningModal from '../components/WarningModal';
import { CheckedLink } from '../types';
import { MOCK_LINKS, STATS } from '../data/mockData';
import { C } from '../constants/theme';

export default function HomeScreen({ navigation }: any) {
  const [modalLink, setModalLink] = useState<CheckedLink | null>(null);
  const [inputUrl, setInputUrl] = useState('');

  const recentLinks = MOCK_LINKS.slice(0, 3);

  const handleLinkPress = (link: CheckedLink) => {
    if (link.status === 'danger' || link.status === 'warning') {
      setModalLink(link);
    } else {
      navigation.navigate('LinkDetail', { link });
    }
  };

  const handleCheckUrl = () => {
    if (!inputUrl.trim()) return;
    const fake: CheckedLink = {
      id: 'live',
      url: inputUrl.trim(),
      status: 'danger',
      riskScore: 89,
      category: 'Phishing',
      domainAge: '3 days',
      sslCert: 'Fake',
      country: 'Unknown',
      registrar: 'Suspicious',
      source: 'Manual Check',
      timestamp: 'Just now',
      riskFactors: ['Very new domain', 'Suspicious pattern detected', 'No SSL certificate'],
    };
    setInputUrl('');
    setModalLink(fake);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar backgroundColor={C.dark} barStyle="light-content" />

      {/* ── Top nav ── */}
      <View style={styles.topNav}>
        <View style={styles.navLeft}>
          <Text style={styles.appName}>LinkGuard</Text>
          <View style={styles.indiaBadge}>
            <Text style={styles.indiaText}>🇮🇳 India</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.bellBtn}>
          <Ionicons name="notifications-outline" size={20} color={C.dark} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── Protected badge ── */}
        <View style={styles.protectedBadge}>
          <View style={styles.badgeLeft}>
            <View style={styles.greenDot}>
              <Ionicons name="shield-checkmark" size={18} color={C.green} />
            </View>
            <View>
              <Text style={styles.protectedTitle}>Protected</Text>
              <Text style={styles.protectedSub}>
                {STATS.blocked} threat{STATS.blocked !== 1 ? 's' : ''} blocked today
              </Text>
            </View>
          </View>
          <View style={styles.activePill}>
            <Text style={styles.activeText}>Active</Text>
          </View>
        </View>

        {/* ── Stats row ── */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: C.redLight }]}>
            <Text style={[styles.statNum, { color: C.red }]}>{STATS.blocked}</Text>
            <Text style={styles.statLabel}>Blocked</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: C.greenLight }]}>
            <Text style={[styles.statNum, { color: C.green }]}>{STATS.safe}</Text>
            <Text style={styles.statLabel}>Safe</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: C.amberLight }]}>
            <Text style={[styles.statNum, { color: C.amber }]}>{STATS.unknown}</Text>
            <Text style={styles.statLabel}>Unknown</Text>
          </View>
        </View>

        {/* ── Check URL ── */}
        <View style={styles.checkSection}>
          <Text style={styles.sectionLabel}>CHECK A LINK</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.urlInput}
              value={inputUrl}
              onChangeText={setInputUrl}
              placeholder="Paste a suspicious URL here..."
              placeholderTextColor={C.muted}
              autoCapitalize="none"
              autoCorrect={false}
              onSubmitEditing={handleCheckUrl}
            />
            <TouchableOpacity style={styles.scanBtn} onPress={handleCheckUrl}>
              <Ionicons name="scan" size={18} color="#fff" />
              <Text style={styles.scanText}>Scan</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Recent activity ── */}
        <Text style={styles.sectionLabel}>RECENT ACTIVITY</Text>
        <View style={styles.activityCard}>
          {recentLinks.map((link) => (
            <LinkCard
              key={link.id}
              link={link}
              onPress={handleLinkPress}
              onLongPress={(l) => navigation.navigate('LinkDetail', { link: l })}
            />
          ))}
          <TouchableOpacity
            style={styles.viewAllRow}
            onPress={() => navigation.navigate('History')}
          >
            <Text style={styles.viewAllText}>View all history →</Text>
          </TouchableOpacity>
        </View>

        {/* ── Quick tip ── */}
        <View style={styles.tipCard}>
          <Ionicons name="bulb-outline" size={16} color={C.amber} />
          <Text style={styles.tipText}>
            Tip: Long-press any link to jump directly to its full analysis.
          </Text>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>

      {/* ── Warning Modal ── */}
      <WarningModal
        link={modalLink}
        visible={!!modalLink}
        onBlock={() => setModalLink(null)}
        onAllow={() => setModalLink(null)}
        onViewDetail={() => {
          if (modalLink) {
            const l = modalLink;
            setModalLink(null);
            navigation.navigate('LinkDetail', { link: l });
          }
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  topNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: C.white,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  navLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  appName: { fontSize: 20, fontWeight: '800', color: C.dark },
  indiaBadge: {
    backgroundColor: '#fff3e0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  indiaText: { fontSize: 11, fontWeight: '600', color: '#e65100' },
  bellBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: C.bg,
    justifyContent: 'center', alignItems: 'center',
  },
  protectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: C.greenLight,
    margin: 14,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#b7e4c7',
  },
  badgeLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  greenDot: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: C.white,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: C.green, shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 }, shadowRadius: 6,
    elevation: 3,
  },
  protectedTitle: { fontSize: 15, fontWeight: '700', color: C.greenDark },
  protectedSub: { fontSize: 11, color: C.greenDark, marginTop: 1 },
  activePill: {
    backgroundColor: C.green,
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 20,
  },
  activeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginHorizontal: 14,
    marginBottom: 14,
  },
  statCard: {
    flex: 1, borderRadius: 12, paddingVertical: 12,
    alignItems: 'center',
  },
  statNum: { fontSize: 26, fontWeight: '800' },
  statLabel: { fontSize: 10, color: C.muted, marginTop: 2, fontWeight: '600' },
  checkSection: { marginHorizontal: 14, marginBottom: 14 },
  sectionLabel: {
    fontSize: 10, fontWeight: '700', color: C.muted,
    letterSpacing: 0.8, marginBottom: 8,
    paddingHorizontal: 14,
  },
  inputRow: { flexDirection: 'row', gap: 8 },
  urlInput: {
    flex: 1, backgroundColor: C.white, borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 11,
    fontSize: 13, color: C.dark,
    borderWidth: 1.5, borderColor: C.border,
  },
  scanBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: C.blue, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 11,
  },
  scanText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  activityCard: {
    backgroundColor: C.white,
    borderRadius: 14,
    marginHorizontal: 14,
    marginBottom: 14,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000', shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 }, shadowRadius: 8,
  },
  viewAllRow: {
    padding: 12, alignItems: 'center',
    borderTopWidth: 1, borderTopColor: C.line,
  },
  viewAllText: { fontSize: 12, color: C.blue, fontWeight: '600' },
  tipCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: C.amberLight, borderRadius: 12,
    marginHorizontal: 14, padding: 12,
    borderWidth: 1, borderColor: '#fde68a',
  },
  tipText: { flex: 1, fontSize: 12, color: '#92400e', lineHeight: 17 },
});
