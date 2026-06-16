import React, { useState, useRef, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react-native';
import { colors } from '../theme';
import { useApp } from '../context/AppContext';

const STATUS_INFO = {
  pickupReady: { label: '픽업 대기', color: colors.primaryGreen, bg: colors.freshMint, Icon: Clock },
  pending:     { label: '픽업 대기', color: colors.primaryGreen, bg: colors.freshMint, Icon: Clock },
  completed:   { label: '픽업 완료', color: '#6B7280',           bg: '#F3F4F6',        Icon: CheckCircle },
  cancelling:  { label: '취소 요청', color: '#B45309',           bg: '#FEF3C7',        Icon: AlertCircle },
  cancelled:   { label: '취소됨',    color: colors.alertRed,     bg: '#FFF0F0',        Icon: XCircle },
};

const PAGE_SIZE = 10;

function formatDate(iso) {
  const d = new Date(iso);
  const diff = Math.floor((Date.now() - d) / 60000);
  if (diff < 1) return '방금 전';
  if (diff < 60) return `${diff}분 전`;
  if (diff < 1440) return `${Math.floor(diff/60)}시간 전`;
  if (diff < 10080) return `${Math.floor(diff/1440)}일 전`;
  return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}`;
}

function OrderCard({ order }) {
  const st = STATUS_INFO[order.status] || STATUS_INFO.pending;
  const { Icon } = st;
  return (
    <View style={styles.card}>
      <View style={[styles.iconBox, { backgroundColor: st.bg }]}>
        <Icon size={20} color={st.color} />
      </View>
      <View style={styles.info}>
        <View style={styles.topRow}>
          <View style={[styles.statusBadge, { backgroundColor: st.bg }]}>
            <Text style={[styles.statusText, { color: st.color }]}>{st.label}</Text>
          </View>
          <Text style={styles.dateText}>{formatDate(order.orderedAt)}</Text>
        </View>
        <Text style={styles.productName} numberOfLines={1}>{order.productName}</Text>
        <Text style={styles.storeName} numberOfLines={1}>{order.store}</Text>
      </View>
      <View style={styles.priceCol}>
        <Text style={styles.price}>{order.totalPrice.toLocaleString()}원</Text>
        <Text style={styles.orderId} numberOfLines={1}>{order.id}</Text>
      </View>
    </View>
  );
}

export default function MyOrderListScreen({ navigation }) {
  const { orders } = useApp();
  const sorted = [...orders].sort((a, b) => new Date(b.orderedAt) - new Date(a.orderedAt));
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [loading, setLoading] = useState(false);

  const visible = sorted.slice(0, visibleCount);
  const hasMore = visibleCount < sorted.length;

  function loadMore() {
    if (loading || !hasMore) return;
    setLoading(true);
    setTimeout(() => {
      setVisibleCount(prev => Math.min(prev + PAGE_SIZE, sorted.length));
      setLoading(false);
    }, 500);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={22} color={colors.charcoalBlack} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>주문내역</Text>
        <Text style={styles.headerCount}>총 {sorted.length}건</Text>
      </View>

      <FlatList
        data={visible}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <OrderCard order={item} />}
        contentContainerStyle={styles.list}
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        ListEmptyComponent={() => (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>📋</Text>
            <Text style={styles.emptyText}>아직 주문 내역이 없습니다</Text>
          </View>
        )}
        ListFooterComponent={() => (
          loading ? (
            <ActivityIndicator color={colors.primaryGreen} style={{ padding: 16 }} />
          ) : !hasMore && sorted.length > 0 ? (
            <Text style={styles.endText}>모든 주문내역을 불러왔습니다</Text>
          ) : null
        )}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.softGray },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.white, paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.softGray },
  backBtn: { padding: 2 },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: '800', color: colors.charcoalBlack },
  headerCount: { fontSize: 13, color: colors.mediumGray },
  list: { padding: 16, paddingBottom: 40 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.white, borderRadius: 16, padding: 14, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  iconBox: { width: 44, height: 44, borderRadius: 13, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  info: { flex: 1, minWidth: 0 },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  statusBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  statusText: { fontSize: 11, fontWeight: '700' },
  dateText: { fontSize: 11, color: colors.mediumGray },
  productName: { fontSize: 15, fontWeight: '700', color: colors.charcoalBlack },
  storeName: { fontSize: 12, color: colors.mediumGray, marginTop: 2 },
  priceCol: { alignItems: 'flex-end', flexShrink: 0 },
  price: { fontSize: 15, fontWeight: '800', color: colors.charcoalBlack },
  orderId: { fontSize: 10, color: colors.mediumGray, marginTop: 2, maxWidth: 90 },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyEmoji: { fontSize: 52, marginBottom: 14 },
  emptyText: { fontSize: 15, color: colors.mediumGray },
  endText: { textAlign: 'center', fontSize: 12, color: colors.mediumGray, padding: 16 },
});
