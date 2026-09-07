import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';

import { Screen, Card, Button } from '@/components/ui';
import { colors, formatINR } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/lib/auth';
import { referralApi } from '@/lib/api';

export default function ProfileScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const { user, loading, logout, refreshProfile } = useAuth();
  const [referral, setReferral] = useState<{ referralCode: string; referralBonus: number; totalReferrals: number } | null>(null);

  useEffect(() => {
    if (!user) return;
    referralApi
      .info()
      .then((d) =>
        setReferral({
          referralCode: d.referralCode,
          referralBonus: d.referralBonus,
          totalReferrals: d.totalReferrals,
        })
      )
      .catch(() => {});
    refreshProfile();
  }, [user, refreshProfile]);

  const muted = isDark ? colors.dark.textMuted : colors.textMuted;
  const text = isDark ? colors.dark.text : colors.text;

  if (!user) {
    return (
      <Screen>
        <View style={styles.centerBlock}>
          <Text style={styles.heroIcon}>👤</Text>
          <Text style={[styles.title, { color: text }]}>Your account</Text>
          <Text style={[styles.subtitle, { color: muted }]}>
            Login to apply for forms, track status, earn referral bonuses and get push notifications.
          </Text>
          <Button title="Login" onPress={() => router.push('/login')} style={styles.wide} />
          <Button title="Create free account" variant="outline" onPress={() => router.push('/signup')} style={styles.wide} />
        </View>
      </Screen>
    );
  }

  const shareReferral = async () => {
    if (!referral) return;
    const message = `🎉 Fill exam/college forms from home with ClickNsit! Use my referral code ${referral.referralCode} and get ₹25 off your first form. https://clickandsit.vercel.app`;
    try {
      await Share.share({ message });
    } catch {
      Clipboard.setStringAsync(referral.referralCode);
      Alert.alert('Copied!', 'Referral code copied to clipboard.');
    }
  };

  const confirmLogout = () => {
    Alert.alert('Logout?', 'You will need to login again to manage your forms.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => logout() },
    ]);
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.body}>
        <Card style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{(user.fullName || 'U')[0].toUpperCase()}</Text>
          </View>
          <Text style={[styles.name, { color: text }]}>{user.fullName}</Text>
          <Text style={[styles.email, { color: muted }]}>{user.email}</Text>
          <Text style={[styles.email, { color: muted }]}>📱 +91 {user.mobile}</Text>
        </Card>

        <Card style={styles.card}>
          <Text style={[styles.cardTitle, { color: text }]}>Refer & Earn</Text>
          <Text style={[styles.referralCode, { color: colors.primary }]}>{referral?.referralCode ?? user.referralCode}</Text>
          <Text style={[styles.referralInfo, { color: muted }]}>
            Earn ₹25 for every friend who fills their first form. Share your code!
          </Text>
          <View style={styles.referralStats}>
            <View style={styles.stat}>
              <Text style={[styles.statValue, { color: text }]}>{referral?.totalReferrals ?? 0}</Text>
              <Text style={[styles.statLabel, { color: muted }]}>Referrals</Text>
            </View>
            <View style={styles.stat}>
              <Text style={[styles.statValue, { color: text }]}>{formatINR(referral?.referralBonus ?? user.referralBonus)}</Text>
              <Text style={[styles.statLabel, { color: muted }]}>Earned</Text>
            </View>
          </View>
          <Button title="Share referral code 🎁" variant="outline" onPress={shareReferral} />
        </Card>

        <Card style={styles.card}>
          <Text style={[styles.cardTitle, { color: text }]}>Account</Text>
          <MenuItem label="My Applications" onPress={() => router.push('/applications')} muted={muted} text={text} />
          <MenuItem label="Browse Forms" onPress={() => router.push('/forms')} muted={muted} text={text} />
          <MenuItem
            label="Contact Support"
            onPress={() => {
              Alert.alert('Support', '📞 +91 9650752995\n💬 WhatsApp (same number)\n📧 support@clickandsit.in');
            }}
            muted={muted}
            text={text}
          />
        </Card>

        <Button title="Logout" variant="ghost" onPress={confirmLogout} />
      </ScrollView>
    </Screen>
  );
}

function MenuItem({ label, onPress, muted, text }: { label: string; onPress: () => void; muted: string; text: string }) {
  return (
    <Text style={[styles.menuItem, { color: text }]} onPress={onPress}>
      {label} <Text style={[styles.menuArrow, { color: muted }]}>›</Text>
    </Text>
  );
}

const styles = StyleSheet.create({
  centerBlock: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 10 },
  heroIcon: { fontSize: 52, marginBottom: 6 },
  title: { fontSize: 24, fontWeight: '800', textAlign: 'center' },
  subtitle: { fontSize: 14, textAlign: 'center', lineHeight: 21, marginBottom: 8 },
  wide: { alignSelf: 'stretch' },
  body: { padding: 16, paddingBottom: 40, gap: 14 },
  profileCard: { alignItems: 'center', gap: 4, paddingVertical: 24 },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  avatarText: { color: '#ffffff', fontSize: 30, fontWeight: '800' },
  name: { fontSize: 20, fontWeight: '800' },
  email: { fontSize: 13 },
  card: { gap: 8 },
  cardTitle: { fontSize: 16, fontWeight: '800' },
  referralCode: { fontSize: 22, fontWeight: '800', letterSpacing: 1 },
  referralInfo: { fontSize: 13, lineHeight: 19 },
  referralStats: { flexDirection: 'row', gap: 24, paddingVertical: 6 },
  stat: { flex: 1 },
  statValue: { fontSize: 18, fontWeight: '800' },
  statLabel: { fontSize: 12 },
  menuItem: { fontSize: 15, fontWeight: '600', paddingVertical: 8 },
  menuArrow: { fontSize: 17 },
});