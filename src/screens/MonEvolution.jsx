import React, { useState, useEffect } from 'react'
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator
} from 'react-native'
import api from '../services/api'

const TEST_ICONS = { motricite: '🦶', vision: '👁️', cognition: '🧠', equilibre: '⚖️' }
const TEST_LABELS = { motricite: 'Motricité', vision: 'Vision', cognition: 'Cognition', equilibre: 'Équilibre' }
const SCORE_LABELS = {
  0: { label: 'Normal', color: '#059669', bg: '#ecfdf5' },
  1: { label: 'Léger', color: '#d97706', bg: '#fffbeb' },
  2: { label: 'Sévère', color: '#dc2626', bg: '#fef2f2' },
}

export default function MonEvolution({ navigation }) {
  const [data, setData] = useState(null)
  const [visites, setVisites] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedVisite, setExpandedVisite] = useState(null)

  useEffect(() => { fetchEvolution() }, [])

  const fetchEvolution = async () => {
    try {
      const [evolRes, visitesRes] = await Promise.all([
        api.get('/patient-portal/mon-evolution'),
        api.get('/patient-portal/mes-visites'),
      ])
      setData(evolRes.data)
      setVisites(visitesRes.data.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const getTendanceConfig = (t) => {
    if (t === 'progression') return { icon: '📈', label: 'En progression', color: '#dc2626', bg: '#fef2f2', border: '#fecaca', msg: 'Le score EDSS montre une tendance à la hausse. Discutez-en avec votre médecin.' }
    if (t === 'amelioration') return { icon: '📉', label: 'En amélioration', color: '#059669', bg: '#f0fdf4', border: '#bbf7d0', msg: 'Bonne nouvelle ! Votre score EDSS s\'améliore.' }
    return { icon: '➡️', label: 'Stable', color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', msg: 'Votre score EDSS est stable. Continuez votre suivi régulier.' }
  }

  const getEdssColor = (score) => {
    if (score <= 3) return '#059669'
    if (score <= 6) return '#d97706'
    return '#dc2626'
  }

  if (loading) return (
    <View style={s.container}>
      <ActivityIndicator color="#4f46e5" size="large" style={{ marginTop: 100 }} />
    </View>
  )

  const tendance = getTendanceConfig(data?.tendance)

  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.back}>← Retour</Text>
        </TouchableOpacity>
        <View style={s.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={s.title}>Mon évolution</Text>
            <Text style={s.subtitle}>Suivez l'évolution de votre score EDSS et de vos tests fonctionnels</Text>
          </View>
          <View style={[s.tendanceBadge, { backgroundColor: tendance.bg, borderColor: tendance.border }]}>
            <Text style={[s.tendanceText, { color: tendance.color }]}>{tendance.icon} {tendance.label}</Text>
          </View>
        </View>
      </View>

      <ScrollView style={s.content}>
        {/* Tendance banner */}
        <View style={[s.tendanceCard, { backgroundColor: tendance.bg, borderColor: tendance.border }]}>
          <View style={[s.tendanceIconBox, { borderColor: tendance.border }]}>
            <Text style={{ fontSize: 20 }}>{tendance.icon}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[s.tendanceLabel, { color: tendance.color }]}>{tendance.label}</Text>
            <Text style={s.tendanceMsg}>{tendance.msg}</Text>
          </View>
        </View>

        {/* EDSS Chart */}
        <View style={s.card}>
          <View style={s.cardHeader}>
            <View style={s.cardIconBox}>
              <Text style={{ fontSize: 14 }}>📊</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.cardTitle}>Score EDSS dans le temps</Text>
              <Text style={s.cardDesc}>Échelle de 0 (normal) à 10 (handicap sévère)</Text>
            </View>
          </View>
          {data?.evolution_edss?.length > 0 ? (
            <View>
              <View style={s.edssGrid}>
                {data.evolution_edss.map((e, i) => {
                  const val = e.score ?? 0
                  const barHeight = Math.max(10, (val / 10) * 120)
                  const barColor = getEdssColor(val)
                  return (
                    <View key={i} style={s.edssItem}>
                      <Text style={[s.edssScore, { color: barColor }]}>{val}</Text>
                      <View style={[s.edssBar, { height: barHeight, backgroundColor: barColor }]} />
                      <Text style={s.edssDate}>
                        {new Date(e.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                      </Text>
                    </View>
                  )
                })}
              </View>
              {/* Legend */}
              <View style={s.legendRow}>
                {[
                  { label: '0-3 Normal', color: '#059669' },
                  { label: '3.5-6 Modéré', color: '#d97706' },
                  { label: '6.5-10 Sévère', color: '#dc2626' },
                ].map(l => (
                  <View key={l.label} style={s.legendItem}>
                    <View style={[s.legendDot, { backgroundColor: l.color }]} />
                    <Text style={s.legendText}>{l.label}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : (
            <View style={s.emptySection}>
              <Text style={{ fontSize: 30, opacity: 0.3 }}>📈</Text>
              <Text style={s.emptyTitle}>Pas encore de données EDSS</Text>
              <Text style={s.emptyDesc}>Les scores seront ajoutés lors de vos prochaines visites</Text>
            </View>
          )}
        </View>

        {/* Historique des visites */}
        <View style={s.card}>
          <View style={s.cardHeader}>
            <View style={[s.cardIconBox, { backgroundColor: '#ecfdf5', borderColor: '#a7f3d0' }]}>
              <Text style={{ fontSize: 14 }}>📅</Text>
            </View>
            <Text style={s.cardTitle}>Historique des visites</Text>
            <View style={s.countBadge}>
              <Text style={s.countText}>{visites.length} visite{visites.length > 1 ? 's' : ''}</Text>
            </View>
          </View>
          {visites.length === 0 ? (
            <View style={s.emptySection}>
              <Text style={{ fontSize: 30, opacity: 0.3 }}>📋</Text>
              <Text style={s.emptyTitle}>Aucune visite</Text>
              <Text style={s.emptyDesc}>Vos consultations apparaîtront ici</Text>
            </View>
          ) : (
            visites.map((v, i) => {
              const isExpanded = expandedVisite === (v.id || i)
              const edssColor = v.edss_score != null ? getEdssColor(v.edss_score) : '#94a3b8'

              return (
                <TouchableOpacity
                  key={v.id || i}
                  style={[s.visiteItem, i < visites.length - 1 && { borderBottomWidth: 0.5, borderBottomColor: '#f1f5f9' }]}
                  onPress={() => setExpandedVisite(isExpanded ? null : (v.id || i))}
                  activeOpacity={0.7}
                >
                  {/* Timeline dot + date */}
                  <View style={s.visiteLeft}>
                    <View style={[s.timelineDot, { backgroundColor: edssColor, borderColor: edssColor + '30' }]} />
                    <View style={s.visiteDateBox}>
                      <Text style={s.visiteDateDay}>{new Date(v.date_visite).getDate()}</Text>
                      <Text style={s.visiteDateMonth}>
                        {['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'][new Date(v.date_visite).getMonth()]}
                      </Text>
                    </View>
                  </View>

                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Text style={s.visiteTitle}>
                        {new Date(v.date_visite).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </Text>
                      <Text style={{ color: '#94a3b8', fontSize: 14 }}>{isExpanded ? '▲' : '▼'}</Text>
                    </View>

                    {v.edss_score != null && (
                      <View style={[s.edssChip, {
                        backgroundColor: v.edss_score > 5 ? '#fef2f2' : v.edss_score > 3 ? '#fffbeb' : '#f0fdf4'
                      }]}>
                        <Text style={[s.edssChipText, { color: edssColor }]}>EDSS : {v.edss_score}</Text>
                      </View>
                    )}

                    {!isExpanded && v.notes && (
                      <Text style={s.visiteNotes} numberOfLines={1}>{v.notes}</Text>
                    )}

                    {/* Expanded details */}
                    {isExpanded && (
                      <View style={s.expandedContent}>
                        {/* Functional tests */}
                        {v.tests_fonctionnels && Object.keys(v.tests_fonctionnels).length > 0 && (
                          <View style={{ marginBottom: 12 }}>
                            <Text style={s.expandedLabel}>TESTS FONCTIONNELS</Text>
                            <View style={s.testsGrid}>
                              {Object.entries(v.tests_fonctionnels).map(([k, val]) => {
                                const scoreCfg = SCORE_LABELS[val] || SCORE_LABELS[0]
                                return (
                                  <View key={k} style={[s.testCard, { backgroundColor: scoreCfg.bg }]}>
                                    <Text style={{ fontSize: 16, marginBottom: 4 }}>{TEST_ICONS[k] || '⚡'}</Text>
                                    <Text style={s.testName}>{TEST_LABELS[k] || k}</Text>
                                    <Text style={[s.testScore, { color: scoreCfg.color }]}>{scoreCfg.label}</Text>
                                  </View>
                                )
                              })}
                            </View>
                          </View>
                        )}

                        {/* Notes */}
                        {v.notes && (
                          <View style={s.notesBox}>
                            <Text style={s.expandedLabel}>NOTES</Text>
                            <Text style={s.notesText}>{v.notes}</Text>
                          </View>
                        )}
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              )
            })
          )}
        </View>
      </ScrollView>
    </View>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fc' },
  header: { padding: 20, paddingTop: 60, backgroundColor: '#fff', borderBottomWidth: 0.5, borderBottomColor: '#e2e8f0' },
  back: { color: '#4f46e5', fontSize: 15, marginBottom: 8 },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1e293b' },
  subtitle: { fontSize: 12, color: '#64748b', marginTop: 2, maxWidth: 230 },
  tendanceBadge: { borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 0.5 },
  tendanceText: { fontSize: 12, fontWeight: '600' },
  content: { padding: 16 },

  // Tendance banner
  tendanceCard: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 14, padding: 16, marginBottom: 16, borderWidth: 1 },
  tendanceIconBox: { width: 42, height: 42, borderRadius: 10, backgroundColor: '#fff', borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  tendanceLabel: { fontSize: 14, fontWeight: '600', marginBottom: 2 },
  tendanceMsg: { fontSize: 13, color: '#374151', lineHeight: 18 },

  // Card
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 16, borderWidth: 0.5, borderColor: '#e2e8f0' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  cardIconBox: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#eef2ff', borderWidth: 1, borderColor: '#c7d2fe', justifyContent: 'center', alignItems: 'center' },
  cardTitle: { fontSize: 15, fontWeight: '600', color: '#1e293b', flex: 1 },
  cardDesc: { fontSize: 11, color: '#94a3b8' },

  // EDSS Chart
  edssGrid: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', paddingVertical: 10, minHeight: 140 },
  edssItem: { alignItems: 'center', gap: 6, flex: 1 },
  edssScore: { fontSize: 13, fontWeight: '700' },
  edssBar: { width: 32, borderRadius: 6, borderTopLeftRadius: 8, borderTopRightRadius: 8 },
  edssDate: { fontSize: 9, color: '#94a3b8' },

  // Legend
  legendRow: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginTop: 14 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 10, height: 10, borderRadius: 3 },
  legendText: { fontSize: 10, color: '#6b7280' },

  // Empty
  emptySection: { alignItems: 'center', paddingVertical: 24 },
  emptyTitle: { fontSize: 14, fontWeight: '500', color: '#64748b', marginTop: 6 },
  emptyDesc: { fontSize: 12, color: '#94a3b8', marginTop: 2 },

  countBadge: { backgroundColor: '#ecfdf5', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
  countText: { fontSize: 11, color: '#059669', fontWeight: '600' },

  // Visit items
  visiteItem: { flexDirection: 'row', gap: 12, paddingVertical: 14 },
  visiteLeft: { alignItems: 'center', gap: 6 },
  timelineDot: { width: 12, height: 12, borderRadius: 6, borderWidth: 3 },
  visiteDateBox: { alignItems: 'center' },
  visiteDateDay: { fontSize: 16, fontWeight: 'bold', color: '#1e293b' },
  visiteDateMonth: { fontSize: 10, color: '#94a3b8' },
  visiteTitle: { fontSize: 14, fontWeight: '600', color: '#1e293b', flex: 1 },
  visiteNotes: { fontSize: 11, color: '#94a3b8', marginTop: 4 },
  edssChip: { alignSelf: 'flex-start', borderRadius: 16, paddingHorizontal: 10, paddingVertical: 3, marginTop: 4, borderWidth: 0.5, borderColor: '#e2e8f0' },
  edssChipText: { fontSize: 12, fontWeight: '600' },

  // Expanded content
  expandedContent: { marginTop: 10 },
  expandedLabel: { fontSize: 10, fontWeight: '600', color: '#94a3b8', letterSpacing: 0.5, marginBottom: 8, textTransform: 'uppercase' },
  testsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  testCard: { width: '47%', borderRadius: 10, padding: 10, alignItems: 'center' },
  testName: { fontSize: 12, fontWeight: '600', color: '#1e293b', marginBottom: 2 },
  testScore: { fontSize: 11, fontWeight: '500' },
  notesBox: { backgroundColor: '#f8f9fc', borderRadius: 10, padding: 12, borderWidth: 0.5, borderColor: '#e2e8f0' },
  notesText: { fontSize: 13, color: '#374151', lineHeight: 19 },
})