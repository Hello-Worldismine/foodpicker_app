import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CheckCircle, Navigation, ClipboardList } from 'lucide-react-native';
import { colors } from '../theme';

export default function OrderCompleteScreen({ route, navigation }) {
  const { order } = route.params;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* 성공 헤더 */}
        <View style={styles.successHeader}>
          <View style={styles.checkCircle}>
            <CheckCircle size={44} color={colors.white} />
          </View>
          <Text style={styles.successTitle}>예약이 완료되었어요!</Text>
          <Text style={styles.successSub}>픽업 시간에 맞춰 방문해주세요</Text>
        </View>

        {/* 픽업 번호 */}
        <View style={styles.pickupCard}>
          <Text style={styles.pickupLabel}>픽업번호</Text>
          <Text style={styles.pickupId}>{order.id}</Text>
          <View style={styles.qrBox}>
            <Text style={styles.qrPlaceholder}>■ ■ □</Text>
            <Text style={styles.qrPlaceholder}>□ ■ □</Text>
            <Text style={styles.qrPlaceholder}>■ □ ■</Text>
          </View>
          <Text style={styles.pickupHint}>매장 직원에게 픽업번호를 보여주세요.</Text>
        </View>

        {/* 예약 정보 */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>예약 정보</Text>
          {[
            ['상품명', order.productName],
            ['픽업 시간', order.pickupTime],
            ['픽업 매장', order.store],
            ['매장 주소', order.storeAddress],
            ['결제 금액', `${order.discountedPrice.toLocaleString()}원`],
          ].map(([label, val]) => (
            <View key={label} style={styles.infoRow}>
              <Text style={styles.infoLabel}>{label}</Text>
              <Text style={[styles.infoValue, label === '결제 금액' && { color: colors.primaryGreen, fontWeight: '800' }]}>{val}</Text>
            </View>
          ))}
        </View>

        {/* 알림 안내 */}
        <View style={styles.alertBanner}>
          <Text style={styles.alertText}>📍 픽업 30분 전에 알림을 보내드릴게요</Text>
        </View>

        {/* 버튼 */}
        <View style={styles.buttons}>
          <TouchableOpacity style={styles.mapBtn}>
            <Navigation size={16} color={colors.primaryGreen} />
            <Text style={styles.mapBtnText}>길찾기</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.ordersBtn}
            onPress={() => navigation.reset({ index: 0, routes: [{ name: 'MainTabs', params: { screen: 'Orders' } }] })}
          >
            <ClipboardList size={16} color={colors.white} />
            <Text style={styles.ordersBtnText}>주문내역 보기</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.homeLink}
          onPress={() => navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] })}
        >
          <Text style={styles.homeLinkText}>홈으로 돌아가기</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.softGray },
  content: { padding: 16, paddingBottom: 40 },
  successHeader: { backgroundColor: colors.primaryGreen, borderRadius: 20, padding: 28, alignItems: 'center', marginBottom: 16 },
  checkCircle: { width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  successTitle: { fontSize: 22, fontWeight: '900', color: colors.white, marginBottom: 6 },
  successSub: { fontSize: 14, color: 'rgba(255,255,255,0.85)' },
  pickupCard: { backgroundColor: colors.white, borderRadius: 16, padding: 20, alignItems: 'center', marginBottom: 12 },
  pickupLabel: { fontSize: 12, color: colors.mediumGray, marginBottom: 6 },
  pickupId: { fontSize: 22, fontWeight: '900', color: colors.primaryGreen, letterSpacing: 1, marginBottom: 16 },
  qrBox: { backgroundColor: colors.softGray, borderRadius: 12, padding: 20, alignItems: 'center', gap: 4, marginBottom: 12 },
  qrPlaceholder: { fontSize: 28, letterSpacing: 8, color: colors.charcoalBlack },
  pickupHint: { fontSize: 12, color: colors.mediumGray },
  infoCard: { backgroundColor: colors.white, borderRadius: 16, padding: 16, marginBottom: 12 },
  infoTitle: { fontSize: 15, fontWeight: '800', color: colors.charcoalBlack, marginBottom: 12 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  infoLabel: { fontSize: 13, color: colors.mediumGray },
  infoValue: { fontSize: 13, color: colors.charcoalBlack, flex: 1, textAlign: 'right' },
  alertBanner: { backgroundColor: colors.freshMint, borderRadius: 12, padding: 14, marginBottom: 16, alignItems: 'center' },
  alertText: { fontSize: 13, color: colors.primaryGreen, fontWeight: '600' },
  buttons: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  mapBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderWidth: 1.5, borderColor: colors.primaryGreen, borderRadius: 14, padding: 14 },
  mapBtnText: { fontSize: 15, fontWeight: '700', color: colors.primaryGreen },
  ordersBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: colors.primaryGreen, borderRadius: 14, padding: 14 },
  ordersBtnText: { fontSize: 15, fontWeight: '700', color: colors.white },
  homeLink: { alignItems: 'center', padding: 8 },
  homeLinkText: { fontSize: 13, color: colors.mediumGray },
});
