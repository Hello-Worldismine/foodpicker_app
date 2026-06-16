import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Share2, Star, Navigation, Phone, MessageSquare,
  MapPin, PhoneCall, Clock, AlarmClock } from 'lucide-react-native';
import { colors } from '../theme';
import { stores } from '../data/mockData';
import { useApp } from '../context/AppContext';
import ProductCard from '../components/ProductCard';

const TABS = [{ key: 'products', label: (n) => `판매 상품 ${n}개` }, { key: 'info', label: () => '매장 정보' }];

const STATUS_COLOR = {
  selling: colors.primaryGreen,
  closing: colors.warmOrange,
  soldout: colors.mediumGray,
};

export default function StoreScreen({ route, navigation }) {
  const { storeId } = route.params;
  const { productList, handleLike } = useApp();
  const store = stores.find(s => s.id === storeId);
  const [tab, setTab] = useState('products');

  if (!store) return null;

  const storeProducts = productList.filter(p => p.storeId === storeId);
  const statusColor = STATUS_COLOR[store.status] || colors.primaryGreen;

  return (
    <View style={{ flex: 1, backgroundColor: colors.softGray }}>
      {/* 녹색 헤더 + 히어로 영역 */}
      <LinearGradientHeader>
        <SafeAreaView edges={['top']}>
          {/* 네비게이션 바 */}
          <View style={styles.navBar}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.navBtn}>
              <ArrowLeft size={22} color={colors.white} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.navBtn}>
              <Share2 size={20} color={colors.white} />
            </TouchableOpacity>
          </View>

          {/* 매장 히어로 */}
          <View style={styles.hero}>
            <View style={styles.storeIconWrap}>
              <Text style={styles.storeIconEmoji}>{store.emoji}</Text>
            </View>
            <Text style={styles.heroName}>{store.name}</Text>
            <Text style={styles.heroCategory}>{store.subcategory || store.category}</Text>
            <View style={styles.heroMeta}>
              <View style={styles.heroBadge}>
                <Star size={13} color="#FBBF24" fill="#FBBF24" />
                <Text style={styles.heroBadgeText}>{store.rating}</Text>
                <Text style={styles.heroBadgeSub}>({store.reviewCount})</Text>
              </View>
              <View style={styles.heroBadge}>
                <MapPin size={12} color="rgba(255,255,255,0.8)" />
                <Text style={styles.heroBadgeText}>{store.distance}m</Text>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradientHeader>

      {/* 액션 버튼 3개 */}
      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.actionBtn}>
          <Navigation size={18} color={colors.primaryGreen} />
          <Text style={styles.actionLabel}>길찾기</Text>
        </TouchableOpacity>
        <View style={styles.actionDivider} />
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => store.phone && Linking.openURL(`tel:${store.phone}`)}
        >
          <Phone size={18} color={colors.charcoalBlack} />
          <Text style={[styles.actionLabel, { color: colors.charcoalBlack }]}>전화</Text>
        </TouchableOpacity>
        <View style={styles.actionDivider} />
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => navigation.navigate('Review', { store })}
        >
          <MessageSquare size={18} color={colors.charcoalBlack} />
          <Text style={[styles.actionLabel, { color: colors.charcoalBlack }]}>리뷰</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} stickyHeaderIndices={[2]}>
        {/* 매장 정보 rows */}
        <View style={styles.infoCard}>
          <InfoRow icon={<MapPin size={15} color={colors.mediumGray} />} label="주소" value={store.address} />
          <InfoRow icon={<PhoneCall size={15} color={colors.mediumGray} />} label="전화" value={store.phone} />
          <InfoRow icon={<Clock size={15} color={colors.mediumGray} />} label="영업시간" value={store.businessHours} />
          <InfoRow
            icon={<AlarmClock size={15} color={colors.warmOrange} />}
            label="픽업시간"
            value={store.pickupTime}
            valueStyle={{ color: colors.warmOrange, fontWeight: '800' }}
            isLast
          />
        </View>

        {/* 설명 + 해시태그 */}
        {(store.description || store.notice) && (
          <View style={styles.descCard}>
            <Text style={styles.descText}>{store.description || store.notice}</Text>
            {store.tags?.length > 0 && (
              <View style={styles.tagRow}>
                {store.tags.map(t => (
                  <View key={t} style={styles.tag}>
                    <Text style={styles.tagText}>{t}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* 탭 바 (sticky) */}
        <View style={styles.tabs}>
          {TABS.map(t => {
            const label = t.key === 'products'
              ? `판매 상품 ${storeProducts.length}개`
              : '매장 정보';
            return (
              <TouchableOpacity
                key={t.key}
                style={[styles.tabBtn, tab === t.key && styles.tabBtnActive]}
                onPress={() => setTab(t.key)}
              >
                <Text style={[styles.tabText, tab === t.key && styles.tabTextActive]}>{label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 탭 콘텐츠 */}
        <View style={styles.tabContent}>
          {tab === 'products' && (
            storeProducts.length === 0 ? (
              <View style={styles.empty}>
                <Text style={styles.emptyEmoji}>📦</Text>
                <Text style={styles.emptyText}>등록된 상품이 없습니다</Text>
              </View>
            ) : storeProducts.map(p => (
              <ProductCard
                key={p.id}
                product={p}
                onPress={pr => navigation.navigate('ProductDetail', { productId: pr.id })}
                onLike={handleLike}
              />
            ))
          )}
          {tab === 'info' && (
            <View style={styles.infoTabCard}>
              {store.notice ? (
                <View style={styles.noticeBox}>
                  <Text style={styles.noticeTitle}>📢 매장 공지</Text>
                  <Text style={styles.noticeText}>{store.notice}</Text>
                </View>
              ) : null}
              <View style={styles.infoDetailRow}>
                <Clock size={15} color={colors.mediumGray} />
                <View>
                  <Text style={styles.infoLabel}>픽업 가능 시간</Text>
                  <Text style={styles.infoValue}>{store.pickupTime}</Text>
                </View>
              </View>
              <View style={styles.infoDetailRow}>
                <MapPin size={15} color={colors.mediumGray} />
                <View>
                  <Text style={styles.infoLabel}>주소</Text>
                  <Text style={styles.infoValue}>{store.address}</Text>
                </View>
              </View>
            </View>
          )}
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

// 녹색 헤더 배경 컴포넌트 (LinearGradient 없이 단색 사용)
function LinearGradientHeader({ children }) {
  return (
    <View style={styles.greenHeader}>
      {children}
    </View>
  );
}

function InfoRow({ icon, label, value, valueStyle, isLast }) {
  return (
    <View style={[styles.infoRow, !isLast && styles.infoRowBorder]}>
      <View style={styles.infoIconWrap}>{icon}</View>
      <Text style={styles.infoRowLabel}>{label}</Text>
      <Text style={[styles.infoRowValue, valueStyle]} numberOfLines={1}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  greenHeader: {
    backgroundColor: colors.primaryGreen,
  },
  navBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4,
  },
  navBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  hero: { alignItems: 'center', paddingBottom: 24, paddingTop: 8 },
  storeIconWrap: {
    width: 72, height: 72, borderRadius: 20,
    backgroundColor: colors.white,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12, shadowRadius: 6, elevation: 4,
  },
  storeIconEmoji: { fontSize: 36 },
  heroName: { fontSize: 20, fontWeight: '900', color: colors.white, marginBottom: 4 },
  heroCategory: { fontSize: 13, color: 'rgba(255,255,255,0.85)', marginBottom: 10 },
  heroMeta: { flexDirection: 'row', gap: 10 },
  heroBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12,
  },
  heroBadgeText: { color: colors.white, fontSize: 13, fontWeight: '700' },
  heroBadgeSub: { color: 'rgba(255,255,255,0.8)', fontSize: 12 },

  actionRow: {
    flexDirection: 'row', backgroundColor: colors.white,
    paddingVertical: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 3, elevation: 2,
  },
  actionBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 14,
  },
  actionLabel: { fontSize: 14, fontWeight: '600', color: colors.primaryGreen },
  actionDivider: { width: 1, backgroundColor: colors.softGray, marginVertical: 12 },

  infoCard: { backgroundColor: colors.white, marginTop: 8, marginHorizontal: 0 },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 13 },
  infoRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.softGray },
  infoIconWrap: { width: 28 },
  infoRowLabel: { fontSize: 13, color: colors.mediumGray, width: 60 },
  infoRowValue: { flex: 1, fontSize: 13, color: colors.charcoalBlack, fontWeight: '500' },

  descCard: { backgroundColor: colors.white, marginTop: 8, padding: 16 },
  descText: { fontSize: 13, color: '#555', lineHeight: 21, marginBottom: 12 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: {
    backgroundColor: colors.freshMint, borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 5,
  },
  tagText: { fontSize: 12, color: colors.primaryGreen, fontWeight: '600' },

  tabs: {
    flexDirection: 'row', backgroundColor: colors.white,
    borderBottomWidth: 2, borderBottomColor: colors.softGray, marginTop: 8,
  },
  tabBtn: {
    flex: 1, paddingVertical: 13, alignItems: 'center',
    borderBottomWidth: 2.5, borderBottomColor: 'transparent', marginBottom: -2,
  },
  tabBtnActive: { borderBottomColor: colors.primaryGreen },
  tabText: { fontSize: 14, color: colors.mediumGray },
  tabTextActive: { color: colors.primaryGreen, fontWeight: '800' },
  tabContent: { padding: 16 },

  empty: { alignItems: 'center', paddingTop: 48 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 14, color: colors.mediumGray },

  infoTabCard: { backgroundColor: colors.white, borderRadius: 14, padding: 16, gap: 14 },
  noticeBox: { backgroundColor: colors.freshMint, borderRadius: 10, padding: 14, marginBottom: 4 },
  noticeTitle: { fontSize: 13, fontWeight: '700', color: colors.primaryGreen, marginBottom: 6 },
  noticeText: { fontSize: 13, color: colors.charcoalBlack, lineHeight: 20 },
  infoDetailRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  infoLabel: { fontSize: 12, color: colors.mediumGray, marginBottom: 2 },
  infoValue: { fontSize: 14, fontWeight: '600', color: colors.charcoalBlack },
});
