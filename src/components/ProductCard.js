import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Heart, Clock } from 'lucide-react-native';
import { colors } from '../theme';

function formatPickupTime(isoStart, isoEnd) {
  const fmt = iso => {
    const d = new Date(iso);
    return `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
  };
  return `픽업 ${fmt(isoStart)}~${fmt(isoEnd)}`;
}

export default function ProductCard({ product, onPress, onLike }) {
  const soldout = product.status === 'soldout';

  return (
    <TouchableOpacity
      style={[styles.card, soldout && styles.cardSoldout]}
      onPress={() => !soldout && onPress?.(product)}
      activeOpacity={soldout ? 1 : 0.85}
    >
      {/* 이미지 영역 */}
      <View style={styles.imageBox}>
        <Text style={styles.emoji}>{product.emoji || '🍱'}</Text>
        {soldout && (
          <View style={styles.soldoutOverlay}>
            <Text style={styles.soldoutText}>품절</Text>
          </View>
        )}
        {/* 배지 */}
        <View style={styles.badges}>
          {product.badges?.filter(b => b !== '품절').slice(0, 2).map(b => (
            <View key={b} style={[
              styles.badge,
              b.includes('마감') && { backgroundColor: colors.warmOrange },
              b.includes('할인') && { backgroundColor: '#3B82F6' },
            ]}>
              <Text style={styles.badgeText}>{b}</Text>
            </View>
          ))}
        </View>
        {/* 찜 버튼 */}
        <TouchableOpacity style={styles.likeBtn} onPress={() => onLike?.(product.id)}>
          <Heart
            size={16}
            color={product.liked ? colors.alertRed : colors.white}
            fill={product.liked ? colors.alertRed : 'none'}
          />
        </TouchableOpacity>
      </View>

      {/* 정보 영역 */}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{product.name}</Text>
        <Text style={styles.store} numberOfLines={1}>{product.store} · {product.distance}m</Text>

        <View style={styles.priceRow}>
          <View style={styles.priceLeft}>
            <Text style={styles.originalPrice}>{product.originalPrice.toLocaleString()}원</Text>
            <Text style={styles.salePrice}>{product.salePrice.toLocaleString()}원</Text>
          </View>
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>-{product.discountRate}%</Text>
          </View>
        </View>

        <View style={styles.pickupRow}>
          <Clock size={11} color={colors.warmOrange} />
          <Text style={styles.pickupText}>
            {formatPickupTime(product.pickupStart, product.pickupEnd)}
          </Text>
          <Text style={styles.stockText}>남은 수량 {product.stock}개</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  cardSoldout: { opacity: 0.6 },
  imageBox: {
    height: 160,
    backgroundColor: colors.softGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: { fontSize: 64 },
  soldoutOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  soldoutText: { color: colors.white, fontSize: 18, fontWeight: '800' },
  badges: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    gap: 4,
  },
  badge: {
    backgroundColor: colors.primaryGreen,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: { color: colors.white, fontSize: 11, fontWeight: '700' },
  likeBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: { padding: 12 },
  name: { fontSize: 15, fontWeight: '700', color: colors.charcoalBlack, marginBottom: 3 },
  store: { fontSize: 12, color: colors.mediumGray, marginBottom: 8 },
  priceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  priceLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  originalPrice: { fontSize: 12, color: colors.mediumGray, textDecorationLine: 'line-through' },
  salePrice: { fontSize: 17, fontWeight: '900', color: colors.primaryGreen },
  discountBadge: { backgroundColor: '#FFF0E6', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  discountText: { fontSize: 12, fontWeight: '700', color: colors.warmOrange },
  pickupRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  pickupText: { fontSize: 11, color: colors.mediumGray, flex: 1 },
  stockText: { fontSize: 11, color: colors.mediumGray },
});
