import React, { useState, useEffect } from 'react'
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator, TextInput, Alert
} from 'react-native'
import api from '../services/api'

const JOURS = ['lu', 'ma', 'me', 'je', 've', 'sa', 'di']
const MOIS = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre']

function getCalendar(year, month) {
  const first = new Date(year, month, 1)
  const last = new Date(year, month + 1, 0)
  let startDay = first.getDay() - 1
  if (startDay < 0) startDay = 6
  const days = []
  for (let i = 0; i < startDay; i++) days.push(null)
  for (let d = 1; d <= last.getDate(); d++) days.push(d)
  return days
}

export default function Agenda({ navigation }) {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtre, setFiltre] = useState('tout')
  const [showForm, setShowForm] = useState(false)
  const [formTitre, setFormTitre] = useState('')
  const [formDate, setFormDate] = useState('')
  const [formDesc, setFormDesc] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [selectedDay, setSelectedDay] = useState(today.getDate())

  useEffect(() => { fetchEvents() }, [])

  const fetchEvents = async () => {
    try {
      const res = await api.get('/agenda/evenements/')
      setEvents(Array.isArray(res.data) ? res.data : [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!formTitre || !formDate) {
      Alert.alert('Erreur', 'Titre et Date sont obligatoires')
      return
    }
    setSubmitting(true)
    try {
      await api.post('/agenda/rappels/', {
        titre: formTitre,
        date_rappel: formDate,
        description: formDesc || '',
      })
      setShowForm(false)
      setFormTitre(''); setFormDate(''); setFormDesc('')
      fetchEvents()
    } catch (err) {
      let msg = err.response?.data?.detail || 'Erreur'
      if (typeof msg !== 'string') msg = JSON.stringify(msg)
      Alert.alert('Erreur', msg)
    } finally {
      setSubmitting(false)
    }
  }

  const selectedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`

  const filteredEvents = events.filter(e => {
    const evDate = e.date ? String(e.date).slice(0, 10) : ''
    const matchDate = evDate === selectedDate
    const matchFiltre = filtre === 'tout' || e.type === filtre
    return matchDate && matchFiltre
  })

  const calDays = getCalendar(year, month)
  const eventDates = events.map(e => e.date ? String(e.date).slice(0, 10) : '')

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(year - 1) } else setMonth(month - 1) }
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(year + 1) } else setMonth(month + 1) }

  const filtres = [
    { key: 'tout', label: 'Tout', color: '#4f46e5' },
    { key: 'visite', label: 'Visites', color: '#3b82f6' },
    { key: 'irm', label: 'IRM', color: '#8b5cf6' },
    { key: 'analyse', label: 'Analyses', color: '#10b981' },
    { key: 'rappel', label: 'Rappels', color: '#f59e0b' },
  ]

  const typeColors = { visite: '#3b82f6', irm: '#8b5cf6', analyse: '#10b981', rappel: '#f59e0b' }

  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.back}>← Retour</Text>
        </TouchableOpacity>
        <View style={s.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={s.title}>Agenda</Text>
            <Text style={s.subtitle}>{selectedDay} {MOIS[month]} {year}</Text>
          </View>
          <TouchableOpacity style={s.addBtn} onPress={() => setShowForm(!showForm)}>
            <Text style={s.addBtnText}>+ Nouveau rappel</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={s.content}>
        {/* CALENDRIER */}
        <View style={s.calCard}>
          <View style={s.calHeader}>
            <TouchableOpacity onPress={prevMonth}><Text style={s.calNav}>◀</Text></TouchableOpacity>
            <Text style={s.calTitle}>{MOIS[month]} {year}</Text>
            <TouchableOpacity onPress={nextMonth}><Text style={s.calNav}>▶</Text></TouchableOpacity>
          </View>
          <View style={s.calDaysRow}>
            {JOURS.map(j => <Text key={j} style={s.calDayLabel}>{j}</Text>)}
          </View>
          <View style={s.calGrid}>
            {calDays.map((d, i) => {
              if (d === null) return <View key={`e${i}`} style={s.calCell} />
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
              const isToday = d === today.getDate() && month === today.getMonth() && year === today.getFullYear()
              const isSelected = d === selectedDay
              const hasEvent = eventDates.includes(dateStr)
              return (
                <TouchableOpacity key={i} style={[s.calCell, isSelected && s.calCellSelected, isToday && !isSelected && s.calCellToday]} onPress={() => setSelectedDay(d)}>
                  <Text style={[s.calCellText, isSelected && s.calCellTextSelected, isToday && !isSelected && { color: '#4f46e5', fontWeight: 'bold' }]}>{d}</Text>
                  {hasEvent && <View style={s.calDot} />}
                </TouchableOpacity>
              )
            })}
          </View>
        </View>

        {/* FILTRES */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filtresRow}>
          {filtres.map(f => (
            <TouchableOpacity key={f.key} style={[s.filtreBtn, filtre === f.key && { backgroundColor: f.color, borderColor: f.color }]} onPress={() => setFiltre(f.key)}>
              <Text style={[s.filtreText, filtre === f.key && { color: '#fff' }]}>{f.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* FORMULAIRE RAPPEL */}
        {showForm && (
          <View style={s.formCard}>
            <View style={s.formTop}>
              <Text style={s.formTitle}>Nouveau rappel</Text>
              <TouchableOpacity onPress={() => setShowForm(false)}><Text style={s.formClose}>✕</Text></TouchableOpacity>
            </View>
            <Text style={s.formLabel}>Titre *</Text>
            <TextInput style={s.input} placeholder="Ex: Appeler patient Dupont" value={formTitre} onChangeText={setFormTitre} placeholderTextColor="#94a3b8" />
            <View style={s.formRow}>
              <View style={s.formField}>
                <Text style={s.formLabel}>Date et heure *</Text>
                <TextInput style={s.input} placeholder="AAAA-MM-JJTHH:MM" value={formDate} onChangeText={setFormDate} placeholderTextColor="#94a3b8" />
              </View>
              <View style={s.formField}>
                <Text style={s.formLabel}>Description</Text>
                <TextInput style={s.input} placeholder="Détails..." value={formDesc} onChangeText={setFormDesc} placeholderTextColor="#94a3b8" />
              </View>
            </View>
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

        {/* ÉVÉNEMENTS */}
        {loading ? (
          <ActivityIndicator color="#4f46e5" size="large" style={{ marginTop: 20 }} />
        ) : filteredEvents.length === 0 ? (
          <View style={s.emptyCard}>
            <Text style={s.emptyText}>Aucun événement pour ce filtre</Text>
          </View>
        ) : (
          filteredEvents.map((e, i) => (
            <View key={e.id || i} style={s.eventCard}>
              <View style={[s.eventDot, { backgroundColor: typeColors[e.type] || '#94a3b8' }]} />
              <View style={{ flex: 1 }}>
                <Text style={s.eventTitle}>{e.titre}</Text>
                {e.description ? <Text style={s.eventDesc}>{e.description}</Text> : null}
                {e.patient_nom ? <Text style={s.eventPatient}>👤 {e.patient_nom}</Text> : null}
              </View>
              <View style={[s.eventTypeBadge, { backgroundColor: (typeColors[e.type] || '#94a3b8') + '20', borderColor: typeColors[e.type] || '#94a3b8' }]}>
                <Text style={[s.eventTypeText, { color: typeColors[e.type] || '#94a3b8' }]}>{e.type}</Text>
              </View>
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
  addBtn: { backgroundColor: '#1e293b', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 10 },
  addBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  content: { padding: 16 },

  // Calendar
  calCard: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 16, borderWidth: 0.5, borderColor: '#e2e8f0' },
  calHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  calNav: { fontSize: 16, color: '#4f46e5', padding: 8 },
  calTitle: { fontSize: 15, fontWeight: '600', color: '#1e293b' },
  calDaysRow: { flexDirection: 'row', marginBottom: 4 },
  calDayLabel: { flex: 1, textAlign: 'center', fontSize: 11, color: '#94a3b8', fontWeight: '500' },
  calGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  calCell: { width: '14.28%', height: 38, justifyContent: 'center', alignItems: 'center' },
  calCellSelected: { backgroundColor: '#4f46e5', borderRadius: 10 },
  calCellToday: { borderWidth: 1, borderColor: '#4f46e5', borderRadius: 10 },
  calCellText: { fontSize: 13, color: '#374151' },
  calCellTextSelected: { color: '#fff', fontWeight: 'bold' },
  calDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#4f46e5', marginTop: 1 },

  // Filters
  filtresRow: { marginBottom: 16, maxHeight: 44 },
  filtreBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#fff', borderWidth: 0.5, borderColor: '#e2e8f0', marginRight: 8 },
  filtreText: { fontSize: 12, color: '#64748b', fontWeight: '500' },

  // Form
  formCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 0.5, borderColor: '#e2e8f0' },
  formTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  formTitle: { fontSize: 15, fontWeight: '600', color: '#1e293b' },
  formClose: { fontSize: 18, color: '#94a3b8' },
  formLabel: { fontSize: 12, color: '#64748b', marginBottom: 4, fontWeight: '500', marginTop: 8 },
  input: { backgroundColor: '#f8f9fc', borderRadius: 8, padding: 12, fontSize: 13, color: '#1e293b', borderWidth: 0.5, borderColor: '#e2e8f0' },
  formRow: { flexDirection: 'row', gap: 10 },
  formField: { flex: 1 },
  formActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 12 },
  cancelBtn: { backgroundColor: '#f1f5f9', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 10, borderWidth: 0.5, borderColor: '#e2e8f0' },
  cancelText: { color: '#64748b', fontSize: 13 },
  submitBtn: { backgroundColor: '#1e293b', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 10 },
  submitText: { color: '#fff', fontSize: 13, fontWeight: '600' },

  // Events
  emptyCard: { backgroundColor: '#fff', borderRadius: 12, padding: 30, alignItems: 'center', borderWidth: 0.5, borderColor: '#e2e8f0' },
  emptyText: { fontSize: 14, color: '#94a3b8' },
  eventCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 0.5, borderColor: '#e2e8f0' },
  eventDot: { width: 6, height: 36, borderRadius: 3, marginRight: 12 },
  eventTitle: { fontSize: 14, fontWeight: '600', color: '#1e293b', marginBottom: 2 },
  eventDesc: { fontSize: 12, color: '#64748b' },
  eventPatient: { fontSize: 11, color: '#94a3b8', marginTop: 2 },
  eventTypeBadge: { borderRadius: 12, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 0.5 },
  eventTypeText: { fontSize: 10, fontWeight: '600' },
})