import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { CalendarDays, Newspaper, Users, Mail, GraduationCap, BarChart3 } from 'lucide-react-native';
import { Eyebrow } from '@/components/ui/eyebrow';
import { Card } from '@/components/ui/card';

const LINKS = [
  { label: 'Atölyeler', description: 'Beceri ağacında kendi hızında ilerle.', href: '/(tabs)/atolyeler', Icon: GraduationCap, color: '#1E3A5F' },
  { label: 'Liderlik', description: 'XP sıralamasında yerini gör.', href: '/(tabs)/liderlik', Icon: BarChart3, color: '#8B5CF6' },
  { label: 'Fikstür', description: 'Güncel puan durumu ve maç eşleşmeleri.', href: '/fikstur', Icon: CalendarDays, color: '#2E9FE0' },
  { label: 'Blog', description: 'Go üzerine yazılar ve haberler.', href: '/blog', Icon: Newspaper, color: '#4C9A6A' },
  { label: 'Eğitmenler', description: 'Agora eğitmen kadrosuyla tanış.', href: '/instructor', Icon: Users, color: '#D9A83B' },
  { label: 'İletişim', description: 'Sorularını doğrudan bize ulaştır.', href: '/contact', Icon: Mail, color: '#D6564F' },
] as const;

export function ExploreSection() {
  const router = useRouter();
  return (
    <View className="mb-8">
      <Eyebrow>Keşfet</Eyebrow>
      <Text className="mt-1 text-2xl text-ink dark:text-slate-100 mb-4" style={{ fontFamily: 'PlusJakartaSans-ExtraBold' }}>
        Daha Fazlası
      </Text>

      <View className="flex-row flex-wrap justify-between">
        {LINKS.map(({ label, description, href, Icon, color }) => (
          <Pressable
            key={href}
            onPress={() => router.push(href as any)}
            className="active:opacity-80 mb-3"
            style={{ width: '48.5%' }}>
            <Card className="p-3.5" style={{ minHeight: 132 }}>
              <View className="h-10 w-10 items-center justify-center rounded-full mb-2.5" style={{ backgroundColor: `${color}1A` }}>
                <Icon size={18} color={color} />
              </View>
              <Text className="text-[13px] text-ink dark:text-slate-100" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>
                {label}
              </Text>
              <Text className="text-[11px] text-ink/50 mt-1 leading-4">{description}</Text>
            </Card>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
