import { useState } from 'react';
import { Image, Linking, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CheckCircle2, GraduationCap, Mail, X } from 'lucide-react-native';
import { instructorsData } from '@/data/gravityContent';
import { useAuth } from '@/context/auth-context';
import { sendInstructorMessage } from '@/lib/instructorMessages';
import { ScreenHeader } from '@/components/ui/screen-header';
import { Card } from '@/components/ui/card';
import { PrimaryButton } from '@/components/ui/primary-button';

function PrivateLessonModal({
  visible,
  onClose,
  instructor,
}: {
  visible: boolean;
  onClose: () => void;
  instructor: { id: string; name: string };
}) {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [email, setEmail] = useState(user?.email ?? '');
  const [phone, setPhone] = useState('');
  const [body, setBody] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  async function submit() {
    if (!name.trim() || !email.trim() || !body.trim()) return;
    setStatus('loading');
    const { error } = await sendInstructorMessage({
      senderId: user?.id ?? null,
      name,
      email,
      phone,
      instructorId: instructor.id,
      instructorName: instructor.name,
      body,
    });
    setStatus(error ? 'error' : 'success');
  }

  function handleClose() {
    onClose();
    setTimeout(() => {
      setName('');
      setPhone('');
      setBody('');
      setStatus('idle');
    }, 300);
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={handleClose}>
      <View className="flex-1 bg-ice-white dark:bg-dark-bg" style={{ paddingTop: insets.top + 8 }}>
        <View className="flex-row items-center justify-between px-5 pb-4 border-b border-silver/60 dark:border-dark-border">
          <Text className="text-lg text-ink dark:text-slate-100" style={{ fontFamily: 'PlusJakartaSans-ExtraBold' }} numberOfLines={1}>
            {instructor.name} — Özel Ders
          </Text>
          <Pressable onPress={handleClose} className="w-9 h-9 rounded-full bg-white dark:bg-dark-card items-center justify-center border border-silver/60 dark:border-dark-border">
            <X size={18} color="#1E3A5F" />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 24 }} showsVerticalScrollIndicator={false}>
          {status === 'success' ? (
            <View className="flex-row items-center gap-3 p-5 rounded-2xl bg-success/10 border border-success/25">
              <CheckCircle2 size={22} color="#4C9A6A" />
              <Text className="flex-1 text-sm font-bold text-success">
                Mesajın {instructor.name}'e iletildi! En kısa sürede dönüş yapılacak.
              </Text>
            </View>
          ) : (
            <View className="gap-4">
              <View>
                <Text className="text-xs font-bold uppercase tracking-wider text-ink/40 mb-1.5">Ad Soyad</Text>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  className="px-4 py-3.5 rounded-2xl border border-silver/60 dark:border-dark-border bg-white dark:bg-dark-card text-sm text-ink dark:text-slate-100"
                />
              </View>
              <View>
                <Text className="text-xs font-bold uppercase tracking-wider text-ink/40 mb-1.5">E-posta</Text>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  className="px-4 py-3.5 rounded-2xl border border-silver/60 dark:border-dark-border bg-white dark:bg-dark-card text-sm text-ink dark:text-slate-100"
                />
              </View>
              <View>
                <Text className="text-xs font-bold uppercase tracking-wider text-ink/40 mb-1.5">Telefon (opsiyonel)</Text>
                <TextInput
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  className="px-4 py-3.5 rounded-2xl border border-silver/60 dark:border-dark-border bg-white dark:bg-dark-card text-sm text-ink dark:text-slate-100"
                />
              </View>
              <View>
                <Text className="text-xs font-bold uppercase tracking-wider text-ink/40 mb-1.5">Mesajın</Text>
                <TextInput
                  value={body}
                  onChangeText={setBody}
                  multiline
                  numberOfLines={4}
                  placeholder="Seviyen, uygun günler, ne üzerinde çalışmak istediğin..."
                  placeholderTextColor="#9AA0AC"
                  textAlignVertical="top"
                  className="px-4 py-3.5 rounded-2xl border border-silver/60 dark:border-dark-border bg-white dark:bg-dark-card text-sm text-ink dark:text-slate-100 h-28"
                />
              </View>

              {status === 'error' && (
                <Text className="text-sm font-bold text-heart">Bir şeyler ters gitti, tekrar dener misin?</Text>
              )}

              <PrimaryButton
                label={status === 'loading' ? 'Gönderiliyor...' : 'Mesajı Gönder'}
                loading={status === 'loading'}
                onPress={submit}
              />
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

export default function InstructorProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const instructor = instructorsData.find((item) => item.id === id) ?? instructorsData[0];
  const [lessonOpen, setLessonOpen] = useState(false);

  if (!instructor) return null;

  return (
    <ScrollView
      className="flex-1 bg-ice-white dark:bg-dark-bg"
      contentContainerStyle={{ paddingTop: insets.top + 18, paddingHorizontal: 20, paddingBottom: insets.bottom + 36 }}
      showsVerticalScrollIndicator={false}>
      <ScreenHeader title="Eğitmen" />

      <Card className="p-6">
        <View className="w-28 h-28 rounded-full bg-primary-blue overflow-hidden mb-5 items-center justify-center">
          {instructor.avatar ? (
            <Image source={instructor.avatar} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
          ) : (
            <Text className="text-3xl font-extrabold text-white">
              {instructor.name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase() ?? '').join('')}
            </Text>
          )}
        </View>
        <Text className="text-2xl text-ink dark:text-slate-100" style={{ fontFamily: 'PlusJakartaSans-ExtraBold' }}>
          {instructor.name}
        </Text>
        <Text className="text-base font-bold text-accent-blue mt-1">{instructor.title}</Text>
        <Text className="text-sm text-ink/40 mt-1">{instructor.location}</Text>

        <Text className="text-base leading-7 text-ink/60 mt-6">{instructor.about}</Text>

        <View className="mt-6 gap-3">
          <PrimaryButton
            label={instructor.email}
            onPress={() => Linking.openURL(`mailto:${instructor.email}`)}
            icon={<Mail size={18} color="#fff" />}
          />
          {instructor.privateLessons && (
            <PrimaryButton
              label="Özel Ders İste"
              variant="secondary"
              onPress={() => setLessonOpen(true)}
              icon={<GraduationCap size={18} color="#1E3A5F" />}
            />
          )}
        </View>

        <Text className="text-[11px] font-extrabold text-accent-blue uppercase tracking-widest mt-7 mb-3">Kursları</Text>
        <View className="gap-2">
          {instructor.courses.map((course) => (
            <View key={course.slug} className="rounded-2xl bg-ice-white dark:bg-dark-bg p-4">
              <Text className="font-bold text-ink" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>
                {course.title}
              </Text>
              <Text className="text-sm text-ink/50 mt-1">{course.level}</Text>
            </View>
          ))}
        </View>
      </Card>

      {instructor.privateLessons && (
        <PrivateLessonModal visible={lessonOpen} onClose={() => setLessonOpen(false)} instructor={instructor} />
      )}
    </ScrollView>
  );
}
