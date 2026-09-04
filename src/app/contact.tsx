import { Linking, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Mail, GraduationCap, Trophy } from 'lucide-react-native';
import { ScreenHeader } from '@/components/ui/screen-header';
import { Card } from '@/components/ui/card';
import { PrimaryButton } from '@/components/ui/primary-button';
import { LEGAL_LINKS } from '@/constants/socialLinks';

const CONTACT_EMAIL = 'agoragoakademisi@gmail.com';

function InfoRow({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <View className="flex-row gap-3 rounded-2xl bg-ice-white dark:bg-dark-bg p-4">
      {icon}
      <View className="flex-1">
        <Text className="font-bold text-ink" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>
          {title}
        </Text>
        <Text className="text-sm text-ink/50 mt-1">{text}</Text>
      </View>
    </View>
  );
}

export default function ContactScreen() {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      className="flex-1 bg-ice-white dark:bg-dark-bg"
      contentContainerStyle={{ paddingTop: insets.top + 18, paddingHorizontal: 20, paddingBottom: insets.bottom + 36 }}
      showsVerticalScrollIndicator={false}>
      <ScreenHeader title="İletişim" />

      <Card className="p-6">
        <Text className="text-2xl text-ink mb-3" style={{ fontFamily: 'PlusJakartaSans-ExtraBold' }}>
          Agora ile iletişime geç
        </Text>
        <Text className="text-base leading-7 text-ink/60 mb-6">
          Dersler, atölyeler, ligler veya hesap süreçleri hakkında bize ulaşabilirsin.
        </Text>

        <PrimaryButton
          label={CONTACT_EMAIL}
          onPress={() => Linking.openURL(`mailto:${CONTACT_EMAIL}`)}
          icon={<Mail size={18} color="#fff" />}
        />

        <View className="mt-6 gap-3">
          <InfoRow
            icon={<GraduationCap size={20} color="#2E9FE0" />}
            title="Eğitim"
            text="Seviyene göre atölye ve lig seçimi."
          />
          <InfoRow icon={<Trophy size={20} color="#2E9FE0" />} title="Ligler" text="Fikstür ve lig katılım süreçleri." />
        </View>

        <Pressable onPress={() => Linking.openURL(LEGAL_LINKS.privacyPolicy)} className="mt-6 active:opacity-70">
          <Text className="text-center text-xs font-semibold text-accent-blue">Gizlilik Politikası</Text>
        </Pressable>
      </Card>
    </ScrollView>
  );
}
