import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput,
  Image, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Star, Camera, X, CheckCircle } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../theme';

const MAX_PHOTOS = 5;
const MIN_TEXT = 10;
const MAX_TEXT = 300;

const STAR_LABELS = ['', '별로예요', '그저 그래요', '괜찮아요', '좋아요', '최고예요!'];

function StarSelector({ value, onChange }) {
  return (
    <View style={styles.starWrap}>
      <View style={styles.starRow}>
        {[1, 2, 3, 4, 5].map(n => (
          <TouchableOpacity key={n} onPress={() => onChange(n)} style={styles.starBtn}>
            <Star size={40} color={n <= value ? '#FBBF24' : '#D1D5DB'} fill={n <= value ? '#FBBF24' : 'none'} />
          </TouchableOpacity>
        ))}
      </View>
      <Text style={[styles.starLabel, value > 0 && { color: '#FBBF24' }]}>
        {STAR_LABELS[value] || '별점을 선택해주세요'}
      </Text>
    </View>
  );
}

export default function WriteReviewScreen({ route, navigation }) {
  const { order } = route.params;
  const [rating, setRating] = useState(0);
  const [text, setText] = useState('');
  const [photos, setPhotos] = useState([]);
  const [submitted, setSubmitted] = useState(false);

  const canSubmit = rating > 0 && text.trim().length >= MIN_TEXT;

  async function handleAddPhoto() {
    if (photos.length >= MAX_PHOTOS) return;
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('권한 필요', '사진 라이브러리 접근 권한이 필요합니다.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: MAX_PHOTOS - photos.length,
      quality: 0.8,
    });
    if (!result.canceled) {
      setPhotos(prev => [...prev, ...result.assets.slice(0, MAX_PHOTOS - prev.length)]);
    }
  }

  function removePhoto(uri) {
    setPhotos(prev => prev.filter(p => p.uri !== uri));
  }

  if (submitted) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.white }]} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ArrowLeft size={22} color={colors.charcoalBlack} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>리뷰 쓰기</Text>
        </View>
        <View style={styles.successWrap}>
          <View style={styles.successIcon}>
            <CheckCircle size={44} color={colors.primaryGreen} />
          </View>
          <Text style={styles.successTitle}>리뷰가 등록되었어요!</Text>
          <Text style={styles.successSub}>소중한 리뷰 감사합니다.{'\n'}사장님과 다른 고객들에게 도움이 돼요 🙌</Text>
          <TouchableOpacity style={styles.confirmBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.confirmBtnText}>확인</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={22} color={colors.charcoalBlack} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>리뷰 쓰기</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 주문 요약 */}
        <View style={styles.orderCard}>
          <View style={styles.orderIcon}>
            <Text style={{ fontSize: 22 }}>🛍️</Text>
          </View>
          <View style={styles.orderInfo}>
            <Text style={styles.orderName} numberOfLines={1}>{order.productName}</Text>
            <Text style={styles.orderMeta}>{order.store} · {order.pickupTime}</Text>
          </View>
        </View>

        {/* 별점 */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>이번 주문은 어떠셨나요?</Text>
          <StarSelector value={rating} onChange={setRating} />
        </View>

        {/* 사진 첨부 */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>사진 첨부</Text>
            <Text style={styles.photoCount}>{photos.length}/{MAX_PHOTOS}</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photoRow}>
            {photos.length < MAX_PHOTOS && (
              <TouchableOpacity style={styles.addPhotoBtn} onPress={handleAddPhoto}>
                <Camera size={22} color={colors.mediumGray} />
                <Text style={styles.addPhotoText}>사진 추가</Text>
              </TouchableOpacity>
            )}
            {photos.map(p => (
              <View key={p.uri} style={styles.thumb}>
                <Image source={{ uri: p.uri }} style={styles.thumbImg} />
                <TouchableOpacity style={styles.removePhoto} onPress={() => removePhoto(p.uri)}>
                  <X size={11} color={colors.white} />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
          <Text style={styles.photoHint}>최대 {MAX_PHOTOS}장까지 첨부 가능합니다. 음식 사진을 올려주세요 📸</Text>
        </View>

        {/* 리뷰 텍스트 */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>리뷰 작성</Text>
            <Text style={[styles.charCount, text.length >= MIN_TEXT && { color: colors.primaryGreen, fontWeight: '700' }]}>
              {text.length}/{MAX_TEXT}
            </Text>
          </View>
          <TextInput
            value={text}
            onChangeText={t => setText(t.slice(0, MAX_TEXT))}
            placeholder={`음식 맛, 포장 상태, 픽업 경험 등을 자유롭게 작성해주세요.\n(최소 ${MIN_TEXT}자)`}
            placeholderTextColor={colors.mediumGray}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
            style={[styles.textArea, text.length > 0 && text.length < MIN_TEXT && { borderColor: colors.alertRed }]}
          />
          {text.length > 0 && text.length < MIN_TEXT && (
            <Text style={styles.minHint}>최소 {MIN_TEXT}자 이상 작성해주세요. ({MIN_TEXT - text.length}자 더 필요)</Text>
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* 제출 버튼 */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.submitBtn, !canSubmit && styles.submitBtnDisabled]}
          onPress={() => canSubmit && setSubmitted(true)}
          disabled={!canSubmit}
        >
          <Text style={styles.submitBtnText}>리뷰 등록하기</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.softGray },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.white, paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.softGray },
  backBtn: { padding: 2 },
  headerTitle: { fontSize: 17, fontWeight: '800', color: colors.charcoalBlack },
  orderCard: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.white, margin: 12, borderRadius: 14, padding: 14 },
  orderIcon: { width: 48, height: 48, borderRadius: 12, backgroundColor: colors.freshMint, alignItems: 'center', justifyContent: 'center' },
  orderInfo: { flex: 1 },
  orderName: { fontSize: 15, fontWeight: '800', color: colors.charcoalBlack, marginBottom: 3 },
  orderMeta: { fontSize: 12, color: colors.mediumGray },
  card: { backgroundColor: colors.white, margin: 0, marginBottom: 8, padding: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  cardTitle: { fontSize: 15, fontWeight: '800', color: colors.charcoalBlack },
  starWrap: { alignItems: 'center' },
  starRow: { flexDirection: 'row', gap: 6, marginBottom: 8 },
  starBtn: { padding: 4 },
  starLabel: { fontSize: 14, fontWeight: '700', color: colors.mediumGray, minHeight: 20 },
  photoCount: { fontSize: 12, color: colors.mediumGray },
  photoRow: { gap: 8, paddingRight: 8 },
  addPhotoBtn: { width: 76, height: 76, borderRadius: 10, borderWidth: 2, borderColor: colors.mediumGray, borderStyle: 'dashed', backgroundColor: colors.softGray, alignItems: 'center', justifyContent: 'center', gap: 4 },
  addPhotoText: { fontSize: 10, color: colors.mediumGray },
  thumb: { width: 76, height: 76, borderRadius: 10, overflow: 'hidden' },
  thumbImg: { width: '100%', height: '100%' },
  removePhoto: { position: 'absolute', top: -4, right: -4, width: 20, height: 20, borderRadius: 10, backgroundColor: colors.charcoalBlack, alignItems: 'center', justifyContent: 'center' },
  photoHint: { fontSize: 11, color: colors.mediumGray, marginTop: 10 },
  charCount: { fontSize: 12, color: colors.mediumGray },
  textArea: { borderWidth: 1.5, borderColor: colors.softGray, borderRadius: 10, padding: 12, fontSize: 14, lineHeight: 22, color: colors.charcoalBlack, backgroundColor: colors.softGray, minHeight: 120 },
  minHint: { fontSize: 12, color: colors.alertRed, marginTop: 6 },
  footer: { padding: 16, backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.softGray },
  submitBtn: { backgroundColor: colors.primaryGreen, borderRadius: 14, padding: 16, alignItems: 'center' },
  submitBtnDisabled: { backgroundColor: '#C8CDD3' },
  submitBtnText: { color: colors.white, fontSize: 16, fontWeight: '800' },
  successWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  successIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.freshMint, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  successTitle: { fontSize: 20, fontWeight: '900', color: colors.charcoalBlack, marginBottom: 10 },
  successSub: { fontSize: 14, color: colors.mediumGray, lineHeight: 22, textAlign: 'center', marginBottom: 36 },
  confirmBtn: { width: '100%', backgroundColor: colors.primaryGreen, borderRadius: 14, padding: 16, alignItems: 'center' },
  confirmBtnText: { color: colors.white, fontSize: 16, fontWeight: '700' },
});
