import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Search, X, Clock } from 'lucide-react-native';
import { colors } from '../theme';
import { useApp } from '../context/AppContext';

const RECENT_DEFAULT = ['닭가슴살 샐러드', '베이커리온', '케이크'];
const SUGGESTIONS = ['닭가슴살 샐러드', '통밀 크로와상', '한식 도시락', '딸기 케이크', '두부 반찬', '아메리카노'];

export default function SearchScreen({ navigation }) {
  const { productList, handleLike } = useApp();
  const [query, setQuery] = useState('');
  const [recent, setRecent] = useState(RECENT_DEFAULT);

  const results = query.trim().length > 0
    ? productList.filter(p =>
        p.name.includes(query) || p.store.includes(query) || p.category.includes(query)
      )
    : [];

  const suggestions = query.length > 0
    ? SUGGESTIONS.filter(s => s.includes(query))
    : [];

  function handleSearch(q) {
    setQuery(q);
    if (q && !recent.includes(q)) setRecent(prev => [q, ...prev.slice(0, 9)]);
  }

  function removeRecent(item) {
    setRecent(prev => prev.filter(r => r !== item));
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={22} color={colors.charcoalBlack} />
        </TouchableOpacity>
        <View style={styles.inputWrap}>
          <Search size={16} color={colors.mediumGray} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={() => handleSearch(query)}
            placeholder="음식 또는 가게 검색"
            placeholderTextColor={colors.mediumGray}
            style={styles.input}
            autoFocus
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <X size={16} color={colors.mediumGray} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={query ? results : []}
        keyExtractor={i => String(i.id)}
        ListHeaderComponent={() => (
          <>
            {/* 자동완성 */}
            {suggestions.length > 0 && query.length > 0 && (
              <View style={styles.section}>
                {suggestions.map(s => (
                  <TouchableOpacity key={s} style={styles.suggRow} onPress={() => handleSearch(s)}>
                    <Search size={14} color={colors.mediumGray} />
                    <Text style={styles.suggText}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            {/* 최근 검색 */}
            {!query && recent.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>최근 검색어</Text>
                  <TouchableOpacity onPress={() => setRecent([])}>
                    <Text style={styles.clearAll}>전체 삭제</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.recentRow}>
                  {recent.map(r => (
                    <TouchableOpacity key={r} style={styles.recentChip} onPress={() => setQuery(r)}>
                      <Clock size={12} color={colors.mediumGray} />
                      <Text style={styles.recentText}>{r}</Text>
                      <TouchableOpacity onPress={() => removeRecent(r)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                        <X size={11} color={colors.mediumGray} />
                      </TouchableOpacity>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
            {/* 검색 결과 헤더 */}
            {query && (
              <Text style={styles.resultHeader}>
                "{query}" 검색 결과 {results.length}건
              </Text>
            )}
          </>
        )}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.resultItem}
            onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
          >
            <Text style={styles.resultEmoji}>{item.emoji}</Text>
            <View style={styles.resultInfo}>
              <Text style={styles.resultName}>{item.name}</Text>
              <Text style={styles.resultStore}>{item.store} · {item.distance}m</Text>
            </View>
            <Text style={styles.resultPrice}>{item.salePrice.toLocaleString()}원</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={() => query.length > 0 && suggestions.length === 0 ? (
          <View style={styles.noResult}>
            <Text style={styles.noResultEmoji}>🔍</Text>
            <Text style={styles.noResultText}>"{query}"에 대한 결과가 없습니다</Text>
          </View>
        ) : null}
        contentContainerStyle={{ paddingBottom: 60 }}
        keyboardShouldPersistTaps="always"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderBottomWidth: 1, borderBottomColor: colors.softGray },
  backBtn: { padding: 4 },
  inputWrap: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.softGray, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 },
  input: { flex: 1, fontSize: 15, color: colors.charcoalBlack },
  section: { padding: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: colors.charcoalBlack },
  clearAll: { fontSize: 13, color: colors.mediumGray },
  recentRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  recentChip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.softGray, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7 },
  recentText: { fontSize: 13, color: colors.charcoalBlack },
  suggRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.softGray },
  suggText: { fontSize: 15, color: colors.charcoalBlack },
  resultHeader: { fontSize: 13, color: colors.mediumGray, paddingHorizontal: 16, paddingVertical: 10 },
  resultItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.softGray },
  resultEmoji: { fontSize: 32, width: 44, textAlign: 'center' },
  resultInfo: { flex: 1 },
  resultName: { fontSize: 15, fontWeight: '700', color: colors.charcoalBlack },
  resultStore: { fontSize: 12, color: colors.mediumGray, marginTop: 2 },
  resultPrice: { fontSize: 15, fontWeight: '800', color: colors.primaryGreen },
  noResult: { alignItems: 'center', paddingTop: 60 },
  noResultEmoji: { fontSize: 48, marginBottom: 12 },
  noResultText: { fontSize: 14, color: colors.mediumGray },
});
