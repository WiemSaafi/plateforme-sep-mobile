import React, { useState, useEffect } from 'react'
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator, TextInput, Alert
} from 'react-native'
import api from '../services/api'

export default function Visites({ navigation }) {
  const [visites, setVisites] = useState([])
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [showPatientPicker, setShowPatientPicker] = useState(false)
  const [formDate, setFormDate] = useState('')
  const [formMotif, setFormMotif] = useState('')
  const [formEDSS, setFormEDSS] = useState('')
  const [formNotes, setFormNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => { fetchAll() }, [])

  const fetchAll = async () => {
    try {
      const patientsRes = await api.get('/patients/')
      const pList = patientsRes.data.data || []
      setPatients(pList)

      const allVisites = []
      for (const p of pList) {
        try {
          const vRes = await api.get(`/patients/${p.id}/visites`)
          const vData = vRes.data.data || vRes.data || []
          const arr = Array.isArray(vData) ? vData : []
          arr.forEach(v => {
            allVisites.push({
              ...v,
              patient_nom: `${p.prenom} ${p.nom}`,
              patient_id: p.id,
            })
          })
        } catch (e) {}
      }
      allVisites.sort((a, b) => {
        const da = a.date_visite || a.date || ''
        const db = b.date_visite || b.date || ''
        return db.localeCompare(da)
      })
      setVisites(allVisites)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!selectedPatient || !formDate) {
      Alert.alert('Erreur', 'Patient et Date sont obligatoires')
      return
    }
    setSubmitting(true)
    try {
      await api.post(`/patients/${selectedPatient.id}/visites`, {
        date_visite: formDate,
        motif: formMotif || null,
        edss_score: formEDSS ? parseFloat(formEDSS) : null,
        notes: formNotes || null,
      })
      setShowForm(false)
      setSelectedPatient(null)
      setFormDate(''); setFormMotif(''); setFormEDSS(''); setFormNotes('')
      setLoading(true)
      fetchAll()
    } catch (err) {
      Alert.alert('Erreur', 'Impossible de créer la visite')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <View style={s.container}>
      {/* HEADER */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.back}>← Retour</Text>
        </TouchableOpacity>
        <View style={s.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={s.title}>Visites cliniques</Text>
            <Text style={s.subtitle}>{visites.length} visite enregistrée</Text>
          </View>
          <TouchableOpacity style={s.addBtn} onPress={() => setShowForm(!showForm)}>
            <Text style={s.addBtnText}>+ Nouvelle visite</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={s.content}>
        {/* FORMULAIRE */}
        {showForm && (
          <View style={s.formCard}>
            <View style={s.formTop}>
              <Text style={s.formTitle}>Nouvelle visite</Text>
              <TouchableOpacity onPress={() => setShowForm(false)}>
                <Text style={s.formClose}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Patient picker */}
            <View style={s.formRow}>
              <View style={s.formField}>
                <Text style={s.formLabel}>Patient *</Text>
                <TouchableOpacity style={s.pickerBtn} onPress={() => setShowPatientPicker(!showPatientPicker)}>
                  <Text style={selectedPatient ? s.pickerTextSelected : s.pickerText}>
                    {selectedPatient ? `${selectedPatient.prenom} ${selectedPatient.nom}` : 'Sélectionner un patient'}
                  </Text>
                  <Text style={s.pickerArrow}>▼</Text>
                </TouchableOpacity>
                {showPatientPicker && (
                  <View style={s.pickerMenu}>
                    <ScrollView style={{ maxHeight: 150 }}>
                      {patients.map(p => (
                        <TouchableOpacity
                          key={p.id}
                          style={[s.pickerItem, selectedPatient?.id === p.id && s.pickerItemActive]}
                          onPress={() => { setSelectedPatient(p); setShowPatientPicker(false) }}
                        >
                          <Text style={[s.pickerItemText, selectedPatient?.id === p.id && s.pickerItemTextActive]}>
                            {p.prenom} {p.nom}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>
              <View style={s.formField}>
                <Text style={s.formLabel}>Date de visite *</Text>
                <TextInput style={s.input} placeholder="AAAA-MM-JJ" value={formDate} onChangeText={setFormDate} placeholderTextColor="#94a3b8" />
              </View>
            </View>

            <View style={s.formRow}>
              <View style={s.formField}>
                <Text style={s.formLabel}>Motif</Text>
                <TextInput style={s.input} placeholder="Motif de la visite" value={formMotif} onChangeText={setFormMotif} placeholderTextColor="#94a3b8" />
              </View>
              <View style={s.formField}>
                <Text style={s.formLabel}>Score EDSS (0-10)</Text>
                <TextInput style={s.input} placeholder="Ex: 3.5" value={formEDSS} onChangeText={setFormEDSS} keyboardType="decimal-pad" placeholderTextColor="#94a3b8" />
              </View>
            </View>

            <Text style={s.formLabel}>Notes cliniques</Text>
            <TextInput style={[s.input, { height: 80, textAlignVertical: 'top', marginBottom: 12 }]} placeholder="Observations, notes..." value={formNotes} onChangeText={setFormNotes} multiline placeholderTextColor="#94a3b8" />

            <View style={s.formActions}>
              <TouchableOpacity style={s.cancelBtn} onPress={() => setShowForm(false)}>
                <Text style={s.cancelText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.submitBtn} onPress={handleSubmit} disabled={submitting}>
                <Text style={s.submitText}>{submitting ? 'Envoi...' : 'Créer la visite'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* LISTE DES VISITES */}
        {loading ? (
          <ActivityIndicator color="#4f46e5" size="large" style={{ marginTop: 40 }} />
        ) : visites.length === 0 ? (
          <View style={s.emptyCard}>
            <Text style={s.emptyIcon}>📊</Text>
            <Text style={s.emptyTitle}>Aucune visite enregistrée</Text>
          </View>
        ) : (
          visites.map((v, i) => (
            <TouchableOpacity
              key={v.id || i}
              style={s.card}
              onPress={() => navigation.navigate('PatientDetail', { patientId: v.patient_id })}
            >
              <View style={s.cardTop}>
                <View style={s.avatar}>
                  <Text style={s.avatarText}>{v.patient_nom?.charAt(0) || '?'}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.patientNom}>{v.patient_nom || 'Patient'}</Text>
                  <Text style={s.date}>📅 {v.date_visite || v.date}</Text>
                  {v.motif && <Text style={s.motif}>📋 {v.motif}</Text>}
                </View>
                {v.edss_score != null && (
                  <View style={s.edssBadge}>
                    <Text style={s.edssLabel}>EDSS</Text>
                    <Text style={s.edssValue}>{v.edss_score}</Text>
                  </View>
                )}
              </View>
              {v.notes && <Text style={s.notes}>{v.notes}</Text>}
            </TouchableOpacity>
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
  addBtn: { backgroundColor: '#1e293b', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 10 },
  addBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  content: { padding: 16 },

  // Form
  formCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 0.5, borderColor: '#e2e8f0', elevation: 2 },
  formTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  formTitle: { fontSize: 16, fontWeight: '600', color: '#1e293b' },
  formClose: { fontSize: 18, color: '#94a3b8', padding: 4 },
  formRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  formField: { flex: 1, zIndex: 10 },
  formLabel: { fontSize: 12, color: '#64748b', marginBottom: 4, fontWeight: '500' },
  input: { backgroundColor: '#f8f9fc', borderRadius: 8, padding: 12, fontSize: 13, color: '#1e293b', borderWidth: 0.5, borderColor: '#e2e8f0' },
  pickerBtn: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8f9fc', borderRadius: 8, padding: 12, borderWidth: 0.5, borderColor: '#e2e8f0' },
  pickerText: { fontSize: 13, color: '#94a3b8' },
  pickerTextSelected: { fontSize: 13, color: '#1e293b', fontWeight: '500' },
  pickerArrow: { fontSize: 10, color: '#94a3b8' },
  pickerMenu: { backgroundColor: '#fff', borderRadius: 8, marginTop: 4, borderWidth: 0.5, borderColor: '#e2e8f0', elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8 },
  pickerItem: { paddingHorizontal: 14, paddingVertical: 10 },
  pickerItemActive: { backgroundColor: '#4f46e5' },
  pickerItemText: { fontSize: 13, color: '#374151' },
  pickerItemTextActive: { color: '#fff', fontWeight: '600' },
  formActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  cancelBtn: { backgroundColor: '#f1f5f9', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 12, borderWidth: 0.5, borderColor: '#e2e8f0' },
  cancelText: { color: '#64748b', fontSize: 13, fontWeight: '500' },
  submitBtn: { backgroundColor: '#1e293b', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 12 },
  submitText: { color: '#fff', fontSize: 13, fontWeight: '600' },

  // Cards
  emptyCard: { backgroundColor: '#fff', borderRadius: 12, padding: 40, alignItems: 'center', borderWidth: 0.5, borderColor: '#e2e8f0' },
  emptyIcon: { fontSize: 40, marginBottom: 12, opacity: 0.5 },
  emptyTitle: { fontSize: 14, color: '#94a3b8' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 0.5, borderColor: '#e2e8f0', elevation: 1 },
  cardTop: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 44, height: 44, borderRadius: 10, backgroundColor: '#4f46e5', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  patientNom: { fontSize: 15, fontWeight: '600', color: '#1e293b', marginBottom: 4 },
  date: { fontSize: 13, color: '#64748b', marginBottom: 2 },
  motif: { fontSize: 12, color: '#94a3b8' },
  notes: { fontSize: 12, color: '#94a3b8', marginTop: 8, paddingTop: 8, borderTopWidth: 0.5, borderTopColor: '#f1f5f9' },
  edssBadge: { backgroundColor: '#eef2ff', borderRadius: 10, padding: 8, alignItems: 'center', borderWidth: 0.5, borderColor: '#c7d2fe' },
  edssLabel: { fontSize: 10, color: '#64748b', marginBottom: 2 },
  edssValue: { fontSize: 16, fontWeight: 'bold', color: '#4f46e5' },
})