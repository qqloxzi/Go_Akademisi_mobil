import { ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { blogEntries } from '@/data/gravityContent';
import { ScreenHeader } from '@/components/ui/screen-header';
import { Card } from '@/components/ui/card';

export default function BlogPostScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const insets = useSafeAreaInsets();
  const entry = blogEntries.find((item) => item.slug === slug) ?? blogEntries[0];

  if (!entry) return null;

  return (
    <ScrollView
      className="flex-1 bg-ice-white dark:bg-dark-bg"
      contentContainerStyle={{ paddingTop: insets.top + 18, paddingHorizontal: 20, paddingBottom: insets.bottom + 36 }}
      showsVerticalScrollIndicator={false}>
      <ScreenHeader title="Blog" />

      <Card className="p-6">
        <Text className="text-[11px] font-extrabold text-accent-blue uppercase tracking-widest">{entry.category}</Text>
        <Text className="text-2xl text-ink dark:text-slate-100 mt-3" style={{ fontFamily: 'PlusJakartaSans-ExtraBold' }}>
          {entry.title}
        </Text>
        <Text className="text-sm text-ink/40 mt-2">
          {entry.author} · {entry.date}
        </Text>

        <View className="mt-7 gap-6">
          {entry.sections.map((section) => (
            <View key={section.title}>
              <Text className="text-xl text-primary-blue dark:text-accent-blue mb-2" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>
                {section.title}
              </Text>
              <Text className="text-base leading-7 text-ink/60">{section.body}</Text>
            </View>
          ))}
        </View>
      </Card>
    </ScrollView>
  );
}
