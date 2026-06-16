import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Heart, Clock } from 'lucide-react-native';
import { colors } from '../theme';

function formatPickupTime(isoStart, isoEnd) {
  const fmt = iso => {
    const d = new Date(iso);
    return `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
  };
  return `${fmt(isoStart)}~${fmt(isoEnd)}`;
}

export default function ProductCard({ product, onPress, onLike, onStorePress }) {
  const soldout = product.status === 'soldout';
  const badges = product.badges?.filter(b => b !== '품절') || [];
  const hasMagam = badges.some(b => b.includes('마감'));

  return (
    <TouchableOpacity
      style={[styles.card, soldout && styles.cardSoldout]}
      onPress={() => !soldout && onPress?.(product)}
      activeOpacity={soldout ? 1 : 0.85}
    >
      {/* 이미지 영역 */}
      <View style={[styles.imageBox, hasMagam && styles.imageBoxMagam]}>
        <Text style={styles.emoji}>{product.emoji || '🍱'}</Text>

        {soldout && (
          <View style={styles.soldoutOverlay}>
            <Text style={styles.soldoutText}>품절</Text>
          </View>
        )}

        {/* 상단 좌측 배지 (마감임박, 오늘까지 등) */}
        <View style={styles.topLeftBadges}>
          {badges.map((b, i) => (
            <View key={i} style={[
              styles.badge,
              b.includes('마감') && styles.badgeMagam,
              b.includes('오늘') && styles.badgeToday,
              b.includes('픽업') && styles.badgePickup,
              b.includes('할인') && styles.badgeDiscount,
            ]}>
              <Text style={[
                styles.badgeText,
                b.includes('오늘') && styles.badgeTodayText,
              ]}>{b}</Text>
            </View>
          ))}
        </View>

        {/* 상단 우측 할인율 */}
        <View style={styles.discountBadge}>
          <Text style={styles.discountText}>-{product.discountRate}%</Text>
        </View>

        {/* 하단 우측 찜 버튼 */}
        <TouchableOpacity style={styles.likeBtn} onPress={() => onLike?.(product.id)}>
          <Heart
            size={16}
            color={product.liked ? colors.alertRed : colors.mediumGray}
            fill={product.liked ? colors.alertRed : 'none'}
            strokeWidth={2}
          />
        </TouchableOpacity>
      </View>

      {/* 정보 영역 */}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{product.name}</Text>
        <TouchableOpacity onPress={() => onStorePress?.(product.storeId)} hitSlop={{ top: 4, bottom: 4 }}>
          <Text style={styles.store} numberOfLines={1}>{product.store} · {product.distance >= 1000 ? `${(product.distance/1000).toFixed(1)}km` : `${product.distance}m`}</Text>
        </TouchableOpacity>

        <View style={styles.priceRow}>
          <Text style={styles.originalPrice}>{product.originalPrice.toLocaleString()}원</Text>
          <Text style={styles.salePrice}>{product.salePrice.toLocaleString()}원</Text>
        </View>

        <View style={styles.bottomRow}>
          <Text style={styles.stockText}>남은 수량 {product.stock}개</Text>
          <View style={styles.pickupRow}>
            <Clock size={11} color={colors.warmOrange} />
            <Text style={styles.pickupText}>
              픽업 {formatPickupTime(product.pickupStart, product.pickupEnd)}
            </Text>
          </View>
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
  cardSoldout: { opacity: 0.55 },
  imageBox: {
    height: 160,
    backgroundColor: '#F0F5F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageBoxMagam: { backgroundColor: '#FFF5EE' },
  emoji: { fontSize: 68 },
  soldoutOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.38)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  soldoutText: { color: colors.white, fontSize: 18, fontWeight: '800' },

  topLeftBadges: {
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
  badgeMagam: { backgroundColor: colors.warmOrange },
  badgeToday: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.primaryGreen },
  badgeTodayText: { color: colors.primaryGreen },
  badgePickup: { backgroundColor: '#3B82F6' },
  badgeDiscount: { backgroundColor: '#3B82F6' },
  badgeText: { color: colors.white, fontSize: 11, fontWeight: '700' },

  discountBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: colors.primaryGreen,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
  },
  discountText: { color: colors.white, fontSize: 12, fontWeight: '800' },

  likeBtn: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },

  info: { padding: 13 },
  name: { fontSize: 15, fontWeight: '700', color: colors.charcoalBlack, marginBottom: 3 },
  store: { fontSize: 12, color: colors.mediumGray, marginBottom: 9 },

  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 8 },
  originalPrice: { fontSize: 12, color: colors.mediumGray, textDecorationLine: 'line-through' },
  salePrice: { fontSize: 17, fontWeight: '900', color: colors.primaryGreen },

  bottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  stockText: { fontSize: 11, color: colors.mediumGray },
  pickupRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  pickupText: { fontSize: 11, color: colors.mediumGray },
});
