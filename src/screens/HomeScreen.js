import React, { useState } from 'react';
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
import ProductCard from '../components/ProductCard';

const CATEGORIES = [
  { key: '전체',    Icon: LayoutGrid, color: '#22A06B', bg: '#E9F8F1' },
  { key: '빵',     Icon: Wheat,      color: '#B45309', bg: '#FEF3C7' },
  { key: '도시락', Icon: Package,    color: '#B91C1C', bg: '#FEE2E2' },
  { key: '샐러드', Icon: Leaf,       color: '#16A34A', bg: '#DCFCE7' },
  { key: '반찬',   Icon: Utensils,   color: '#C2410C', bg: '#FFEDD5' },
  { key: '디저트', Icon: Cookie,     color: '#7E22CE', bg: '#F3E8FF' },
  { key: '음료',   Icon: Coffee,     color: '#1D4ED8', bg: '#DBEAFE' },
  { key: '마감임박', Icon: Clock,    color: '#BE123C', bg: '#FFE4E6' },
];

const { width: SCREEN_W } = Dimensions.get('window');
const BANNER_W = SCREEN_W - 32;

// ── 매장 카드 (웹과 동일한 디자인) ────────────────────────
function StoreCard({ store, onPress }) {
  const bgColor = store.status === 'selling'
    ? '#E8F4E8' : store.status === 'closing' ? '#FFF3E0' : '#F0F0F0';
  const dotColor = store.status === 'selling'
    ? colors.primaryGreen : store.status === 'closing' ? colors.warmOrange : colors.mediumGray;

  return (
    <TouchableOpacity style={styles.storeCard} onPress={onPress} activeOpacity={0.82}>
      <View style={[styles.storeImageArea, { backgroundColor: bgColor }]}>
        <Text style={styles.storeEmoji}>{store.emoji}</Text>
        <View style={[styles.statusDot, { backgroundColor: dotColor }]} />
      </View>
      <View style={styles.storeCardInfo}>
        <Text style={styles.storeCardName} numberOfLines={1}>{store.name}</Text>
        <Text style={styles.storeCardMeta}>
          {store.distance >= 1000 ? `${(store.distance/1000).toFixed(1)}km` : `${store.distance}m`} · 상품 {store.productCount}개
        </Text>
        <Text style={styles.storeCardPickup}>픽업 {store.pickupTime}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function HomeScreen({ navigation }) {
  const { handleLike, productList } = useApp();
  const [bannerIndex, setBannerIndex] = useState(0);

  const nearbyStores = [...stores].sort((a, b) => a.distance - b.distance);
  const selling = productList.filter(
    p => p.status === 'selling' && p.stock > 0 && new Date(p.expiryDate) > new Date()
  );
  const newest = [...selling].reverse().slice(0, 6);

  function goCategory(category) {
    navigation.navigate('CategoryProducts', { category });
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>

      {/* ── 고정 헤더 (위치 + 알림 + 검색바) ── */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
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

        {/* 검색바 */}
        <TouchableOpacity
          style={styles.searchBar}
          onPress={() => navigation.navigate('Search')}
        >
          <Search size={16} color={colors.mediumGray} />
          <Text style={styles.searchPlaceholder}>음식 또는 가게 검색</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>

        {/* 광고 배너 */}
        <View style={styles.bannerWrap}>
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
                {/* 배경 원형 장식 */}
                <View style={styles.bannerCircle1} />
                <View style={styles.bannerCircle2} />
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
          {/* 인디케이터 */}
          <View style={styles.indicators}>
            {mockBannerAds.map((_, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.dot, i === bannerIndex && styles.dotActive]}
              />
            ))}
          </View>
        </View>

        {/* 카테고리 그리드 */}
        <View style={styles.catSection}>
          <View style={styles.catGrid}>
            {CATEGORIES.map(c => {
              const Icon = c.Icon;
              return (
                <TouchableOpacity
                  key={c.key}
                  style={styles.catCard}
                  onPress={() => goCategory(c.key)}
                  activeOpacity={0.75}
                >
                  <View style={[styles.catIconCircle, { backgroundColor: c.bg }]}>
                    <Icon size={20} color={c.color} strokeWidth={1.8} />
                  </View>
                  <Text style={styles.catLabel}>{c.key}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
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
              <StoreCard
                key={s.id}
                store={s}
                onPress={() => navigation.navigate('Store', { storeId: s.id })}
              />
            ))}
            <View style={{ width: 4 }} />
          </ScrollView>
        </View>

        {/* 새로 등록된 상품 */}
        <View style={styles.newSection}>
          <Text style={styles.sectionTitle}>새로 등록된 상품</Text>
          <Text style={[styles.sectionSub, { marginBottom: 14 }]}>방금 막 올라왔어요</Text>
          {newest.length === 0 ? (
            <View style={styles.newEmpty}>
              <Text style={styles.newEmptyText}>등록된 상품이 없습니다</Text>
            </View>
          ) : newest.map(p => (
            <ProductCard
              key={p.id}
              product={p}
              onPress={pr => navigation.navigate('ProductDetail', { productId: pr.id })}
              onLike={handleLike}
              onStorePress={storeId => navigation.navigate('Store', { storeId })}
            />
          ))}
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const CAT_CARD_W = (SCREEN_W - 32 - 30) / 4; // 4열, 패딩·갭 제외

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.softGray },
  scroll: { flex: 1 },

  /* ── 헤더 ── */
  header: { backgroundColor: colors.white },
  headerTop: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 16,
  },
  locationBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationText: { fontSize: 15, fontWeight: '700', color: colors.charcoalBlack },
  bellWrap: { position: 'relative', padding: 4 },
  bellDot: {
    position: 'absolute', top: 2, right: 2,
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: colors.alertRed,
    borderWidth: 1.5, borderColor: colors.white,
  },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: colors.softGray,
    marginHorizontal: 16, marginTop: 12, marginBottom: 12,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10,
  },
  searchPlaceholder: { fontSize: 14, color: colors.mediumGray },

  /* ── 배너 ── */
  bannerWrap: { paddingTop: 20 },
  bannerList: { paddingHorizontal: 16 },
  banner: {
    borderRadius: 20, padding: 24,
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', height: 160,
    overflow: 'hidden',
  },
  bannerCircle1: {
    position: 'absolute', right: -20, top: -20,
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  bannerCircle2: {
    position: 'absolute', right: 30, bottom: -30,
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  bannerContent: { flex: 1 },
  bannerTitle: {
    fontSize: 18, fontWeight: '800', color: colors.white,
    lineHeight: 26, marginBottom: 8,
  },
  bannerDesc: { fontSize: 13, color: 'rgba(255,255,255,0.88)', marginBottom: 16 },
  bannerBtn: {
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.5)',
    paddingHorizontal: 16, paddingVertical: 9,
    borderRadius: 10, alignSelf: 'flex-start',
  },
  bannerBtnText: { fontSize: 13, fontWeight: '700', color: colors.white },
  bannerEmoji: { fontSize: 52, marginLeft: 8, flexShrink: 0, lineHeight: 60 },

  /* 인디케이터 */
  indicators: {
    flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 10,
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#D0D3D7' },
  dotActive: { width: 20, backgroundColor: colors.primaryGreen, borderRadius: 3 },

  /* ── 카테고리 ── */
  catSection: {
    backgroundColor: colors.white,
    marginTop: 16,
    paddingHorizontal: 16, paddingTop: 20, paddingBottom: 16,
  },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  catCard: {
    width: CAT_CARD_W,
    backgroundColor: colors.white,
    borderWidth: 1.5, borderColor: '#EDEFF2',
    borderRadius: 14,
    paddingVertical: 14, paddingHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4, elevation: 1,
  },
  catIconCircle: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 8,
  },
  catLabel: {
    fontSize: 11.5, fontWeight: '600', color: colors.charcoalBlack, textAlign: 'center',
  },

  /* ── 주변 매장 ── */
  storeSection: { backgroundColor: colors.white, marginTop: 12 },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 18, paddingBottom: 12,
  },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: colors.charcoalBlack },
  sectionSub: { fontSize: 13, color: colors.mediumGray, marginTop: 2 },
  moreBtn: { flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 4 },
  moreText: { fontSize: 13, color: colors.primaryGreen, fontWeight: '600' },
  storeList: { paddingHorizontal: 16, paddingBottom: 16, gap: 10 },

  storeCard: {
    flexShrink: 0, width: 160, backgroundColor: colors.white,
    borderRadius: 14, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 8, elevation: 3,
  },
  storeImageArea: {
    height: 80, alignItems: 'center', justifyContent: 'center',
    position: 'relative',
  },
  storeEmoji: { fontSize: 36 },
  statusDot: {
    position: 'absolute', top: 6, right: 6,
    width: 8, height: 8, borderRadius: 4,
    borderWidth: 1.5, borderColor: colors.white,
  },
  storeCardInfo: { padding: 8, paddingHorizontal: 10, paddingBottom: 10 },
  storeCardName: {
    fontSize: 13, fontWeight: '700', color: colors.charcoalBlack, marginBottom: 3,
  },
  storeCardMeta: { fontSize: 11, color: colors.mediumGray, marginBottom: 2 },
  storeCardPickup: { fontSize: 11, color: colors.warmOrange, fontWeight: '600' },

  /* ── 새로 등록된 상품 ── */
  newSection: {
    backgroundColor: colors.white, marginTop: 12,
    paddingHorizontal: 16, paddingTop: 18, paddingBottom: 20,
  },
  newEmpty: {
    backgroundColor: colors.softGray, borderRadius: 14, padding: 24, alignItems: 'center',
  },
  newEmptyText: { fontSize: 14, color: colors.mediumGray },
});
