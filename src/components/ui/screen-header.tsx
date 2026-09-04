import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';

export function ScreenHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  const router = useRouter();
  return (
    <View className="flex-row items-center gap-3 mb-6">
      <Pressable
        onPress={() => router.back()}
        className="w-10 h-10 rounded-full bg-white dark:bg-dark-card items-center justify-center border border-silver/60 dark:border-dark-border active:opacity-70">
        <ArrowLeft size={18} color="#1E3A5F" />
      </Pressable>
      <View className="flex-1">
        <Text className="text-2xl text-ink dark:text-slate-100" style={{ fontFamily: 'PlusJakartaSans-ExtraBold' }}>
          {title}
        </Text>
        {subtitle ? <Text className="text-sm text-ink/40">{subtitle}</Text> : null}
      </View>
    </View>
  );
}
