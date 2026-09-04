import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Play } from 'lucide-react-native';
import GoBoard from '@/components/GoBoard';
import { ATOLYELER_SECTIONS } from '@/lib/education/atolyelerSections';
import { courseArticles, type CourseArticleBlock } from '@/data/courseArticles';
import { fetchCurriculum, findCourseBySlug, flattenLessons, type Course } from '@/lib/education/fetchCurriculum';
import { PrimaryButton } from '@/components/ui/primary-button';

function TextBlock({ content }: { content: string }) {
  const parts = content.split('\n\n');
  const hasSubtitle = parts.length >= 2 && parts[0]?.trim() && !parts[0].includes('\n');
  if (hasSubtitle) {
    return (
      <View className="my-5">
        <Text className="text-xl text-ink dark:text-white mb-2" style={{ fontFamily: 'PlusJakartaSans-ExtraBold' }}>
          {parts[0]?.trim()}
        </Text>
        <Text className="text-base leading-7 text-ink/75 dark:text-white/75">{parts.slice(1).join('\n\n').trim()}</Text>
      </View>
    );
  }
  return <Text className="my-5 text-base leading-7 text-ink/75 dark:text-white/75">{content}</Text>;
}

function ArticleBoardBlock({ course, description }: { course: Course; description?: string }) {
  const { width } = useWindowDimensions();
  const firstLesson = flattenLessons([course]).find((lesson) => lesson.problem);
  const problem = firstLesson?.problem;
  if (!problem) return null;

  return (
    <View className="my-5 rounded-2xl overflow-hidden border border-primary-blue/10 dark:border-white/10 p-4">
      <GoBoard
        size={problem.size ?? 19}
        boardSizePx={Math.min(width - 68, 320)}
        initialState={problem.initialState}
        startTurn={problem.turn === 'white' ? 'white' : 'black'}
        problem={problem}
        readOnly
        hideTurnIndicator
      />
      {description ? <Text className="mt-3 text-sm leading-6 text-ink/50 dark:text-white/50">{description}</Text> : null}
    </View>
  );
}

export default function AtolyeArticleScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { courses: loadedCourses } = await fetchCurriculum();
      if (!cancelled) {
        setCourses(loadedCourses);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const course = useMemo(() => (slug ? findCourseBySlug(courses, slug) : null), [courses, slug]);
  const lessonCount = course ? flattenLessons([course]).length : 0;
  const article = course ? courseArticles[course.slug] : null;
  const section = ATOLYELER_SECTIONS.find((s) => s.levelBand === (course?.levelBand ?? '17-12-kyu'));

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-ice-white dark:bg-dark-bg" style={{ paddingTop: insets.top }}>
        <ActivityIndicator size="large" color="#2E9FE0" />
      </View>
    );
  }

  if (!course) {
    return (
      <View className="flex-1 items-center justify-center bg-ice-white dark:bg-dark-bg px-6" style={{ paddingTop: insets.top }}>
        <Text className="text-center text-ink/60 mb-4">Bu atölye bulunamadı.</Text>
        <PrimaryButton label="Atölyelere Dön" onPress={() => router.replace('/(tabs)/atolyeler')} />
      </View>
    );
  }

  const blocks: CourseArticleBlock[] =
    article?.blocks ??
    [
      {
        type: 'text',
        content: `${course.title}\n\n${course.description || course.summary || 'Bu atölye için giriş yazısı yakında eklenecek.'}`,
      },
    ];

  return (
    <ScrollView
      className="flex-1 bg-ice-white dark:bg-dark-bg"
      contentContainerStyle={{ paddingTop: insets.top + 20, paddingHorizontal: 20, paddingBottom: insets.bottom + 48 }}
      showsVerticalScrollIndicator={false}>
      <Pressable onPress={() => router.replace('/(tabs)/atolyeler')} className="flex-row items-center gap-1.5 mb-6 active:opacity-70">
        <ArrowLeft size={16} color="rgba(26,26,26,0.6)" />
        <Text className="text-sm font-bold text-ink/60 dark:text-white/60">Atölyeler</Text>
      </Pressable>

      <Text className="text-[28px] leading-9 text-ink dark:text-white mb-4" style={{ fontFamily: 'PlusJakartaSans-ExtraBold' }}>
        {article?.title ?? course.title}
      </Text>

      <View className="flex-row items-center gap-2 mb-6">
        <Text className="text-sm text-ink/50 dark:text-white/50">{section?.subtitle}</Text>
        <Text className="text-ink/25">·</Text>
        <Text className="text-sm text-ink/50 dark:text-white/50">{lessonCount} ders</Text>
      </View>

      <View className="h-px bg-primary-blue/10 dark:bg-white/10 mb-2" />

      <View>
        {blocks.map((block, index) =>
          block.type === 'board' ? (
            <ArticleBoardBlock key={index} course={course} description={block.description} />
          ) : (
            <TextBlock key={index} content={block.content} />
          )
        )}
      </View>

      <View className="mt-8 items-center">
        <PrimaryButton
          label="Alıştırmalara Başla"
          onPress={() => router.push(`/atolyeler/kurs/${course.slug || course.id}`)}
          icon={<Play size={16} color="#fff" fill="#fff" />}
        />
      </View>
    </ScrollView>
  );
}
