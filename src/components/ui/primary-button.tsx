import { useRef } from 'react';
import { Pressable, Text, ActivityIndicator, Animated, type PressableProps } from 'react-native';

type Props = PressableProps & {
  label: string;
  loading?: boolean;
  icon?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
};

const VARIANTS = {
  primary: { bg: 'bg-primary-blue', text: 'text-white' },
  secondary: { bg: 'bg-white border border-silver', text: 'text-primary-blue' },
  danger: { bg: 'bg-heart', text: 'text-white' },
} as const;

/** Web'deki .press-btn — dokununca hafifçe aşağı iner (Duolingo tarzı 3D CTA). */
export function PrimaryButton({ label, loading, icon, variant = 'primary', disabled, style, ...rest }: Props) {
  const translateY = useRef(new Animated.Value(0)).current;
  const v = VARIANTS[variant];

  const pressIn = () =>
    Animated.timing(translateY, { toValue: 3, duration: 90, useNativeDriver: true }).start();
  const pressOut = () =>
    Animated.timing(translateY, { toValue: 0, duration: 90, useNativeDriver: true }).start();

  return (
    <Pressable
      disabled={disabled || loading}
      onPressIn={pressIn}
      onPressOut={pressOut}
      style={style}
      {...rest}>
      <Animated.View
        className={`flex-row items-center justify-center gap-2 rounded-full py-4 px-6 ${v.bg} ${disabled ? 'opacity-50' : ''}`}
        style={{ transform: [{ translateY }] }}>
        {loading ? (
          <ActivityIndicator color={variant === 'secondary' ? '#1E3A5F' : '#fff'} />
        ) : (
          <>
            {icon}
            <Text className={`font-bold text-base ${v.text}`}>{label}</Text>
          </>
        )}
      </Animated.View>
    </Pressable>
  );
}
