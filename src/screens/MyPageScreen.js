import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ClipboardList, Ticket, CreditCard, Bell, HelpCircle, FileText, LogOut, UserX, ChevronRight, User } from 'lucide-react-native';
import { colors } from '../theme';
import { useApp } from '../context/AppContext';

export default function MyPageScreen({ navigation }) {
  const { orders, coupons } = useApp();
  const pendingCount = orders.filter(o => o.status === 'pending' || o.status === 'pickupReady').length;

  const menuItems = [
    { key: 'orders',    Icon: ClipboardList, label: '주문내역',           badge: pendingCount > 0 ? String(pendingCount) : null, badgeStyle: 'green', onPress: () => navigation.navigate('MyOrders') },
    { key: 'coupons',   Icon: Ticket,        label: '쿠폰함',             badge: coupons.length > 0 ? `${coupons.length}장` : null, badgeStyle: 'mint',  onPress: () => navigation.navigate('Coupons') },
    { key: 'payment',   Icon: CreditCard,    label: '결제수단 관리' },
    { key: 'bell',      Icon: Bell,          label: '알림 설정' },
    { key: 'support',   Icon: HelpCircle,    label: '고객센터' },
    { key: 'faq',       Icon: FileText,      label: '자주 묻는 질문' },
    { key: 'terms',     Icon: FileText,      label: '약관 및 개인정보처리방침', onPress: () => navigation.navigate('Terms') },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 프로필 */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <User size={28} color={colors.primaryGreen} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>홍길동</Text>
            <Text style={styles.profileEmail}>gildong@email.com</Text>
          </View>
          <TouchableOpacity style={styles.editBtn}>
            <Text style={styles.editBtnText}>편집</Text>
          </TouchableOpacity>
        </View>

        {/* 환경 통계 */}
        <View style={styles.statsRow}>
          {[['12개', '구한 음식'], ['38,000원', '예상 절감'], ['4.2kg', '폐기 감소']].map(([val, lbl]) => (
            <View key={lbl} style={styles.statItem}>
              <Text style={styles.statValue}>{val}</Text>
              <Text style={styles.statLabel}>{lbl}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.statsNote}>* 수치는 예상값입니다</Text>

        {/* 메뉴 */}
        <View style={styles.menuCard}>
          {menuItems.map((item, i) => (
            <TouchableOpacity key={item.key} style={[styles.menuRow, i > 0 && styles.menuRowBorder]} onPress={item.onPress}>
              <item.Icon size={18} color={colors.charcoalBlack} />
              <Text style={styles.menuLabel}>{item.label}</Text>
              {item.badge && (
                <View style={[styles.badge, item.badgeStyle === 'mint' && styles.badgeMint]}>
                  <Text style={[styles.badgeText, item.badgeStyle === 'mint' && styles.badgeTextMint]}>{item.badge}</Text>
                </View>
              )}
              <ChevronRight size={16} color={colors.mediumGray} />
            </TouchableOpacity>
          ))}
        </View>

        {/* 계정 */}
        <View style={styles.menuCard}>
          <TouchableOpacity style={styles.menuRow}>
            <LogOut size={18} color={colors.mediumGray} />
            <Text style={[styles.menuLabel, { color: colors.mediumGray }]}>로그아웃</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.menuRow, styles.menuRowBorder]}>
            <UserX size={18} color={colors.alertRed} />
            <Text style={[styles.menuLabel, { color: colors.alertRed }]}>회원탈퇴</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.version}>푸드피커 v1.0.0</Text>
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.softGray },
  profileCard: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.white, padding: 20 },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: colors.freshMint, alignItems: 'center', justifyContent: 'center' },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 18, fontWeight: '800', color: colors.charcoalBlack },
  profileEmail: { fontSize: 13, color: colors.mediumGray, marginTop: 3 },
  editBtn: { backgroundColor: colors.softGray, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 7 },
  editBtnText: { fontSize: 13, fontWeight: '600', color: colors.charcoalBlack },
  statsRow: { flexDirection: 'row', gap: 8, backgroundColor: colors.white, paddingHorizontal: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: colors.softGray },
  statItem: { flex: 1, backgroundColor: colors.freshMint, borderRadius: 12, paddingVertical: 10, alignItems: 'center' },
  statValue: { fontSize: 14, fontWeight: '800', color: colors.primaryGreen },
  statLabel: { fontSize: 10, color: colors.mediumGray, marginTop: 2 },
  statsNote: { fontSize: 11, color: colors.mediumGray, textAlign: 'center', backgroundColor: colors.white, paddingBottom: 12 },
  menuCard: { backgroundColor: colors.white, borderRadius: 16, marginHorizontal: 16, marginTop: 12, overflow: 'hidden' },
  menuRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 15 },
  menuRowBorder: { borderTopWidth: 1, borderTopColor: colors.softGray },
  menuLabel: { flex: 1, fontSize: 15, color: colors.charcoalBlack },
  badge: { backgroundColor: colors.primaryGreen, borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2, marginRight: 4 },
  badgeMint: { backgroundColor: colors.freshMint, borderWidth: 1, borderColor: colors.primaryGreen },
  badgeText: { color: colors.white, fontSize: 11, fontWeight: '700' },
  badgeTextMint: { color: colors.primaryGreen },
  version: { fontSize: 12, color: colors.mediumGray, textAlign: 'center', marginTop: 20 },
});
