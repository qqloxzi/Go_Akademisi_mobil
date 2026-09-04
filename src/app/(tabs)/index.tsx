import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HeroSection } from '@/components/home/HeroSection';
import { ActiveLeagues } from '@/components/home/ActiveLeagues';
import { ExploreSection } from '@/components/home/ExploreSection';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-ice-white dark:bg-dark-bg">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingTop: insets.top + 12,
          paddingBottom: insets.bottom + 40,
          paddingHorizontal: 20,
        }}
        showsVerticalScrollIndicator={false}>
        <HeroSection />
        <ActiveLeagues />
        <ExploreSection />
      </ScrollView>
    </View>
  );
}
