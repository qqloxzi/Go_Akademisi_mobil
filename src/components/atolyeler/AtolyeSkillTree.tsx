/**
 * AtolyeSkillTree — web (Agora 3.1) src/pages/Workshops.jsx + SkillTreePath.jsx
 * ile birebir kilit mantığı ve zigzag yol görünümü.
 */
import { useMemo } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FileText } from 'lucide-react-native';
import type { Course } from '@/lib/education/fetchCurriculum';
import { flattenLessons } from '@/lib/education/fetchCurriculum';
import { ATOLYELER_SECTIONS } from '@/lib/education/atolyelerSections';
import { AtolyeSkillNode, type NodeState } from './AtolyeSkillNode';

type CourseWithMeta = {
  course: Course;
  sectionId: string;
  nodeState: NodeState;
  isEmpty: boolean;
  completedLessons: number;
  totalLessons: number;
  stars: number;
};

function computeCoursesMeta(courses: Course[], completedIds: Set<string>): CourseWithMeta[] {
  const bySection: Record<string, Course[]> = {};
  for (const section of ATOLYELER_SECTIONS) {
    bySection[section.id] = courses.filter((c) => (c.levelBand ?? '17-12-kyu') === section.levelBand);
  }

  const out: CourseWithMeta[] = [];
  for (const section of ATOLYELER_SECTIONS) {
    const sectionCourses = bySection[section.id] ?? [];
    sectionCourses.forEach((course, idx) => {
      const lessons = flattenLessons([course]);
      const total = lessons.length;
      const done = lessons.filter((l) => completedIds.has(l.id)).length;

      const prevCourse = sectionCourses[idx - 1];
      let prevComplete = true;
      if (prevCourse) {
        const prevLessons = flattenLessons([prevCourse]);
        prevComplete = prevLessons.length > 0 && prevLessons.every((l) => completedIds.has(l.id));
      }

      let nodeState: NodeState = 'locked';
      if (total > 0 && done === total) nodeState = 'completed';
      else if (idx === 0 || prevComplete) nodeState = 'current';

      out.push({
        course,
        sectionId: section.id,
        nodeState,
        isEmpty: total === 0,
        completedLessons: done,
        totalLessons: total,
        stars: total > 0 && done === total ? 3 : 0,
      });
    });
  }
  return out;
}

type Props = {
  courses: Course[];
  completedIds: Set<string>;
  onPressCourse: (course: Course) => void;
  header?: React.ReactNode;
};

export function AtolyeSkillTree({ courses, completedIds, onPressCourse, header }: Props) {
  const insets = useSafeAreaInsets();
  const coursesMeta = useMemo(() => computeCoursesMeta(courses, completedIds), [courses, completedIds]);

  const sectionGroups = ATOLYELER_SECTIONS.map((section) => ({
    section,
    courses: coursesMeta.filter((c) => c.sectionId === section.id),
  })).filter((g) => g.courses.length > 0);

  if (courses.length === 0) {
    return (
      <ScrollView style={{ backgroundColor: '#F5F5F5' }} contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}>
        {header}
        <View style={{ alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, paddingTop: 40 }}>
          <FileText size={48} color="#D7DADD" />
          <Text style={{ color: '#9AA0AC', marginTop: 12, fontSize: 15, textAlign: 'center', lineHeight: 22 }}>
            Henüz atölye içeriği yok.
          </Text>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      style={{ backgroundColor: '#F5F5F5' }}
      contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}>
      {header}
      {sectionGroups.map(({ section, courses: sectionCourses }) => (
        <View key={section.id} style={{ marginTop: 32 }}>
          <View style={{ alignItems: 'center', paddingHorizontal: 24, marginBottom: 8 }}>
            <Text style={{ fontSize: 22, fontFamily: 'PlusJakartaSans-ExtraBold', color: '#1A1A1A' }}>{section.title}</Text>
            <Text style={{ fontSize: 13, fontFamily: 'IBMPlexMono-SemiBold', color: '#1E3A5F', marginTop: 4 }}>
              {section.subtitle}
            </Text>
            <Text style={{ fontSize: 13, color: 'rgba(26,26,26,0.5)', marginTop: 8, textAlign: 'center' }}>
              {section.intro}
            </Text>
          </View>

          <View style={{ alignItems: 'center', paddingTop: 16 }}>
            {sectionCourses.map((meta, idx) => (
              <AtolyeSkillNode
                key={meta.course.id}
                title={meta.course.title}
                subtitle={meta.course.summary ?? meta.course.description}
                state={meta.nodeState}
                stepNumber={idx + 1}
                isEmpty={meta.isEmpty}
                lessonCount={meta.totalLessons}
                completedCount={meta.completedLessons}
                stars={meta.stars}
                onPress={() => onPressCourse(meta.course)}
              />
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
