import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search } from 'lucide-react-native';
import { colors } from '../theme';
import { stores } from '../data/mockData';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const MAP_H = SCREEN_H * 0.62;

const CATEGORIES = ['전체', '빵', '도시락', '샐러드', '반찬', '디저트', '음료'];

// 위경도 → 화면 좌표 변환
const LAT_MIN = 37.4975, LAT_MAX = 37.5050;
const LNG_MIN = 127.0265, LNG_MAX = 127.0500;

function toScreen(lat, lng) {
  const x = ((lng - LNG_MIN) / (LNG_MAX - LNG_MIN)) * (SCREEN_W - 60) + 10;
  const y = ((LAT_MAX - lat) / (LAT_MAX - LAT_MIN)) * (MAP_H - 80) + 20;
  return { x, y };
}

const STATUS_CONFIG = {
  selling: { bg: colors.primaryGreen, text: colors.white },
  closing: { bg: colors.warmOrange,   text: colors.white },
  soldout: { bg: '#9AA3AF',           text: colors.white },
};

export default function MapScreen({ navigation }) {
  const [selectedCat, setSelectedCat] = useState('전체');

  const filtered = selectedCat === '전체'
    ? stores
    : stores.filter(s => s.category === selectedCat);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* 검색 */}
      <View style={styles.searchWrap}>
        <View style={styles.searchBar}>
          <Search size={15} color={colors.mediumGray} />
          <TextInput
            style={styles.searchInput}
            placeholder="매장 또는 상품 검색"
            placeholderTextColor={colors.mediumGray}
          />
        </View>
      </View>

      {/* 카테고리 칩 */}
      <View style={styles.catWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catList}>
          {CATEGORIES.map(c => (
            <TouchableOpacity
              key={c}
              style={[styles.catChip, selectedCat === c && styles.catChipActive]}
              onPress={() => setSelectedCat(c)}
            >
              <Text style={[styles.catChipText, selectedCat === c && styles.catChipTextActive]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* 범례 */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.primaryGreen }]} />
          <Text style={styles.legendText}>판매중</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.warmOrange }]} />
          <Text style={styles.legendText}>마감임박</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.mediumGray }]} />
          <Text style={styles.legendText}>품절</Text>
        </View>
      </View>

      {/* 지도 영역 */}
      <View style={[styles.mapArea, { height: MAP_H }]}>
        {/* 그리드 라인 (도로 시뮬레이션) */}
        <MapGrid />

        {/* 매장 말풍선 핀 */}
        {filtered.map(s => {
          const pos = toScreen(s.lat, s.lng);
          const cfg = STATUS_CONFIG[s.status] || STATUS_CONFIG.selling;
          return (
            <TouchableOpacity
              key={s.id}
              style={[styles.pinWrap, { left: pos.x - 40, top: pos.y }]}
              onPress={() => navigation.navigate('Store', { storeId: s.id })}
              activeOpacity={0.85}
            >
              <View style={[styles.pinBubble, { backgroundColor: cfg.bg }]}>
                <Text style={[styles.pinText, { color: cfg.text }]} numberOfLines={1}>
                  {s.name.replace(/\s*(강남점|역삼점|강남역점|선릉점)/, '')}
                </Text>
              </View>
              <View style={[styles.pinTip, { borderTopColor: cfg.bg }]} />
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

function MapGrid() {
  const hLines = Array.from({ length: 8 }, (_, i) => (i + 1) * MAP_H / 9);
  const vLines = Array.from({ length: 5 }, (_, i) => (i + 1) * SCREEN_W / 6);
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {hLines.map((y, i) => (
        <View key={`h${i}`} style={[styles.gridLine, styles.gridH, { top: y }]} />
      ))}
      {vLines.map((x, i) => (
        <View key={`v${i}`} style={[styles.gridLine, styles.gridV, { left: x }]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },

  searchWrap: { backgroundColor: colors.white, paddingHorizontal: 12, paddingVertical: 8 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: colors.softGray, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11,
  },
  searchInput: { flex: 1, fontSize: 14, color: colors.charcoalBlack },

  catWrap: { backgroundColor: colors.white, paddingBottom: 8 },
  catList: { paddingHorizontal: 12, gap: 6 },
  catChip: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
    borderWidth: 1, borderColor: '#E0E0E0', backgroundColor: colors.white,
  },
  catChipActive: { backgroundColor: colors.primaryGreen, borderColor: colors.primaryGreen },
  catChipText: { fontSize: 13, color: colors.charcoalBlack, fontWeight: '500' },
  catChipTextActive: { color: colors.white, fontWeight: '700' },

  legend: {
    flexDirection: 'row', gap: 14,
    paddingHorizontal: 16, paddingVertical: 8,
    backgroundColor: colors.white,
    borderBottomWidth: 1, borderBottomColor: colors.softGray,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 12, color: colors.mediumGray },

  mapArea: {
    flex: 1,
    backgroundColor: '#DCE8DC',
    position: 'relative',
    overflow: 'hidden',
  },

  gridLine: { position: 'absolute', backgroundColor: '#C8DBC8' },
  gridH: { left: 0, right: 0, height: 1 },
  gridV: { top: 0, bottom: 0, width: 1 },

  pinWrap: { position: 'absolute', alignItems: 'center', width: 80 },
  pinBubble: {
    borderRadius: 12, paddingHorizontal: 10, paddingVertical: 6,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2, shadowRadius: 4, elevation: 4,
    maxWidth: 110,
  },
  pinText: { fontSize: 12, fontWeight: '700', textAlign: 'center' },
  pinTip: {
    width: 0, height: 0,
    borderLeftWidth: 6, borderRightWidth: 6, borderTopWidth: 7,
    borderLeftColor: 'transparent', borderRightColor: 'transparent',
  },
});
