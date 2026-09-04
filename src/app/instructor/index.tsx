import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronRight } from 'lucide-react-native';
import { instructorsData, type InstructorProfile } from '@/data/gravityContent';
import { ScreenHeader } from '@/components/ui/screen-header';
import { Card } from '@/components/ui/card';

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toLocaleUpperCase('tr-TR') ?? '')
    .join('');
}

function InstructorAvatar({ instructor }: { instructor: InstructorProfile }) {
  return (
    <View className="w-16 h-16 rounded-full bg-primary-blue overflow-hidden items-center justify-center">
      {instructor.avatar ? (
        <Image source={instructor.avatar} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
      ) : (
        <Text className="text-lg font-extrabold text-white">{getInitials(instructor.name)}</Text>
      )}
    </View>
  );
}

export default function InstructorScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <ScrollView
      className="flex-1 bg-ice-white dark:bg-dark-bg"
      contentContainerStyle={{ paddingTop: insets.top + 18, paddingHorizontal: 20, paddingBottom: insets.bottom + 36 }}
      showsVerticalScrollIndicator={false}>
      <ScreenHeader title="Eğitmenler" subtitle="Agora'nın eğitmen kadrosu" />

      <View className="gap-3">
        {instructorsData.map((instructor) => (
          <Pressable key={instructor.id} onPress={() => router.push(`/instructor/${instructor.id}`)} className="active:opacity-90">
            <Card className="p-4 flex-row items-center gap-4">
              <InstructorAvatar instructor={instructor} />
              <View className="flex-1">
                <Text className="text-base text-ink dark:text-slate-100" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>
                  {instructor.name}
                </Text>
                <Text className="text-sm font-bold text-accent-blue mt-0.5">{instructor.title}</Text>
                <Text className="text-xs text-ink/40 mt-0.5">{instructor.location}</Text>
              </View>
              <ChevronRight size={18} color="#2E9FE0" />
            </Card>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}
