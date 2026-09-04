import { View, type ViewProps } from 'react-native';

/** Web'deki .shadow-card kartı — yumuşak, geniş gölge + rounded-3xl. */
export function Card({ children, className = '', style, ...rest }: ViewProps & { children: React.ReactNode }) {
  return (
    <View
      className={`rounded-3xl bg-white dark:bg-dark-card ${className}`}
      style={[
        {
          shadowColor: '#000',
          shadowOpacity: 0.06,
          shadowRadius: 20,
          shadowOffset: { width: 0, height: 8 },
          elevation: 3,
        },
        style,
      ]}
      {...rest}>
      {children}
    </View>
  );
}
