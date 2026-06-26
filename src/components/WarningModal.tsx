import React from 'react';
import {
  Modal, View, Text, TouchableOpacity,
  StyleSheet, Pressable, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CheckedLink } from '../types';
import { C, SW } from '../constants/theme';

interface Props {
  link: CheckedLink | null;
  visible: boolean;
  onBlock: () => void;
  onAllow: () => void;
  onViewDetail: () => void;
}

export default function WarningModal({ link, visible, onBlock, onAllow, onViewDetail }: Props) {
  if (!link) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onBlock}>
      <Pressable style={styles.overlay} onPress={onBlock}>
        {/* Dimmed background text */}
        <View style={styles.bgHint}>
          <Text style={styles.bgText}>You clicked a link in Messages...</Text>
        </View>

        {/* Modal card — stop touch propagation */}
        <Pressable style={styles.card} onPress={e => e.stopPropagation()}>

          {/* Shield icon */}
          <Text style={styles.icon}>🛡️</Text>
          <Text style={styles.title}>Suspicious Link Detected</Text>

          {/* URL pill */}
          <View style={styles.urlPill}>
            <Text style={styles.urlText} numberOfLines={2}>{link.url}</Text>
          </View>

          {/* Risk factors */}
          {link.riskFactors.length > 0 && (
            <>
              <Text style={styles.riskLabel}>Risk factors:</Text>
              {link.riskFactors.map((factor, i) => (
                <View key={i} style={styles.riskRow}>
                  <Ionicons name="warning-outline" size={11} color={C.red} />
                  <Text style={styles.riskText}>{factor}</Text>
                </View>
              ))}
            </>
          )}

          {/* Divider */}
          <View style={styles.divider} />

          {/* Buttons */}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.btnBlock} onPress={onBlock} activeOpacity={0.85}>
              <Ionicons name="ban" size={14} color="#fff" />
              <Text style={styles.btnBlockText}>Block it</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnAllow} onPress={onAllow} activeOpacity={0.85}>
              <Text style={styles.btnAllowText}>Open anyway</Text>
            </TouchableOpacity>
          </View>

          {/* View full analysis */}
          <TouchableOpacity style={styles.moreRow} onPress={onViewDetail}>
            <Text style={styles.moreText}>View full analysis →</Text>
          </TouchableOpacity>

        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(26,26,46,0.72)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  bgHint: {
    position: 'absolute',
    top: 60,
    left: 20,
  },
  bgText: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 12,
  },
  card: {
    width: SW - 48,
    backgroundColor: C.white,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 16,
  },
  icon: {
    fontSize: 36,
    textAlign: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: C.dark,
    textAlign: 'center',
    marginBottom: 14,
  },
  urlPill: {
    backgroundColor: C.redLight,
    borderRadius: 8,
    padding: 10,
    marginBottom: 14,
  },
  urlText: {
    fontSize: 11,
    fontWeight: '700',
    color: C.redDark,
  },
  riskLabel: {
    fontSize: 11,
    color: C.muted,
    fontWeight: '600',
    marginBottom: 6,
  },
  riskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  riskText: {
    fontSize: 11,
    color: C.red,
    flex: 1,
  },
  divider: {
    borderTopWidth: 1,
    borderTopColor: C.border,
    marginVertical: 14,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  btnBlock: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: C.red,
    borderRadius: 12,
    paddingVertical: 12,
  },
  btnBlockText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  btnAllow: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingVertical: 12,
  },
  btnAllowText: {
    color: C.sub,
    fontSize: 13,
    fontWeight: '600',
  },
  moreRow: {
    alignItems: 'center',
    marginTop: 12,
  },
  moreText: {
    fontSize: 12,
    color: C.blue,
    fontWeight: '600',
  },
});
