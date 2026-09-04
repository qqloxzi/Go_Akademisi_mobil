import { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, type ListRenderItem } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { CloudOff, MapPin } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { CourseListCard, type CourseListCardItem } from '@/components/courses';
import { Eyebrow } from '@/components/ui/eyebrow';

export default function LiglerScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [courses, setCourses] = useState<CourseListCardItem[]>([]);
  const [slugs, setSlugs] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCourses() {
      setLoading(true);
      setErrorMsg(null);

      const { data, error } = await supabase
        .from('courses')
        .select(
          'id, title, description, level, duration, lessons_count, price, students_count, rating_avg, rating_count, slug'
        )
        .order('created_at', { ascending: false });

      if (error) {
        setErrorMsg(error.message);
      } else {
        setCourses((data as CourseListCardItem[]) ?? []);
        setSlugs(
          Object.fromEntries((data ?? []).map((c: any) => [c.id, c.slug || c.id]))
        );
      }
      setLoading(false);
    }
    fetchCourses();
  }, []);

  const renderItem: ListRenderItem<CourseListCardItem> = ({ item }) => (
    <View className="mb-4">
      <CourseListCard item={item} onPress={() => router.push(`/course-detail/${slugs[item.id]}`)} />
    </View>
  );

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-ice-white dark:bg-dark-bg" style={{ paddingTop: insets.top }}>
        <ActivityIndicator size="large" color="#2E9FE0" />
        <Text className="mt-3 text-sm text-ink/40">Ligler yükleniyor…</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-ice-white dark:bg-dark-bg" style={{ paddingTop: insets.top }}>
      <View className="px-5 pb-3 pt-6">
        <Eyebrow>Rehberli Programlar</Eyebrow>
        <Text className="mt-1 text-[28px] text-ink dark:text-slate-100" style={{ fontFamily: 'PlusJakartaSans-ExtraBold' }}>
          Ligler
        </Text>
        <Text className="mt-1.5 text-[15px] leading-relaxed text-ink/50 dark:text-slate-400">
          Seviyene uygun ligde eğitmen eşliğinde 6 haftalık yoğun bir programla gelişimini hızlandır.
        </Text>
      </View>

      {errorMsg ? (
        <View className="items-center px-6 py-10">
          <CloudOff size={40} color="#cbd5e1" />
          <Text className="mt-3 text-center text-sm text-ink/40">{errorMsg}</Text>
        </View>
      ) : courses.length === 0 ? (
        <View className="items-center px-6 py-14">
          <MapPin size={44} color="#cbd5e1" />
          <Text className="mt-3 text-ink/40">Henüz lig bulunamadı.</Text>
        </View>
      ) : (
        <FlatList
          data={courses}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: insets.bottom + 100 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}
