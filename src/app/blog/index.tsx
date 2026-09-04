import { Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronRight } from 'lucide-react-native';
import { blogEntries } from '@/data/gravityContent';
import { ScreenHeader } from '@/components/ui/screen-header';
import { Card } from '@/components/ui/card';

export default function BlogScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <ScrollView
      className="flex-1 bg-ice-white dark:bg-dark-bg"
      contentContainerStyle={{ paddingTop: insets.top + 18, paddingHorizontal: 20, paddingBottom: insets.bottom + 36 }}
      showsVerticalScrollIndicator={false}>
      <ScreenHeader title="Blog" subtitle="Go üzerine yazılar" />

      <View className="gap-3">
        {blogEntries.map((entry) => (
          <Pressable key={entry.slug} onPress={() => router.push(`/blog/${entry.slug}`)} className="active:opacity-90">
            <Card className="p-5">
              <Text className="text-[11px] font-extrabold text-accent-blue uppercase tracking-widest">{entry.category}</Text>
              <Text className="text-xl text-ink dark:text-slate-100 mt-2" style={{ fontFamily: 'PlusJakartaSans-ExtraBold' }}>
                {entry.title}
              </Text>
              <Text className="text-sm text-ink/50 mt-2 leading-6">{entry.snippet}</Text>
              <View className="flex-row items-center justify-between mt-4">
                <Text className="text-xs text-ink/40">
                  {entry.author} · {entry.date}
                </Text>
                <ChevronRight size={18} color="#2E9FE0" />
              </View>
            </Card>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}
