import { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Linking, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getCourseBySlug, parseOutcomes, formatDateRange } from '@/lib/courses';
import type { CourseDetail } from '@/types/course';
import { LEVEL_BAND_META, levelBandFromLevel } from '@/components/courses';
import { ScreenHeader } from '@/components/ui/screen-header';
import { Card } from '@/components/ui/card';
import { PrimaryButton } from '@/components/ui/primary-button';
import { Star } from 'lucide-react-native';

export default function CourseDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setError('Lig bulunamadı.');
      setLoading(false);
      return;
    }
    getCourseBySlug(slug).then(({ data, error: err }) => {
      setLoading(false);
      if (err) setError(err.message);
      else setCourse(data ?? null);
    });
  }, [slug]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-ice-white dark:bg-dark-bg">
        <ActivityIndicator size="large" color="#2E9FE0" />
        <Text className="mt-3 text-ink/40">Lig bilgileri yükleniyor…</Text>
      </View>
    );
  }

  if (error || !course) {
    return (
      <View className="flex-1 items-center justify-center bg-ice-white dark:bg-dark-bg px-6">
        <Text className="mb-4 text-center text-heart">{error ?? 'Lig bulunamadı.'}</Text>
        <PrimaryButton label="Geri Dön" onPress={() => router.back()} />
      </View>
    );
  }

  const band = LEVEL_BAND_META[levelBandFromLevel(course.title)];
  const outcomes = parseOutcomes(course.outcomes);
  const providerName = course.provider || 'Agora Akademi';

  return (
    <ScrollView
      className="flex-1 bg-ice-white dark:bg-dark-bg"
      contentContainerStyle={{ paddingTop: insets.top + 18, paddingHorizontal: 20, paddingBottom: insets.bottom + 36 }}
      showsVerticalScrollIndicator={false}>
      <ScreenHeader title="Lig Detayı" />

      <Text className="text-[11px] font-extrabold uppercase tracking-widest text-accent-blue mb-1">
        {band.seviyeLabel.toUpperCase()}
      </Text>
      <Text className="text-[26px] text-ink dark:text-slate-100 mb-2" style={{ fontFamily: 'PlusJakartaSans-ExtraBold' }}>
        {course.title}
      </Text>
      {course.description ? (
        <Text className="text-base leading-7 text-ink/60 mb-5">{course.description}</Text>
      ) : null}

      {course.rating_avg ? (
        <View className="flex-row items-center gap-1 mb-5">
          {[1, 2, 3, 4, 5].map((n) => (
            <Star key={n} size={15} color="#D9A83B" fill={n <= Math.round(course.rating_avg ?? 0) ? '#D9A83B' : 'transparent'} />
          ))}
          <Text className="ml-1 text-sm font-bold text-ink/70">{course.rating_avg.toFixed(1)}</Text>
          <Text className="text-sm text-ink/40">({course.rating_count ?? 0})</Text>
        </View>
      ) : null}

      <View className="mb-6">
        <PrimaryButton
          label={course.price ? `Lige Katıl · ${course.price}` : 'Lige Katıl'}
          onPress={() => {
            const link = course.payment_link;
            if (link) {
              Linking.openURL(link).catch(() => Alert.alert('Hata', 'Kayıt sayfası açılamadı.'));
            } else {
              Alert.alert('Bilgi', 'Kayıt için lütfen bizimle iletişime geçin.');
            }
          }}
        />
      </View>

      <Card className="p-4 mb-6">
        <SummaryRow label="Eğitmen" value={providerName} />
        <SummaryRow label="Durum" value={course.status || 'Kayıtlar Açık'} />
        <SummaryRow label="Seviye" value={band.seviyeLabel} />
        <SummaryRow label="Tarih Aralığı" value={formatDateRange(course.course_start, course.course_end)} />
        <SummaryRow label="Süre" value={course.duration || 'Esnek'} last />
      </Card>

      <Text className="text-[11px] font-extrabold uppercase tracking-widest text-accent-blue mb-3">
        Kazanımlar · Hedefler
      </Text>
      {outcomes.length > 0 ? (
        <View className="gap-2">
          {outcomes.map((item, i) => (
            <View key={`${i}-${item.slice(0, 24)}`} className="flex-row items-start gap-2">
              <View className="mt-1.5 h-1.5 w-1.5 rounded-full bg-accent-blue" />
              <Text className="flex-1 text-sm leading-6 text-ink/70">{item}</Text>
            </View>
          ))}
        </View>
      ) : (
        <Text className="py-4 italic text-ink/40">Detaylı kazanım bilgisi eklenmemiş.</Text>
      )}
    </ScrollView>
  );
}

function SummaryRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <View className={`flex-row items-center justify-between py-2.5 ${last ? '' : 'border-b border-silver/40'}`}>
      <Text className="text-sm text-ink/50">{label}</Text>
      <Text className="text-sm font-bold text-ink">{value}</Text>
    </View>
  );
}
