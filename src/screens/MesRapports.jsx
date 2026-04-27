import React, { useState, useEffect } from 'react'
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator, TextInput
} from 'react-native'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

const TYPE_CONFIG = {
  segmentation: { icon: '🧠', color: '#7c3aed', bg: '#f5f3ff', border: '#c4b5fd', label: 'Segmentation des lésions' },
  classification: { icon: '📊', color: '#2563eb', bg: '#eff6ff', border: '#93c5fd', label: 'Classification SEP' },
  prediction: { icon: '✨', color: '#d97706', bg: '#fffbeb', border: '#fcd34d', label: 'Prédiction futures' },
}

export default function MesRapports({ navigation }) {
  const { user } = useAuth()
  const [rapports, setRapports] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [expandedId, setExpandedId] = useState(null)

  const isPatient = user?.role === 'patient'

  useEffect(() => { fetchRapports() }, [])

  const fetchRapports = async () => {
    try {
      if (user?.role === 'radiologue') {
        const res = await api.get('/patients/irm/toutes')
        const allIrms = Array.isArray(res.data) ? res.data : []
        setRapports(allIrms.filter(i => i.rapport))
      } else if (isPatient) {
        const res = await api.get('/patient-portal/mes-rapports')
        setRapports(res.data.data || [])
      } else {
        const res = await api.get('/patients/rapports/recus')
        setRapports(Array.isArray(res.data) ? res.data : [])
      }
    } catch (err) {
      console.error(err)
      try {
        const pRes = await api.get('/patients/')
        const pList = pRes.data.data || []
        const allIrms = []
        for (const p of pList) {
          try {
            const iRes = await api.get(`/patients/${p.id}/irm`)
            const arr = iRes.data.data || []
            arr.forEach(irm => {
              if (irm.rapport) allIrms.push({ ...irm, patient_nom: `${p.prenom} ${p.nom}` })
            })
          } catch (e) {}
        }
        setRapports(allIrms)
      } catch (e2) {}
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (d) => {
    if (!d) return '—'
    try {
      const date = new Date(d)
      return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    } catch { return String(d) }
  }

  const filtered = rapports.filter(r => {
    if (!search) return true
    const searchLow = search.toLowerCase()
    return (r.patient_nom || '').toLowerCase().includes(searchLow) ||
           (r.sequence_type || '').toLowerCase().includes(searchLow)
  })

  // ────── PATIENT VIEW ──────
  const renderPatientView = () => (
    <>
      {/* Info banner */}
      <View style={s.infoBanner}>
        <Text style={{ fontSize: 14 }}>🛡️</Text>
        <Text style={s.infoBannerText}>
          Ces rapports sont générés par notre intelligence artificielle et doivent être interprétés par votre médecin traitant. Ils ne constituent pas un diagnostic médical.
        </Text>
      </View>

      {filtered.length === 0 ? (
        <View style={s.emptyCard}>
          <View style={s.emptyIconBox}><Text style={{ fontSize: 26 }}>📄</Text></View>
          <Text style={s.emptyTitle}>Aucun rapport disponible</Text>
          <Text style={s.emptyDesc}>Les rapports apparaîtront après l'analyse de vos IRM</Text>
        </View>
      ) : (
        filtered.map((rapport, i) => {
          const rapportData = rapport.rapport || {}
          const types = Object.keys(rapportData)
          const isExpanded = expandedId === (rapport.id || i)

          return (
            <TouchableOpacity
              key={rapport.id || i}
              style={s.card}
              onPress={() => setExpandedId(isExpanded ? null : (rapport.id || i))}
              activeOpacity={0.7}
            >
              {/* Header */}
              <View style={s.cardTop}>
                <View style={s.avatarBoxPurple}>
                  <Text style={{ fontSize: 18 }}>🧠</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.patientName}>IRM {rapport.sequence_type || 'FLAIR'}</Text>
                  <Text style={s.meta}>🕐 {formatDate(rapport.date || rapport.uploaded_at)}</Text>
                </View>
                <View style={s.analyseCountBadge}>
                  <Text style={s.analyseCountText}>{types.length} analyse{types.length > 1 ? 's' : ''}</Text>
                </View>
              </View>

              {/* Expanded: show each analysis type */}
              {isExpanded && types.map(type => {
                const data = rapportData[type]
                const cfg = TYPE_CONFIG[type] || TYPE_CONFIG.segmentation
                return (
                  <View key={type} style={[s.analysisCard, { backgroundColor: cfg.bg, borderColor: cfg.border }]}>
                    <View style={s.analysisHeader}>
                      <Text style={{ fontSize: 14 }}>{cfg.icon}</Text>
                      <Text style={[s.analysisLabel, { color: cfg.color }]}>{cfg.label}</Text>
                    </View>

                    {/* Segmentation */}
                    {type === 'segmentation' && (
                      <View>
                        <View style={s.analysisRow}>
                          <Text style={{ fontSize: 14 }}>
                            {data.niveau === 'aucune' || data.niveau === 'faible' ? '✅' : '⚠️'}
                          </Text>
                          <Text style={s.analysisLevel}>Niveau : {data.niveau || '—'}</Text>
                        </View>
                        {data.message && <Text style={s.analysisMessage}>{data.message}</Text>}
                        <View style={s.metricsRow}>
                          <View style={s.metricBox}>
                            <Text style={[s.metricValue, { color: cfg.color }]}>{data.volume_lesions ?? '—'}</Text>
                            <Text style={s.metricLabel}>Volume (voxels)</Text>
                          </View>
                          <View style={s.metricBox}>
                            <Text style={[s.metricValue, { color: cfg.color }]}>{data.coupes_touchees ?? '—'}</Text>
                            <Text style={s.metricLabel}>Coupes touchées</Text>
                          </View>
                        </View>
                      </View>
                    )}

                    {/* Classification */}
                    {type === 'classification' && (
                      <View>
                        <View style={[s.analysisRow, { justifyContent: 'space-between' }]}>
                          <Text style={[s.analysisLevel, { fontSize: 15 }]}>{data.diagnostic}</Text>
                          <Text style={[s.metricValue, { color: cfg.color, fontSize: 18 }]}>{data.confiance}%</Text>
                        </View>
                        {data.message && <Text style={s.analysisMessage}>{data.message}</Text>}
                        <View style={s.progressBar}>
                          <View style={[s.progressFill, { width: `${data.confiance || 0}%`, backgroundColor: cfg.color }]} />
                        </View>
                      </View>
                    )}

                    {/* Prediction */}
                    {type === 'prediction' && (
                      <View>
                        <View style={s.analysisRow}>
                          <Text style={{ fontSize: 14 }}>{data.rechute_probable ? '⚠️' : '✅'}</Text>
                          <Text style={[s.analysisLevel, { color: data.rechute_probable ? '#dc2626' : '#059669' }]}>
                            {data.rechute_probable ? 'Risque de rechute détecté' : 'Pas de rechute anticipée'}
                          </Text>
                          <Text style={[s.metricValue, { color: cfg.color, marginLeft: 'auto' }]}>{data.proba_rechute}%</Text>
                        </View>
                        {data.message && <Text style={s.analysisMessage}>{data.message}</Text>}
                        <View style={s.progressBar}>
                          <View style={[s.progressFill, {
                            width: `${data.proba_rechute || 0}%`,
                            backgroundColor: data.rechute_probable ? '#dc2626' : '#059669'
                          }]} />
                        </View>
                      </View>
                    )}
                  </View>
                )
              })}

              {!isExpanded && types.length > 0 && (
                <Text style={s.tapHint}>Appuyez pour voir les détails →</Text>
              )}
            </TouchableOpacity>
          )
        })
      )}
    </>
  )

  // ────── RADIOLOGUE / MEDECIN VIEW ──────
  const renderProfessionalView = () => (
    <>
      {filtered.length === 0 ? (
        <View style={s.emptyCard}>
          <Text style={s.emptyIconLarge}>📋</Text>
          <Text style={s.emptyTitle}>Aucun rapport</Text>
        </View>
      ) : (
        filtered.map((r, i) => (
          <TouchableOpacity key={r.id || i} style={s.card} onPress={() => navigation.navigate('RapportDetail', { irm: r })}>
            <View style={s.cardTop}>
              <View style={s.avatarBox}>
                <Text style={s.avatarText}>{r.patient_nom?.charAt(0) || '?'}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.patientName}>{r.patient_nom || 'Patient'}</Text>
                <Text style={s.meta}>{r.sequence_type || 'FLAIR'} — {formatDate(r.uploaded_at)}</Text>
              </View>
              <View style={s.statusBadge}>
                <Text style={s.statusText}>Rédigé</Text>
              </View>
            </View>
            <TouchableOpacity style={s.voirBtn} onPress={() => navigation.navigate('RapportDetail', { irm: r })}>
              <Text style={s.voirText}>👁 Voir rapport</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ))
      )}
    </>
  )

  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.back}>← Retour</Text>
        </TouchableOpacity>
        <Text style={s.title}>{isPatient ? 'Mes rapports médicaux' : 'Mes rapports'}</Text>
        <Text style={s.subtitle}>
          {isPatient
            ? `Résultats des analyses IA de vos imageries — ${rapports.length} rapport${rapports.length > 1 ? 's' : ''}`
            : `${rapports.length} rapport${rapports.length > 1 ? 's' : ''} rédigé${rapports.length > 1 ? 's' : ''}`
          }
        </Text>
      </View>

      {/* SEARCH */}
      <View style={s.searchRow}>
        <View style={s.searchBox}>
          <Text style={{ fontSize: 14 }}>🔍</Text>
          <TextInput style={s.searchInput} placeholder="Rechercher..." value={search} onChangeText={setSearch} placeholderTextColor="#94a3b8" />
        </View>
      </View>

      <ScrollView style={s.content}>
        {loading ? (
          <ActivityIndicator color="#4f46e5" size="large" style={{ marginTop: 40 }} />
        ) : isPatient ? renderPatientView() : renderProfessionalView()}
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
  searchRow: { padding: 16, paddingBottom: 0 },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 8, paddingHorizontal: 12, borderWidth: 0.5, borderColor: '#e2e8f0' },
  searchInput: { flex: 1, padding: 10, fontSize: 13, color: '#1e293b' },
  content: { padding: 16 },

  // Info banner (patient)
  infoBanner: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, padding: 14, borderRadius: 12, backgroundColor: '#eff6ff', borderWidth: 1, borderColor: '#93c5fd', marginBottom: 16 },
  infoBannerText: { flex: 1, fontSize: 12, color: '#1e40af', lineHeight: 18 },

  // Empty state
  emptyCard: { backgroundColor: '#fff', borderRadius: 12, padding: 40, alignItems: 'center', borderWidth: 0.5, borderColor: '#e2e8f0' },
  emptyIconBox: { width: 56, height: 56, borderRadius: 14, backgroundColor: '#f5f3ff', borderWidth: 1, borderColor: '#c4b5fd', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  emptyIconLarge: { fontSize: 40, marginBottom: 12, opacity: 0.4 },
  emptyTitle: { fontSize: 15, fontWeight: '600', color: '#1e293b', marginBottom: 4 },
  emptyDesc: { fontSize: 13, color: '#94a3b8' },

  // Card
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 0.5, borderColor: '#e2e8f0', elevation: 1 },
  cardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  avatarBox: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#4f46e5', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarBoxPurple: { width: 42, height: 42, borderRadius: 10, backgroundColor: '#4f46e5', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  patientName: { fontSize: 15, fontWeight: '600', color: '#1e293b', marginBottom: 2 },
  meta: { fontSize: 12, color: '#94a3b8' },

  // Analyse count badge
  analyseCountBadge: { backgroundColor: '#f5f3ff', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 0.5, borderColor: '#c4b5fd' },
  analyseCountText: { fontSize: 11, color: '#7c3aed', fontWeight: '600' },

  // Analysis cards (patient expanded)
  analysisCard: { borderRadius: 10, padding: 14, marginBottom: 8, borderWidth: 1 },
  analysisHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  analysisLabel: { fontSize: 13, fontWeight: '700' },
  analysisRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  analysisLevel: { fontSize: 14, fontWeight: '600', color: '#1e293b', textTransform: 'capitalize' },
  analysisMessage: { fontSize: 13, color: '#374151', lineHeight: 19, marginBottom: 10 },
  metricsRow: { flexDirection: 'row', gap: 8 },
  metricBox: { flex: 1, backgroundColor: '#fff', borderRadius: 8, padding: 10, alignItems: 'center' },
  metricValue: { fontSize: 18, fontWeight: '700' },
  metricLabel: { fontSize: 10, color: '#6b7280', marginTop: 2 },
  progressBar: { height: 6, backgroundColor: '#e5e7eb', borderRadius: 8, marginTop: 8, overflow: 'hidden' },
  progressFill: { height: 6, borderRadius: 8 },

  tapHint: { fontSize: 12, color: '#4f46e5', textAlign: 'center', marginTop: 4 },

  // Status badge (radiologue)
  statusBadge: { backgroundColor: '#f0fdf4', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 0.5, borderColor: '#bbf7d0' },
  statusText: { fontSize: 11, color: '#059669', fontWeight: '600' },
  voirBtn: { backgroundColor: '#f1f5f9', borderRadius: 8, padding: 10, alignItems: 'center', borderWidth: 0.5, borderColor: '#e2e8f0' },
  voirText: { fontSize: 13, color: '#4f46e5', fontWeight: '600' },
})