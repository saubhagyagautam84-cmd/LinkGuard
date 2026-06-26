import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CheckedLink, LinkStatus } from '../types';
import { C } from '../constants/theme';

const STATUS_CONFIG: Record<LinkStatus, { icon: string; color: string; label: string }> = {
  safe:    { icon: 'checkmark-circle', color: C.green,  label: 'Safe'    },
  danger:  { icon: 'warning',          color: C.red,    label: 'Blocked' },
  warning: { icon: 'help-circle',      color: C.amber,  label: 'Warned'  },
  unknown: { icon: 'ellipse-outline',  color: C.muted,  label: 'Unknown' },
};

interface Props {
  link: CheckedLink;
  onPress: (link: CheckedLink) => void;
  onLongPress?: (link: CheckedLink) => void;
}

export default function LinkCard({ link, onPress, onLongPress }: Props) {
  const cfg = STATUS_CONFIG[link.status];
  return (
    <TouchableOpacity
      style={styles.row}
      onPress={() => onPress(link)}
      onLongPress={() => onLongPress?.(link)}
      activeOpacity={0.7}
    >
      <View style={[styles.iconBox, { backgroundColor: cfg.color + '18' }]}>
        <Ionicons name={cfg.icon as any} size={18} color={cfg.color} />
      </View>
      <View style={styles.info}>
        <Text style={styles.url} numberOfLines={1}>{link.url}</Text>
        <View style={styles.meta}>
          <Text style={[styles.status, { color: cfg.color }]}>
            {link.status === 'danger' ? '⊘ ' : link.status === 'safe' ? '✓ ' : '? '}
            {cfg.label}  ·  {link.category}
          </Text>
        </View>
        <Text style={styles.time}>{link.source}  ·  {link.timestamp}</Text>
      </View>
      <Ionicons name="chevron-forward" size={14} color={C.border} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: C.line,
    backgroundColor: C.white,
    gap: 12,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: { flex: 1 },
  url: {
    fontSize: 13,
    fontWeight: '700',
    color: C.dark,
    marginBottom: 2,
  },
  meta: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  status: { fontSize: 11, fontWeight: '600' },
  time: { fontSize: 10, color: C.muted },
});
