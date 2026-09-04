import { Image, Linking, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Mail } from 'lucide-react-native';
import { instructorsData } from '@/data/gravityContent';
import { ScreenHeader } from '@/components/ui/screen-header';
import { Card } from '@/components/ui/card';
import { PrimaryButton } from '@/components/ui/primary-button';

export default function InstructorProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const instructor = instructorsData.find((item) => item.id === id) ?? instructorsData[0];

  if (!instructor) return null;

  return (
    <ScrollView
      className="flex-1 bg-ice-white dark:bg-dark-bg"
      contentContainerStyle={{ paddingTop: insets.top + 18, paddingHorizontal: 20, paddingBottom: insets.bottom + 36 }}
      showsVerticalScrollIndicator={false}>
      <ScreenHeader title="Eğitmen" />

      <Card className="p-6">
        <View className="w-28 h-28 rounded-full bg-primary-blue overflow-hidden mb-5 items-center justify-center">
          {instructor.avatar ? (
            <Image source={instructor.avatar} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
          ) : (
            <Text className="text-3xl font-extrabold text-white">
              {instructor.name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase() ?? '').join('')}
            </Text>
          )}
        </View>
        <Text className="text-2xl text-ink dark:text-slate-100" style={{ fontFamily: 'PlusJakartaSans-ExtraBold' }}>
          {instructor.name}
        </Text>
        <Text className="text-base font-bold text-accent-blue mt-1">{instructor.title}</Text>
        <Text className="text-sm text-ink/40 mt-1">{instructor.location}</Text>

        <Text className="text-base leading-7 text-ink/60 mt-6">{instructor.about}</Text>

        <View className="mt-6">
          <PrimaryButton
            label={instructor.email}
            onPress={() => Linking.openURL(`mailto:${instructor.email}`)}
            icon={<Mail size={18} color="#fff" />}
          />
        </View>

        <Text className="text-[11px] font-extrabold text-accent-blue uppercase tracking-widest mt-7 mb-3">Kursları</Text>
        <View className="gap-2">
          {instructor.courses.map((course) => (
            <View key={course.slug} className="rounded-2xl bg-ice-white dark:bg-dark-bg p-4">
              <Text className="font-bold text-ink" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>
                {course.title}
              </Text>
              <Text className="text-sm text-ink/50 mt-1">{course.level}</Text>
            </View>
          ))}
        </View>
      </Card>
    </ScrollView>
  );
}
