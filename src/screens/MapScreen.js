import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Dimensions, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Navigation, X, ChevronRight } from 'lucide-react-native';
import { colors } from '../theme';
import { stores, products } from '../data/mockData';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

const CATEGORIES = ['전체', '빵', '도시락', '샐러드', '반찬', '디저트', '음료'];

const PIN_COLORS = {
  selling: colors.primaryGreen,
  closing: colors.warmOrange,
  soldout: colors.mediumGray,
};

// ── 위경도 → 화면 좌표 변환 ──────────────────────────────
const MIN_LAT = 37.495, MAX_LAT = 37.508;
const MIN_LNG = 127.024, MAX_LNG = 127.053;

function toXY(lat, lng, w, h) {
  const x = ((lng - MIN_LNG) / (MAX_LNG - MIN_LNG)) * w;
  const y = (1 - (lat - MIN_LAT) / (MAX_LAT - MIN_LAT)) * h;
  return { x, y };
}

// ── 지도 그리드 + 도로 ────────────────────────────────────
function PseudoMap({ filteredStores, selectedStore, onPinPress, onMapPress }) {
  const MAP_H = SCREEN_H - 260; // 헤더 영역 제외한 지도 높이

  return (
    <View
      style={[styles.mapArea, { height: MAP_H }]}
      onStartShouldSetResponder={() => true}
      onResponderRelease={onMapPress}
    >
      {/* 그리드 라인 */}
      {[0.25, 0.5, 0.75].map(f => (
        <View key={`h${f}`} style={[styles.gridLine, { top: `${f * 100}%`, left: 0, right: 0, height: 1 }]} />
      ))}
      {[0.25, 0.5, 0.75].map(f => (
        <View key={`v${f}`} style={[styles.gridLine, { left: `${f * 100}%`, top: 0, bottom: 0, width: 1 }]} />
      ))}

      {/* 도로 */}
      <View style={[styles.road, styles.roadH, { top: '42%' }]} />
      <View style={[styles.road, styles.roadV, { left: '35%' }]} />
      <View style={[styles.road, styles.roadV, { left: '65%' }]} />

      {/* 현재 위치 */}
      <View style={styles.myLocation}>
        <View style={styles.myLocationDot} />
        <View style={styles.myLocationPulse} />
      </View>

      {/* 매장 핀 */}
      {filteredStores.map(store => {
        const { x, y } = toXY(store.lat, store.lng, SCREEN_W, MAP_H);
        const selected = selectedStore?.id === store.id;
        const pColor = PIN_COLORS[store.status] || colors.primaryGreen;
        return (
          <TouchableOpacity
            key={store.id}
            style={[styles.pinWrap, { left: x - 40, top: y }]}
            onPress={e => { e.stopPropagation?.(); onPinPress(store); }}
            activeOpacity={0.85}
          >
            <View style={[
              styles.pinBubble,
              { backgroundColor: pColor },
              selected && styles.pinBubbleSelected,
            ]}>
              <Text style={styles.pinText} numberOfLines={1}>
                {store.name.split(' ')[0]}
              </Text>
            </View>
            <View style={[styles.pinTip, { borderTopColor: pColor }]} />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function MapScreen({ navigation }) {
  const [selCat, setSelCat] = useState('전체');
  const [selectedStore, setSelectedStore] = useState(null);

  const filteredStores = selCat === '전체'
    ? stores
    : stores.filter(s => {
        const sp = products.filter(p => p.storeId === s.id);
        return sp.some(p => p.category === selCat);
      });

  const storeProducts = selectedStore
    ? products.filter(p => p.storeId === selectedStore.id && p.status === 'selling' && p.stock > 0)
    : [];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* 검색바 */}
      <View style={styles.searchWrap}>
        <View style={styles.searchBar}>
          <Search size={16} color={colors.mediumGray} />
          <Text style={styles.searchPlaceholder}>매장 또는 상품 검색</Text>
        </View>
      </View>

      {/* 카테고리 필터 */}
      <View style={styles.catWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catList}>
          {CATEGORIES.map(c => (
            <TouchableOpacity
              key={c}
              style={[styles.catChip, selCat === c && styles.catChipActive]}
              onPress={() => setSelCat(c)}
            >
              <Text style={[styles.catChipText, selCat === c && styles.catChipTextActive]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* 범례 */}
      <View style={styles.legend}>
        {[
          { color: colors.primaryGreen, label: '판매중' },
          { color: colors.warmOrange, label: '마감임박' },
          { color: colors.mediumGray, label: '품절' },
        ].map(l => (
          <View key={l.label} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: l.color }]} />
            <Text style={styles.legendText}>{l.label}</Text>
          </View>
        ))}
      </View>

      {/* 지도 */}
      <View style={{ flex: 1, position: 'relative' }}>
        <PseudoMap
          filteredStores={filteredStores}
          selectedStore={selectedStore}
          onPinPress={store => setSelectedStore(store)}
          onMapPress={() => selectedStore && setSelectedStore(null)}
        />

        {/* 현재 위치 버튼 */}
        <TouchableOpacity
          style={[
            styles.locationBtn,
            { bottom: selectedStore ? 220 : 20 },
          ]}
        >
          <Navigation size={20} color={colors.primaryGreen} />
        </TouchableOpacity>

        {/* 선택된 매장 미니 카드 */}
        {selectedStore && (
          <View style={styles.miniCard}>
            <View style={styles.miniCardHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.miniCardName}>{selectedStore.name}</Text>
                <Text style={styles.miniCardMeta}>
                  남은 상품 {selectedStore.productCount}개 · {selectedStore.distance >= 1000 ? `${(selectedStore.distance/1000).toFixed(1)}km` : `${selectedStore.distance}m`}
                </Text>
                <Text style={styles.miniCardPickup}>픽업 가능 {selectedStore.pickupTime}</Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedStore(null)} style={{ padding: 4 }}>
                <X size={20} color={colors.mediumGray} />
              </TouchableOpacity>
            </View>

            {/* 상품 미리보기 */}
            {storeProducts.length > 0 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.miniProductScroll}
                contentContainerStyle={{ gap: 8, paddingRight: 4 }}
              >
                {storeProducts.slice(0, 3).map(p => (
                  <TouchableOpacity
                    key={p.id}
                    style={styles.miniProduct}
                    onPress={() => navigation.navigate('ProductDetail', { productId: p.id })}
                  >
                    <Text style={styles.miniProductEmoji}>{p.emoji}</Text>
                    <Text style={styles.miniProductName} numberOfLines={1}>{p.name}</Text>
                    <Text style={styles.miniProductPrice}>{p.salePrice.toLocaleString()}원</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            <TouchableOpacity
              style={styles.miniCardBtn}
              onPress={() => navigation.navigate('Store', { storeId: selectedStore.id })}
            >
              <Text style={styles.miniCardBtnText}>상품 보기</Text>
              <ChevronRight size={16} color={colors.white} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },

  /* 검색 */
  searchWrap: { backgroundColor: colors.white, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 0 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: colors.softGray, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 10, marginBottom: 10,
  },
  searchPlaceholder: { fontSize: 14, color: colors.mediumGray },

  /* 카테고리 */
  catWrap: { backgroundColor: colors.white },
  catList: { paddingHorizontal: 16, gap: 8, paddingBottom: 10 },
  catChip: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
    backgroundColor: colors.white, borderWidth: 1.5, borderColor: '#E8EAED',
  },
  catChipActive: { backgroundColor: colors.primaryGreen, borderColor: colors.primaryGreen },
  catChipText: { fontSize: 12, color: colors.charcoalBlack, fontWeight: '400' },
  catChipTextActive: { color: colors.white, fontWeight: '700' },

  /* 범례 */
  legend: {
    flexDirection: 'row', gap: 14,
    paddingHorizontal: 16, paddingVertical: 6,
    backgroundColor: colors.white,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 12, color: colors.mediumGray },

  /* 지도 */
  mapArea: {
    backgroundColor: '#E8F4E8', overflow: 'hidden', position: 'relative',
  },
  gridLine: { position: 'absolute', backgroundColor: 'rgba(34,160,107,0.12)' },
  road: { position: 'absolute', backgroundColor: 'rgba(255,255,255,0.6)', borderRadius: 4 },
  roadH: { left: 0, right: 0, height: 8 },
  roadV: { top: 0, bottom: 0, width: 8 },

  /* 현재 위치 */
  myLocation: {
    position: 'absolute', left: '50%', top: '50%',
    transform: [{ translateX: -8 }, { translateY: -8 }],
    zIndex: 5,
  },
  myLocationDot: {
    width: 16, height: 16, backgroundColor: '#4A90D9', borderRadius: 8,
    borderWidth: 3, borderColor: colors.white,
    shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 4, elevation: 4,
  },
  myLocationPulse: {
    position: 'absolute', top: -8, left: -8,
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: 'rgba(74,144,217,0.2)',
  },

  /* 핀 */
  pinWrap: { position: 'absolute', alignItems: 'center', width: 80, zIndex: 5 },
  pinBubble: {
    borderRadius: 10, paddingHorizontal: 8, paddingVertical: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15, shadowRadius: 6, elevation: 4,
    borderWidth: 2, borderColor: 'transparent',
    maxWidth: 110,
  },
  pinBubbleSelected: {
    borderColor: colors.white,
    shadowOpacity: 0.25, elevation: 8,
    transform: [{ scale: 1.1 }],
  },
  pinText: { fontSize: 11, fontWeight: '700', color: colors.white, textAlign: 'center' },
  pinTip: {
    width: 0, height: 0,
    borderLeftWidth: 5, borderRightWidth: 5, borderTopWidth: 6,
    borderLeftColor: 'transparent', borderRightColor: 'transparent',
  },

  /* 현재 위치 버튼 */
  locationBtn: {
    position: 'absolute', right: 16,
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: colors.white,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15, shadowRadius: 8, elevation: 4,
    zIndex: 10,
  },

  /* 미니 카드 */
  miniCard: {
    position: 'absolute', bottom: 0, left: 16, right: 16,
    backgroundColor: colors.white,
    borderRadius: 20, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12, shadowRadius: 20, elevation: 8,
    zIndex: 50,
  },
  miniCardHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  miniCardName: { fontSize: 16, fontWeight: '800', color: colors.charcoalBlack, marginBottom: 4 },
  miniCardMeta: { fontSize: 13, color: colors.mediumGray, marginBottom: 2 },
  miniCardPickup: { fontSize: 13, color: colors.charcoalBlack },

  miniProductScroll: { marginBottom: 12 },
  miniProduct: {
    backgroundColor: colors.softGray, borderRadius: 10,
    padding: 8, minWidth: 110,
  },
  miniProductEmoji: { fontSize: 22, marginBottom: 4 },
  miniProductName: { fontSize: 12, fontWeight: '700', color: colors.charcoalBlack, marginBottom: 2 },
  miniProductPrice: { fontSize: 13, fontWeight: '800', color: colors.primaryGreen },

  miniCardBtn: {
    backgroundColor: colors.primaryGreen, borderRadius: 12, padding: 13,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4,
  },
  miniCardBtnText: { fontSize: 15, fontWeight: '700', color: colors.white },
});
