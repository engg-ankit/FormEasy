import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import { Screen, Card, StatusBadge } from '@/components/ui';
import { colors, formatDate, formatINR, statusInfo } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { applicationsApi, type ApplicationDetail } from '@/lib/api';

const FLOW = ['SUBMITTED', 'IN_PROCESS', 'FORM_FILLED', 'COMPLETED'];

export default function ApplicationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isDark } = useTheme();
  const [app, setApp] = useState<ApplicationDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    applicationsApi
      .detail(id)
      .then((d) => setApp(d.application))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const muted = isDark ? colors.dark.textMuted : colors.textMuted;
  const text = isDark ? colors.dark.text : colors.text;

  if (loading) {
    return (
      <Screen style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </Screen>
    );
  }

  if (!app) {
    return (
      <Screen style={styles.center}>
        <Text style={{ color: muted }}>Application not found.</Text>
      </Screen>
    );
  }

  const stepIndex = app.status === 'REJECTED' ? -1 : FLOW.indexOf(app.status);
  const paid = app.payment?.status === 'SUCCESS';
  const documents = app.documents || [];

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerRow}>
          <Text style={[styles.title, { color: text }]} numberOfLines={2}>
            {app.exam.title}
          </Text>
          <StatusBadge status={app.status} />
        </View>
        <Text style={[styles.meta, { color: muted }]}>
          Applied on {formatDate(app.createdAt)} · {app.exam.category}
        </Text>

        {/* Progress tracker */}
        {app.status !== 'REJECTED' ? (
          <Card style={styles.card}>
            <Text style={[styles.cardTitle, { color: text }]}>Application Progress</Text>
            {FLOW.map((status, i) => {
              const info = statusInfo(status);
              const reached = stepIndex >= i;
              return (
                <View key={status} style={styles.timelineRow}>
                  <View style={styles.timelineLeft}>
                    <View
                      style={[
                        styles.timelineDot,
                        { backgroundColor: reached ? info.fg : isDark ? colors.dark.border : colors.border },
                      ]}
                    />
                    {i < FLOW.length - 1 && (
                      <View
                        style={[
                          styles.timelineLine,
                          { backgroundColor: stepIndex > i ? info.fg : isDark ? colors.dark.border : colors.border },
                        ]}
                      />
                    )}
                  </View>
                  <Text style={[styles.timelineLabel, { color: reached ? text : muted, fontWeight: reached ? '700' : '500' }]}>
                    {info.label}
                  </Text>
                </View>
              );
            })}
          </Card>
        ) : (
          <Card style={styles.card}>
            <Text style={[styles.cardTitle, { color: colors.danger }]}>Application Rejected</Text>
            <Text style={[styles.meta, { color: muted }]}>Contact support for details.</Text>
          </Card>
        )}

        {/* Payment */}
        <Card style={styles.card}>
          <Text style={[styles.cardTitle, { color: text }]}>Payment</Text>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: muted }]}>Status</Text>
            <Text style={[styles.summaryValue, { color: paid ? colors.success : colors.warning }]}>
              {paid ? 'Paid ✓' : app.payment ? 'Pending' : 'Not started'}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: muted }]}>Amount</Text>
            <Text style={[styles.summaryValue, { color: text }]}>
              {formatINR(app.payment?.amount ?? app.exam.officialFee + app.exam.serviceFee)}
            </Text>
          </View>
        </Card>

        {/* Documents */}
        {documents.length > 0 && (
          <Card style={styles.card}>
            <Text style={[styles.cardTitle, { color: text }]}>Documents</Text>
            {documents.map((doc) => {
              const isUrl = /^https?:\/\//.test(doc.fileUrl);
              return (
                <Text
                  key={doc.id}
                  style={[styles.docItem, { color: isUrl ? colors.primary : muted }]}
                  onPress={isUrl ? () => Linking.openURL(doc.fileUrl) : undefined}
                >
                  📄 {doc.fileName || doc.docType.replace(/_/g, ' ').toLowerCase()}
                  {isUrl ? ' — open' : ''}
                </Text>
              );
            })}
          </Card>
        )}

        <Text style={[styles.help, { color: muted }]}>
          Need help? WhatsApp us at +91 9650752995 or email support@clickandsit.in
        </Text>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
  container: { padding: 16, paddingBottom: 40 },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 6 },
  title: { flex: 1, fontSize: 20, fontWeight: '800', lineHeight: 27 },
  meta: { fontSize: 13, marginBottom: 14 },
  card: { marginBottom: 14, gap: 6 },
  cardTitle: { fontSize: 16, fontWeight: '800', marginBottom: 8 },
  timelineRow: { flexDirection: 'row', gap: 12, minHeight: 52 },
  timelineLeft: { alignItems: 'center', width: 14 },
  timelineDot: { width: 14, height: 14, borderRadius: 7 },
  timelineLine: { width: 3, flex: 1, borderRadius: 2, marginVertical: 2 },
  timelineLabel: { fontSize: 14, paddingTop: 0 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  summaryLabel: { fontSize: 14 },
  summaryValue: { fontSize: 14, fontWeight: '700' },
  docItem: { fontSize: 14, paddingVertical: 4, fontWeight: '600' },
  help: { fontSize: 12, textAlign: 'center', lineHeight: 18 },
});