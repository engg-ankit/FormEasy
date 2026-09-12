import React, { useEffect, useState } from 'react';
import {
  Alert,
  Linking,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';

import { Screen, Card, Button } from '@/components/ui';
import { EditProfileModal, ContactSupportModal } from '@/components/profile-modals';
import { colors, formatINR, radius, spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/lib/auth';
import { referralApi } from '@/lib/api';

export default function ProfileScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const { user, loading, logout, refreshProfile } = useAuth();
  const [referral, setReferral] = useState<{ referralCode: string; referralBonus: number; totalReferrals: number } | null>(null);
  const [showEdit, setShowEdit] = useState(false);
  const [showContact, setShowContact] = useState(false);

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
  const cardBg = isDark ? colors.dark.card : colors.card;
  const border = isDark ? colors.dark.border : colors.border;

  if (!user) {
    return (
      <Screen edges={[]}>
        <View style={styles.centerBlock}>
          <View style={[styles.loginIcon, { backgroundColor: `${colors.primary}15` }]}>
            <Ionicons name="person-circle-outline" size={64} color={colors.primary} />
          </View>
          <Text style={[styles.title, { color: text }]}>Welcome Back!</Text>
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
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <Card style={[styles.profileCard, { backgroundColor: cardBg, borderColor: border }]}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarText}>{(user.fullName || 'U')[0].toUpperCase()}</Text>
          </View>
          <Text style={[styles.name, { color: text }]}>{user.fullName}</Text>
          <Text style={[styles.email, { color: muted }]}>{user.email}</Text>
          <View style={[styles.phoneRow, { borderColor: border }]}>
            <Ionicons name="call-outline" size={14} color={muted} />
            <Text style={[styles.phone, { color: muted }]}>+91 {user.mobile}</Text>
          </View>
        </Card>

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: cardBg, borderColor: border }]}>
            <Ionicons name="document-text" size={20} color={colors.primary} />
            <Text style={[styles.statValue, { color: text }]}>0</Text>
            <Text style={[styles.statLabel, { color: muted }]}>Forms</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: cardBg, borderColor: border }]}>
            <Ionicons name="people" size={20} color={colors.accent} />
            <Text style={[styles.statValue, { color: text }]}>{referral?.totalReferrals ?? 0}</Text>
            <Text style={[styles.statLabel, { color: muted }]}>Referrals</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: cardBg, borderColor: border }]}>
            <Ionicons name="wallet" size={20} color={colors.success} />
            <Text style={[styles.statValue, { color: text }]}>{formatINR(referral?.referralBonus ?? user.referralBonus)}</Text>
            <Text style={[styles.statLabel, { color: muted }]}>Earned</Text>
          </View>
        </View>

        {/* Referral Card */}
        <Card style={[styles.card, { backgroundColor: cardBg, borderColor: border }]}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardIconBg, { backgroundColor: `${colors.accent}15` }]}>
              <Ionicons name="gift" size={18} color={colors.accent} />
            </View>
            <Text style={[styles.cardTitle, { color: text }]}>Refer & Earn</Text>
          </View>
          <View style={[styles.referralCodeBox, { backgroundColor: `${colors.primary}10`, borderColor: `${colors.primary}30` }]}>
            <Text style={[styles.referralCode, { color: colors.primary }]}>{referral?.referralCode ?? user.referralCode}</Text>
          </View>
          <Text style={[styles.referralInfo, { color: muted }]}>
            Earn ₹25 for every friend who fills their first form. Share your code!
          </Text>
          <Button title="Share referral code 🎁" variant="outline" onPress={shareReferral} />
        </Card>

        {/* Menu Items */}
        <Card style={[styles.card, { backgroundColor: cardBg, borderColor: border }]}>
          <MenuItem
            icon="document-text"
            label="My Applications"
            subtitle="Track all your form submissions"
            onPress={() => router.push('/(tabs)/applications')}
            color={colors.primary}
            muted={muted}
            text={text}
          />
          <MenuDivider border={border} />
          <MenuItem
            icon="search"
            label="Browse Forms"
            subtitle="Find exam, college & scholarship forms"
            onPress={() => router.push('/(tabs)/forms')}
            color={colors.accent}
            muted={muted}
            text={text}
          />
          <MenuDivider border={border} />
          <MenuItem
            icon="add-circle"
            label="Request a Form"
            subtitle="Can't find a form? Ask us to add it"
            onPress={() => router.push('/request-form')}
            color={colors.info}
            muted={muted}
            text={text}
          />
          <MenuDivider border={border} />
          <MenuItem
            icon="card"
            label="Payment History"
            subtitle="All your transactions in one place"
            onPress={() => router.push('/payment-history')}
            color={colors.success}
            muted={muted}
            text={text}
          />
          <MenuDivider border={border} />
          <MenuItem
            icon="settings"
            label="Edit Profile"
            subtitle="Update name, email or password"
            onPress={() => setShowEdit(true)}
            color={colors.primaryDark}
            muted={muted}
            text={text}
          />
        </Card>

        {/* Support & Help */}
        <Card style={[styles.card, { backgroundColor: cardBg, borderColor: border }]}>
          <MenuItem
            icon="chatbubble-ellipses"
            label="Contact Form"
            subtitle="Send us a message — we reply fast"
            onPress={() => setShowContact(true)}
            color={colors.accent}
            muted={muted}
            text={text}
          />
          <MenuDivider border={border} />
          <MenuItem
            icon="chatbubble-ellipses"
            label="WhatsApp Support"
            subtitle="Chat with us on WhatsApp"
            onPress={() => Linking.openURL('https://wa.me/919650752995')}
            color={colors.success}
            muted={muted}
            text={text}
          />
          <MenuDivider border={border} />
          <MenuItem
            icon="call"
            label="Call Support"
            subtitle="+91 9650752995"
            onPress={() => Linking.openURL('tel:+919650752995')}
            color={colors.info}
            muted={muted}
            text={text}
          />
          <MenuDivider border={border} />
          <MenuItem
            icon="mail"
            label="Email Support"
            subtitle="support@clickandsit.in"
            onPress={() => Linking.openURL('mailto:support@clickandsit.in')}
            color={colors.primaryDark}
            muted={muted}
            text={text}
          />
        </Card>

        {/* About */}
        <Card style={[styles.card, { backgroundColor: cardBg, borderColor: border }]}>
          <MenuItem
            icon="help-circle"
            label="FAQ & Help"
            subtitle="Common questions answered"
            onPress={() =>
              Alert.alert(
                'FAQ',
                'Q: How does ClickNsit work?\nA: Browse forms, fill your details, upload docs, and our team submits it on the official portal.\n\nQ: Is my data safe?\nA: Yes, we use bank-level encryption and never share your data.\n\nQ: How fast is processing?\nA: Usually within 24 hours of payment confirmation.'
              )
            }
            color={colors.info}
            muted={muted}
            text={text}
          />
          <MenuDivider border={border} />
          <MenuItem
            icon="shield-checkmark"
            label="Privacy Policy"
            subtitle="How we protect your data"
            onPress={() => Linking.openURL('https://clickandsit.in/privacy')}
            color={colors.success}
            muted={muted}
            text={text}
          />
          <MenuDivider border={border} />
          <MenuItem
            icon="document-text"
            label="Terms of Service"
            subtitle="Our terms and conditions"
            onPress={() => Linking.openURL('https://clickandsit.in/terms')}
            color={colors.textMuted}
            muted={muted}
            text={text}
          />
        </Card>

        {/* App Version */}
        <Text style={[styles.version, { color: muted }]}>
          ClickNsit v1.0.0 • Made with ❤️
        </Text>

        <Button title="Logout" variant="ghost" onPress={confirmLogout} />
      </ScrollView>

      {/* Edit Profile + Contact modals (web parity) */}
      <EditProfileModal
        visible={showEdit}
        onClose={() => setShowEdit(false)}
        onSaved={() => {
          setShowEdit(false);
          refreshProfile();
        }}
      />
      <ContactSupportModal visible={showContact} onClose={() => setShowContact(false)} />
    </Screen>
  );
}

function MenuItem({
  icon,
  label,
  subtitle,
  onPress,
  color,
  muted,
  text,
}: {
  icon: string;
  label: string;
  subtitle?: string;
  onPress: () => void;
  color: string;
  muted: string;
  text: string;
}) {
  return (
    <View style={styles.menuItem}>
      <View style={[styles.menuIconBg, { backgroundColor: `${color}15` }]}>
        <Ionicons name={icon as any} size={18} color={color} />
      </View>
      <View style={styles.menuTextContainer}>
        <Text style={[styles.menuLabel, { color: text }]}>{label}</Text>
        {subtitle && <Text style={[styles.menuSubtitle, { color: muted }]}>{subtitle}</Text>}
      </View>
      <Ionicons name="chevron-forward" size={16} color={muted} />
    </View>
  );
}

function MenuDivider({ border }: { border: string }) {
  return <View style={[styles.menuDivider, { backgroundColor: border }]} />;
}

const styles = StyleSheet.create({
  centerBlock: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 12 },
  loginIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  title: { fontSize: 26, fontWeight: '900', textAlign: 'center' },
  subtitle: { fontSize: 14, textAlign: 'center', lineHeight: 21, marginBottom: 8 },
  wide: { alignSelf: 'stretch' },
  body: { padding: spacing.md, paddingBottom: 40, gap: spacing.md },

  // Profile card
  profileCard: { alignItems: 'center', paddingVertical: 24, borderWidth: 1 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: { color: '#ffffff', fontSize: 32, fontWeight: '900' },
  name: { fontSize: 22, fontWeight: '900' },
  email: { fontSize: 14, marginTop: 2 },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
    paddingTop: 8,
    borderTopWidth: 1,
  },
  phone: { fontSize: 14 },

  // Stats
  statsRow: { flexDirection: 'row', gap: 10 },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: 4,
  },
  statValue: { fontSize: 18, fontWeight: '900' },
  statLabel: { fontSize: 11, fontWeight: '600' },

  // Cards
  card: { borderWidth: 1, padding: 16, gap: 12 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cardIconBg: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: { fontSize: 17, fontWeight: '800' },

  // Referral
  referralCodeBox: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  referralCode: { fontSize: 24, fontWeight: '900', letterSpacing: 2 },
  referralInfo: { fontSize: 13, lineHeight: 19 },

  // Menu
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 4,
  },
  menuIconBg: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTextContainer: { flex: 1 },
  menuLabel: { fontSize: 15, fontWeight: '700' },
  menuSubtitle: { fontSize: 12, marginTop: 1 },
  menuDivider: {
    height: 1,
    marginVertical: 6,
  },

  // Version
  version: { fontSize: 12, textAlign: 'center', marginTop: 8 },
});
