import React, { useState, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  FlatList, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Bell, Search, ChevronRight, ChevronDown,
  LayoutGrid, Wheat, Package, Leaf, Utensils, Cookie, Coffee, Clock,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme';
import { useApp } from '../context/AppContext';
import { stores, mockBannerAds } from '../data/mockData';

const CATEGORIES = [
  { key: '전체',   Icon: LayoutGrid, color: '#22A06B', bg: '#E9F8F1' },
  { key: '빵',     Icon: Wheat,      color: '#D97706', bg: '#FEF3C7' },
  { key: '도시락', Icon: Package,    color: '#EF4444', bg: '#FEE2E2' },
  { key: '샐러드', Icon: Leaf,       color: '#16A34A', bg: '#DCFCE7' },
  { key: '반찬',   Icon: Utensils,   color: '#EA580C', bg: '#FFEDD5' },
  { key: '디저트', Icon: Cookie,     color: '#9333EA', bg: '#F3E8FF' },
  { key: '음료',   Icon: Coffee,     color: '#0891B2', bg: '#CFFAFE' },
  { key: '마감임박', Icon: Clock,    color: '#E11D48', bg: '#FFE4E6' },
];

const { width: SCREEN_W } = Dimensions.get('window');
const BANNER_W = SCREEN_W - 32;

export default function HomeScreen({ navigation }) {
  const { handleLike } = useApp();
  const [bannerIndex, setBannerIndex] = useState(0);

  const nearbyStores = [...stores].sort((a, b) => a.distance - b.distance).slice(0, 6);

  function goCategory(category) {
    navigation.navigate('CategoryProducts', { category });
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.locationBtn}>
          <Text style={styles.locationText}>강남구 역삼동</Text>
          <ChevronDown size={16} color={colors.charcoalBlack} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.bellWrap}
          onPress={() => navigation.navigate('Notifications')}
        >
          <Bell size={22} color={colors.charcoalBlack} />
          <View style={styles.bellDot} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
        {/* 검색 바 */}
        <TouchableOpacity
          style={styles.searchBar}
          onPress={() => navigation.navigate('Search')}
        >
          <Search size={15} color={colors.mediumGray} />
          <Text style={styles.searchPlaceholder}>음식 또는 가게 검색</Text>
        </TouchableOpacity>

        {/* 배너 */}
        <FlatList
          data={mockBannerAds}
          keyExtractor={i => String(i.id)}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={e => {
            setBannerIndex(Math.round(e.nativeEvent.contentOffset.x / BANNER_W));
          }}
          renderItem={({ item }) => (
            <LinearGradient
              colors={item.bg}
              style={[styles.banner, { width: BANNER_W }]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <View style={styles.bannerContent}>
                <Text style={styles.bannerTitle}>{item.title}</Text>
                <Text style={styles.bannerDesc}>{item.description}</Text>
                <TouchableOpacity
                  style={styles.bannerBtn}
                  onPress={() => goCategory(item.category)}
                >
                  <Text style={styles.bannerBtnText}>{item.btnLabel}</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.bannerEmoji}>{item.emoji}</Text>
            </LinearGradient>
          )}
          contentContainerStyle={styles.bannerList}
          snapToInterval={BANNER_W}
          decelerationRate="fast"
        />

        {/* 배너 인디케이터 */}
        <View style={styles.indicators}>
          {mockBannerAds.map((_, i) => (
            <View key={i} style={[styles.dot, i === bannerIndex && styles.dotActive]} />
          ))}
        </View>

        {/* 카테고리 2×4 그리드 — 개별 흰색 카드, 회색 배경 */}
        <View style={styles.catSection}>
          {CATEGORIES.map((c, idx) => {
            const Icon = c.Icon;
            return (
              <TouchableOpacity
                key={c.key}
                style={styles.catCard}
                onPress={() => goCategory(c.key)}
                activeOpacity={0.75}
              >
                <View style={[styles.catIconCircle, { backgroundColor: c.bg }]}>
                  <Icon size={22} color={c.color} />
                </View>
                <Text style={styles.catLabel}>{c.key}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 내 주변 매장 */}
        <View style={styles.storeSection}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>내 주변 매장</Text>
              <Text style={styles.sectionSub}>가까운 순으로 보기</Text>
            </View>
            <TouchableOpacity style={styles.moreBtn}>
              <Text style={styles.moreText}>전체보기</Text>
              <ChevronRight size={14} color={colors.primaryGreen} />
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.storeList}
          >
            {nearbyStores.map(s => (
              <TouchableOpacity
                key={s.id}
                style={styles.storeCard}
                onPress={() => navigation.navigate('Store', { storeId: s.id })}
                activeOpacity={0.82}
              >
                {/* 상태 점 */}
                <View style={styles.statusDotWrap}>
                  <View style={[styles.statusDot, {
                    backgroundColor:
                      s.status === 'selling' ? colors.primaryGreen
                      : s.status === 'closing' ? colors.warmOrange
                      : colors.mediumGray,
                  }]} />
                </View>
                {/* 이모지 */}
                <View style={[styles.storeEmojiBox, {
                  backgroundColor:
                    s.status === 'selling' ? colors.freshMint
                    : s.status === 'closing' ? '#FFF3E0'
                    : '#F0F0F0',
                }]}>
                  <Text style={styles.storeEmoji}>{s.emoji}</Text>
                </View>
                <Text style={styles.storeName} numberOfLines={1}>{s.name}</Text>
                <Text style={styles.storeInfo}>{s.distance}m · 상품 {s.productCount}개</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.softGray },
  scroll: { flex: 1 },

  /* 헤더 */
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: colors.white,
  },
  locationBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationText: { fontSize: 17, fontWeight: '800', color: colors.charcoalBlack },
  bellWrap: { position: 'relative', padding: 2 },
  bellDot: {
    position: 'absolute', top: 0, right: 0,
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: colors.alertRed,
    borderWidth: 1.5, borderColor: colors.white,
  },

  /* 검색 */
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: colors.white,
    marginHorizontal: 12, marginTop: 10, marginBottom: 12,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 3, elevation: 1,
  },
  searchPlaceholder: { fontSize: 14, color: colors.mediumGray },

  /* 배너 */
  bannerList: { paddingHorizontal: 16 },
  banner: {
    borderRadius: 18, padding: 20,
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', minHeight: 138,
  },
  bannerContent: { flex: 1 },
  bannerTitle: {
    fontSize: 18, fontWeight: '900', color: colors.white,
    lineHeight: 26, marginBottom: 8,
  },
  bannerDesc: {
    fontSize: 12, color: 'rgba(255,255,255,0.88)',
    lineHeight: 17, marginBottom: 16,
  },
  bannerBtn: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 20, alignSelf: 'flex-start',
  },
  bannerBtnText: { fontSize: 13, fontWeight: '700', color: colors.white },
  bannerEmoji: { fontSize: 56, marginLeft: 8 },

  /* 인디케이터 */
  indicators: {
    flexDirection: 'row', justifyContent: 'center', gap: 5,
    marginTop: 12, marginBottom: 4,
  },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#D1D5DB' },
  dotActive: { width: 18, backgroundColor: colors.primaryGreen, borderRadius: 3 },

  /* 카테고리 그리드 */
  catSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: colors.softGray,
    paddingHorizontal: 10,
    paddingVertical: 14,
    gap: 8,
  },
  catCard: {
    width: (SCREEN_W - 20 - 24) / 4,   // 4열, 패딩·간격 제외
    backgroundColor: colors.white,
    borderRadius: 14,
    alignItems: 'center',
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  catIconCircle: {
    width: 50, height: 50, borderRadius: 25,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 8,
  },
  catLabel: { fontSize: 12, fontWeight: '500', color: colors.charcoalBlack },

  /* 주변 매장 */
  storeSection: {
    backgroundColor: colors.white,
    paddingTop: 18, paddingBottom: 20,
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 16, marginBottom: 14,
  },
  sectionTitle: { fontSize: 18, fontWeight: '900', color: colors.charcoalBlack },
  sectionSub: { fontSize: 12, color: colors.mediumGray, marginTop: 2 },
  moreBtn: { flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 4 },
  moreText: { fontSize: 13, color: colors.primaryGreen, fontWeight: '600' },

  storeList: { paddingHorizontal: 16, gap: 10 },
  storeCard: {
    width: 110,
    backgroundColor: colors.white,
    borderRadius: 14,
    paddingHorizontal: 10, paddingVertical: 12,
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  statusDotWrap: { position: 'absolute', top: 10, right: 10 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  storeEmojiBox: {
    width: 64, height: 64, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 8,
  },
  storeEmoji: { fontSize: 30 },
  storeName: {
    fontSize: 11, fontWeight: '700', color: colors.charcoalBlack,
    textAlign: 'center', marginBottom: 3,
  },
  storeInfo: { fontSize: 10, color: colors.mediumGray, textAlign: 'center' },
});
