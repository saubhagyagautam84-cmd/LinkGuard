import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import LinkCard from '../components/LinkCard';
import WarningModal from '../components/WarningModal';
import { CheckedLink, LinkStatus } from '../types';
import { MOCK_LINKS } from '../data/mockData';
import { C } from '../constants/theme';

const FILTERS: { label: string; value: LinkStatus | 'all' }[] = [
  { label: 'All',     value: 'all'    },
  { label: '⊘ Blocked', value: 'danger'  },
  { label: '✓ Safe',   value: 'safe'    },
  { label: '? Unknown',value: 'warning' },
];

export default function HistoryScreen({ navigation }: any) {
  const [filter, setFilter] = useState<LinkStatus | 'all'>('all');
  const [modalLink, setModalLink] = useState<CheckedLink | null>(null);

  const filtered = filter === 'all'
    ? MOCK_LINKS
    : MOCK_LINKS.filter(l => l.status === filter);

  const handlePress = (link: CheckedLink) => {
    if (link.status === 'danger' || link.status === 'warning') setModalLink(link);
    else navigation.navigate('LinkDetail', { link });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>History</Text>
        <Text style={styles.headerCount}>{MOCK_LINKS.length} links checked</Text>
      </View>

      {/* Filter pills */}
      <View style={styles.filterRow}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f.value}
            style={[styles.pill, filter === f.value && styles.pillActive]}
            onPress={() => setFilter(f.value)}
          >
            <Text style={[styles.pillText, filter === f.value && styles.pillTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <LinkCard
            link={item}
            onPress={handlePress}
            onLongPress={l => navigation.navigate('LinkDetail', { link: l })}
          />
        )}
        contentContainerStyle={{ paddingBottom: 32 }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="search-outline" size={40} color={C.border} />
            <Text style={styles.emptyText}>No links in this category</Text>
          </View>
        }
      />

      <WarningModal
        link={modalLink}
        visible={!!modalLink}
        onBlock={() => setModalLink(null)}
        onAllow={() => setModalLink(null)}
        onViewDetail={() => {
          const l = modalLink;
          setModalLink(null);
          if (l) navigation.navigate('LinkDetail', { link: l });
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 13,
    backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: C.border,
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: C.dark },
  headerCount: { fontSize: 12, color: C.muted, fontWeight: '500' },
  filterRow: {
    flexDirection: 'row', gap: 8, padding: 12,
    backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: C.border,
  },
  pill: {
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20, backgroundColor: C.bg,
    borderWidth: 1.5, borderColor: C.border,
  },
  pillActive: { backgroundColor: C.dark, borderColor: C.dark },
  pillText: { fontSize: 12, fontWeight: '600', color: C.muted },
  pillTextActive: { color: C.white },
  empty: { flex: 1, alignItems: 'center', padding: 48, gap: 12 },
  emptyText: { fontSize: 14, color: C.muted },
});
