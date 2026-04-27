import React, { useState, useEffect } from 'react'
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator, TextInput
} from 'react-native'
import api from '../services/api'

const TYPE_LABELS = {
  bilan_sanguin: 'Bilan sanguin',
  ponction_lombaire: 'Ponction lombaire',
  bilan_inflammatoire: 'Bilan inflammatoire',
  bilan_immunologique: 'Bilan immunologique',
  autre: 'Autre',
}

export default function Resultats({ navigation }) {
  const [analyses, setAnalyses] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [expandedId, setExpandedId] = useState(null)

  useEffect(() => { fetch() }, [])

  const fetch = async () => {
    try {
      const res = await api.get('/analyses/')
      const data = Array.isArray(res.data) ? res.data : []
      setAnalyses(data.filter(a => a.statut === 'termine'))
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (d) => {
    if (!d) return '—'
    try {
      const dt = new Date(d)
      return `${dt.getDate().toString().padStart(2,'0')}/${(dt.getMonth()+1).toString().padStart(2,'0')}/${dt.getFullYear()}`
    } catch { return String(d) }
  }

  const filtered = analyses.filter(a => {
    if (!search) return true
    return a.patient_nom?.toLowerCase().includes(search.toLowerCase()) ||
           a.type_analyse?.toLowerCase().includes(search.toLowerCase())
  })

  const getValueColor = (key, val) => {
    const num = parseFloat(val)
    if (isNaN(num)) return '#1e293b'
    // Basic abnormal value detection for common MS-related markers
    const norms = {
      'CRP': [0, 5], 'VS': [0, 20], 'Hémoglobine': [12, 17], 'Leucocytes': [4, 11],
      'Plaquettes': [150, 400], 'NFS': [0, 999], 'Protéines': [15, 45], 'Glucose': [50, 80],
      'IgG': [7, 16], 'IgA': [0.7, 4], 'IgM': [0.4, 2.3], 'CD4': [500, 1500],
    }
    const range = norms[key]
    if (range && (num < range[0] || num > range[1])) return '#dc2626'
    return '#059669'
  }

  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.back}>← Retour</Text>
        </TouchableOpacity>
        <Text style={s.title}>Résultats</Text>
        <Text style={s.subtitle}>Analyses avec résultats enregistrés</Text>
      </View>

      <ScrollView style={s.content}>
        {/* SEARCH */}
        <View style={s.searchBox}>
          <Text style={{ fontSize: 14 }}>🔍</Text>
          <TextInput style={s.searchInput} placeholder="Rechercher..." value={search} onChangeText={setSearch} placeholderTextColor="#94a3b8" />
        </View>

        {loading ? (
          <ActivityIndicator color="#4f46e5" size="large" style={{ marginTop: 40 }} />
        ) : filtered.length === 0 ? (
          <View style={s.emptyCard}>
            <Text style={s.emptyIcon}>🧪</Text>
            <Text style={s.emptyText}>Aucun résultat disponible</Text>
          </View>
        ) : (
          filtered.map((a, i) => {
            const expanded = expandedId === a.id
            return (
              <TouchableOpacity key={a.id || i} style={s.card} onPress={() => setExpandedId(expanded ? null : a.id)} activeOpacity={0.8}>
                <View style={s.cardTop}>
                  <View style={s.typeChip}>
                    <Text style={s.typeText}>{TYPE_LABELS[a.type_analyse] || a.type_analyse}</Text>
                  </View>
                  <Text style={s.cardDate}>{formatDate(a.date_analyse)}</Text>
                </View>

                <View style={s.cardInfo}>
                  <View style={s.avatarBox}>
                    <Text style={s.avatarText}>{(a.patient_nom || '?')[0]}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.cardName}>{a.patient_nom || 'Patient'}</Text>
                    <Text style={s.cardMeta}>
                      {Object.keys(a.resultats || {}).length} paramètre{Object.keys(a.resultats || {}).length > 1 ? 's' : ''}
                    </Text>
                  </View>
                  <View style={s.doneBadge}>
                    <Text style={s.doneText}>✅ Terminée</Text>
                  </View>
                </View>

                {/* EXPANDED RESULTS */}
                {expanded && a.resultats && (
                  <View style={s.resultsSection}>
                    <Text style={s.resultsSectionTitle}>📊 Résultats détaillés</Text>
                    <View style={s.resultsTable}>
                      <View style={s.resultTableHeader}>
                        <Text style={s.resultTableHeaderText}>Paramètre</Text>
                        <Text style={s.resultTableHeaderText}>Valeur</Text>
                        <Text style={s.resultTableHeaderText}>Statut</Text>
                      </View>
                      {Object.entries(a.resultats).map(([key, val]) => {
                        const color = getValueColor(key, val)
                        return (
                          <View key={key} style={s.resultTableRow}>
                            <Text style={s.resultTableParam}>{key}</Text>
                            <Text style={[s.resultTableVal, { color }]}>{val || '—'}</Text>
                            <View style={[s.resultStatusDot, { backgroundColor: color }]} />
                          </View>
                        )
                      })}
                    </View>
                    {a.notes && (
                      <View style={s.notesBox}>
                        <Text style={s.notesLabel}>📝 Notes</Text>
                        <Text style={s.notesText}>{a.notes}</Text>
                      </View>
                    )}
                  </View>
                )}

                <Text style={s.expandHint}>{expanded ? '▲ Réduire' : '▼ Voir résultats détaillés'}</Text>
              </TouchableOpacity>
            )
          })
        )}
      </ScrollView>
    </View>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fc' },
  header: { padding: 20, paddingTop: 60, backgroundColor: '#fff', borderBottomWidth: 0.5, borderBottomColor: '#e2e8f0' },
  back: { color: '#4f46e5', fontSize: 15, marginBottom: 8 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1e293b' },
  subtitle: { fontSize: 13, color: '#64748b', marginTop: 2 },
  content: { padding: 16 },

  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 8, paddingHorizontal: 12, borderWidth: 0.5, borderColor: '#e2e8f0', marginBottom: 16 },
  searchInput: { flex: 1, padding: 10, fontSize: 13, color: '#1e293b' },

  emptyCard: { backgroundColor: '#fff', borderRadius: 12, padding: 40, alignItems: 'center', borderWidth: 0.5, borderColor: '#e2e8f0' },
  emptyIcon: { fontSize: 40, marginBottom: 12, opacity: 0.4 },
  emptyText: { fontSize: 14, color: '#94a3b8' },

  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 0.5, borderColor: '#e2e8f0', elevation: 1 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  typeChip: { backgroundColor: '#eef2ff', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 0.5, borderColor: '#c7d2fe' },
  typeText: { fontSize: 11, color: '#4f46e5', fontWeight: '600' },
  cardDate: { fontSize: 12, color: '#94a3b8' },
  cardInfo: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  avatarBox: { width: 36, height: 36, borderRadius: 8, backgroundColor: '#4f46e5', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  cardName: { fontSize: 14, fontWeight: '600', color: '#1e293b', marginBottom: 1 },
  cardMeta: { fontSize: 12, color: '#94a3b8' },
  doneBadge: { backgroundColor: '#f0fdf4', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 0.5, borderColor: '#bbf7d0' },
  doneText: { fontSize: 11, color: '#059669', fontWeight: '600' },

  resultsSection: { marginTop: 12, borderTopWidth: 0.5, borderTopColor: '#f1f5f9', paddingTop: 12 },
  resultsSectionTitle: { fontSize: 14, fontWeight: '600', color: '#1e293b', marginBottom: 10 },
  resultsTable: { backgroundColor: '#f8f9fc', borderRadius: 8, overflow: 'hidden', borderWidth: 0.5, borderColor: '#e2e8f0' },
  resultTableHeader: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#f1f5f9', borderBottomWidth: 0.5, borderBottomColor: '#e2e8f0' },
  resultTableHeaderText: { flex: 1, fontSize: 11, fontWeight: '600', color: '#64748b', textTransform: 'uppercase' },
  resultTableRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: '#f1f5f9' },
  resultTableParam: { flex: 1, fontSize: 13, color: '#374151', fontWeight: '500' },
  resultTableVal: { flex: 1, fontSize: 14, fontWeight: '600' },
  resultStatusDot: { width: 8, height: 8, borderRadius: 4 },

  notesBox: { marginTop: 10, padding: 10, backgroundColor: '#fffbeb', borderRadius: 8, borderWidth: 0.5, borderColor: '#fcd34d' },
  notesLabel: { fontSize: 12, fontWeight: '600', color: '#92400e', marginBottom: 4 },
  notesText: { fontSize: 12, color: '#78350f' },

  expandHint: { textAlign: 'center', fontSize: 12, color: '#94a3b8', marginTop: 8 },
})
