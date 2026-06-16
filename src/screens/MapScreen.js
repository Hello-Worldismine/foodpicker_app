import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapPin } from 'lucide-react-native';
import { colors } from '../theme';
import { stores } from '../data/mockData';

export default function MapScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>지도</Text>
      </View>
      {/* 지도 플레이스홀더 — react-native-maps 연동 예정 */}
      <View style={styles.mapArea}>
        <MapPin size={40} color={colors.primaryGreen} />
        <Text style={styles.mapText}>지도를 불러오는 중...</Text>
        <Text style={styles.mapSub}>근처 매장을 지도에서 확인할 수 있어요</Text>
      </View>

      {/* 하단 매장 목록 */}
      <View style={styles.storeList}>
        <Text style={styles.listTitle}>주변 매장 {stores.length}곳</Text>
        {stores.slice(0, 3).map(s => (
          <TouchableOpacity
            key={s.id}
            style={styles.storeRow}
            onPress={() => navigation.navigate('Store', { storeId: s.id })}
          >
            <View style={[styles.dot, { backgroundColor: s.status === 'selling' ? colors.primaryGreen : colors.mediumGray }]} />
            <View style={styles.storeInfo}>
              <Text style={styles.storeName}>{s.name}</Text>
              <Text style={styles.storeMeta}>{s.distance}m · 픽업 {s.pickupTime}</Text>
            </View>
            <Text style={styles.storeArrow}>›</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.softGray },
  header: { backgroundColor: colors.white, padding: 16, borderBottomWidth: 1, borderBottomColor: colors.softGray },
  headerTitle: { fontSize: 20, fontWeight: '900', color: colors.charcoalBlack },
  mapArea: { flex: 1, backgroundColor: '#E8EAF0', alignItems: 'center', justifyContent: 'center', gap: 12 },
  mapText: { fontSize: 16, fontWeight: '700', color: colors.charcoalBlack },
  mapSub: { fontSize: 13, color: colors.mediumGray },
  storeList: { backgroundColor: colors.white, padding: 16, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: 240 },
  listTitle: { fontSize: 14, fontWeight: '700', color: colors.mediumGray, marginBottom: 12 },
  storeRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderTopWidth: 1, borderTopColor: colors.softGray },
  dot: { width: 10, height: 10, borderRadius: 5 },
  storeInfo: { flex: 1 },
  storeName: { fontSize: 15, fontWeight: '700', color: colors.charcoalBlack },
  storeMeta: { fontSize: 12, color: colors.mediumGray, marginTop: 2 },
  storeArrow: { fontSize: 20, color: colors.mediumGray },
});
