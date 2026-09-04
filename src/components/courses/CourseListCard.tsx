import { Pressable, Text, View } from 'react-native';
import { Clock, Users, Star, ArrowRight, Circle } from 'lucide-react-native';
import { LEVEL_BAND_META, levelBandFromLevel } from './courseTheme';

export type CourseListCardItem = {
  id: string;
  title: string;
  description?: string | null;
  level?: string | null;
  duration?: string | null;
  lessons_count?: number | null;
  price?: string | null;
  students_count?: number | null;
  rating_avg?: number | null;
  rating_count?: number | null;
};

type Props = {
  item: CourseListCardItem;
  onPress: () => void;
};

function StarRow({ rating, count }: { rating: number; count: number }) {
  return (
    <View className="flex-row items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={13}
          color="#D9A83B"
          fill={n <= Math.round(rating) ? '#D9A83B' : 'transparent'}
        />
      ))}
      <Text className="ml-1 text-xs font-bold text-ink/70">
        {rating > 0 ? rating.toFixed(1) : '—'}
      </Text>
      <Text className="text-xs text-ink/40">({count})</Text>
    </View>
  );
}

/** "Ligler" kartı — web'deki navy banner + yıldız + fiyat kartıyla birebir. */
export function CourseListCard({ item, onPress }: Props) {
  const band = LEVEL_BAND_META[levelBandFromLevel(item.title)];
  const durationLabel = [item.duration, item.lessons_count ? `${item.lessons_count} Oturum` : null]
    .filter(Boolean)
    .join(' / ');

  return (
    <Pressable onPress={onPress} accessibilityRole="button" className="active:opacity-90">
      <View className="overflow-hidden rounded-3xl bg-white dark:bg-dark-card" style={{
        shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 20, shadowOffset: { width: 0, height: 8 }, elevation: 3,
      }}>
        <View className="h-24 items-center justify-center bg-primary-blue">
          <View className="flex-row">
            <Circle size={22} color="#fff" fill="#fff" style={{ opacity: 0.9 }} />
            <Circle size={22} color="#fff" fill="#fff" style={{ opacity: 0.5, marginLeft: -8 }} />
          </View>
        </View>

        <View className="p-4">
          <Text className="mb-1 text-[11px] font-bold uppercase tracking-[1.5px] text-accent-blue">
            {band.seviyeLabel.toUpperCase()}
          </Text>
          <Text
            className="text-[17px] leading-snug text-ink dark:text-slate-100"
            style={{ fontFamily: 'PlusJakartaSans-Bold' }}
            numberOfLines={2}>
            {item.title}
          </Text>
          {item.description ? (
            <Text className="mt-1.5 text-sm leading-relaxed text-ink/50 dark:text-slate-400" numberOfLines={2}>
              {item.description}
            </Text>
          ) : null}

          <View className="mt-3">
            <StarRow rating={item.rating_avg ?? 0} count={item.rating_count ?? 0} />
          </View>

          <View className="mt-3 flex-row items-center gap-4">
            {durationLabel ? (
              <View className="flex-row items-center gap-1.5">
                <Clock size={13} color="#94a3b8" />
                <Text className="text-xs font-medium text-ink/40">{durationLabel}</Text>
              </View>
            ) : null}
            <View className="flex-row items-center gap-1.5">
              <Users size={13} color="#94a3b8" />
              <Text className="text-xs font-medium text-ink/40">{item.students_count ?? 0} öğrenci</Text>
            </View>
          </View>

          <View className="mt-4 flex-row items-center justify-between border-t border-silver/60 pt-3.5">
            <Text className="text-lg text-primary-blue" style={{ fontFamily: 'PlusJakartaSans-ExtraBold' }}>
              {item.price || 'Ücretsiz'}
            </Text>
            <View className="flex-row items-center gap-1.5 rounded-full bg-primary-blue px-4 py-2">
              <Text className="text-xs font-bold text-white">İncele</Text>
              <ArrowRight size={13} color="#fff" />
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  );
}
