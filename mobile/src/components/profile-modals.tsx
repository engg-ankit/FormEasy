import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, radius, spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/lib/auth';
import { contactApi, profileApi } from '@/lib/api';

function Shell({
  visible,
  onClose,
  title,
  icon,
  children,
}: {
  visible: boolean;
  onClose: () => void;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  children: React.ReactNode;
}) {
  const { isDark } = useTheme();
  const text = isDark ? colors.dark.text : colors.text;
  const muted = isDark ? colors.dark.textMuted : colors.textMuted;
  const cardBg = isDark ? colors.dark.card : colors.card;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={[styles.sheet, { backgroundColor: cardBg }]}>
          <View style={styles.grabber} />
          <View style={styles.head}>
            <View style={[styles.headIcon, { backgroundColor: `${colors.primary}15` }]}>
              <Ionicons name={icon} size={18} color={colors.primary} />
            </View>
            <Text style={[styles.headTitle, { color: text }]}>{title}</Text>
            <Pressable onPress={onClose} hitSlop={10}>
              <Ionicons name="close" size={22} color={muted} />
            </Pressable>
          </View>
          {children}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const inputStyle = (isDark: boolean, border: string, text: string) => ({
  minHeight: 48,
  borderWidth: 1,
  borderRadius: radius.md,
  paddingHorizontal: 14,
  fontSize: 15,
  backgroundColor: isDark ? colors.dark.background : '#fff',
  borderColor: border,
  color: text,
});

/** Web dashboard ke "Edit Profile" jaisa — name/email/password update. */
export function EditProfileModal({
  visible,
  onClose,
  onSaved,
}: {
  visible: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible && user) {
      setFullName(user.fullName || '');
      setEmail(user.email || '');
      setCurrentPassword('');
      setNewPassword('');
    }
  }, [visible, user]);

  const text = isDark ? colors.dark.text : colors.text;
  const muted = isDark ? colors.dark.textMuted : colors.textMuted;
  const border = isDark ? colors.dark.border : colors.border;

  const save = async () => {
    const payload: Record<string, string> = {};
    if (fullName && fullName !== user?.fullName) payload.fullName = fullName;
    if (email && email !== user?.email) payload.email = email;
    if (newPassword) {
      if (!currentPassword) {
        Alert.alert('Current password chahiye', 'Password change karne ke liye current password daalo.');
        return;
      }
      payload.currentPassword = currentPassword;
      payload.newPassword = newPassword;
    }
    if (Object.keys(payload).length === 0) {
      onClose();
      return;
    }
    setSaving(true);
    try {
      await profileApi.update(payload);
      Alert.alert('Saved ✓', 'Profile update ho gaya.');
      onSaved();
    } catch (e: any) {
      Alert.alert('Failed', e?.message || 'Profile update nahi hua.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Shell visible={visible} onClose={onClose} title="Edit Profile" icon="settings">
      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        <Text style={[styles.label, { color: muted }]}>Full Name</Text>
        <TextInput style={inputStyle(isDark, border, text)} value={fullName} onChangeText={setFullName} placeholder="Your name" placeholderTextColor={muted} />

        <Text style={[styles.label, { color: muted }]}>Email</Text>
        <TextInput style={inputStyle(isDark, border, text)} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholder="you@example.com" placeholderTextColor={muted} />

        <Text style={[styles.sectionLabel, { color: text }]}>Change Password (optional)</Text>

        <Text style={[styles.label, { color: muted }]}>Current Password</Text>
        <TextInput style={inputStyle(isDark, border, text)} value={currentPassword} onChangeText={setCurrentPassword} secureTextEntry placeholder="••••••••" placeholderTextColor={muted} />

        <Text style={[styles.label, { color: muted }]}>New Password</Text>
        <TextInput style={inputStyle(isDark, border, text)} value={newPassword} onChangeText={setNewPassword} secureTextEntry placeholder="Min 6 characters" placeholderTextColor={muted} />

        <Pressable
          onPress={save}
          disabled={saving}
          style={({ pressed }) => [styles.saveBtn, { opacity: saving || pressed ? 0.85 : 1 }]}
        >
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveText}>Save Changes</Text>}
        </Pressable>
      </ScrollView>
    </Shell>
  );
}

/** Web /contact jaisa — support form jo admin ko message bhejta hai. */
export function ContactSupportModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (visible && user) {
      setName(user.fullName || '');
      setEmail(user.email || '');
    }
  }, [visible, user]);

  const text = isDark ? colors.dark.text : colors.text;
  const muted = isDark ? colors.dark.textMuted : colors.textMuted;
  const border = isDark ? colors.dark.border : colors.border;

  const send = async () => {
    if (!name || !email || !subject || !message) {
      Alert.alert('Missing info', 'All fields are required.');
      return;
    }
    setSending(true);
    try {
      await contactApi.send({ name, email, subject, message });
      Alert.alert('Sent ✓', 'Message mil gaya! Hum jaldi reply karenge.');
      setSubject('');
      setMessage('');
      onClose();
    } catch (e: any) {
      Alert.alert('Failed', e?.message || 'Message send nahi hua.');
    } finally {
      setSending(false);
    }
  };

  return (
    <Shell visible={visible} onClose={onClose} title="Contact Support" icon="chatbubble-ellipses">
      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        <Text style={[styles.label, { color: muted }]}>Name</Text>
        <TextInput style={inputStyle(isDark, border, text)} value={name} onChangeText={setName} placeholder="Your name" placeholderTextColor={muted} />

        <Text style={[styles.label, { color: muted }]}>Email</Text>
        <TextInput style={inputStyle(isDark, border, text)} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholder="you@example.com" placeholderTextColor={muted} />

        <Text style={[styles.label, { color: muted }]}>Subject</Text>
        <TextInput style={inputStyle(isDark, border, text)} value={subject} onChangeText={setSubject} placeholder="What is it about?" placeholderTextColor={muted} />

        <Text style={[styles.label, { color: muted }]}>Message</Text>
        <TextInput
          style={[inputStyle(isDark, border, text), styles.textarea]}
          value={message}
          onChangeText={setMessage}
          multiline
          numberOfLines={4}
          placeholder="Describe your issue…"
          placeholderTextColor={muted}
        />

        <Pressable
          onPress={send}
          disabled={sending}
          style={({ pressed }) => [styles.saveBtn, { backgroundColor: colors.accent, opacity: sending || pressed ? 0.85 : 1 }]}
        >
          {sending ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveText}>Send Message</Text>}
        </Pressable>
      </ScrollView>
    </Shell>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, justifyContent: 'flex-end' },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingBottom: spacing.xl,
    maxHeight: '88%',
  },
  grabber: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#9ca3af',
    marginTop: 10,
  },
  head: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: spacing.md },
  headIcon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  headTitle: { flex: 1, fontSize: 17, fontWeight: '800' },
  body: { padding: spacing.md, paddingTop: 4, gap: 2 },
  label: { fontSize: 13, fontWeight: '700', marginTop: 10, marginBottom: 6 },
  sectionLabel: { fontSize: 14, fontWeight: '800', marginTop: 18, marginBottom: 2 },
  textarea: { minHeight: 96, paddingTop: 12, textAlignVertical: 'top' },
  saveBtn: {
    minHeight: 50,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
  },
  saveText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
