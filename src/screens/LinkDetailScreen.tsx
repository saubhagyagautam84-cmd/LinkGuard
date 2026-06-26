import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, StatusBar, Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { CheckedLink } from '../types';
import { C, riskColor } from '../constants/theme';

const INFO_CARDS = (link: CheckedLink) => [
  { label: 'Risk Score',  value: `${link.riskScore} / 100`, color: riskColor(link.riskScore) },
  { label: 'Category',   value: link.category,              color: riskColor(link.riskScore) },
  { label: 'Domain Age', value: link.domainAge,             color: link.riskScore > 50 ? C.red : C.green },
  { label: 'SSL Cert',   value: link.sslCert,               color: link.sslCert === 'Fake' || link.sslCert === 'Missing' ? C.red : link.sslCert === 'Valid (EV)' ? C.green : C.amber },
  { label: 'Country',    value: link.country,               color: C.dark },
  { label: 'Registrar',  value: link.registrar,             color: link.registrar === 'Suspicious' ? C.amber : C.dark },
];

const SOURCE_ICONS: Record<string, string> = {
  'Messages App': '💬',
  'WhatsApp':     '💬',
  'SMS':          '📱',
  'Email':        '📧',
  'Chrome Browser': '🌐',
  'Telegram':     '📨',
  'Manual Check': '🔍',
};

export default function LinkDetailScreen({ route, navigation }: any) {
  const { link }: { link: CheckedLink } = route.params;
  const [copied, setCopied] = React.useState(false);

  const bannerColor  = link.riskScore >= 70 ? C.redLight  : link.riskScore >= 40 ? C.amberLight : C.greenLight;
  const bannerIcon   = link.riskScore >= 70 ? '🛡️'        : link.riskScore >= 40 ? '⚠️'         : '✅';
  const bannerTitle  = link.riskScore >= 70 ? 'High Risk' : link.riskScore >= 40 ? 'Medium Risk' : 'Safe';
  const bannerColor2 = riskColor(link.riskScore);

  const handleCopy = async () => {
    await Clipboard.setStringAsync(`https://${link.url}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleShare = async () => {
    await Share.share({
      message: `LinkGuard Analysis\nURL: ${link.url}\nRisk Score: ${link.riskScore}/100\nCategory: ${link.category}\n\nChecked with LinkGuard India`,
    });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar backgroundColor={C.dark} barStyle="light-content" />

      {/* ── Back nav ── */}
      <View style={styles.topNav}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color={C.dark} />
          <Text style={styles.backText}>Link Analysis</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleCopy}>
          <Ionicons
            name={copied ? 'checkmark-done' : 'copy-outline'}
            size={20}
            color={copied ? C.green : C.muted}
          />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── Risk banner ── */}
        <View style={[styles.riskBanner, { backgroundColor: bannerColor, borderColor: bannerColor2 + '40' }]}>
          <Text style={styles.bannerIcon}>{bannerIcon}</Text>
          <Text style={[styles.bannerTitle, { color: bannerColor2 }]}>{bannerTitle}</Text>
          <Text style={[styles.bannerScore, { color: bannerColor2 }]}>
            {link.riskScore} / 100 risk score
          </Text>
          {/* Score bar */}
          <View style={styles.scoreBarBg}>
            <View style={[styles.scoreBarFill, {
              width: `${link.riskScore}%` as any,
              backgroundColor: bannerColor2,
            }]} />
          </View>
        </View>

        {/* ── URL section ── */}
        <Text style={styles.fieldLabel}>URL</Text>
        <TouchableOpacity style={styles.urlBox} onPress={handleCopy}>
          <Ionicons name="link-outline" size={14} color={C.muted} />
          <Text style={styles.urlText} selectable>{link.url}</Text>
        </TouchableOpacity>

        {/* ── Risk factors ── */}
        {link.riskFactors.length > 0 && (
          <>
            <Text style={styles.fieldLabel}>RISK FACTORS</Text>
            <View style={styles.factorsCard}>
              {link.riskFactors.map((f, i) => (
                <View key={i} style={[styles.factorRow, i < link.riskFactors.length - 1 && styles.factorBorder]}>
                  <View style={styles.factorDot} />
                  <Text style={styles.factorText}>{f}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* ── Info grid ── */}
        <Text style={styles.fieldLabel}>DETAILS</Text>
        <View style={styles.infoGrid}>
          {INFO_CARDS(link).map((card, i) => (
            <View key={i} style={styles.infoCard}>
              <Text style={styles.infoLabel}>{card.label}</Text>
              <Text style={[styles.infoValue, { color: card.color }]}>{card.value}</Text>
            </View>
          ))}
        </View>

        {/* ── Source ── */}
        <Text style={styles.fieldLabel}>CLICKED FROM</Text>
        <View style={styles.sourceRow}>
          <Text style={styles.sourceIcon}>{SOURCE_ICONS[link.source] ?? '📎'}</Text>
          <View>
            <Text style={styles.sourceName}>{link.source}</Text>
            <Text style={styles.sourceTime}>{link.timestamp}</Text>
          </View>
        </View>

        {/* ── Action buttons ── */}
        <TouchableOpacity style={styles.btnReport}>
          <Ionicons name="flag" size={15} color={C.redDark} />
          <Text style={styles.btnReportText}>Report this link</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnShare} onPress={handleShare}>
          <Ionicons name="share-social-outline" size={15} color={C.blue} />
          <Text style={styles.btnShareText}>Share analysis</Text>
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>
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
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  backText: { fontSize: 15, fontWeight: '600', color: C.blue },
  riskBanner: {
    margin: 14,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
  },
  bannerIcon: { fontSize: 32, marginBottom: 6 },
  bannerTitle: { fontSize: 18, fontWeight: '800', marginBottom: 2 },
  bannerScore: { fontSize: 13, fontWeight: '600', marginBottom: 10 },
  scoreBarBg: {
    width: '100%', height: 6, borderRadius: 3,
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
  scoreBarFill: { height: 6, borderRadius: 3 },
  fieldLabel: {
    fontSize: 10, fontWeight: '700', color: C.muted,
    letterSpacing: 0.8,
    marginTop: 4, marginBottom: 6,
    paddingHorizontal: 14,
  },
  urlBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: C.white, marginHorizontal: 14,
    borderRadius: 12, padding: 12, marginBottom: 14,
    borderWidth: 1, borderColor: C.border,
  },
  urlText: { flex: 1, fontSize: 12, color: C.dark, lineHeight: 18 },
  factorsCard: {
    backgroundColor: C.white, marginHorizontal: 14,
    borderRadius: 12, marginBottom: 14,
    overflow: 'hidden', borderWidth: 1, borderColor: C.border,
  },
  factorRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 10, gap: 10,
  },
  factorBorder: { borderBottomWidth: 1, borderBottomColor: C.line },
  factorDot: {
    width: 6, height: 6, borderRadius: 3, backgroundColor: C.red,
  },
  factorText: { flex: 1, fontSize: 12, color: C.red, fontWeight: '500' },
  infoGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: 14, gap: 8, marginBottom: 14,
  },
  infoCard: {
    width: '47%',
    backgroundColor: C.white, borderRadius: 12,
    padding: 12, borderWidth: 1, borderColor: C.border,
  },
  infoLabel: { fontSize: 10, color: C.muted, marginBottom: 4, fontWeight: '600' },
  infoValue: { fontSize: 14, fontWeight: '700' },
  sourceRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: C.white, marginHorizontal: 14,
    borderRadius: 12, padding: 14, marginBottom: 14,
    borderWidth: 1, borderColor: C.border,
  },
  sourceIcon: { fontSize: 24 },
  sourceName: { fontSize: 14, fontWeight: '600', color: C.dark },
  sourceTime: { fontSize: 11, color: C.muted, marginTop: 2 },
  btnReport: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: C.redLight,
    marginHorizontal: 14, borderRadius: 12,
    paddingVertical: 13, marginBottom: 10,
    borderWidth: 1, borderColor: '#fca5a5',
  },
  btnReportText: { fontSize: 14, fontWeight: '700', color: C.redDark },
  btnShare: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: '#f0f4ff',
    marginHorizontal: 14, borderRadius: 12,
    paddingVertical: 13,
    borderWidth: 1, borderColor: '#bfdbfe',
  },
  btnShareText: { fontSize: 14, fontWeight: '700', color: C.blue },
});
