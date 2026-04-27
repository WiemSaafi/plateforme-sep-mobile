import React, { useState, useEffect } from 'react'
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator, TextInput, Alert, Platform
} from 'react-native'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

const MOTIFS = [
  'Consultation de suivi',
  'Nouvelle poussée',
  'Renouvellement ordonnance',
  'Résultats d\'examens',
  'Bilan annuel',
  'Urgence',
  'Autre',
]

const HEURES = [
  '08:00','08:30','09:00','09:30','10:00','10:30','11:00','11:30',
  '12:00','13:00','13:30','14:00','14:30','15:00','15:30','16:00',
  '16:30','17:00','17:30','18:00',
]

export default function RendezVous({ navigation }) {
  const { user } = useAuth()
  const [medecins, setMedecins] = useState([])
  const [rdvs, setRdvs] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedMedecin, setSelectedMedecin] = useState(null)

  // Form states
  const [day, setDay] = useState('')
  const [month, setMonth] = useState('')
  const [year, setYear] = useState('')
  const [heure, setHeure] = useState('')
  const [showHeurePicker, setShowHeurePicker] = useState(false)
  const [motif, setMotif] = useState('')
  const [showMotifPicker, setShowMotifPicker] = useState(false)
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [tab, setTab] = useState('demande') // demande | historique

  useEffect(() => { fetchAll() }, [])

  const fetchAll = async () => {
    try {
      const [medsRes, rdvRes] = await Promise.all([
        api.get('/medecins/disponibles'),
        api.get('/rendez-vous'),
      ])
      setMedecins(Array.isArray(medsRes.data) ? medsRes.data : [])
      setRdvs(Array.isArray(rdvRes.data) ? rdvRes.data : [])
    } catch (err) {
      console.error(err)
      try { const r = await api.get('/rendez-vous'); setRdvs(Array.isArray(r.data) ? r.data : []) } catch(e){}
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!selectedMedecin) { Alert.alert('Erreur', 'Veuillez choisir un médecin'); return }
    if (!day || !month || !year) { Alert.alert('Erreur', 'Veuillez entrer la date complète'); return }
    if (!heure) { Alert.alert('Erreur', 'Veuillez choisir une heure'); return }
    if (!motif) { Alert.alert('Erreur', 'Veuillez choisir un motif'); return }

    const dateStr = `${year}-${month.padStart(2,'0')}-${day.padStart(2,'0')}`
    setSubmitting(true)
    try {
      await api.post('/rendez-vous', {
        date: dateStr,
        heure,
        motif,
        message,
        patient_id: user?.patient_id || String(user?.id),
        medecin_id: selectedMedecin.id,
      })
      Alert.alert('✅ Demande envoyée !', 'Votre demande de rendez-vous a été enregistrée. Votre médecin la validera bientôt.')
      setDay(''); setMonth(''); setYear(''); setHeure(''); setMotif(''); setMessage('')
      setSelectedMedecin(null); setTab('historique')
      fetchAll()
    } catch (err) {
      const msg = err.response?.data?.detail || 'Erreur lors de la création'
      Alert.alert('Erreur', typeof msg === 'string' ? msg : JSON.stringify(msg))
    } finally {
      setSubmitting(false)
    }
  }

  const statusConfig = {
    en_attente: { label: '⏳ En attente', color: '#d97706', bg: '#fffbeb', border: '#fcd34d' },
    confirme: { label: '✅ Confirmé', color: '#059669', bg: '#f0fdf4', border: '#bbf7d0' },
    annule: { label: '❌ Annulé', color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
  }

  const getInitials = (m) => `${(m.prenom||'?')[0]}${(m.nom||'?')[0]}`.toUpperCase()

  const avatarColors = ['#4f46e5','#7c3aed','#dc2626','#059669','#d97706','#0891b2','#be185d','#6d28d9','#ea580c','#0d9488']

  if (loading) return (
    <View style={s.container}>
      <ActivityIndicator color="#4f46e5" size="large" style={{ marginTop: 100 }} />
    </View>
  )

  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.back}>← Retour</Text>
        </TouchableOpacity>
        <Text style={s.title}>Prendre rendez-vous</Text>
        <Text style={s.subtitle}>Contactez votre médecin et planifiez votre prochaine consultation</Text>
      </View>

      {/* Tabs */}
      <View style={s.tabRow}>
        <TouchableOpacity style={[s.tabBtn, tab === 'demande' && s.tabActive]} onPress={() => setTab('demande')}>
          <Text style={[s.tabText, tab === 'demande' && s.tabTextActive]}>📝 Nouvelle demande</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.tabBtn, tab === 'historique' && s.tabActive]} onPress={() => setTab('historique')}>
          <Text style={[s.tabText, tab === 'historique' && s.tabTextActive]}>📋 Historique ({rdvs.length})</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={s.content} keyboardShouldPersistTaps="handled">
        {tab === 'demande' && (
          <>
            {/* STEP 1: Choose doctor */}
            <View style={s.card}>
              <Text style={s.cardTitle}>Choisissez votre médecin</Text>
              <View style={s.medecinGrid}>
                {medecins.map((m, i) => {
                  const selected = selectedMedecin?.id === m.id
                  const color = avatarColors[i % avatarColors.length]
                  return (
                    <TouchableOpacity
                      key={m.id}
                      style={[s.medecinCard, selected && { borderColor: '#4f46e5', borderWidth: 2, backgroundColor: '#eef2ff' }]}
                      onPress={() => setSelectedMedecin(m)}
                    >
                      {selected && <View style={s.checkMark}><Text style={s.checkText}>✓</Text></View>}
                      <View style={[s.medecinAvatar, { backgroundColor: color }]}>
                        <Text style={s.medecinInitials}>{getInitials(m)}</Text>
                      </View>
                      <Text style={s.medecinName} numberOfLines={1}>Dr. {m.prenom} {m.nom}</Text>
                      <Text style={s.medecinSpec}>Neurologue</Text>
                      <Text style={s.medecinEmail} numberOfLines={1}>📧 {m.email}</Text>
                    </TouchableOpacity>
                  )
                })}
              </View>
            </View>

            {/* STEP 2: Appointment form */}
            <View style={s.card}>
              <Text style={s.cardTitle}>Demande de rendez-vous</Text>

              {/* Date */}
              <Text style={s.formLabel}>Date souhaitée *</Text>
              <View style={s.dateRow}>
                <TextInput style={[s.dateInput, { flex: 1 }]} placeholder="JJ" value={day} onChangeText={setDay} keyboardType="numeric" maxLength={2} placeholderTextColor="#94a3b8" />
                <Text style={s.dateSep}>/</Text>
                <TextInput style={[s.dateInput, { flex: 1 }]} placeholder="MM" value={month} onChangeText={setMonth} keyboardType="numeric" maxLength={2} placeholderTextColor="#94a3b8" />
                <Text style={s.dateSep}>/</Text>
                <TextInput style={[s.dateInput, { flex: 2 }]} placeholder="AAAA" value={year} onChangeText={setYear} keyboardType="numeric" maxLength={4} placeholderTextColor="#94a3b8" />
              </View>

              {/* Heure */}
              <Text style={s.formLabel}>Heure souhaitée *</Text>
              <TouchableOpacity style={s.pickerBtn} onPress={() => { setShowHeurePicker(!showHeurePicker); setShowMotifPicker(false) }}>
                <Text style={s.pickerText}>{heure || '🕐 --:--'}</Text>
                <Text style={{ color: '#94a3b8' }}>▼</Text>
              </TouchableOpacity>
              {showHeurePicker && (
                <View style={s.pickerMenu}>
                  <ScrollView style={{ maxHeight: 200 }}>
                    {HEURES.map(h => (
                      <TouchableOpacity key={h} style={[s.pickerItem, heure === h && s.pickerItemActive]} onPress={() => { setHeure(h); setShowHeurePicker(false) }}>
                        <Text style={[s.pickerItemText, heure === h && { color: '#fff' }]}>{h}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}

              {/* Motif */}
              <Text style={s.formLabel}>Motif de consultation *</Text>
              <TouchableOpacity style={s.pickerBtn} onPress={() => { setShowMotifPicker(!showMotifPicker); setShowHeurePicker(false) }}>
                <Text style={s.pickerText}>{motif || 'Sélectionner un motif'}</Text>
                <Text style={{ color: '#94a3b8' }}>▼</Text>
              </TouchableOpacity>
              {showMotifPicker && (
                <View style={s.pickerMenu}>
                  {MOTIFS.map(m => (
                    <TouchableOpacity key={m} style={[s.pickerItem, motif === m && s.pickerItemActive]} onPress={() => { setMotif(m); setShowMotifPicker(false) }}>
                      <Text style={[s.pickerItemText, motif === m && { color: '#fff' }]}>{m}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Message */}
              <Text style={s.formLabel}>Message (optionnel)</Text>
              <TextInput
                style={s.textArea}
                placeholder="Décrivez brièvement votre demande..."
                value={message}
                onChangeText={setMessage}
                multiline
                placeholderTextColor="#94a3b8"
              />

              {/* Submit */}
              <TouchableOpacity style={s.submitBtn} onPress={handleSubmit} disabled={submitting}>
                <Text style={s.submitText}>{submitting ? 'Envoi en cours...' : '✈️ Envoyer la demande'}</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {tab === 'historique' && (
          <>
            {/* Stats */}
            <View style={s.statsRow}>
              {[
                { label: 'Total', value: rdvs.length, color: '#4f46e5' },
                { label: 'En attente', value: rdvs.filter(r => r.statut === 'en_attente').length, color: '#d97706' },
                { label: 'Confirmés', value: rdvs.filter(r => r.statut === 'confirme').length, color: '#059669' },
              ].map((st, i) => (
                <View key={i} style={s.statCard}>
                  <Text style={[s.statNum, { color: st.color }]}>{st.value}</Text>
                  <Text style={s.statLabel}>{st.label}</Text>
                </View>
              ))}
            </View>

            {rdvs.length === 0 ? (
              <View style={s.emptyCard}>
                <Text style={{ fontSize: 40, opacity: 0.3, marginBottom: 10 }}>📅</Text>
                <Text style={s.emptyTitle}>Aucun rendez-vous</Text>
                <Text style={s.emptyDesc}>Vos rendez-vous apparaîtront ici</Text>
              </View>
            ) : (
              rdvs.map((r, i) => {
                const st = statusConfig[r.statut] || statusConfig.en_attente
                return (
                  <View key={r.id || i} style={s.rdvCard}>
                    <View style={s.rdvTop}>
                      <View style={[s.rdvBadge, { backgroundColor: st.bg, borderColor: st.border }]}>
                        <Text style={[s.rdvBadgeText, { color: st.color }]}>{st.label}</Text>
                      </View>
                      <Text style={s.rdvDate}>📅 {r.date}</Text>
                    </View>
                    <View style={s.rdvDetails}>
                      <View style={s.rdvRow}><Text style={s.rdvIcon}>🕐</Text><Text style={s.rdvVal}>{r.heure}</Text></View>
                      <View style={s.rdvRow}><Text style={s.rdvIcon}>📋</Text><Text style={s.rdvVal}>{r.motif}</Text></View>
                      {r.medecin_nom && <View style={s.rdvRow}><Text style={s.rdvIcon}>👨‍⚕️</Text><Text style={s.rdvVal}>Dr. {r.medecin_nom}</Text></View>}
                      {r.message && <View style={s.rdvRow}><Text style={s.rdvIcon}>💬</Text><Text style={[s.rdvVal, { fontStyle: 'italic', color: '#94a3b8' }]}>{r.message}</Text></View>}
                    </View>
                  </View>
                )
              })
            )}
          </>
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
  subtitle: { fontSize: 12, color: '#64748b', marginTop: 2 },

  tabRow: { flexDirection: 'row', paddingHorizontal: 16, paddingTop: 12, gap: 8 },
  tabBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10, backgroundColor: '#fff', borderWidth: 0.5, borderColor: '#e2e8f0' },
  tabActive: { backgroundColor: '#4f46e5', borderColor: '#4f46e5' },
  tabText: { fontSize: 13, color: '#64748b', fontWeight: '500' },
  tabTextActive: { color: '#fff', fontWeight: '600' },

  content: { padding: 16 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 0.5, borderColor: '#e2e8f0' },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#1e293b', marginBottom: 14, paddingBottom: 10, borderBottomWidth: 0.5, borderBottomColor: '#f1f5f9' },

  // Doctor grid
  medecinGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  medecinCard: { width: '47%', backgroundColor: '#f8f9fc', borderRadius: 10, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0', position: 'relative' },
  checkMark: { position: 'absolute', top: 6, right: 6, width: 20, height: 20, borderRadius: 10, backgroundColor: '#4f46e5', justifyContent: 'center', alignItems: 'center', zIndex: 1 },
  checkText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  medecinAvatar: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
  medecinInitials: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  medecinName: { fontSize: 12, fontWeight: '600', color: '#1e293b', textAlign: 'center', marginBottom: 2 },
  medecinSpec: { fontSize: 10, color: '#64748b', marginBottom: 4 },
  medecinEmail: { fontSize: 9, color: '#94a3b8' },

  // Form
  formLabel: { fontSize: 13, fontWeight: '500', color: '#374151', marginBottom: 6, marginTop: 12 },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dateInput: { backgroundColor: '#f8f9fc', borderRadius: 8, padding: 12, fontSize: 14, color: '#1e293b', borderWidth: 0.5, borderColor: '#e2e8f0', textAlign: 'center' },
  dateSep: { fontSize: 18, color: '#94a3b8', fontWeight: '300' },

  pickerBtn: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8f9fc', borderRadius: 8, padding: 12, borderWidth: 0.5, borderColor: '#e2e8f0' },
  pickerText: { fontSize: 13, color: '#1e293b' },
  pickerMenu: { backgroundColor: '#fff', borderRadius: 8, borderWidth: 0.5, borderColor: '#e2e8f0', elevation: 4, marginTop: 4, marginBottom: 4, overflow: 'hidden' },
  pickerItem: { paddingHorizontal: 14, paddingVertical: 11, borderBottomWidth: 0.5, borderBottomColor: '#f1f5f9' },
  pickerItemActive: { backgroundColor: '#4f46e5' },
  pickerItemText: { fontSize: 13, color: '#374151' },

  textArea: { backgroundColor: '#f8f9fc', borderRadius: 8, padding: 12, fontSize: 13, color: '#1e293b', borderWidth: 0.5, borderColor: '#e2e8f0', height: 80, textAlignVertical: 'top', marginTop: 4 },

  submitBtn: { backgroundColor: '#4f46e5', borderRadius: 10, padding: 16, alignItems: 'center', marginTop: 16 },
  submitText: { color: '#fff', fontSize: 15, fontWeight: '600' },

  // Stats
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statCard: { flex: 1, backgroundColor: '#fff', borderRadius: 8, padding: 12, alignItems: 'center', borderWidth: 0.5, borderColor: '#e2e8f0' },
  statNum: { fontSize: 20, fontWeight: 'bold' },
  statLabel: { fontSize: 11, color: '#64748b', marginTop: 2 },

  // Empty
  emptyCard: { backgroundColor: '#fff', borderRadius: 12, padding: 40, alignItems: 'center', borderWidth: 0.5, borderColor: '#e2e8f0' },
  emptyTitle: { fontSize: 14, fontWeight: '500', color: '#64748b' },
  emptyDesc: { fontSize: 12, color: '#94a3b8', marginTop: 4 },

  // RDV cards
  rdvCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 0.5, borderColor: '#e2e8f0', elevation: 1 },
  rdvTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  rdvBadge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 0.5 },
  rdvBadgeText: { fontSize: 11, fontWeight: '600' },
  rdvDate: { fontSize: 12, fontWeight: '500', color: '#1e293b' },
  rdvDetails: { gap: 6 },
  rdvRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rdvIcon: { fontSize: 13 },
  rdvVal: { fontSize: 13, color: '#374151' },
})