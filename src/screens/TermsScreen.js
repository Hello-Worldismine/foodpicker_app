import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { colors } from '../theme';

const TERMS = [
  { title: '서비스 이용약관', content: '본 약관은 푸드피커 서비스 이용에 관한 기본적인 사항을 규정합니다.\n\n제1조 (목적)\n이 약관은 푸드피커가 제공하는 식품 픽업 중개 서비스의 이용 조건 및 절차에 관한 사항을 규정함을 목적으로 합니다.\n\n제2조 (서비스 내용)\n푸드피커는 소비기한이 임박한 식품을 합리적인 가격에 구매할 수 있도록 연결하는 중개 플랫폼 서비스를 제공합니다.' },
  { title: '개인정보 처리방침', content: '푸드피커는 이용자의 개인정보를 소중히 여기며 관련 법령을 준수합니다.\n\n1. 수집하는 개인정보 항목\n- 필수: 이름, 이메일, 전화번호\n- 선택: 프로필 사진\n\n2. 개인정보의 수집 목적\n서비스 제공, 결제 처리, 고객 상담\n\n3. 보유 기간\n서비스 이용 기간 및 관련 법령에 따른 기간' },
];

export default function TermsScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={22} color={colors.charcoalBlack} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>약관 및 개인정보처리방침</Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {TERMS.map((t, i) => (
          <View key={i} style={styles.section}>
            <Text style={styles.sectionTitle}>{t.title}</Text>
            <Text style={styles.sectionText}>{t.content}</Text>
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
  headerTitle: { fontSize: 17, fontWeight: '800', color: colors.charcoalBlack },
  content: { padding: 16, paddingBottom: 60 },
  section: { backgroundColor: colors.white, borderRadius: 14, padding: 16, marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: colors.charcoalBlack, marginBottom: 12 },
  sectionText: { fontSize: 13, color: colors.mediumGray, lineHeight: 22 },
});
