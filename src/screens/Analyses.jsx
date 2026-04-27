import React, { useState, useEffect } from 'react'
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator, TextInput, Alert
} from 'react-native'
import api from '../services/api'

const TYPES_ANALYSE = [
  { key: 'bilan_sanguin', label: 'Bilan sanguin' },
  { key: 'ponction_lombaire', label: 'Ponction lombaire' },
  { key: 'bilan_inflammatoire', label: 'Bilan inflammatoire' },
  { key: 'bilan_immunologique', label: 'Bilan immunologique' },
  { key: 'autre', label: 'Autre' },
]

const RESULTATS_FIELDS = {
  bilan_sanguin: ['CRP', 'VS', 'NFS', 'Hémoglobine', 'Plaquettes', 'Leucocytes'],
  ponction_lombaire: ['Protéines', 'Glucose', 'Cellules', 'Bandes oligoclonales', 'IgG Index'],
  bilan_inflammatoire: ['CRP', 'VS', 'Fibrinogène', 'Ferritine', 'IL-6'],
  bilan_immunologique: ['IgG', 'IgA', 'IgM', 'CD4', 'CD8', 'Lymphocytes'],
  autre: ['Résultat 1', 'Résultat 2', 'Résultat 3'],
}

export default function Analyses({ navigation }) {
  const [analyses, setAnalyses] = useState([])
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [filtre, setFiltre] = useState('tous')
  const [search, setSearch] = useState('')

  // Form
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [showPatientPicker, setShowPatientPicker] = useState(false)
  const [typeAnalyse, setTypeAnalyse] = useState('bilan_sanguin')
  const [showTypePicker, setShowTypePicker] = useState(false)
  const [resultats, setResultats] = useState({})
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => { fetchAll() }, [])

  const fetchAll = async () => {
    try {
      const [aRes, pRes] = await Promise.all([
        api.get('/analyses/'),
        api.get('/patients/'),
      ])
      setAnalyses(Array.isArray(aRes.data) ? aRes.data : [])
      setPatients(pRes.data.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!selectedPatient) {
      Alert.alert('Erreur', 'Veuillez sélectionner un patient')
      return
    }
    setSubmitting(true)
    try {
      await api.post('/analyses/', {
        patient_id: selectedPatient.id,
        type_analyse: typeAnalyse,
        resultats,
        notes,
      })
      setShowForm(false)
      setSelectedPatient(null)
      setTypeAnalyse('bilan_sanguin')
      setResultats({})
      setNotes('')
      fetchAll()
      Alert.alert('✅ Succès', 'Analyse créée avec succès !')
    } catch (err) {
      let msg = err.response?.data?.detail || 'Erreur'
      if (typeof msg !== 'string') msg = JSON.stringify(msg)
      Alert.alert('Erreur', msg)
    } finally {
      setSubmitting(false)
    }
  }

  const handleTerminer = async (id) => {
    try {
      await api.put(`/analyses/${id}`, { statut: 'termine' })
      fetchAll()
    } catch (err) {
      Alert.alert('Erreur', 'Impossible de terminer l\'analyse')
    }
  }

  const total = analyses.length
  const enAttente = analyses.filter(a => a.statut === 'en_attente').length
  const terminees = analyses.filter(a => a.statut === 'termine').length

  const filtered = analyses.filter(a => {
    const matchFiltre = filtre === 'tous' || a.statut === filtre
    const matchSearch = !search || a.patient_nom?.toLowerCase().includes(search.toLowerCase())
    return matchFiltre && matchSearch
  })

  const fields = RESULTATS_FIELDS[typeAnalyse] || []

  const formatDate = (d) => {
    if (!d) return '—'
    try {
      const dt = new Date(d)
      return `${dt.getDate().toString().padStart(2,'0')}/${(dt.getMonth()+1).toString().padStart(2,'0')}/${dt.getFullYear()}`
    } catch { return String(d) }
  }

  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.back}>← Retour</Text>
        </TouchableOpacity>
        <View style={s.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={s.title}>Analyses biologiques</Text>
            <Text style={s.subtitle}>{total} analyse{total > 1 ? 's' : ''} enregistrée{total > 1 ? 's' : ''}</Text>
          </View>
          <TouchableOpacity style={s.addBtn} onPress={() => setShowForm(!showForm)}>
            <Text style={s.addBtnText}>+ Nouvelle analyse</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={s.content} keyboardShouldPersistTaps="handled">
        {/* STATS */}
        <View style={s.statsRow}>
          <View style={s.statCard}>
            <Text style={[s.statNum, { color: '#4f46e5' }]}>{total}</Text>
            <Text style={s.statLabel}>Total</Text>
          </View>
          <View style={s.statCard}>
            <Text style={[s.statNum, { color: '#d97706' }]}>{enAttente}</Text>
            <Text style={s.statLabel}>En attente</Text>
          </View>
          <View style={s.statCard}>
            <Text style={[s.statNum, { color: '#059669' }]}>{terminees}</Text>
            <Text style={s.statLabel}>Terminées</Text>
          </View>
        </View>

        {/* FORMULAIRE NOUVELLE ANALYSE */}
        {showForm && (
          <View style={s.formCard}>
            <View style={s.formTop}>
              <Text style={s.formTitle}>Nouvelle analyse</Text>
              <TouchableOpacity onPress={() => setShowForm(false)}><Text style={s.formClose}>✕</Text></TouchableOpacity>
            </View>

            {/* Patient picker */}
            <Text style={s.formLabel}>Patient *</Text>
            <TouchableOpacity style={s.pickerBtn} onPress={() => setShowPatientPicker(!showPatientPicker)}>
              <Text style={s.pickerText}>{selectedPatient ? `${selectedPatient.prenom} ${selectedPatient.nom}` : 'Sélectionner un patient'}</Text>
              <Text style={s.pickerArrow}>▼</Text>
            </TouchableOpacity>
            {showPatientPicker && (
              <View style={s.pickerMenu}>
                <ScrollView style={{ maxHeight: 180 }}>
                  {patients.map(p => (
                    <TouchableOpacity key={p.id} style={s.pickerItem} onPress={() => { setSelectedPatient(p); setShowPatientPicker(false) }}>
                      <Text style={s.pickerItemText}>{p.prenom} {p.nom}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Type d'analyse picker */}
            <Text style={s.formLabel}>Type d'analyse *</Text>
            <TouchableOpacity style={s.pickerBtn} onPress={() => setShowTypePicker(!showTypePicker)}>
              <Text style={s.pickerText}>{TYPES_ANALYSE.find(t => t.key === typeAnalyse)?.label || typeAnalyse}</Text>
              <Text style={s.pickerArrow}>▼</Text>
            </TouchableOpacity>
            {showTypePicker && (
              <View style={s.pickerMenu}>
                {TYPES_ANALYSE.map(t => (
                  <TouchableOpacity key={t.key} style={[s.pickerItem, typeAnalyse === t.key && s.pickerItemActive]} onPress={() => { setTypeAnalyse(t.key); setShowTypePicker(false); setResultats({}) }}>
                    <Text style={[s.pickerItemText, typeAnalyse === t.key && { color: '#fff' }]}>{t.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Résultats fields */}
            <Text style={[s.formLabel, { marginTop: 12 }]}>Résultats</Text>
            <View style={s.resultsGrid}>
              {fields.map(field => (
                <View key={field} style={s.resultField}>
                  <Text style={[s.resultLabel, { color: '#4f46e5' }]}>{field}</Text>
                  <TextInput
                    style={s.resultInput}
                    placeholder="Valeur"
                    placeholderTextColor="#94a3b8"
                    value={resultats[field] || ''}
                    onChangeText={(v) => setResultats(prev => ({...prev, [field]: v}))}
                  />
                </View>
              ))}
            </View>

            {/* Notes */}
            <Text style={s.formLabel}>Notes</Text>
            <TextInput style={s.textArea} placeholder="Observations, commentaires..." value={notes} onChangeText={setNotes} multiline placeholderTextColor="#94a3b8" />

            {/* Actions */}
            <View style={s.formActions}>
              <TouchableOpacity style={s.cancelBtn} onPress={() => setShowForm(false)}>
                <Text style={s.cancelText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.submitBtn} onPress={handleCreate} disabled={submitting}>
                <Text style={s.submitText}>{submitting ? 'Envoi...' : 'Créer'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* FILTERS */}
        <View style={s.filterRow}>
          {[
            { key: 'tous', label: 'Toutes' },
            { key: 'en_attente', label: '⏳ En attente' },
            { key: 'termine', label: '✅ Terminées' },
          ].map(f => (
            <TouchableOpacity key={f.key} style={[s.filterBtn, filtre === f.key && s.filterBtnActive]} onPress={() => setFiltre(f.key)}>
              <Text style={[s.filterText, filtre === f.key && s.filterTextActive]}>{f.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* LIST */}
        {loading ? (
          <ActivityIndicator color="#4f46e5" size="large" style={{ marginTop: 30 }} />
        ) : filtered.length === 0 ? (
          <View style={s.emptyCard}>
            <Text style={s.emptyIcon}>🧪</Text>
            <Text style={s.emptyText}>Aucune analyse enregistrée</Text>
          </View>
        ) : (
          filtered.map((a, i) => (
            <View key={a.id || i} style={s.analyseCard}>
              <View style={s.analyseTop}>
                <View style={s.typeChip}>
                  <Text style={s.typeText}>{TYPES_ANALYSE.find(t => t.key === a.type_analyse)?.label || a.type_analyse}</Text>
                </View>
                <View style={[s.statusBadge, a.statut === 'termine' ? s.statusDone : s.statusWait]}>
                  <Text style={[s.statusText, { color: a.statut === 'termine' ? '#059669' : '#d97706' }]}>
                    {a.statut === 'termine' ? '✅ Terminée' : '⏳ En attente'}
                  </Text>
                </View>
              </View>
              <Text style={s.analyseName}>👤 {a.patient_nom || 'Patient'}</Text>
              <Text style={s.analyseDate}>📅 {formatDate(a.date_analyse)}</Text>

              {/* Résultats preview */}
              {a.resultats && Object.keys(a.resultats).length > 0 && (
                <View style={s.resultsPreview}>
                  {Object.entries(a.resultats).slice(0, 4).map(([k, v]) => (
                    <View key={k} style={s.resultItem}>
                      <Text style={s.resultItemLabel}>{k}</Text>
                      <Text style={s.resultItemValue}>{v || '—'}</Text>
                    </View>
                  ))}
                </View>
              )}

              {a.notes ? <Text style={s.analyseNotes}>📝 {a.notes}</Text> : null}

              {a.statut === 'en_attente' && (
                <TouchableOpacity style={s.terminerBtn} onPress={() => handleTerminer(a.id)}>
                  <Text style={s.terminerText}>✅ Marquer comme terminée</Text>
                </TouchableOpacity>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fc' },
  header: { padding: 20, paddingTop: 60, backgroundColor: '#fff', borderBottomWidth: 0.5, borderBottomColor: '#e2e8f0' },
  back: { color: '#4f46e5', fontSize: 15, marginBottom: 8 },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1e293b' },
  subtitle: { fontSize: 13, color: '#64748b', marginTop: 2 },
  addBtn: { backgroundColor: '#4f46e5', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10 },
  addBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  content: { padding: 16 },

  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statCard: { flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 14, alignItems: 'center', borderWidth: 0.5, borderColor: '#e2e8f0' },
  statNum: { fontSize: 24, fontWeight: 'bold', marginBottom: 2 },
  statLabel: { fontSize: 12, color: '#64748b' },

  formCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 0.5, borderColor: '#e2e8f0', elevation: 2 },
  formTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  formTitle: { fontSize: 16, fontWeight: '600', color: '#1e293b' },
  formClose: { fontSize: 18, color: '#94a3b8' },
  formLabel: { fontSize: 13, fontWeight: '500', color: '#374151', marginBottom: 4, marginTop: 10 },

  pickerBtn: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8f9fc', borderRadius: 8, padding: 12, borderWidth: 0.5, borderColor: '#e2e8f0' },
  pickerText: { fontSize: 13, color: '#1e293b' },
  pickerArrow: { fontSize: 10, color: '#94a3b8' },
  pickerMenu: { backgroundColor: '#fff', borderRadius: 8, borderWidth: 0.5, borderColor: '#e2e8f0', elevation: 4, marginBottom: 4, overflow: 'hidden' },
  pickerItem: { paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: '#f1f5f9' },
  pickerItemActive: { backgroundColor: '#4f46e5' },
  pickerItemText: { fontSize: 13, color: '#374151' },

  resultsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  resultField: { width: '31%', minWidth: 90 },
  resultLabel: { fontSize: 11, fontWeight: '600', marginBottom: 4 },
  resultInput: { backgroundColor: '#f8f9fc', borderRadius: 6, padding: 8, fontSize: 13, color: '#1e293b', borderWidth: 0.5, borderColor: '#e2e8f0' },

  textArea: { backgroundColor: '#f8f9fc', borderRadius: 8, padding: 12, fontSize: 13, color: '#1e293b', borderWidth: 0.5, borderColor: '#e2e8f0', height: 70, textAlignVertical: 'top', marginTop: 4 },

  formActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 14 },
  cancelBtn: { backgroundColor: '#f1f5f9', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 10 },
  cancelText: { color: '#64748b', fontSize: 13 },
  submitBtn: { backgroundColor: '#4f46e5', borderRadius: 8, paddingHorizontal: 20, paddingVertical: 10 },
  submitText: { color: '#fff', fontSize: 13, fontWeight: '600' },

  filterRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  filterBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, backgroundColor: '#fff', borderWidth: 0.5, borderColor: '#e2e8f0' },
  filterBtnActive: { backgroundColor: '#1e293b', borderColor: '#1e293b' },
  filterText: { fontSize: 12, color: '#64748b', fontWeight: '500' },
  filterTextActive: { color: '#fff', fontWeight: '600' },

  emptyCard: { backgroundColor: '#fff', borderRadius: 12, padding: 40, alignItems: 'center', borderWidth: 0.5, borderColor: '#e2e8f0' },
  emptyIcon: { fontSize: 40, marginBottom: 12, opacity: 0.4 },
  emptyText: { fontSize: 14, color: '#94a3b8' },

  analyseCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 0.5, borderColor: '#e2e8f0', elevation: 1 },
  analyseTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  typeChip: { backgroundColor: '#eef2ff', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 0.5, borderColor: '#c7d2fe' },
  typeText: { fontSize: 12, color: '#4f46e5', fontWeight: '600' },
  statusBadge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 0.5 },
  statusDone: { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' },
  statusWait: { backgroundColor: '#fffbeb', borderColor: '#fcd34d' },
  statusText: { fontSize: 11, fontWeight: '600' },
  analyseName: { fontSize: 14, fontWeight: '500', color: '#1e293b', marginBottom: 4 },
  analyseDate: { fontSize: 12, color: '#94a3b8', marginBottom: 8 },

  resultsPreview: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8, padding: 10, backgroundColor: '#f8f9fc', borderRadius: 8 },
  resultItem: { minWidth: 70 },
  resultItemLabel: { fontSize: 10, color: '#64748b', fontWeight: '500' },
  resultItemValue: { fontSize: 14, fontWeight: '600', color: '#1e293b' },

  analyseNotes: { fontSize: 12, color: '#64748b', fontStyle: 'italic', marginBottom: 8 },

  terminerBtn: { backgroundColor: '#f0fdf4', borderRadius: 8, padding: 10, alignItems: 'center', borderWidth: 0.5, borderColor: '#bbf7d0', marginTop: 4 },
  terminerText: { fontSize: 13, color: '#059669', fontWeight: '600' },
})
