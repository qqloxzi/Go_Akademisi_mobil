/**
 * Atölye alıştırma oynatıcısı — tahta + tek açıklama satırı.
 * Tamamlama sessiz gerçekleşir (üst bardaki "sonraki" oku); kutlama banner'ı yok.
 */
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Modal, Pressable, ScrollView, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, ArrowRight, List, X, Check, Lock, AlertCircle, PlayCircle } from 'lucide-react-native';
import GoBoard from '@/components/GoBoard';
import {
  fetchCurriculum,
  findCourseBySlug,
  flattenLessonsForCourse,
  getNextLesson,
  type Course,
  type Lesson,
} from '@/lib/education/fetchCurriculum';
import {
  fetchRemoteCompletedLessonIds,
  loadLocalCompletedIds,
  markLessonCompleted,
  saveLocalCompletedIds,
  syncLocalCompletedIdsToRemote,
} from '@/lib/education/progressStorage';
import { supabase } from '@/lib/supabase';
import { PrimaryButton } from '@/components/ui/primary-button';

function formatCoord(x: number, y: number, size: number): string {
  const col = String.fromCharCode(65 + (x >= 8 ? x + 1 : x));
  return `${col}${size - y}`;
}

function cleanText(text: string | null | undefined): string {
  if (!text) return '';
  return text.replace(/https:\/\/online-go\.com\/review\/\d+/g, '').trim();
}

function getLessonIntroText(lesson: Lesson): string {
  const initialDescription = cleanText(lesson.problem?.initialDescription);
  if (initialDescription) return initialDescription;
  const body = cleanText(lesson.body);
  if (body) return body;
  const problemDescription = cleanText(lesson.problem?.description);
  if (problemDescription && !problemDescription.startsWith('SGF:')) return problemDescription;
  return '';
}

function SidebarMenu({
  course,
  selectedId,
  completedIds,
  unlockedIds,
  onSelect,
}: {
  course: Course;
  selectedId: string | null;
  completedIds: Set<string>;
  unlockedIds: Set<string>;
  onSelect: (id: string) => void;
}) {
  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      {course.modules.map((mod) => (
        <View key={mod.id} style={{ marginBottom: 16 }}>
          <Text
            style={{
              fontSize: 10,
              fontWeight: '700',
              color: '#9AA0AC',
              textTransform: 'uppercase',
              letterSpacing: 1.5,
              paddingHorizontal: 16,
              marginBottom: 4,
            }}>
            {mod.title}
          </Text>
          {mod.lessons.map((lesson) => {
            const isSelected = lesson.id === selectedId;
            const isDone = completedIds.has(lesson.id);
            const isUnlocked = unlockedIds.has(lesson.id);
            return (
              <Pressable
                key={lesson.id}
                onPress={() => isUnlocked && onSelect(lesson.id)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  borderRadius: 10,
                  opacity: isUnlocked ? 1 : 0.4,
                  backgroundColor: isSelected ? 'rgba(46,159,224,0.1)' : 'transparent',
                }}>
                {isDone ? (
                  <Check size={16} color="#4C9A6A" />
                ) : isUnlocked ? (
                  <PlayCircle size={16} color="#2E9FE0" />
                ) : (
                  <Lock size={14} color="#9AA0AC" />
                )}
                <Text
                  numberOfLines={2}
                  style={{
                    flex: 1,
                    fontSize: 13,
                    fontFamily: 'PlusJakartaSans-Bold',
                    color: isSelected ? '#1E3A5F' : isUnlocked ? 'rgba(26,26,26,0.7)' : 'rgba(26,26,26,0.3)',
                  }}>
                  {lesson.title}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ))}
    </ScrollView>
  );
}

function LessonContent({
  lesson,
  completed,
  onSolved,
  progressIndex,
  progressTotal,
  onSolvedStateChange,
}: {
  lesson: Lesson;
  completed: boolean;
  onSolved: () => void;
  progressIndex: number;
  progressTotal: number;
  onSolvedStateChange?: (solved: boolean) => void;
}) {
  const { width, height } = useWindowDimensions();
  const isShortScreen = height < 720;
  const boardMaxByHeight = height * (isShortScreen ? 0.48 : 0.54);
  const boardPx = Math.min(width - 24, boardMaxByHeight);

  const [activeNodeInfo, setActiveNodeInfo] = useState<{
    x: number;
    y: number;
    color: string;
    comment: string | null;
  } | null>(null);
  const solvedOnceRef = useRef(false);
  const prevLessonIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (prevLessonIdRef.current === null) {
      prevLessonIdRef.current = lesson.id;
      solvedOnceRef.current = false;
      onSolvedStateChange?.(completed);
      return;
    }
    if (prevLessonIdRef.current !== lesson.id) {
      prevLessonIdRef.current = lesson.id;
      setActiveNodeInfo(null);
      solvedOnceRef.current = false;
      onSolvedStateChange?.(completed);
    }
  }, [lesson.id, completed, onSolvedStateChange]);

  const shakeAnim = useRef(new Animated.Value(0)).current;
  const correctOpacity = useRef(new Animated.Value(0)).current;
  const wrongOpacity = useRef(new Animated.Value(0)).current;
  const [feedbackType, setFeedbackType] = useState<'correct' | 'wrong' | null>(null);

  const triggerCorrect = useCallback(() => {
    correctOpacity.setValue(0);
    setFeedbackType('correct');
    Animated.sequence([
      Animated.timing(correctOpacity, { toValue: 1, duration: 180, useNativeDriver: true }),
      Animated.delay(750),
      Animated.timing(correctOpacity, { toValue: 0, duration: 280, useNativeDriver: true }),
    ]).start(() => setFeedbackType(null));
  }, [correctOpacity]);

  const triggerWrong = useCallback(() => {
    shakeAnim.setValue(0);
    wrongOpacity.setValue(1);
    setFeedbackType('wrong');
    Animated.parallel([
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 9, duration: 55, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -9, duration: 55, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 7, duration: 55, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -7, duration: 55, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 55, useNativeDriver: true }),
      ]),
      Animated.sequence([
        Animated.delay(420),
        Animated.timing(wrongOpacity, { toValue: 0, duration: 220, useNativeDriver: true }),
      ]),
    ]).start(() => setFeedbackType(null));
  }, [shakeAnim, wrongOpacity]);

  const handleSolveCorrect = useCallback(() => {
    triggerCorrect();
    if (!solvedOnceRef.current) {
      solvedOnceRef.current = true;
      onSolved();
      onSolvedStateChange?.(true);
    }
  }, [onSolved, onSolvedStateChange, triggerCorrect]);

  const handleWrong = useCallback(() => {
    triggerWrong();
  }, [triggerWrong]);

  const handleNodeChange = useCallback(
    (info: { x: number; y: number; comment: string | null; color: string | null } | null) => {
      if (!info) {
        setActiveNodeInfo(null);
        return;
      }
      setActiveNodeInfo({ x: info.x, y: info.y, color: info.color ?? 'black', comment: info.comment });
    },
    []
  );

  const initialTurn: 'black' | 'white' = lesson.problem?.turn === 'white' ? 'white' : 'black';
  const boardSize = lesson.problem?.size ?? 19;
  const introText = getLessonIntroText(lesson);
  const moveComment = cleanText(activeNodeInfo?.comment);
  const moveLabel = activeNodeInfo
    ? `${activeNodeInfo.color === 'white' ? 'Beyaz' : 'Siyah'} · ${formatCoord(activeNodeInfo.x, activeNodeInfo.y, boardSize)}`
    : null;

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
      <Animated.View
        style={[
          { alignItems: 'center', paddingHorizontal: 12, paddingTop: isShortScreen ? 6 : 10 },
          { transform: [{ translateX: shakeAnim }] },
        ]}>
        <View style={{ alignSelf: 'stretch', marginBottom: 10 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <Text
              style={{ fontSize: 11, fontFamily: 'PlusJakartaSans-Bold', color: '#2E9FE0', textTransform: 'uppercase', letterSpacing: 0.5 }}
              numberOfLines={1}>
              Alıştırma · {lesson.title}
            </Text>
            <Text
              style={{
                fontSize: 11,
                color: '#2E9FE0',
                fontFamily: 'PlusJakartaSans-Bold',
                backgroundColor: 'rgba(46,159,224,0.1)',
                overflow: 'hidden',
                paddingHorizontal: 8,
                paddingVertical: 3,
                borderRadius: 8,
              }}>
              {progressIndex}/{progressTotal}
            </Text>
          </View>
          {introText && !activeNodeInfo ? (
            <Text style={{ fontSize: isShortScreen ? 17 : 20, fontFamily: 'PlusJakartaSans-ExtraBold', color: '#1A1A1A', lineHeight: isShortScreen ? 22 : 26 }}>
              {introText}
            </Text>
          ) : null}
        </View>

        <View style={{ alignSelf: 'stretch', flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <View
            style={{
              width: 10,
              height: 10,
              borderRadius: 5,
              backgroundColor: initialTurn === 'black' ? '#1A1A1A' : '#f5f0e8',
              borderWidth: 1,
              borderColor: 'rgba(148,163,184,0.7)',
            }}
          />
          <Text style={{ fontSize: 12, color: '#6b7280', fontWeight: '500' }}>
            {initialTurn === 'white' ? 'Beyaz oynar' : 'Siyah oynar'}
          </Text>
        </View>

        {lesson.problem && (
          <GoBoard
            size={boardSize}
            boardSizePx={boardPx}
            initialState={lesson.problem.initialState}
            startTurn={initialTurn}
            problem={lesson.problem}
            onSolve={handleSolveCorrect}
            onWrong={handleWrong}
            onNodeChange={handleNodeChange}
            hideTurnIndicator
          />
        )}
      </Animated.View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}>
        {moveLabel ? (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'flex-start',
              gap: 8,
              borderRadius: 12,
              backgroundColor: 'rgba(30,58,95,0.05)',
              paddingHorizontal: 16,
              paddingVertical: 14,
            }}>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 11,
                  fontFamily: 'PlusJakartaSans-Bold',
                  color: '#2E9FE0',
                  letterSpacing: 0.4,
                  textTransform: 'uppercase',
                  marginBottom: 4,
                }}>
                {moveLabel}
              </Text>
              {moveComment ? (
                <Text style={{ fontSize: 15, color: 'rgba(26,26,26,0.8)', lineHeight: 21 }}>{moveComment}</Text>
              ) : null}
            </View>
          </View>
        ) : null}
      </ScrollView>

      {feedbackType === 'correct' && (
        <Animated.View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: correctOpacity,
            pointerEvents: 'none',
          }}>
          <View
            style={{
              width: 88,
              height: 88,
              borderRadius: 44,
              backgroundColor: 'rgba(76,154,106,0.93)',
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#4C9A6A',
              shadowOpacity: 0.45,
              shadowRadius: 16,
              elevation: 8,
            }}>
            <Check size={52} color="#fff" />
          </View>
        </Animated.View>
      )}

      {feedbackType === 'wrong' && (
        <Animated.View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: wrongOpacity,
            pointerEvents: 'none',
          }}>
          <View
            style={{
              width: 88,
              height: 88,
              borderRadius: 44,
              backgroundColor: 'rgba(214,86,79,0.90)',
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#D6564F',
              shadowOpacity: 0.4,
              shadowRadius: 14,
              elevation: 8,
            }}>
            <X size={52} color="#fff" />
          </View>
        </Animated.View>
      )}
    </View>
  );
}

export default function AtolyelerKursScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { slug } = useLocalSearchParams<{ slug: string }>();

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [lessonSolved, setLessonSolved] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const activeCourse = useMemo(() => (slug ? findCourseBySlug(courses, slug) : null), [courses, slug]);
  const flatLessons = useMemo(
    () => (activeCourse && slug ? flattenLessonsForCourse(courses, slug) : []),
    [courses, slug, activeCourse]
  );
  const currentLesson = useMemo(
    () => flatLessons.find((l) => l.id === selectedLessonId) ?? null,
    [flatLessons, selectedLessonId]
  );
  const lessonCompleted = currentLesson ? completedIds.has(currentLesson.id) : false;
  const nextLesson = useMemo(
    () => (selectedLessonId ? getNextLesson(flatLessons, selectedLessonId) : null),
    [flatLessons, selectedLessonId]
  );
  const lessonIndex = flatLessons.findIndex((l) => l.id === selectedLessonId);
  const prevLesson = lessonIndex > 0 ? flatLessons[lessonIndex - 1] : null;

  const unlockedIds = useMemo(() => {
    const set = new Set<string>();
    flatLessons.forEach((lesson, idx) => {
      if (idx === 0 || completedIds.has(lesson.id) || completedIds.has(flatLessons[idx - 1]!.id)) {
        set.add(lesson.id);
      }
    });
    return set;
  }, [flatLessons, completedIds]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth?.user?.id ?? null;
      if (!cancelled) setUserId(uid);

      const ids = await loadLocalCompletedIds();
      if (!cancelled) setCompletedIds(ids);

      if (uid) {
        const remote = await fetchRemoteCompletedLessonIds(uid);
        if (!cancelled) {
          const merged = new Set([...ids, ...remote]);
          setCompletedIds(merged);
          saveLocalCompletedIds(merged);
          syncLocalCompletedIdsToRemote(uid, ids);
        }
      }

      const { courses: c } = await fetchCurriculum();
      if (cancelled) return;
      setCourses(c);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (flatLessons.length > 0 && !selectedLessonId) {
      setSelectedLessonId(flatLessons[0]!.id);
    }
  }, [flatLessons, selectedLessonId]);

  useEffect(() => {
    if (!loading && courses.length > 0 && slug && !activeCourse) {
      router.replace('/(tabs)/atolyeler');
    }
  }, [loading, courses, slug, activeCourse, router]);

  const handleSelectLesson = useCallback(
    (id: string) => {
      const idx = flatLessons.findIndex((l) => l.id === id);
      if (idx > 0 && !completedIds.has(flatLessons[idx - 1]!.id)) return;
      setSelectedLessonId(id);
      setSidebarOpen(false);
    },
    [flatLessons, completedIds]
  );

  const handleSolved = useCallback(async () => {
    if (!currentLesson) return;
    if (!completedIds.has(currentLesson.id)) {
      await markLessonCompleted(userId, currentLesson.id, { course: activeCourse, lesson: currentLesson });
      setCompletedIds((prev) => {
        const n = new Set(prev);
        n.add(currentLesson.id);
        saveLocalCompletedIds(n);
        return n;
      });
    }
  }, [currentLesson, completedIds, userId, activeCourse]);

  const handleNext = useCallback(() => {
    if (nextLesson) setSelectedLessonId(nextLesson.id);
  }, [nextLesson]);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', paddingTop: insets.top }}>
        <ActivityIndicator size="large" color="#2E9FE0" />
        <Text style={{ color: '#9AA0AC', marginTop: 12 }}>İçerik yükleniyor…</Text>
      </View>
    );
  }

  if (!activeCourse) {
    return (
      <View style={{ flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', padding: 32, paddingTop: insets.top }}>
        <AlertCircle size={48} color="#D7DADD" />
        <Text style={{ color: '#9AA0AC', marginTop: 12, textAlign: 'center' }}>Kurs bulunamadı.</Text>
        <View style={{ marginTop: 16, width: '100%', maxWidth: 220 }}>
          <PrimaryButton label="Geri Dön" onPress={() => router.back()} />
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F5F5', paddingTop: insets.top }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: '#fff',
          borderBottomWidth: 1,
          borderBottomColor: '#EDEFF2',
        }}>
        <Pressable
          onPress={() => router.back()}
          style={{ padding: 8, borderRadius: 100, backgroundColor: '#F5F5F5' }}>
          <ArrowLeft size={18} color="#1E3A5F" />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 13, fontFamily: 'PlusJakartaSans-Bold', color: '#1A1A1A' }} numberOfLines={1}>
            {activeCourse.title}
          </Text>
          {currentLesson && (
            <Text style={{ fontSize: 11, color: '#9AA0AC' }}>
              {lessonIndex + 1} / {flatLessons.length} ders
            </Text>
          )}
        </View>
        <Pressable
          onPress={() => setSidebarOpen(true)}
          style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center' }}>
          <List size={17} color="#1E3A5F" />
        </Pressable>
      </View>

      {currentLesson ? (
        <>
          <LessonContent
            key={currentLesson.id}
            lesson={currentLesson}
            completed={lessonCompleted}
            onSolved={handleSolved}
            progressIndex={lessonIndex + 1}
            progressTotal={flatLessons.length}
            onSolvedStateChange={setLessonSolved}
          />
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 8,
              paddingHorizontal: 16,
              paddingVertical: 12,
              backgroundColor: '#fff',
              borderTopWidth: 1,
              borderTopColor: '#EDEFF2',
            }}>
            <Pressable
              disabled={!prevLesson}
              onPress={() => prevLesson && setSelectedLessonId(prevLesson.id)}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 10, opacity: prevLesson ? 1 : 0.3 }}>
              <ArrowLeft size={16} color="rgba(26,26,26,0.6)" />
              <Text style={{ fontSize: 13, fontFamily: 'PlusJakartaSans-Bold', color: 'rgba(26,26,26,0.6)' }}>Önceki</Text>
            </Pressable>

            {lessonSolved && !lessonCompleted ? (
              <Pressable
                onPress={handleSolved}
                style={{ paddingHorizontal: 18, paddingVertical: 10, borderRadius: 12, backgroundColor: '#4C9A6A' }}>
                <Text style={{ fontSize: 13, fontFamily: 'PlusJakartaSans-ExtraBold', color: '#fff' }}>Tamamlandı olarak işaretle</Text>
              </Pressable>
            ) : (
              <View />
            )}

            <Pressable
              disabled={!lessonSolved || !nextLesson}
              onPress={handleNext}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 5,
                paddingHorizontal: 14,
                paddingVertical: 10,
                borderRadius: 12,
                backgroundColor: lessonSolved && nextLesson ? 'rgba(30,58,95,0.1)' : 'transparent',
                opacity: lessonSolved && nextLesson ? 1 : 0.3,
              }}>
              <Text style={{ fontSize: 13, fontFamily: 'PlusJakartaSans-Bold', color: '#1E3A5F' }}>Sonraki</Text>
              <ArrowRight size={16} color="#1E3A5F" />
            </Pressable>
          </View>
        </>
      ) : (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: '#9AA0AC' }}>Bu kursta henüz ders yok.</Text>
        </View>
      )}

      <Modal visible={sidebarOpen} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setSidebarOpen(false)}>
        <View style={{ flex: 1, backgroundColor: '#fff', paddingTop: insets.top + 8 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 20,
              paddingBottom: 16,
              borderBottomWidth: 1,
              borderBottomColor: '#F5F5F5',
            }}>
            <Text style={{ fontSize: 15, fontFamily: 'PlusJakartaSans-Bold', color: '#1A1A1A' }}>Ders Listesi</Text>
            <Pressable
              onPress={() => setSidebarOpen(false)}
              style={{ padding: 8, borderRadius: 100, backgroundColor: '#F5F5F5' }}>
              <X size={20} color="#1E3A5F" />
            </Pressable>
          </View>
          <SidebarMenu
            course={activeCourse}
            selectedId={selectedLessonId}
            completedIds={completedIds}
            unlockedIds={unlockedIds}
            onSelect={handleSelectLesson}
          />
        </View>
      </Modal>
    </View>
  );
}
