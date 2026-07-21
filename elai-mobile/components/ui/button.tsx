import { Colors, Radii } from '@/constants/theme';
import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
} from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary';
  loading?: boolean;
}

export function Button({
  title,
  variant = 'primary',
  loading = false,
  disabled,
  style,
  ...props
}: ButtonProps) {
  const colors = Colors.light;
  const isPrimary = variant === 'primary';
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        isPrimary
          ? { backgroundColor: colors.tint }
          : { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.border },
        isDisabled && styles.disabled,
        style,
      ]}
      disabled={isDisabled}
      activeOpacity={0.85}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? '#fff' : colors.tint} />
      ) : (
        <Text
          style={[
            styles.text,
            { color: isPrimary ? '#fff' : colors.text },
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: Radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  text: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  disabled: {
    opacity: 0.5,
  },
});
