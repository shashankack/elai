import { Colors, FontFamily, Radii, Spacing } from '@/constants/theme';
import { useLayout } from '@/hooks/use-layout';
import { HOME_FOOTER, HOME_INTRO, HOME_STATS, HOME_WHY } from '@/lib/site-content';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

/** Light marketing blocks from elai-client — keep sparse on mobile home. */
export function HomeEditorial() {
  const colors = Colors.light;
  const { contentPad, isCompact, sectionTitleSize } = useLayout();

  return (
    <View style={[styles.wrap, { paddingHorizontal: contentPad }]}>
      <Text style={[styles.eyebrow, { color: colors.tint }]}>{HOME_INTRO.eyebrow}</Text>
      <Text
        style={[
          styles.headline,
          {
            color: colors.text,
            fontSize: isCompact ? 26 : sectionTitleSize + 4,
            lineHeight: isCompact ? 30 : sectionTitleSize + 10,
          },
        ]}
      >
        {HOME_INTRO.headline}
      </Text>
      <Text style={[styles.body, { color: colors.textMuted }]}>{HOME_INTRO.body}</Text>

      <View
        style={[
          styles.stats,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        {HOME_STATS.map((stat, index) => (
          <React.Fragment key={stat.label}>
            {index > 0 ? (
              <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            ) : null}
            <View style={styles.stat}>
              <Text style={[styles.statNumber, { color: colors.text }]}>{stat.number}</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]} numberOfLines={2}>
                {stat.label}
              </Text>
            </View>
          </React.Fragment>
        ))}
      </View>

      <Text style={[styles.whyTitle, { color: colors.text }]}>Why ELAI</Text>
      {HOME_WHY.map((line) => (
        <View key={line} style={styles.whyRow}>
          <View style={[styles.whyDot, { backgroundColor: colors.tint }]} />
          <Text style={[styles.whyText, { color: colors.textMuted }]}>{line}</Text>
        </View>
      ))}
    </View>
  );
}

export function HomeFooterNote() {
  const colors = Colors.light;
  const { contentPad } = useLayout();

  return (
    <View style={[styles.footer, { paddingHorizontal: contentPad }]}>
      <Text style={[styles.footerTagline, { color: colors.textMuted }]}>
        {HOME_FOOTER.tagline}
      </Text>
      <Text style={[styles.footerMeta, { color: colors.tint }]}>{HOME_FOOTER.location}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
  headline: {
    fontFamily: FontFamily.heading,
    marginTop: 2,
  },
  body: {
    fontSize: 14,
    lineHeight: 21,
    marginTop: 4,
    marginBottom: Spacing.md,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'stretch',
    borderWidth: 1,
    borderRadius: Radii.lg,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.lg,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 6,
    gap: 4,
  },
  statDivider: {
    width: StyleSheet.hairlineWidth,
    alignSelf: 'stretch',
  },
  statNumber: {
    fontFamily: FontFamily.heading,
    fontSize: 20,
  },
  statLabel: {
    fontSize: 10,
    lineHeight: 13,
    textAlign: 'center',
    fontWeight: '600',
  },
  whyTitle: {
    fontFamily: FontFamily.heading,
    fontSize: 20,
    marginBottom: Spacing.sm,
  },
  whyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  whyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 7,
  },
  whyText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  footerTagline: {
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
  },
  footerMeta: {
    fontSize: 12,
    fontWeight: '700',
  },
});
