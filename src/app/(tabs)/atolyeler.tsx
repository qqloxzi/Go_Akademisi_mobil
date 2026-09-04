/**
 * Atölyeler Ana Ekranı — web (Agora 3.1) src/pages/Workshops.jsx ile birebir.
 */
import { useRouter, type Href } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AtolyeSkillTree } from '@/components/atolyeler';
import { ProfileSummaryCard } from '@/components/profile-summary-card';
import { useAuth } from '@/context/auth-context';
import { Eyebrow } from '@/components/ui/eyebrow';
import { fetchCurriculum, type Course } from '@/lib/education/fetchCurriculum';
import {
  fetchRemoteCompletedLessonIds,
  loadLocalCompletedIds,
  saveLocalCompletedIds,
  syncLocalCompletedIdsToRemote,
} from '@/lib/education/progressStorage';
import { supabase } from '@/lib/supabase';

export default function AtolyelerScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);

      const ids = await loadLocalCompletedIds();
      if (!cancelled) setCompletedIds(ids);

      const { data: auth } = await supabase.auth.getUser();
      const uid = auth?.user?.id ?? null;
      if (uid) {
        const remoteIds = await fetchRemoteCompletedLessonIds(uid);
        if (!cancelled) {
          const merged = new Set([...ids, ...remoteIds]);
          setCompletedIds(merged);
          saveLocalCompletedIds(merged);
          syncLocalCompletedIdsToRemote(uid, ids);
        }
      }

      const { courses: loadedCourses } = await fetchCurriculum();
      if (cancelled) return;
      setCourses(loadedCourses);
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const handlePressCourse = useCallback(
    (course: Course) => {
      router.push({
        pathname: '/atolyeler/[slug]',
        params: { slug: course.slug || course.id },
      } as unknown as Href);
    },
    [router]
  );

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F5F5F5', paddingTop: insets.top }}>
        <ActivityIndicator size="large" color="#2E9FE0" />
        <Text style={{ marginTop: 12, fontSize: 13, color: '#9AA0AC' }}>Müfredat yükleniyor…</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
      <AtolyeSkillTree
        courses={courses}
        completedIds={completedIds}
        onPressCourse={handlePressCourse}
        header={
          <View style={{ paddingHorizontal: 20, paddingTop: insets.top + 24 }}>
            <View style={{ alignItems: 'center', marginBottom: 24 }}>
              <Eyebrow>Beceri Ağacı</Eyebrow>
              <Text
                style={{ fontSize: 34, fontFamily: 'PlusJakartaSans-ExtraBold', color: '#1E3A5F', marginTop: 6, marginBottom: 10 }}>
                Atölyeler
              </Text>
              <Text style={{ fontSize: 14, color: 'rgba(26,26,26,0.6)', textAlign: 'center', lineHeight: 20, maxWidth: 320 }}>
                Duolingo tarzı bir yolda ilerle: her atölyeyi tamamladıkça sıradaki kilidi açılır, XP ve token kazanırsın.
              </Text>
            </View>
            {user ? <ProfileSummaryCard /> : null}
          </View>
        }
      />
    </View>
  );
}
