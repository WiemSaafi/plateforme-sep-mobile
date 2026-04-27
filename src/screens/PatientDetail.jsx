import React, { useState, useEffect } from 'react'
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator, TextInput, Alert
} from 'react-native'
import api from '../services/api'

export default function PatientDetail({ route, navigation }) {
  const { patientId, patient: patientInit } = route.params
  const [patient, setPatient] = useState(patientInit || null)
  const [visites, setVisites] = useState([])
  const [irms, setIrms] = useState([])
  const [predictions, setPredictions] = useState([])
  const [loading, setLoading] = useState(true)
  const [onglet, setOnglet] = useState('infos')

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      const [pRes, vRes, iRes] = await Promise.allSettled([
        api.get(`/patients/${patientId}`),
        api.get(`/patients/${patientId}/visites`),
        api.get(`/patients/${patientId}/irm`),
      ])
      if (pRes.status === 'fulfilled') setPatient(pRes.value.data)
      if (vRes.status === 'fulfilled') {
        const vData = vRes.value.data.data || vRes.value.data || []
        setVisites(Array.isArray(vData) ? vData : [])
      }
      if (iRes.status === 'fulfilled') {
        const iData = iRes.value.data.data || iRes.value.data || []
        setIrms(Array.isArray(iData) ? iData : [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const onglets = [
    { key: 'infos', label: '👤 Informations' },
    { key: 'visites', label: '📅 Visites' },
    { key: 'irm', label: '🧠 IRM' },
    { key: 'prediction', label: '✨ Prédiction IA' },
  ]

  const dernierEDSS = visites.length > 0
    ? visites.reduce((last, v) => v.edss_score != null ? v.edss_score : last, null)
    : null

  if (loading) return (
    <View style={s.loadingContainer}>
      <ActivityIndicator color="#4f46e5" size="large" />
    </View>
  )

  return (
    <View style={s.container}>
      {/* HEADER */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.back}>← Retour</Text>
        </TouchableOpacity>
        <Text style={s.pageLabel}>Détail patient</Text>
        <View style={s.patientRow}>
          <View style={s.avatar}>
            <Text style={s.avatarText}>{patient?.prenom?.charAt(0)}{patient?.nom?.charAt(0)}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.patientName}>{patient?.prenom} {patient?.nom}</Text>
            <View style={s.metaRow}>
              {patient?.sexe && (
                <View style={[s.sexeBadge, patient.sexe === 'Féminin' ? { backgroundColor: '#fdf2f8', borderColor: '#fbcfe8' } : { backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }]}>
                  <Text style={[s.sexeText, { color: patient.sexe === 'Féminin' ? '#db2777' : '#2563eb' }]}>{patient.sexe}</Text>
                </View>
              )}
              {patient?.date_naissance && <Text style={s.metaText}>Né(e) le {patient.date_naissance}</Text>}
            </View>
          </View>
        </View>
      </View>

      {/* ONGLETS */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.ongletBar}>
        {onglets.map(o => (
          <TouchableOpacity key={o.key} style={[s.ongletBtn, onglet === o.key && s.ongletActive]} onPress={() => setOnglet(o.key)}>
            <Text style={[s.ongletText, onglet === o.key && s.ongletTextActive]}>{o.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={s.content}>
        {onglet === 'infos' && <TabInfos patient={patient} visites={visites} irms={irms} dernierEDSS={dernierEDSS} />}
        {onglet === 'visites' && <TabVisites visites={visites} patientId={patientId} onRefresh={fetchData} />}
        {onglet === 'irm' && <TabIRM irms={irms} />}
        {onglet === 'prediction' && <TabPrediction irms={irms} patientId={patientId} />}
      </ScrollView>
    </View>
  )
}

/* ═══════════════════ TAB INFORMATIONS ═══════════════════ */
function TabInfos({ patient, visites, irms, dernierEDSS }) {
  return (
    <View>
      {/* Résumé clinique */}
      <View style={s.statsGrid}>
        <View style={[s.statCard, { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }]}>
          <Text style={[s.statValue, { color: '#059669' }]}>{visites.length}</Text>
          <Text style={s.statLabel}>Visites</Text>
        </View>
        <View style={[s.statCard, { backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }]}>
          <Text style={[s.statValue, { color: '#2563eb' }]}>{irms.length}</Text>
          <Text style={s.statLabel}>IRM</Text>
        </View>
        <View style={[s.statCard, { backgroundColor: '#fefce8', borderColor: '#fde68a' }]}>
          <Text style={[s.statValue, { color: '#d97706' }]}>{dernierEDSS ?? '—'}</Text>
          <Text style={s.statLabel}>Dernier EDSS</Text>
        </View>
        <View style={[s.statCard, { backgroundColor: '#f5f3ff', borderColor: '#ddd6fe' }]}>
          <Text style={[s.statValue, { color: '#7c3aed' }]}>—</Text>
          <Text style={s.statLabel}>Score risque</Text>
        </View>
      </View>

      {/* Info personnelles */}
      <View style={s.card}>
        <Text style={s.cardTitle}>👤 Informations personnelles</Text>
        <InfoRow label="Nom complet" value={`${patient?.prenom} ${patient?.nom}`} />
        <InfoRow label="Date de naissance" value={patient?.date_naissance || '—'} />
        <InfoRow label="Sexe" value={patient?.sexe || '—'} />
        <InfoRow label="Email" value={patient?.contact?.email || '—'} />
        <InfoRow label="Téléphone" value={patient?.contact?.telephone || '—'} />
      </View>
    </View>
  )
}

/* ═══════════════════ TAB VISITES ═══════════════════ */
function TabVisites({ visites, patientId, onRefresh }) {
  const [showForm, setShowForm] = useState(false)
  const [formDate, setFormDate] = useState('')
  const [formEDSS, setFormEDSS] = useState('')
  const [formNotes, setFormNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!formDate) { Alert.alert('Erreur', 'La date est obligatoire'); return }
    setSubmitting(true)
    try {
      await api.post(`/patients/${patientId}/visites`, {
        date_visite: formDate,
        edss_score: formEDSS ? parseFloat(formEDSS) : null,
        notes: formNotes || null,
      })
      setShowForm(false)
      setFormDate(''); setFormEDSS(''); setFormNotes('')
      onRefresh()
    } catch (err) {
      Alert.alert('Erreur', 'Impossible de créer la visite')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <View>
      <View style={s.sectionHeader}>
        <Text style={s.sectionCount}>{visites.length} visite(s)</Text>
        <TouchableOpacity style={s.addBtn} onPress={() => setShowForm(!showForm)}>
          <Text style={s.addBtnText}>{showForm ? 'Annuler' : '+ Nouvelle visite'}</Text>
        </TouchableOpacity>
      </View>

      {showForm && (
        <View style={s.formCard}>
          <Text style={s.formTitle}>📅 Nouvelle visite</Text>
          <Text style={s.formLabel}>Date *</Text>
          <TextInput style={s.input} placeholder="AAAA-MM-JJ" value={formDate} onChangeText={setFormDate} placeholderTextColor="#94a3b8" />
          <Text style={s.formLabel}>Score EDSS (0-10)</Text>
          <TextInput style={s.input} placeholder="ex: 3.5" value={formEDSS} onChangeText={setFormEDSS} keyboardType="decimal-pad" placeholderTextColor="#94a3b8" />
          <Text style={s.formLabel}>Notes</Text>
          <TextInput style={[s.input, { height: 80, textAlignVertical: 'top' }]} placeholder="Notes et observations..." value={formNotes} onChangeText={setFormNotes} multiline placeholderTextColor="#94a3b8" />
          <TouchableOpacity style={s.submitBtn} onPress={handleSubmit} disabled={submitting}>
            <Text style={s.submitText}>{submitting ? 'Envoi...' : 'Enregistrer'}</Text>
          </TouchableOpacity>
        </View>
      )}

      {visites.length === 0 ? (
        <View style={s.empty}><Text style={s.emptyIcon}>📅</Text><Text style={s.emptyTitle}>Aucune visite</Text><Text style={s.emptyDesc}>Créez la première visite pour ce patient</Text></View>
      ) : (
        visites.map((v, i) => (
          <View key={v.id || i} style={s.card}>
            <View style={s.visiteRow}>
              <Text style={s.visiteDate}>📅 {v.date_visite || v.date}</Text>
              {v.edss_score != null && (
                <View style={s.edssBadge}><Text style={s.edssText}>EDSS {v.edss_score}</Text></View>
              )}
            </View>
            {v.motif && <Text style={s.visiteMotif}>📋 {v.motif}</Text>}
            {v.notes && <Text style={s.visiteNotes}>{v.notes}</Text>}
          </View>
        ))
      )}
    </View>
  )
}

/* ═══════════════════ TAB IRM ═══════════════════ */
function TabIRM({ irms }) {
  return (
    <View>
      <Text style={s.sectionCount}>{irms.length} IRM enregistrée(s)</Text>
      {irms.length === 0 ? (
        <View style={s.empty}><Text style={s.emptyIcon}>🧠</Text><Text style={s.emptyTitle}>Aucune IRM</Text></View>
      ) : (
        irms.map((irm, i) => (
          <View key={irm.id || i} style={s.card}>
            <View style={s.irmRow}>
              <View style={s.irmIconBox}><Text style={{ fontSize: 20 }}>🧠</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={s.irmType}>{irm.sequence_type || irm.type_sequence || 'FLAIR'}</Text>
                <Text style={s.irmDate}>{irm.uploaded_at || irm.date_upload || '—'}</Text>
              </View>
              <View style={[s.irmStatusBadge, irm.statut === 'pending' ? s.statusPending : s.statusDone]}>
                <Text style={[s.irmStatusText, { color: irm.statut === 'pending' ? '#d97706' : '#059669' }]}>{irm.statut}</Text>
              </View>
            </View>
            <View style={s.irmStatsRow}>
              <View style={s.irmStat}><Text style={s.irmStatVal}>{irm.nombre_slices || '—'}</Text><Text style={s.irmStatLbl}>Slices</Text></View>
              <View style={s.irmStat}><Text style={s.irmStatVal}>{irm.hauteur || '—'}px</Text><Text style={s.irmStatLbl}>Hauteur</Text></View>
              <View style={s.irmStat}><Text style={s.irmStatVal}>{irm.taille_mo ? `${irm.taille_mo} MB` : '—'}</Text><Text style={s.irmStatLbl}>Taille</Text></View>
            </View>
          </View>
        ))
      )}
    </View>
  )
}

/* ═══════════════════ TAB PREDICTION IA ═══════════════════ */
function TabPrediction({ irms, patientId }) {
  const models = [
    { num: 1, title: 'Classification — SEP vs Sain', desc: 'Analyse automatique par IA • Précision 99.35%', action: 'Diagnostiquer', color: '#059669', bg: '#f0fdf4' },
    { num: 2, title: 'Détection changements — T0 + T1', desc: 'Analyse par IA • Compare 2 IRM et détecte les nouvelles lésions', action: 'Détecter', color: '#2563eb', bg: '#eff6ff' },
    { num: 3, title: 'Prédiction Temporelle — Future Lésions', desc: 'Nécessite au moins 3 IRM FLAIR du même patient', action: 'Prédire T4', color: '#7c3aed', bg: '#f5f3ff' },
  ]

  return (
    <View>
      <View style={s.predHeader}>
        <Text style={s.predTitle}>✨ Analyse IA — 3 Modèles</Text>
        <Text style={s.predDesc}>Classification SEP/Sain • Détection changements • Prédiction temporelle</Text>
      </View>

      {models.map((m, mi) => (
        <View key={mi} style={s.card}>
          <View style={s.modelHeader}>
            <View style={[s.modelNum, { backgroundColor: m.color }]}><Text style={s.modelNumText}>{m.num}</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={s.modelTitle}>{m.title}</Text>
              <Text style={s.modelDesc}>{m.desc}</Text>
            </View>
          </View>
          {irms.length === 0 ? (
            <Text style={s.noIrmText}>Aucune IRM disponible</Text>
          ) : (
            irms.map((irm, ii) => (
              <View key={ii} style={s.predRow}>
                <Text style={s.predIrmLabel}>{irm.sequence_type || 'FLAIR'} — {irm.uploaded_at || irm.date_upload || ''}</Text>
                <TouchableOpacity style={[s.predBtn, { backgroundColor: m.color }]}>
                  <Text style={s.predBtnText}>🧠 {m.action}</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
      ))}
    </View>
  )
}

/* ═══════════════════ HELPERS ═══════════════════ */
function InfoRow({ label, value }) {
  return (
    <View style={s.infoRow}>
      <Text style={s.infoLabel}>{label}</Text>
      <Text style={s.infoValue}>{value}</Text>
    </View>
  )
}

/* ═══════════════════ STYLES ═══════════════════ */
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fc' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f9fc' },
  header: { backgroundColor: '#fff', padding: 20, paddingTop: 60, borderBottomWidth: 0.5, borderBottomColor: '#e2e8f0' },
  back: { color: '#4f46e5', fontSize: 15, marginBottom: 6 },
  pageLabel: { fontSize: 12, color: '#94a3b8', marginBottom: 10 },
  patientRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: { width: 50, height: 50, borderRadius: 12, backgroundColor: '#4f46e5', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 17 },
  patientName: { fontSize: 20, fontWeight: 'bold', color: '#1e293b', marginBottom: 6 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sexeBadge: { borderRadius: 12, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 0.5 },
  sexeText: { fontSize: 11, fontWeight: '500' },
  metaText: { fontSize: 12, color: '#64748b' },

  ongletBar: { backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 10, maxHeight: 54, borderBottomWidth: 0.5, borderBottomColor: '#e2e8f0' },
  ongletBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, marginRight: 8, backgroundColor: '#f1f5f9' },
  ongletActive: { backgroundColor: '#4f46e5' },
  ongletText: { color: '#64748b', fontSize: 13, fontWeight: '500' },
  ongletTextActive: { color: '#fff', fontWeight: '600' },
  content: { padding: 16, paddingBottom: 40 },

  // Stats grid
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  statCard: { width: '47%', borderRadius: 12, padding: 14, borderWidth: 1, alignItems: 'center' },
  statValue: { fontSize: 28, fontWeight: 'bold', marginBottom: 4 },
  statLabel: { fontSize: 12, color: '#64748b' },

  // Card
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 0.5, borderColor: '#e2e8f0', elevation: 1 },
  cardTitle: { fontSize: 14, fontWeight: '600', color: '#1e293b', marginBottom: 14, paddingBottom: 10, borderBottomWidth: 0.5, borderBottomColor: '#f1f5f9' },

  // Info rows
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: '#f1f5f9' },
  infoLabel: { fontSize: 13, color: '#64748b' },
  infoValue: { fontSize: 13, color: '#1e293b', fontWeight: '500', maxWidth: '60%', textAlign: 'right' },

  // Section
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionCount: { fontSize: 13, color: '#64748b', marginBottom: 12 },
  addBtn: { backgroundColor: '#4f46e5', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8 },
  addBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },

  // Form
  formCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#4f46e5', borderStyle: 'solid' },
  formTitle: { fontSize: 15, fontWeight: '600', color: '#1e293b', marginBottom: 12 },
  formLabel: { fontSize: 12, color: '#64748b', marginBottom: 4, marginTop: 8 },
  input: { backgroundColor: '#f8f9fc', borderRadius: 8, padding: 12, fontSize: 14, color: '#1e293b', borderWidth: 0.5, borderColor: '#e2e8f0' },
  submitBtn: { backgroundColor: '#4f46e5', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 12 },
  submitText: { color: '#fff', fontSize: 14, fontWeight: '600' },

  // Visites
  visiteRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  visiteDate: { fontSize: 13, color: '#64748b' },
  edssBadge: { backgroundColor: '#eef2ff', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 0.5, borderColor: '#c7d2fe' },
  edssText: { fontSize: 12, color: '#4f46e5', fontWeight: '600' },
  visiteMotif: { fontSize: 13, color: '#374151', marginBottom: 4 },
  visiteNotes: { fontSize: 12, color: '#94a3b8' },

  // Empty
  empty: { alignItems: 'center', padding: 40 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: '#1e293b', marginBottom: 4 },
  emptyDesc: { fontSize: 13, color: '#64748b', textAlign: 'center' },

  // IRM
  irmRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  irmIconBox: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#f0fdf4', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  irmType: { fontSize: 14, fontWeight: '600', color: '#1e293b', marginBottom: 2 },
  irmDate: { fontSize: 12, color: '#64748b' },
  irmStatusBadge: { borderRadius: 12, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 0.5 },
  statusPending: { backgroundColor: '#fffbeb', borderColor: '#fcd34d' },
  statusDone: { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' },
  irmStatusText: { fontSize: 11, fontWeight: '600' },
  irmStatsRow: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: '#f8f9fc', borderRadius: 8, padding: 10 },
  irmStat: { alignItems: 'center' },
  irmStatVal: { fontSize: 14, fontWeight: 'bold', color: '#1e293b', marginBottom: 2 },
  irmStatLbl: { fontSize: 11, color: '#64748b' },

  // Prediction
  predHeader: { marginBottom: 16 },
  predTitle: { fontSize: 16, fontWeight: '600', color: '#1e293b', marginBottom: 4 },
  predDesc: { fontSize: 12, color: '#64748b' },
  modelHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  modelNum: { width: 28, height: 28, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  modelNumText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  modelTitle: { fontSize: 14, fontWeight: '600', color: '#1e293b' },
  modelDesc: { fontSize: 11, color: '#64748b', marginTop: 2 },
  noIrmText: { fontSize: 13, color: '#94a3b8', fontStyle: 'italic', paddingVertical: 8 },
  predRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderTopWidth: 0.5, borderTopColor: '#f1f5f9' },
  predIrmLabel: { fontSize: 13, color: '#374151', flex: 1 },
  predBtn: { borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
  predBtnText: { color: '#fff', fontSize: 12, fontWeight: '600' },
})