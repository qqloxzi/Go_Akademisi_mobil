import { View, Text, Pressable } from 'react-native';
import { Check, Lock, Star } from 'lucide-react-native';

export type NodeState = 'locked' | 'current' | 'completed';

/** Web'deki SkillTreePath.jsx ile birebir — zigzag Duolingo yolu. */
const OFFSETS = [0, 56, 84, 56, 0, -56, -84, -56];

type Props = {
  title: string;
  subtitle: string | null;
  state: NodeState;
  stepNumber: number;
  isEmpty: boolean;
  lessonCount: number;
  completedCount: number;
  stars: number;
  onPress: () => void;
};

export function AtolyeSkillNode({
  title,
  state,
  stepNumber,
  isEmpty,
  lessonCount,
  completedCount,
  stars,
  onPress,
}: Props) {
  const offset = OFFSETS[(stepNumber - 1) % OFFSETS.length];
  const locked = state === 'locked' || isEmpty;
  const complete = state === 'completed';

  const bg = locked ? 'rgba(26,26,26,0.08)' : complete ? '#4C9A6A' : '#1E3A5F';
  const iconColor = locked ? 'rgba(26,26,26,0.3)' : '#fff';

  return (
    <View style={{ alignItems: 'center', transform: [{ translateX: offset }] }}>
      <Pressable onPress={onPress} disabled={locked} className="active:opacity-80">
        <View
          style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: bg,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          {locked ? (
            <Lock size={24} color={iconColor} />
          ) : complete ? (
            <Check size={28} color={iconColor} />
          ) : (
            <Text style={{ fontSize: 18, fontFamily: 'PlusJakartaSans-ExtraBold', color: iconColor }}>{stepNumber}</Text>
          )}

          {stars > 0 ? (
            <View
              style={{
                position: 'absolute',
                bottom: -8,
                flexDirection: 'row',
                gap: 2,
                backgroundColor: '#fff',
                borderRadius: 100,
                paddingHorizontal: 6,
                paddingVertical: 3,
                shadowColor: '#000',
                shadowOpacity: 0.1,
                shadowRadius: 6,
                shadowOffset: { width: 0, height: 2 },
                elevation: 2,
              }}>
              {[0, 1, 2].map((s) => (
                <Star key={s} size={10} color="#D9A83B" fill={s < stars ? '#D9A83B' : 'transparent'} />
              ))}
            </View>
          ) : null}
        </View>
      </Pressable>

      <View style={{ marginTop: 10, marginBottom: 26, alignItems: 'center', maxWidth: 140 }}>
        <Text style={{ fontSize: 13, fontFamily: 'PlusJakartaSans-ExtraBold', color: '#1A1A1A', textAlign: 'center' }}>
          {title}
        </Text>
        <Text style={{ fontSize: 11, color: 'rgba(26,26,26,0.4)', fontFamily: 'IBMPlexMono-Medium', marginTop: 2 }}>
          {isEmpty ? 'Yakında' : `${completedCount}/${lessonCount} ders`}
        </Text>
      </View>
    </View>
  );
}
