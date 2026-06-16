import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme';
import { useApp } from '../context/AppContext';
import ProductCard from '../components/ProductCard';

export default function LikedScreen({ navigation }) {
  const { productList, handleLike } = useApp();
  const liked = productList.filter(p => p.liked);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>찜한 상품</Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
        {liked.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🤍</Text>
            <Text style={styles.emptyTitle}>찜한 상품이 없어요</Text>
            <Text style={styles.emptySub}>마음에 드는 상품에 하트를 눌러보세요</Text>
          </View>
        ) : liked.map(p => (
          <ProductCard
            key={p.id}
            product={p}
            onPress={pr => navigation.navigate('ProductDetail', { productId: pr.id })}
            onLike={handleLike}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.softGray },
  header: { backgroundColor: colors.white, padding: 16, borderBottomWidth: 1, borderBottomColor: colors.softGray },
  headerTitle: { fontSize: 20, fontWeight: '900', color: colors.charcoalBlack },
  list: { padding: 16, paddingBottom: 80 },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyEmoji: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: colors.charcoalBlack, marginBottom: 6 },
  emptySub: { fontSize: 13, color: colors.mediumGray },
});
