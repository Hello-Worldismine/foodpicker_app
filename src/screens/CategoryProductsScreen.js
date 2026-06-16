import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { colors } from '../theme';
import { useApp } from '../context/AppContext';
import ProductCard from '../components/ProductCard';

export default function CategoryProductsScreen({ route, navigation }) {
  const { category } = route.params;
  const { productList, handleLike } = useApp();

  const filtered = category === '전체'
    ? productList
    : category === '마감임박'
      ? productList.filter(p => p.badges?.some(b => b.includes('마감')))
      : productList.filter(p => p.category === category);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={22} color={colors.charcoalBlack} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{category}</Text>
        <Text style={styles.headerCount}>총 {filtered.length}개</Text>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => String(item.id)}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            onPress={p => navigation.navigate('ProductDetail', { productId: p.id })}
            onLike={handleLike}
          />
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🔍</Text>
            <Text style={styles.emptyTitle}>{category} 상품이 없어요</Text>
            <Text style={styles.emptySub}>다른 카테고리를 확인해보세요</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.softGray },
  header: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: colors.softGray,
  },
  backBtn: { padding: 2, marginRight: 8 },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: '800', color: colors.charcoalBlack },
  headerCount: { fontSize: 13, color: colors.mediumGray },
  list: { padding: 16, paddingBottom: 40 },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyEmoji: { fontSize: 52, marginBottom: 14 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: colors.charcoalBlack, marginBottom: 6 },
  emptySub: { fontSize: 13, color: colors.mediumGray },
});
