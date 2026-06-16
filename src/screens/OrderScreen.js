import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Tag, ChevronRight, X, MapPin, Clock, CreditCard } from 'lucide-react-native';
import { colors } from '../theme';
import { useApp } from '../context/AppContext';

function generateOrderId() {
  const now = new Date();
  const d = `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}`;
  const seq = String(Math.floor(Math.random() * 900) + 100);
  return `ORD-${d}-${seq}`;
}

function calcCouponDiscount(coupon, subtotal) {
  if (!coupon) return 0;
  if (coupon.discountType === '정액') return Math.min(coupon.discountValue, subtotal);
  return Math.floor(subtotal * coupon.discountValue / 100);
}

const PAYMENT_METHODS = [
  { key: 'card', label: '신용/체크카드', Icon: CreditCard },
  { key: 'kakao', label: '카카오페이', Icon: null },
  { key: 'naver', label: '네이버페이', Icon: null },
  { key: 'toss', label: '토스페이', Icon: null },
];

export default function OrderScreen({ route, navigation }) {
  const { productId, qty } = route.params;
  const { productList, coupons, handleOrderComplete } = useApp();
  const product = productList.find(p => p.id === productId);

  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [showCouponSheet, setShowCouponSheet] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [checks, setChecks] = useState([false, false, false]);

  if (!product) return null;

  const subtotal = product.salePrice * qty;
  const originalTotal = product.originalPrice * qty;
  const productDiscount = originalTotal - subtotal;
  const couponDiscount = calcCouponDiscount(selectedCoupon, subtotal);
  const finalPrice = subtotal - couponDiscount;

  const allChecked = checks.every(Boolean);

  function formatTime(iso) {
    const d = new Date(iso);
    return `${d.getHours()}:${String(d.getMinutes()).padStart(2,'0')}`;
  }

  function handlePay() {
    if (!allChecked) return;
    const now = new Date();
    const order = {
      id: generateOrderId(),
      productId: product.id,
      productName: product.name,
      store: product.store,
      storeId: product.storeId,
      storeAddress: product.pickupAddress,
      pickupTime: `오늘 ${formatTime(product.pickupStart)}~${formatTime(product.pickupEnd)}`,
      quantity: qty,
      totalPrice: subtotal,
      discountedPrice: finalPrice,
      couponName: selectedCoupon?.name || null,
      status: 'pickupReady',
      orderedAt: now.toISOString(),
    };
    handleOrderComplete(order);
    navigation.replace('OrderComplete', { order });
  }

  const availableCoupons = coupons.filter(c => subtotal >= c.minOrderAmount);
  const unavailableCoupons = coupons.filter(c => subtotal < c.minOrderAmount);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={22} color={colors.charcoalBlack} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>주문/결제</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 픽업 정보 */}
        <View style={styles.card}>
          <View style={styles.infoRow}>
            <Text style={styles.label}>픽업 매장</Text>
            <Text style={styles.value}>{product.store}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>픽업 가능 시간</Text>
            <Text style={styles.value}>{formatTime(product.pickupStart)} ~ {formatTime(product.pickupEnd)}</Text>
          </View>
          <View style={[styles.infoRow, { marginBottom: 0 }]}>
            <Text style={styles.label}>픽업 장소</Text>
            <Text style={[styles.value, { color: colors.mediumGray, fontSize: 12 }]}>{product.pickupAddress}</Text>
          </View>
        </View>

        {/* 쿠폰 */}
        <TouchableOpacity style={styles.couponRow} onPress={() => setShowCouponSheet(true)}>
          <Tag size={16} color={colors.primaryGreen} />
          <Text style={styles.couponLabel}>
            {selectedCoupon ? selectedCoupon.name : `쿠폰  ${availableCoupons.length}장 사용 가능`}
          </Text>
          <ChevronRight size={16} color={colors.mediumGray} />
        </TouchableOpacity>

        {/* 결제 수단 */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>결제 수단</Text>
          <View style={styles.payGrid}>
            {PAYMENT_METHODS.map(m => (
              <TouchableOpacity
                key={m.key}
                style={[styles.payBtn, paymentMethod === m.key && styles.payBtnActive]}
                onPress={() => setPaymentMethod(m.key)}
              >
                <Text style={[styles.payLabel, paymentMethod === m.key && styles.payLabelActive]}>{m.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 결제 금액 */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>결제 금액</Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>상품 금액</Text>
            <Text style={styles.priceValue}>{originalTotal.toLocaleString()}원</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>상품 할인</Text>
            <Text style={[styles.priceValue, { color: colors.alertRed }]}>-{productDiscount.toLocaleString()}원</Text>
          </View>
          {couponDiscount > 0 && (
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>쿠폰 할인</Text>
              <Text style={[styles.priceValue, { color: colors.alertRed }]}>-{couponDiscount.toLocaleString()}원</Text>
            </View>
          )}
          <View style={[styles.priceRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>최종 결제</Text>
            <Text style={styles.totalValue}>{finalPrice.toLocaleString()}원</Text>
          </View>
        </View>

        {/* 필수 확인 */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>구매 전 필수 확인</Text>
          {['소비기한 임박 상품임을 확인했습니다.', '지정된 픽업 시간 내 방문해야 함을 확인했습니다.', '픽업 후 단순 변심 환불이 제한될 수 있음을 확인했습니다.'].map((txt, i) => (
            <TouchableOpacity key={i} style={styles.checkRow} onPress={() => setChecks(prev => prev.map((v, j) => j === i ? !v : v))}>
              <View style={[styles.checkbox, checks[i] && styles.checkboxChecked]}>
                {checks[i] && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.checkText}>{txt}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* 결제 버튼 */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.payNowBtn, !allChecked && styles.payNowBtnDisabled]}
          onPress={handlePay}
          disabled={!allChecked}
        >
          <Text style={styles.payNowText}>{allChecked ? `${finalPrice.toLocaleString()}원 결제하기` : '위 내용을 모두 확인해주세요'}</Text>
        </TouchableOpacity>
      </View>

      {/* 쿠폰 바텀시트 */}
      <Modal visible={showCouponSheet} transparent animationType="slide">
        <TouchableOpacity style={styles.overlay} onPress={() => setShowCouponSheet(false)} />
        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>쿠폰 선택</Text>
            <TouchableOpacity onPress={() => setShowCouponSheet(false)}>
              <X size={20} color={colors.charcoalBlack} />
            </TouchableOpacity>
          </View>
          {selectedCoupon && (
            <TouchableOpacity style={styles.removeCoupon} onPress={() => { setSelectedCoupon(null); setShowCouponSheet(false); }}>
              <Text style={styles.removeCouponText}>쿠폰 사용 안함</Text>
            </TouchableOpacity>
          )}
          {availableCoupons.map(c => (
            <TouchableOpacity
              key={c.id}
              style={[styles.couponItem, selectedCoupon?.id === c.id && styles.couponItemSelected]}
              onPress={() => { setSelectedCoupon(c); setShowCouponSheet(false); }}
            >
              <View style={styles.couponItemLeft}>
                <Text style={styles.couponItemDiscount}>
                  {c.discountType === '정액' ? `${c.discountValue.toLocaleString()}원` : `${c.discountValue}%`} 할인
                </Text>
                <Text style={styles.couponItemName}>{c.name}</Text>
                <Text style={styles.couponItemCond}>{c.minOrderAmount.toLocaleString()}원 이상 · ~{c.endDate}</Text>
              </View>
              {selectedCoupon?.id === c.id && <Text style={styles.couponCheck}>✓</Text>}
            </TouchableOpacity>
          ))}
          {unavailableCoupons.map(c => (
            <View key={c.id} style={[styles.couponItem, styles.couponItemUnavail]}>
              <View style={styles.couponItemLeft}>
                <Text style={[styles.couponItemDiscount, { color: colors.mediumGray }]}>
                  {c.discountType === '정액' ? `${c.discountValue.toLocaleString()}원` : `${c.discountValue}%`} 할인
                </Text>
                <Text style={[styles.couponItemName, { color: colors.mediumGray }]}>{c.name}</Text>
                <Text style={styles.couponItemCond}>{c.minOrderAmount.toLocaleString()}원 이상 필요</Text>
              </View>
            </View>
          ))}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.softGray },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.white, paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.softGray },
  backBtn: { padding: 2 },
  headerTitle: { fontSize: 17, fontWeight: '800', color: colors.charcoalBlack },
  card: { backgroundColor: colors.white, padding: 16, marginBottom: 8 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: colors.mediumGray, marginBottom: 12 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  label: { fontSize: 13, color: colors.mediumGray },
  value: { fontSize: 13, fontWeight: '700', color: colors.charcoalBlack },
  couponRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.white, padding: 16, marginBottom: 8 },
  couponLabel: { flex: 1, fontSize: 14, color: colors.charcoalBlack },
  payGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  payBtn: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, borderWidth: 1.5, borderColor: colors.softGray },
  payBtnActive: { borderColor: colors.primaryGreen, backgroundColor: colors.freshMint },
  payLabel: { fontSize: 13, color: colors.mediumGray },
  payLabelActive: { color: colors.primaryGreen, fontWeight: '700' },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  priceLabel: { fontSize: 13, color: colors.mediumGray },
  priceValue: { fontSize: 13, color: colors.charcoalBlack },
  totalRow: { borderTopWidth: 1, borderTopColor: colors.softGray, paddingTop: 10, marginTop: 4, marginBottom: 0 },
  totalLabel: { fontSize: 15, fontWeight: '800', color: colors.charcoalBlack },
  totalValue: { fontSize: 17, fontWeight: '900', color: colors.primaryGreen },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: colors.softGray, backgroundColor: colors.softGray, alignItems: 'center', justifyContent: 'center' },
  checkboxChecked: { backgroundColor: colors.primaryGreen, borderColor: colors.primaryGreen },
  checkmark: { color: colors.white, fontSize: 13, fontWeight: '900' },
  checkText: { flex: 1, fontSize: 13, color: colors.charcoalBlack },
  footer: { padding: 16, backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.softGray },
  payNowBtn: { backgroundColor: colors.primaryGreen, borderRadius: 14, padding: 16, alignItems: 'center' },
  payNowBtnDisabled: { backgroundColor: '#C8CDD3' },
  payNowText: { color: colors.white, fontSize: 16, fontWeight: '800' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  sheet: { backgroundColor: colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 40, maxHeight: '70%' },
  sheetHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: colors.softGray, alignSelf: 'center', marginBottom: 16 },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sheetTitle: { fontSize: 17, fontWeight: '800', color: colors.charcoalBlack },
  removeCoupon: { paddingVertical: 12, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: colors.softGray, marginBottom: 8 },
  removeCouponText: { fontSize: 14, color: colors.mediumGray },
  couponItem: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: colors.softGray, borderRadius: 12, padding: 14, marginBottom: 8 },
  couponItemSelected: { borderColor: colors.primaryGreen, backgroundColor: colors.freshMint },
  couponItemUnavail: { opacity: 0.5 },
  couponItemLeft: { flex: 1 },
  couponItemDiscount: { fontSize: 16, fontWeight: '900', color: colors.primaryGreen, marginBottom: 2 },
  couponItemName: { fontSize: 13, color: colors.charcoalBlack, marginBottom: 4 },
  couponItemCond: { fontSize: 11, color: colors.mediumGray },
  couponCheck: { fontSize: 18, color: colors.primaryGreen, fontWeight: '900' },
});
