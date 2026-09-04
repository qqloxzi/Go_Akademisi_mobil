import { Text, type TextProps } from 'react-native';

/** Web'deki küçük harf aralıklı üst etiket (ör. "OYUNLAŞTIRILMIŞ ÖĞRENİM"). */
export function Eyebrow({ children, className = '', ...rest }: TextProps & { children: React.ReactNode }) {
  return (
    <Text
      className={`text-[11px] font-bold uppercase tracking-[2px] text-accent-blue ${className}`}
      {...rest}>
      {children}
    </Text>
  );
}
