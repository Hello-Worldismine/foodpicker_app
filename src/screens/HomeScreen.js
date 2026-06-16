import React, { useState, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, FlatList, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, Search, ChevronRight, ChevronDown } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme';
import { useApp } from '../context/AppContext';
import { stores, mockBannerAds } from '../data/mockData';
import ProductCard from '../components/ProductCard';

const CATEGORIES = [
  { key: '전체', emoji: '⊞' },
  { key: '빵',   emoji: '🥖' },
  { key: '도시락', emoji: '🍱' },
  { key: '샐러드', emoji: '🥗' },
  { key: '반찬',  emoji: '🍲' },
  { key: '디저트', emoji: '🍰' },
  { key: '음료',  emoji: '☕' },
  { key: '마감임박', emoji: '⏰' },
];

const { width: SCREEN_W } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const { productList, handleLike } = useApp();
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [bannerIndex, setBannerIndex] = useState(0);

  const filteredProducts = selectedCategory === '전체'
    ? productList
    : selectedCategory === '마감임박'
      ? productList.filter(p => p.badges?.includes('마감임박'))
      : productList.filter(p => p.category === selectedCategory);

  const nearbyStores = stores.sort((a, b) => a.distance - b.distance).slice(0, 4);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.locationBtn}>
          <Text style={styles.locationText}>강남구 역삼동</Text>
          <ChevronDown size={16} color={colors.charcoalBlack} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Notifications')}>
          <Bell size={22} color={colors.charcoalBlack} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 검색 바 */}
        <TouchableOpacity style={styles.searchBar} onPress={() => navigation.navigate('Search')}>
          <Search size={16} color={colors.mediumGray} />
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
            setBannerIndex(Math.round(e.nativeEvent.contentOffset.x / (SCREEN_W - 32)));
          }}
          renderItem={({ item }) => (
            <LinearGradient colors={item.bg} style={styles.banner}>
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
          style={styles.bannerList}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
          snapToInterval={SCREEN_W - 20}
          decelerationRate="fast"
        />
        {/* 배너 인디케이터 */}
        <View style={styles.indicators}>
          {mockBannerAds.map((_, i) => (
            <View key={i} style={[styles.dot, i === bannerIndex && styles.dotActive]} />
          ))}
        </View>

        {/* 카테고리 */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll} contentContainerStyle={styles.catContent}>
          {CATEGORIES.map(c => (
            <TouchableOpacity
              key={c.key}
              style={[styles.catBtn, selectedCategory === c.key && styles.catBtnActive]}
              onPress={() => setSelectedCategory(c.key)}
            >
              <Text style={styles.catEmoji}>{c.emoji}</Text>
              <Text style={[styles.catLabel, selectedCategory === c.key && styles.catLabelActive]}>{c.key}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

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
                <View style={[styles.storeStatus, { backgroundColor: s.status === 'selling' ? colors.freshMint : '#F0F0F0' }]}>
                  <View style={[styles.statusDot, { backgroundColor: s.status === 'selling' ? colors.primaryGreen : colors.mediumGray }]} />
                </View>
                <Text style={styles.storeName} numberOfLines={1}>{s.name}</Text>
                <Text style={styles.storeInfo}>{s.distance}m · {s.category}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* 새로 등록된 상품 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>새로 등록된 상품</Text>
              <Text style={styles.sectionSub}>방금 막 올라왔어요</Text>
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
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: colors.white },
  locationBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationText: { fontSize: 16, fontWeight: '700', color: colors.charcoalBlack },
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.white, margin: 16, marginTop: 8, borderRadius: 12, padding: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  searchPlaceholder: { fontSize: 14, color: colors.mediumGray },
  bannerList: { marginBottom: 0 },
  banner: { width: SCREEN_W - 44, borderRadius: 16, padding: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 130 },
  bannerContent: { flex: 1 },
  bannerTitle: { fontSize: 17, fontWeight: '900', color: colors.white, lineHeight: 24, marginBottom: 6 },
  bannerDesc: { fontSize: 12, color: 'rgba(255,255,255,0.85)', marginBottom: 12 },
  bannerBtn: { backgroundColor: 'rgba(255,255,255,0.25)', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, alignSelf: 'flex-start' },
  bannerBtnText: { fontSize: 12, fontWeight: '700', color: colors.white },
  bannerEmoji: { fontSize: 52 },
  indicators: { flexDirection: 'row', justifyContent: 'center', gap: 5, marginTop: 10, marginBottom: 4 },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: colors.mediumGray },
  dotActive: { width: 14, backgroundColor: colors.primaryGreen },
  catScroll: { marginVertical: 8 },
  catContent: { paddingHorizontal: 16, gap: 8 },
  catBtn: { alignItems: 'center', backgroundColor: colors.white, borderRadius: 14, padding: 10, minWidth: 62, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1 },
  catBtnActive: { backgroundColor: colors.freshMint },
  catEmoji: { fontSize: 22, marginBottom: 4 },
  catLabel: { fontSize: 11, color: colors.mediumGray, fontWeight: '500' },
  catLabelActive: { color: colors.primaryGreen, fontWeight: '700' },
  section: { paddingHorizontal: 16, marginTop: 16 },
  sectionHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '900', color: colors.charcoalBlack },
  sectionSub: { fontSize: 12, color: colors.mediumGray, marginTop: 2 },
  moreBtn: { flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 4 },
  moreText: { fontSize: 13, color: colors.primaryGreen, fontWeight: '600' },
  storeCard: { width: 110, backgroundColor: colors.white, borderRadius: 14, padding: 12, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  storeStatus: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  statusDot: { width: 12, height: 12, borderRadius: 6 },
  storeName: { fontSize: 11, fontWeight: '700', color: colors.charcoalBlack, textAlign: 'center', marginBottom: 3 },
  storeInfo: { fontSize: 10, color: colors.mediumGray, textAlign: 'center' },
  empty: { alignItems: 'center', paddingVertical: 48 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 14, color: colors.mediumGray },
});
