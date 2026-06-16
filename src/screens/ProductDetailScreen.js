import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft, Share2, Heart, MapPin, ChevronDown, ChevronUp,
  AlertTriangle, Clock,
} from 'lucide-react-native';
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

export default function ProductDetailScreen({ route, navigation }) {
  const { productId } = route.params;
  const { productList, handleLike } = useApp();
  const product = productList.find(p => p.id === productId);
  const [qty, setQty] = useState(1);
  const [expandedSection, setExpandedSection] = useState(null);

  if (!product) return null;

  const now = new Date();
  const isExpired = new Date(product.expiryDate) < now;
  const isPickupEnded = new Date(product.pickupEnd) < now;
  const isSoldout = product.status === 'soldout' || product.stock === 0;
  const unavailable = isExpired || isPickupEnded || isSoldout;

  let btnLabel = `${(product.salePrice * qty).toLocaleString()}원 예약하기`;
  let btnDisabled = false;
  if (isSoldout) { btnLabel = '품절된 상품입니다'; btnDisabled = true; }
  if (isPickupEnded || isExpired) { btnLabel = '판매가 종료되었습니다'; btnDisabled = true; }

  const sections = [
    { key: 'composition', label: '상품 구성', content: product.composition },
    { key: 'origin',      label: '원산지 정보', content: product.origin },
    { key: 'allergy',     label: '알레르기 정보', content: product.allergyInfo },
    { key: 'storage',     label: '보관 방법',   content: product.storageMethod },
    { key: 'expiry',      label: '소비기한',    content: formatDate(product.expiryDate) },
    { key: 'pickupTime',  label: '픽업 가능 시간', content: `${formatTime(product.pickupStart)} ~ ${formatTime(product.pickupEnd)}` },
    { key: 'cancel',      label: '취소/환불 규정', content: product.cancelPolicy },
    ...(product.storeNotice ? [{ key: 'notice', label: '매장 공지', content: product.storeNotice }] : []),
  ];

  return (
    <View style={styles.outer}>
      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>

        {/* 이미지 영역 (오버레이 헤더 포함) */}
        <View style={styles.imageArea}>
          <Text style={styles.emoji}>{product.emoji}</Text>

          {/* 상단 버튼 바 (오버레이) */}
          <SafeAreaView style={styles.imageHeader} edges={['top']}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.imageBtn}>
              <ArrowLeft size={20} color={colors.charcoalBlack} />
            </TouchableOpacity>
            <View style={styles.imageHeaderRight}>
              <TouchableOpacity style={styles.imageBtn}>
                <Share2 size={18} color={colors.charcoalBlack} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.imageBtn} onPress={() => handleLike(product.id)}>
                <Heart
                  size={18}
                  fill={product.liked ? colors.alertRed : 'none'}
                  color={product.liked ? colors.alertRed : colors.charcoalBlack}
                />
              </TouchableOpacity>
            </View>
          </SafeAreaView>

          {/* 배지 */}
          <View style={styles.badgesRow}>
            {product.badges?.map(b => (
              <View key={b} style={[
                styles.badge,
                (b.includes('마감') || b.includes('오늘까지')) && { backgroundColor: colors.warmOrange },
                b.includes('할인') && { backgroundColor: '#3B82F6' },
              ]}>
                <Text style={styles.badgeText}>{b}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 기본 정보 카드 */}
        <View style={styles.card}>
          <Text style={styles.productName}>{product.name}</Text>
          <TouchableOpacity
            style={styles.storeRow}
            onPress={() => navigation.navigate('Store', { storeId: product.storeId })}
          >
            <MapPin size={13} color={colors.primaryGreen} />
            <Text style={styles.storeName}>{product.store}</Text>
            <ChevronDown size={13} color={colors.primaryGreen} style={{ transform: [{ rotate: '-90deg' }] }} />
          </TouchableOpacity>

          {/* 가격 */}
          <View style={styles.priceArea}>
            <View style={styles.priceRow}>
              <Text style={styles.originalPrice}>정가 {product.originalPrice.toLocaleString()}원</Text>
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>{product.discountRate}%</Text>
              </View>
            </View>
            <Text style={styles.salePrice}>{product.salePrice.toLocaleString()}원</Text>
          </View>

          {/* 정보 그리드 */}
          <View style={styles.infoGrid}>
            {[
              { label: '남은 수량',      value: isSoldout ? '품절' : `${product.stock}개`, warn: isSoldout },
              { label: '픽업 가능 시간', value: `${formatTime(product.pickupStart)}~${formatTime(product.pickupEnd)}` },
              { label: '소비기한',       value: formatDate(product.expiryDate), warn: isExpired },
              { label: '보관 방법',      value: product.storage },
            ].map(item => (
              <View key={item.label} style={styles.infoGridItem}>
                <Text style={styles.infoGridLabel}>{item.label}</Text>
                <Text style={[styles.infoGridValue, item.warn && { color: colors.alertRed }]}>{item.value}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 구매 전 주의사항 */}
        <View style={styles.noticeCard}>
          <View style={styles.noticeHeader}>
            <AlertTriangle size={16} color={colors.warmOrange} />
            <Text style={styles.noticeTitle}>구매 전 꼭 확인해주세요</Text>
          </View>
          {[
            '이 상품은 소비기한이 임박한 상품입니다.',
            '구매 후 지정된 시간 안에 매장에서 직접 픽업해야 합니다.',
            '픽업 후에는 식품 특성상 단순 변심 환불이 어려울 수 있습니다.',
            '알레르기 정보와 보관 방법을 확인해주세요.',
          ].map((t, i) => (
            <Text key={i} style={styles.noticeItem}>• {t}</Text>
          ))}
        </View>

        {/* 픽업 장소 지도 */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>픽업 장소</Text>
          <View style={styles.mapPlaceholder}>
            <MapGrid />
            <View style={{ zIndex: 1, alignItems: 'center' }}>
              <Text style={{ fontSize: 28 }}>📍</Text>
              <View style={styles.mapLabel}>
                <Text style={styles.mapLabelText}>{product.store}</Text>
              </View>
            </View>
          </View>
          <View style={styles.addressRow}>
            <MapPin size={13} color={colors.mediumGray} />
            <Text style={styles.addressText}>{product.pickupAddress}</Text>
          </View>
          <View style={{ height: 4 }} />
        </View>

        {/* 상세 섹션 (아코디언) */}
        <View style={styles.accordionCard}>
          {sections.map((sec, idx) => (
            <View key={sec.key} style={idx > 0 ? styles.accordionBorder : undefined}>
              <TouchableOpacity
                style={styles.accordionRow}
                onPress={() => setExpandedSection(expandedSection === sec.key ? null : sec.key)}
              >
                <Text style={styles.accordionLabel}>{sec.label}</Text>
                {expandedSection === sec.key
                  ? <ChevronUp size={16} color={colors.mediumGray} />
                  : <ChevronDown size={16} color={colors.mediumGray} />}
              </TouchableOpacity>
              {expandedSection === sec.key && (
                <View style={styles.accordionContent}>
                  <Text style={styles.accordionText}>{sec.content}</Text>
                </View>
              )}
            </View>
          ))}
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* 고정 하단 바 */}
      <View style={styles.bottomBar}>
        {!btnDisabled && (
          <View style={styles.qtyControl}>
            <TouchableOpacity
              onPress={() => setQty(q => Math.max(1, q - 1))}
              style={styles.qtyBtn}
            >
              <Text style={styles.qtyBtnText}>−</Text>
            </TouchableOpacity>
            <Text style={styles.qtyValue}>{qty}</Text>
            <TouchableOpacity
              onPress={() => setQty(q => Math.min(product.stock, q + 1))}
              style={styles.qtyBtn}
            >
              <Text style={styles.qtyBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        )}
        <TouchableOpacity
          style={[styles.orderBtn, btnDisabled && styles.orderBtnDisabled]}
          onPress={() => !btnDisabled && navigation.navigate('Order', { productId: product.id, qty })}
          disabled={btnDisabled}
        >
          <Text style={styles.orderBtnText}>{btnLabel}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function MapGrid() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={{ position: 'absolute', top: '35%', left: 0, right: 0, height: 7, backgroundColor: 'rgba(255,255,255,0.6)', borderRadius: 4 }} />
      <View style={{ position: 'absolute', left: '40%', top: 0, bottom: 0, width: 7, backgroundColor: 'rgba(255,255,255,0.6)', borderRadius: 4 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  outer: { flex: 1, backgroundColor: colors.softGray },

  /* 이미지 영역 */
  imageArea: {
    height: 280, backgroundColor: '#E8F0E8',
    alignItems: 'center', justifyContent: 'center',
    position: 'relative', overflow: 'hidden',
  },
  emoji: { fontSize: 100 },
  imageHeader: {
    position: 'absolute', top: 0, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'space-between',
    paddingHorizontal: 14, paddingTop: 4,
  },
  imageHeaderRight: { flexDirection: 'row', gap: 8 },
  imageBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center', justifyContent: 'center',
  },
  badgesRow: {
    position: 'absolute', bottom: 12, left: 12,
    flexDirection: 'row', gap: 6,
  },
  badge: {
    backgroundColor: colors.primaryGreen,
    paddingHorizontal: 9, paddingVertical: 4, borderRadius: 8,
  },
  badgeText: { color: colors.white, fontSize: 12, fontWeight: '700' },

  /* 기본 정보 카드 */
  card: { backgroundColor: colors.white, padding: 16, marginBottom: 8 },
  productName: { fontSize: 20, fontWeight: '800', color: colors.charcoalBlack, marginBottom: 6 },
  storeRow: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingBottom: 16, paddingTop: 2,
  },
  storeName: { flex: 1, fontSize: 14, fontWeight: '600', color: colors.primaryGreen },

  priceArea: { marginBottom: 16 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  originalPrice: { fontSize: 13, color: colors.mediumGray, textDecorationLine: 'line-through' },
  discountBadge: {
    backgroundColor: '#FEE2E2', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6,
  },
  discountText: { fontSize: 13, fontWeight: '700', color: colors.alertRed },
  salePrice: { fontSize: 28, fontWeight: '900', color: colors.primaryGreen },

  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  infoGridItem: {
    width: '47%', backgroundColor: colors.softGray,
    borderRadius: 10, padding: 12,
  },
  infoGridLabel: { fontSize: 11, color: colors.mediumGray, marginBottom: 4 },
  infoGridValue: { fontSize: 13, fontWeight: '700', color: colors.charcoalBlack },

  cardTitle: { fontSize: 14, fontWeight: '800', color: colors.mediumGray, marginBottom: 12 },

  /* 주의사항 */
  noticeCard: { backgroundColor: '#FFF8E6', padding: 16, marginBottom: 8 },
  noticeHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  noticeTitle: { fontSize: 14, fontWeight: '700', color: colors.warmOrange },
  noticeItem: { fontSize: 13, color: '#7A5C1E', lineHeight: 22, marginTop: 2 },

  /* 픽업 지도 */
  mapPlaceholder: {
    height: 160, borderRadius: 14, backgroundColor: '#E8F4E8',
    overflow: 'hidden', marginBottom: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  mapLabel: {
    marginTop: 6, backgroundColor: colors.primaryGreen,
    borderRadius: 8, paddingHorizontal: 12, paddingVertical: 4,
  },
  mapLabelText: { fontSize: 12, fontWeight: '700', color: colors.white },
  addressRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  addressText: { flex: 1, fontSize: 13, color: colors.mediumGray },

  /* 아코디언 */
  accordionCard: { backgroundColor: colors.white, marginBottom: 8 },
  accordionBorder: { borderTopWidth: 1, borderTopColor: colors.softGray },
  accordionRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 14, paddingHorizontal: 16,
  },
  accordionLabel: { fontSize: 14, fontWeight: '600', color: colors.charcoalBlack },
  accordionContent: { paddingHorizontal: 16, paddingBottom: 14 },
  accordionText: { fontSize: 13, color: colors.charcoalBlack, lineHeight: 21 },

  /* 하단 고정 바 */
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: colors.white,
    borderTopWidth: 1, borderTopColor: colors.softGray,
    padding: 12, flexDirection: 'row', gap: 12, alignItems: 'center',
    paddingBottom: 24,
  },
  qtyControl: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: '#E8EAED', borderRadius: 12, overflow: 'hidden',
  },
  qtyBtn: { width: 40, height: 48, alignItems: 'center', justifyContent: 'center' },
  qtyBtnText: { fontSize: 20, color: colors.charcoalBlack, fontWeight: '500' },
  qtyValue: {
    width: 32, textAlign: 'center',
    fontSize: 16, fontWeight: '700', color: colors.charcoalBlack,
  },
  orderBtn: {
    flex: 1, backgroundColor: colors.primaryGreen,
    borderRadius: 14, paddingVertical: 14, alignItems: 'center',
  },
  orderBtnDisabled: { backgroundColor: colors.mediumGray },
  orderBtnText: { color: colors.white, fontSize: 16, fontWeight: '800' },
});
