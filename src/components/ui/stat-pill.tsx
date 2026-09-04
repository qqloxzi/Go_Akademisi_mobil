import { View, Text } from 'react-native';
import { Flame, Gem, Heart } from 'lucide-react-native';

type Kind = 'streak' | 'token' | 'heart';

const KIND_CONFIG: Record<Kind, { color: string; Icon: typeof Flame }> = {
  streak: { color: '#E8752B', Icon: Flame },
  token: { color: '#D9A83B', Icon: Gem },
  heart: { color: '#D6564F', Icon: Heart },
};

/** Web sidebar'ındaki can/token/streak rozetleri — aynı simge + renk sistemi. */
export function StatPill({ kind, value }: { kind: Kind; value: number }) {
  const { color, Icon } = KIND_CONFIG[kind];
  return (
    <View
      className="flex-row items-center gap-1.5 rounded-full px-3 py-1.5"
      style={{ backgroundColor: `${color}1A` }}>
      <Icon color={color} size={15} fill={kind === 'heart' ? color : 'none'} />
      <Text style={{ color, fontFamily: 'IBMPlexMono-SemiBold' }} className="text-[13px]">
        {value}
      </Text>
    </View>
  );
}
