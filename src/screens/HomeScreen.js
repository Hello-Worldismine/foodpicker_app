import React, { useState, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  FlatList, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, Search, ChevronRight, ChevronDown,
  LayoutGrid, Wheat, Package, Leaf, Utensils, Cookie, Coffee, Clock } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme';
import { useApp } from '../context/AppContext';
import { stores, mockBannerAds } from '../data/mockData';
import ProductCard from '../components/ProductCard';

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
  const { productList, handleLike } = useApp();
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [bannerIndex, setBannerIndex] = useState(0);

  const filteredProducts = selectedCategory === '전체'
    ? productList
    : selectedCategory === '마감임박'
      ? productList.filter(p => p.badges?.includes('마감임박'))
      : productList.filter(p => p.category === selectedCategory);

  const nearbyStores = [...stores].sort((a, b) => a.distance - b.distance).slice(0, 5);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.locationBtn}>
          <Text style={styles.locationText}>강남구 역삼동</Text>
          <ChevronDown size={16} color={colors.charcoalBlack} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate('Notifications')}
          style={styles.bellWrap}
        >
          <Bell size={22} color={colors.charcoalBlack} />
          <View style={styles.bellDot} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 검색 바 */}
        <TouchableOpacity style={styles.searchBar} onPress={() => navigation.navigate('Search')}>
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
            <LinearGradient colors={item.bg} style={[styles.banner, { width: BANNER_W }]}>
              <View style={styles.bannerContent}>
                <Text style={styles.bannerTitle}>{item.title}</Text>
                <Text style={styles.bannerDesc}>{item.description}</Text>
                <TouchableOpacity style={styles.bannerBtn}>
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

        {/* 카테고리 2×4 그리드 */}
        <View style={styles.catGrid}>
          {CATEGORIES.map(c => {
            const Icon = c.Icon;
            const active = selectedCategory === c.key;
            return (
              <TouchableOpacity
                key={c.key}
                style={styles.catItem}
                onPress={() => setSelectedCategory(c.key)}
              >
                <View style={[
                  styles.catIconWrap,
                  { backgroundColor: c.bg },
                  active && styles.catIconWrapActive,
                ]}>
                  <Icon size={22} color={c.color} />
                </View>
                <Text style={[styles.catLabel, active && { color: c.color, fontWeight: '700' }]}>
                  {c.key}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 내 주변 매장 */}
        <View style={styles.section}>
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
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
            {nearbyStores.map(s => (
              <TouchableOpacity
                key={s.id}
                style={styles.storeCard}
                onPress={() => navigation.navigate('Store', { storeId: s.id })}
              >
                {/* 상태 도트 */}
                <View style={styles.statusDotWrap}>
                  <View style={[styles.statusDot, {
                    backgroundColor: s.status === 'selling' ? colors.primaryGreen
                      : s.status === 'closing' ? colors.warmOrange
                      : colors.mediumGray
                  }]} />
                </View>
                {/* 이모지 */}
                <View style={[styles.storeEmojiBox, {
                  backgroundColor: s.status === 'selling' ? colors.freshMint
                    : s.status === 'closing' ? '#FFF3E0'
                    : '#F0F0F0'
                }]}>
                  <Text style={styles.storeEmoji}>{s.emoji}</Text>
                </View>
                <Text style={styles.storeName} numberOfLines={1}>{s.name}</Text>
                <Text style={styles.storeInfo}>{s.distance}m · 상품 {s.productCount}개</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* 상품 목록 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>
                {selectedCategory === '전체' ? '새로 등록된 상품' : `${selectedCategory} 상품`}
              </Text>
              <Text style={styles.sectionSub}>
                {selectedCategory === '전체' ? '방금 막 올라왔어요' : `총 ${filteredProducts.length}개`}
              </Text>
            </View>
          </View>
          {filteredProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onPress={p => navigation.navigate('ProductDetail', { productId: p.id })}
              onLike={handleLike}
            />
          ))}
          {filteredProducts.length === 0 && (
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>🔍</Text>
              <Text style={styles.emptyText}>해당 카테고리의 상품이 없습니다</Text>
            </View>
          )}
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.softGray },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14, backgroundColor: colors.white,
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

  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: colors.softGray,
    margin: 12, marginBottom: 8, borderRadius: 12, padding: 13,
  },
  searchPlaceholder: { fontSize: 14, color: colors.mediumGray },

  bannerList: { paddingHorizontal: 16 },
  banner: {
    borderRadius: 16, padding: 20,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    minHeight: 130,
  },
  bannerContent: { flex: 1 },
  bannerTitle: { fontSize: 18, fontWeight: '900', color: colors.white, lineHeight: 25, marginBottom: 6 },
  bannerDesc: { fontSize: 12, color: 'rgba(255,255,255,0.88)', marginBottom: 14, lineHeight: 17 },
  bannerBtn: {
    backgroundColor: 'rgba(255,255,255,0.28)',
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20, alignSelf: 'flex-start',
  },
  bannerBtnText: { fontSize: 12, fontWeight: '700', color: colors.white },
  bannerEmoji: { fontSize: 54, marginLeft: 8 },

  indicators: { flexDirection: 'row', justifyContent: 'center', gap: 5, marginTop: 10, marginBottom: 4 },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#D1D5DB' },
  dotActive: { width: 16, backgroundColor: colors.primaryGreen, borderRadius: 3 },

  // 카테고리 2×4 그리드
  catGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: 12, marginVertical: 8,
    backgroundColor: colors.white,
    paddingVertical: 12,
  },
  catItem: {
    width: '25%', alignItems: 'center', paddingVertical: 8,
  },
  catIconWrap: {
    width: 52, height: 52, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 6,
  },
  catIconWrapActive: {
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12, shadowRadius: 4, elevation: 3,
  },
  catLabel: { fontSize: 12, color: colors.charcoalBlack, fontWeight: '500' },

  section: { paddingHorizontal: 16, marginTop: 16 },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'flex-start',
    justifyContent: 'space-between', marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: '900', color: colors.charcoalBlack },
  sectionSub: { fontSize: 12, color: colors.mediumGray, marginTop: 2 },
  moreBtn: { flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 4 },
  moreText: { fontSize: 13, color: colors.primaryGreen, fontWeight: '600' },

  storeCard: {
    width: 100, backgroundColor: colors.white, borderRadius: 14,
    padding: 10, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
    position: 'relative',
  },
  statusDotWrap: { position: 'absolute', top: 8, right: 8 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  storeEmojiBox: {
    width: 56, height: 56, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center', marginBottom: 7,
  },
  storeEmoji: { fontSize: 28 },
  storeName: { fontSize: 11, fontWeight: '700', color: colors.charcoalBlack, textAlign: 'center', marginBottom: 2 },
  storeInfo: { fontSize: 10, color: colors.mediumGray, textAlign: 'center' },

  empty: { alignItems: 'center', paddingVertical: 48 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 14, color: colors.mediumGray },
});
