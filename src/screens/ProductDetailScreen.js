import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Share2, Heart, ChevronRight, Clock, MapPin, AlertTriangle } from 'lucide-react-native';
import { colors } from '../theme';
import { useApp } from '../context/AppContext';

function formatDate(iso) {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}

function formatTime(iso) {
  const d = new Date(iso);
  return `${d.getHours()}:${String(d.getMinutes()).padStart(2,'0')}`;
}

function InfoRow({ label, value }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

export default function ProductDetailScreen({ route, navigation }) {
  const { productId } = route.params;
  const { productList, handleLike, coupons } = useApp();
  const product = productList.find(p => p.id === productId);
  const [qty, setQty] = useState(1);

  if (!product) return null;

  const soldout = product.status === 'soldout';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <ArrowLeft size={22} color={colors.charcoalBlack} />
        </TouchableOpacity>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconBtn}>
            <Share2 size={20} color={colors.charcoalBlack} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={() => handleLike(product.id)}>
            <Heart size={20} color={product.liked ? colors.alertRed : colors.charcoalBlack} fill={product.liked ? colors.alertRed : 'none'} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 상품 이미지 */}
        <View style={styles.imageBox}>
          <Text style={styles.emoji}>{product.emoji}</Text>
          <View style={styles.badgesRow}>
            {product.badges?.map(b => (
              <View key={b} style={[styles.badge, b.includes('마감') && { backgroundColor: colors.warmOrange }, b.includes('할인') && { backgroundColor: '#3B82F6' }]}>
                <Text style={styles.badgeText}>{b}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 매장명 */}
        <TouchableOpacity
          style={styles.storeRow}
          onPress={() => navigation.navigate('Store', { storeId: product.storeId })}
        >
          <MapPin size={14} color={colors.primaryGreen} />
          <Text style={styles.storeName}>{product.store}</Text>
          <ChevronRight size={14} color={colors.mediumGray} />
        </TouchableOpacity>

        {/* 가격 */}
        <View style={styles.priceSection}>
          <View style={styles.priceRow}>
            <Text style={styles.originalPrice}>{product.originalPrice.toLocaleString()}원</Text>
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{product.discountRate}%</Text>
            </View>
          </View>
          <Text style={styles.salePrice}>{product.salePrice.toLocaleString()}원</Text>
        </View>

        {/* 기본 정보 그리드 */}
        <View style={styles.card}>
          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>남은 수량</Text>
              <Text style={[styles.gridValue, soldout && { color: colors.alertRed }]}>
                {soldout ? '품절' : `${product.stock}개`}
              </Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>픽업 가능 시간</Text>
              <Text style={styles.gridValue}>{formatTime(product.pickupStart)}~{formatTime(product.pickupEnd)}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>소비기한</Text>
              <Text style={styles.gridValue}>{formatDate(product.expiryDate)}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>보관 방법</Text>
              <Text style={styles.gridValue}>{product.storage}</Text>
            </View>
          </View>
        </View>

        {/* 구매 전 주의사항 */}
        <View style={[styles.card, styles.warningCard]}>
          <View style={styles.warningHeader}>
            <AlertTriangle size={15} color={colors.warmOrange} />
            <Text style={styles.warningTitle}>구매 전 꼭 확인해주세요</Text>
          </View>
          <Text style={styles.warningText}>• 이 상품은 소비기한이 임박한 상품입니다.</Text>
          <Text style={styles.warningText}>• 구매 후 지정된 시간 안에 매장에서 직접 픽업해야 합니다.</Text>
        </View>

        {/* 수량 + 예약 버튼 */}
        {!soldout && (
          <View style={styles.orderRow}>
            <View style={styles.qtyControl}>
              <TouchableOpacity onPress={() => setQty(q => Math.max(1, q - 1))} style={styles.qtyBtn}>
                <Text style={styles.qtyBtnText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.qtyValue}>{qty}</Text>
              <TouchableOpacity onPress={() => setQty(q => Math.min(product.stock, q + 1))} style={styles.qtyBtn}>
                <Text style={styles.qtyBtnText}>+</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.orderBtn}
              onPress={() => navigation.navigate('Order', { productId: product.id, qty })}
            >
              <Text style={styles.orderBtnText}>{(product.salePrice * qty).toLocaleString()}원 예약하기</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 픽업 장소 */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>픽업 장소</Text>
          <View style={styles.mapPlaceholder}>
            <MapPin size={28} color={colors.primaryGreen} />
            <Text style={styles.mapText}>지도 준비 중</Text>
          </View>
          <View style={styles.addressRow}>
            <MapPin size={13} color={colors.mediumGray} />
            <Text style={styles.addressText}>{product.pickupAddress}</Text>
          </View>
        </View>

        {/* 상품 상세 */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>상품 정보</Text>
          <InfoRow label="상품 설명" value={product.description} />
          <InfoRow label="구성" value={product.composition} />
          <InfoRow label="원산지" value={product.origin} />
          <InfoRow label="알레르기" value={product.allergyInfo} />
          <InfoRow label="보관 방법" value={product.storageMethod} />
        </View>

        {/* 취소 정책 */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>취소 및 환불 정책</Text>
          <Text style={styles.policyText}>{product.cancelPolicy}</Text>
        </View>

        {product.storeNotice ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>매장 공지</Text>
            <Text style={styles.policyText}>{product.storeNotice}</Text>
          </View>
        ) : null}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.softGray },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 8, paddingVertical: 8, backgroundColor: colors.white },
  headerRight: { flexDirection: 'row', gap: 4 },
  iconBtn: { padding: 8 },
  imageBox: { height: 220, backgroundColor: colors.softGray, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 80 },
  badgesRow: { position: 'absolute', top: 12, left: 12, flexDirection: 'row', gap: 6 },
  badge: { backgroundColor: colors.primaryGreen, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeText: { color: colors.white, fontSize: 12, fontWeight: '700' },
  storeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.white, padding: 14, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: colors.softGray },
  storeName: { flex: 1, fontSize: 14, fontWeight: '600', color: colors.primaryGreen },
  priceSection: { backgroundColor: colors.white, padding: 16, marginBottom: 8 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  originalPrice: { fontSize: 13, color: colors.mediumGray, textDecorationLine: 'line-through' },
  discountBadge: { backgroundColor: '#FEE2E2', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  discountText: { fontSize: 13, fontWeight: '700', color: colors.alertRed },
  salePrice: { fontSize: 28, fontWeight: '900', color: colors.primaryGreen },
  card: { backgroundColor: colors.white, marginHorizontal: 0, marginBottom: 8, padding: 16 },
  cardTitle: { fontSize: 14, fontWeight: '800', color: colors.mediumGray, marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 0 },
  gridItem: { width: '50%', backgroundColor: colors.softGray, padding: 12, borderRadius: 0 },
  gridLabel: { fontSize: 11, color: colors.mediumGray, marginBottom: 4 },
  gridValue: { fontSize: 14, fontWeight: '700', color: colors.charcoalBlack },
  warningCard: { backgroundColor: '#FFFBF0' },
  warningHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  warningTitle: { fontSize: 13, fontWeight: '700', color: colors.warmOrange },
  warningText: { fontSize: 12, color: '#92400E', lineHeight: 20 },
  orderRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.white, padding: 16, marginBottom: 8 },
  qtyControl: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: colors.softGray, borderRadius: 10, overflow: 'hidden' },
  qtyBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  qtyBtnText: { fontSize: 18, color: colors.charcoalBlack, fontWeight: '500' },
  qtyValue: { width: 36, textAlign: 'center', fontSize: 16, fontWeight: '700', color: colors.charcoalBlack },
  orderBtn: { flex: 1, backgroundColor: colors.primaryGreen, borderRadius: 12, padding: 14, alignItems: 'center' },
  orderBtnText: { color: colors.white, fontSize: 15, fontWeight: '800' },
  mapPlaceholder: { height: 140, backgroundColor: colors.softGray, borderRadius: 12, alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 10 },
  mapText: { fontSize: 13, color: colors.mediumGray },
  addressRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  addressText: { fontSize: 13, color: colors.mediumGray, flex: 1 },
  infoRow: { marginBottom: 10 },
  infoLabel: { fontSize: 12, color: colors.mediumGray, marginBottom: 3 },
  infoValue: { fontSize: 13, color: colors.charcoalBlack, lineHeight: 18 },
  policyText: { fontSize: 13, color: colors.mediumGray, lineHeight: 20 },
});
