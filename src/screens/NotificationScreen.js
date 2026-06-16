import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Heart, Megaphone, ShoppingBag, MapPin } from 'lucide-react-native';
import { colors } from '../theme';

const NOTIFS = [
  { id: 1, type: 'liked_closing', title: '찜한 상품이 마감 임박이에요!', body: '딸기 생크림 케이크 조각 · 파리바게뜨 선릉점', time: new Date(Date.now() - 5*60000).toISOString(), read: false },
  { id: 2, type: 'order_complete', title: '결제가 완료되었어요', body: '닭가슴살 샐러드 · ORD-20240615-1024', time: new Date(Date.now() - 2*3600000).toISOString(), read: false },
  { id: 3, type: 'pickup', title: '픽업 시간 30분 전이에요!', body: '그린샐러드 강남점에서 픽업을 준비해주세요', time: new Date(Date.now() - 3*3600000).toISOString(), read: true },
  { id: 4, type: 'ad', title: '오늘의 특가 상품을 확인하세요 🎉', body: '지금 최대 70% 할인 상품이 등록되었어요', time: new Date(Date.now() - 86400000).toISOString(), read: true },
  { id: 5, type: 'liked_closing', title: '찜한 상품이 곧 마감돼요', body: '두부 반찬 세트 · 자연반찬 강남점', time: new Date(Date.now() - 2*86400000).toISOString(), read: true },
];

const TYPE_CONFIG = {
  liked_closing: { Icon: Heart,       color: '#E5484D', bg: '#FFF0F0' },
  ad:            { Icon: Megaphone,   color: colors.primaryGreen, bg: colors.freshMint },
  order_complete:{ Icon: ShoppingBag, color: '#7C3AED', bg: '#F3E8FF' },
  pickup:        { Icon: MapPin,      color: colors.warmOrange, bg: '#FFF3E0' },
};

function formatTime(iso) {
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (diff < 60) return '방금 전';
  if (diff < 3600) return `${Math.floor(diff/60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff/3600)}시간 전`;
  const d = new Date(iso);
  return `${d.getMonth()+1}.${d.getDate()}`;
}

function getGroup(iso) {
  const diff = Math.floor((Date.now() - new Date(iso)) / 86400000);
  if (diff < 1) return '오늘';
  if (diff < 2) return '어제';
  if (diff < 7) return '이번 주';
  return '이전';
}

export default function NotificationScreen({ navigation }) {
  const unreadCount = NOTIFS.filter(n => !n.read).length;

  const grouped = NOTIFS.reduce((acc, n) => {
    const g = getGroup(n.time);
    if (!acc[g]) acc[g] = [];
    acc[g].push(n);
    return acc;
  }, {});

  const groupOrder = ['오늘', '어제', '이번 주', '이전'];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={22} color={colors.charcoalBlack} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>알림</Text>
        {unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>새 알림 {unreadCount}</Text>
          </View>
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
        {groupOrder.filter(g => grouped[g]).map(g => (
          <View key={g}>
            <Text style={styles.groupLabel}>{g}</Text>
            {grouped[g].map(n => {
              const cfg = TYPE_CONFIG[n.type];
              const Icon = cfg.Icon;
              return (
                <View key={n.id} style={[styles.notifItem, !n.read && styles.notifUnread]}>
                  <View style={[styles.iconWrap, { backgroundColor: cfg.bg }]}>
                    <Icon size={18} color={cfg.color} fill={n.type === 'liked_closing' ? cfg.color : 'none'} />
                    {!n.read && <View style={styles.unreadDot} />}
                  </View>
                  <View style={styles.notifContent}>
                    <Text style={[styles.notifTitle, !n.read && styles.notifTitleBold]}>{n.title}</Text>
                    <Text style={styles.notifBody} numberOfLines={1}>{n.body}</Text>
                    <Text style={styles.notifTime}>{formatTime(n.time)}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.softGray },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.white, paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.softGray },
  backBtn: { padding: 2 },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: '800', color: colors.charcoalBlack },
  unreadBadge: { backgroundColor: colors.primaryGreen, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 3 },
  unreadText: { color: colors.white, fontSize: 11, fontWeight: '700' },
  list: { paddingBottom: 60 },
  groupLabel: { fontSize: 12, fontWeight: '700', color: colors.mediumGray, paddingHorizontal: 16, paddingVertical: 10 },
  notifItem: { flexDirection: 'row', gap: 12, backgroundColor: colors.white, paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.softGray },
  notifUnread: { backgroundColor: '#F0FAF4' },
  iconWrap: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', flexShrink: 0, position: 'relative' },
  unreadDot: { position: 'absolute', top: 0, right: 0, width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primaryGreen, borderWidth: 2, borderColor: colors.white },
  notifContent: { flex: 1 },
  notifTitle: { fontSize: 14, color: colors.charcoalBlack, lineHeight: 20, marginBottom: 2 },
  notifTitleBold: { fontWeight: '700' },
  notifBody: { fontSize: 12, color: colors.mediumGray, marginBottom: 4 },
  notifTime: { fontSize: 11, color: colors.mediumGray },
});
