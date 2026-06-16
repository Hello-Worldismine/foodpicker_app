import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Star, MessageSquare, Clock, MapPin } from 'lucide-react-native';
import { colors } from '../theme';
import { stores } from '../data/mockData';
import { useApp } from '../context/AppContext';
import ProductCard from '../components/ProductCard';

const TABS = [{ key: 'products', label: '상품' }, { key: 'info', label: '정보' }];

const STATUS_MAP = {
  selling: { label: '판매중', color: colors.primaryGreen, bg: colors.freshMint },
  closing: { label: '마감임박', color: colors.warmOrange, bg: '#FFF3E0' },
  soldout: { label: '품절', color: colors.mediumGray, bg: colors.softGray },
};

export default function StoreScreen({ route, navigation }) {
  const { storeId } = route.params;
  const { productList, handleLike } = useApp();
  const store = stores.find(s => s.id === storeId);
  const [tab, setTab] = useState('products');

  if (!store) return null;

  const storeProducts = productList.filter(p => p.storeId === storeId);
  const st = STATUS_MAP[store.status] || STATUS_MAP.selling;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <ArrowLeft size={22} color={colors.charcoalBlack} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{store.name}</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} stickyHeaderIndices={[1]}>
        {/* 매장 정보 헤더 */}
        <View style={styles.storeHeader}>
          <View style={styles.storeIconWrap}>
            <Text style={styles.storeEmoji}>🏪</Text>
          </View>
          <Text style={styles.storeName}>{store.name}</Text>
          <View style={[styles.statusBadge, { backgroundColor: st.bg }]}>
            <Text style={[styles.statusText, { color: st.color }]}>{st.label}</Text>
          </View>
          <View style={styles.storeMetaRow}>
            <TouchableOpacity
              style={styles.ratingBtn}
              onPress={() => navigation.navigate('Review', { store })}
            >
              <Star size={14} color="#FBBF24" fill="#FBBF24" />
              <Text style={styles.ratingText}>{store.rating}</Text>
              <Text style={styles.reviewCount}>리뷰 {store.reviewCount}개</Text>
              <MessageSquare size={13} color={colors.mediumGray} />
            </TouchableOpacity>
            <View style={styles.pickupInfo}>
              <Clock size={13} color={colors.mediumGray} />
              <Text style={styles.pickupTime}>{store.pickupTime}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.reviewNavBtn}
            onPress={() => navigation.navigate('Review', { store })}
          >
            <MessageSquare size={14} color={colors.primaryGreen} />
            <Text style={styles.reviewNavText}>리뷰 보기</Text>
          </TouchableOpacity>
        </View>

        {/* 탭 */}
        <View style={styles.tabs}>
          {TABS.map(t => (
            <TouchableOpacity key={t.key} style={[styles.tabBtn, tab === t.key && styles.tabBtnActive]} onPress={() => setTab(t.key)}>
              <Text style={[styles.tabText, tab === t.key && styles.tabTextActive]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
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
            <View style={styles.infoCard}>
              {store.notice ? (
                <View style={styles.noticeBox}>
                  <Text style={styles.noticeTitle}>📢 매장 공지</Text>
                  <Text style={styles.noticeText}>{store.notice}</Text>
                </View>
              ) : null}
              <View style={styles.infoRow}>
                <Clock size={15} color={colors.mediumGray} />
                <View>
                  <Text style={styles.infoLabel}>픽업 가능 시간</Text>
                  <Text style={styles.infoValue}>{store.pickupTime}</Text>
                </View>
              </View>
              <View style={styles.infoRow}>
                <MapPin size={15} color={colors.mediumGray} />
                <View>
                  <Text style={styles.infoLabel}>카테고리</Text>
                  <Text style={styles.infoValue}>{store.category}</Text>
                </View>
              </View>
            </View>
          )}
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.softGray },
  header: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, paddingHorizontal: 8, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.softGray },
  iconBtn: { padding: 8 },
  headerTitle: { flex: 1, fontSize: 16, fontWeight: '700', color: colors.charcoalBlack, textAlign: 'center' },
  storeHeader: { backgroundColor: colors.white, alignItems: 'center', padding: 20, paddingBottom: 16 },
  storeIconWrap: { width: 68, height: 68, borderRadius: 20, backgroundColor: colors.freshMint, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  storeEmoji: { fontSize: 32 },
  storeName: { fontSize: 20, fontWeight: '900', color: colors.charcoalBlack, marginBottom: 8 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, marginBottom: 10 },
  statusText: { fontSize: 13, fontWeight: '700' },
  storeMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 12 },
  ratingBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { fontSize: 14, fontWeight: '700', color: colors.charcoalBlack },
  reviewCount: { fontSize: 13, color: colors.mediumGray },
  pickupInfo: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  pickupTime: { fontSize: 13, color: colors.mediumGray },
  reviewNavBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1.5, borderColor: colors.primaryGreen, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8 },
  reviewNavText: { fontSize: 13, fontWeight: '700', color: colors.primaryGreen },
  tabs: { flexDirection: 'row', backgroundColor: colors.white, borderBottomWidth: 2, borderBottomColor: colors.softGray },
  tabBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2.5, borderBottomColor: 'transparent', marginBottom: -2 },
  tabBtnActive: { borderBottomColor: colors.primaryGreen },
  tabText: { fontSize: 14, color: colors.mediumGray },
  tabTextActive: { color: colors.primaryGreen, fontWeight: '800' },
  tabContent: { padding: 16 },
  empty: { alignItems: 'center', paddingTop: 48 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 14, color: colors.mediumGray },
  infoCard: { backgroundColor: colors.white, borderRadius: 14, padding: 16, gap: 14 },
  noticeBox: { backgroundColor: colors.freshMint, borderRadius: 10, padding: 14, marginBottom: 4 },
  noticeTitle: { fontSize: 13, fontWeight: '700', color: colors.primaryGreen, marginBottom: 6 },
  noticeText: { fontSize: 13, color: colors.charcoalBlack, lineHeight: 20 },
  infoRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  infoLabel: { fontSize: 12, color: colors.mediumGray, marginBottom: 2 },
  infoValue: { fontSize: 14, fontWeight: '600', color: colors.charcoalBlack },
});
