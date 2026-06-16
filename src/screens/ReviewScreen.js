import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Star, ThumbsUp, Megaphone, ChevronDown } from 'lucide-react-native';
import { colors } from '../theme';

const MOCK_REVIEWS = {
  1: {
    ownerNotice: '매일 신선한 재료로 만든 샐러드를 제공합니다. 감사합니다!',
    ownerNoticeDate: '2024.06.01',
    distribution: { 5: 18, 4: 7, 3: 2, 2: 1, 1: 0 },
    reviews: [
      { id: 1, user: '김*연', rating: 5, date: '2024.06.10', text: '닭가슴살이 정말 신선하고 맛있어요! 다이어트 중인데 딱이에요.', helpful: 12, ownerReply: '감사합니다! 매일 신선하게 준비하겠습니다 😊' },
      { id: 2, user: '이*준', rating: 4, date: '2024.06.08', text: '맛은 좋은데 양이 조금 적은 것 같아요. 그래도 가격 대비 훌륭해요.', helpful: 5, ownerReply: null },
      { id: 3, user: '박*희', rating: 5, date: '2024.06.05', text: '픽업도 편리하고 포장도 깔끔해요. 자주 이용할 것 같아요!', helpful: 8, ownerReply: '좋은 말씀 감사드려요 🙏' },
    ],
  },
};

const DEFAULT_DATA = {
  ownerNotice: '',
  ownerNoticeDate: '',
  distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  reviews: [],
};

const SORT_OPTIONS = ['추천순', '최신순', '별점 높은순', '별점 낮은순'];

function RatingBar({ score, count, total }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <View style={styles.barRow}>
      <Text style={styles.barScore}>{score}</Text>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${pct}%` }]} />
      </View>
      <Text style={styles.barCount}>{count}</Text>
    </View>
  );
}

export default function ReviewScreen({ route, navigation }) {
  const { store } = route.params;
  const data = MOCK_REVIEWS[store.id] || DEFAULT_DATA;
  const [sort, setSort] = useState('추천순');
  const [showSort, setShowSort] = useState(false);
  const [helpful, setHelpful] = useState({});

  const totalReviews = Object.values(data.distribution).reduce((a, b) => a + b, 0);
  const avgRating = totalReviews > 0
    ? (Object.entries(data.distribution).reduce((a, [k, v]) => a + Number(k) * v, 0) / totalReviews).toFixed(1)
    : store.rating;

  const sorted = [...data.reviews].sort((a, b) => {
    if (sort === '최신순') return new Date(b.date) - new Date(a.date);
    if (sort === '별점 높은순') return b.rating - a.rating;
    if (sort === '별점 낮은순') return a.rating - b.rating;
    return b.helpful - a.helpful;
  });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={22} color={colors.charcoalBlack} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>리뷰</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 평점 요약 */}
        <View style={styles.summaryCard}>
          <View style={styles.avgRow}>
            <Text style={styles.avgNum}>{avgRating}</Text>
            <View style={styles.starsRow}>
              {[1,2,3,4,5].map(n => (
                <Star key={n} size={18} color="#FBBF24" fill={n <= Math.round(Number(avgRating)) ? '#FBBF24' : 'none'} />
              ))}
              <Text style={styles.reviewTotal}>({totalReviews})</Text>
            </View>
          </View>
          <View style={styles.bars}>
            {[5,4,3,2,1].map(n => (
              <RatingBar key={n} score={n} count={data.distribution[n]} total={totalReviews} />
            ))}
          </View>
        </View>

        {/* 사장님 공지 */}
        {data.ownerNotice ? (
          <View style={styles.noticeCard}>
            <View style={styles.noticeHeader}>
              <Megaphone size={15} color={colors.primaryGreen} />
              <Text style={styles.noticeTitle}>사장님 공지</Text>
              <Text style={styles.noticeDate}>{data.ownerNoticeDate}</Text>
            </View>
            <Text style={styles.noticeText}>{data.ownerNotice}</Text>
          </View>
        ) : null}

        {/* 정렬 */}
        <View style={styles.sortRow}>
          <Text style={styles.sortCount}>리뷰 {sorted.length}개</Text>
          <TouchableOpacity style={styles.sortBtn} onPress={() => setShowSort(true)}>
            <Text style={styles.sortBtnText}>{sort}</Text>
            <ChevronDown size={14} color={colors.mediumGray} />
          </TouchableOpacity>
        </View>

        {/* 리뷰 목록 */}
        {sorted.map(review => (
          <View key={review.id} style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{review.user[0]}</Text>
              </View>
              <View style={styles.reviewMeta}>
                <Text style={styles.reviewUser}>{review.user}</Text>
                <Text style={styles.reviewDate}>{review.date}</Text>
              </View>
              <View style={styles.reviewStars}>
                {[1,2,3,4,5].map(n => (
                  <Star key={n} size={13} color="#FBBF24" fill={n <= review.rating ? '#FBBF24' : 'none'} />
                ))}
              </View>
            </View>
            <Text style={styles.reviewText}>{review.text}</Text>
            <TouchableOpacity
              style={styles.helpfulBtn}
              onPress={() => setHelpful(prev => ({ ...prev, [review.id]: !prev[review.id] }))}
            >
              <ThumbsUp size={13} color={helpful[review.id] ? colors.primaryGreen : colors.mediumGray} fill={helpful[review.id] ? colors.primaryGreen : 'none'} />
              <Text style={[styles.helpfulText, helpful[review.id] && { color: colors.primaryGreen }]}>
                도움돼요 {review.helpful + (helpful[review.id] ? 1 : 0)}
              </Text>
            </TouchableOpacity>
            {review.ownerReply && (
              <View style={styles.replyBox}>
                <View style={styles.replyOwner}>
                  <View style={styles.ownerDot}>
                    <Text style={styles.ownerDotText}>사</Text>
                  </View>
                  <Text style={styles.replyLabel}>사장님 댓글</Text>
                </View>
                <Text style={styles.replyText}>{review.ownerReply}</Text>
              </View>
            )}
          </View>
        ))}

        {sorted.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>✍️</Text>
            <Text style={styles.emptyText}>아직 리뷰가 없습니다</Text>
          </View>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* 정렬 모달 */}
      <Modal visible={showSort} transparent animationType="slide">
        <TouchableOpacity style={styles.overlay} onPress={() => setShowSort(false)} />
        <View style={styles.sortSheet}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>정렬</Text>
          {SORT_OPTIONS.map(opt => (
            <TouchableOpacity key={opt} style={styles.sortOption} onPress={() => { setSort(opt); setShowSort(false); }}>
              <Text style={[styles.sortOptionText, sort === opt && styles.sortOptionActive]}>{opt}</Text>
              {sort === opt && <Text style={styles.sortCheck}>✓</Text>}
            </TouchableOpacity>
          ))}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.softGray },
  header: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, paddingHorizontal: 8, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.softGray },
  backBtn: { padding: 8 },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: '800', color: colors.charcoalBlack, textAlign: 'center' },
  summaryCard: { backgroundColor: colors.white, padding: 20, marginBottom: 8 },
  avgRow: { alignItems: 'center', marginBottom: 16 },
  avgNum: { fontSize: 48, fontWeight: '900', color: colors.charcoalBlack },
  starsRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 4 },
  reviewTotal: { fontSize: 13, color: colors.mediumGray, marginLeft: 4 },
  bars: { gap: 6 },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  barScore: { fontSize: 12, color: colors.mediumGray, width: 14, textAlign: 'right' },
  barTrack: { flex: 1, height: 6, backgroundColor: colors.softGray, borderRadius: 3, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: '#FBBF24', borderRadius: 3 },
  barCount: { fontSize: 12, color: colors.mediumGray, width: 24 },
  noticeCard: { backgroundColor: colors.white, padding: 16, marginBottom: 8 },
  noticeHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  noticeTitle: { flex: 1, fontSize: 13, fontWeight: '700', color: colors.primaryGreen },
  noticeDate: { fontSize: 12, color: colors.mediumGray },
  noticeText: { fontSize: 13, color: colors.charcoalBlack, lineHeight: 20 },
  sortRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10 },
  sortCount: { fontSize: 13, color: colors.mediumGray },
  sortBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  sortBtnText: { fontSize: 13, color: colors.charcoalBlack, fontWeight: '600' },
  reviewCard: { backgroundColor: colors.white, marginHorizontal: 0, marginBottom: 8, padding: 16 },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.freshMint, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 14, fontWeight: '700', color: colors.primaryGreen },
  reviewMeta: { flex: 1 },
  reviewUser: { fontSize: 14, fontWeight: '700', color: colors.charcoalBlack },
  reviewDate: { fontSize: 11, color: colors.mediumGray },
  reviewStars: { flexDirection: 'row', gap: 2 },
  reviewText: { fontSize: 14, color: colors.charcoalBlack, lineHeight: 22, marginBottom: 10 },
  helpfulBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', borderWidth: 1, borderColor: colors.softGray, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  helpfulText: { fontSize: 12, color: colors.mediumGray },
  replyBox: { marginTop: 10, backgroundColor: '#F0FAF4', borderLeftWidth: 3, borderLeftColor: colors.primaryGreen, borderRadius: 8, padding: 12 },
  replyOwner: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  ownerDot: { width: 22, height: 22, borderRadius: 11, backgroundColor: colors.primaryGreen, alignItems: 'center', justifyContent: 'center' },
  ownerDotText: { fontSize: 11, fontWeight: '900', color: colors.white },
  replyLabel: { fontSize: 12, fontWeight: '700', color: colors.primaryGreen },
  replyText: { fontSize: 13, color: colors.charcoalBlack, lineHeight: 20 },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 14, color: colors.mediumGray },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  sortSheet: { backgroundColor: colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 40 },
  sheetHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: colors.softGray, alignSelf: 'center', marginBottom: 16 },
  sheetTitle: { fontSize: 17, fontWeight: '800', color: colors.charcoalBlack, marginBottom: 16 },
  sortOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderTopWidth: 1, borderTopColor: colors.softGray },
  sortOptionText: { fontSize: 15, color: colors.charcoalBlack },
  sortOptionActive: { color: colors.primaryGreen, fontWeight: '700' },
  sortCheck: { fontSize: 16, color: colors.primaryGreen, fontWeight: '900' },
});
