import React, { useState, useEffect } from 'react'
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator
} from 'react-native'
import api from '../services/api'

export default function RapportsRecus({ navigation }) {
  const [rapports, setRapports] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchRapports() }, [])

  const fetchRapports = async () => {
    try {
      const res = await api.get('/patients/rapports/recus')
      setRapports(Array.isArray(res.data) ? res.data : [])
    } catch (err) {
      console.error(err)
      setRapports([])
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (d) => {
    if (!d) return '—'
    try {
      const date = new Date(d)
      return `${date.getDate().toString().padStart(2,'0')}/${(date.getMonth()+1).toString().padStart(2,'0')}/${date.getFullYear()}`
    } catch { return String(d) }
  }

  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.back}>← Retour</Text>
        </TouchableOpacity>
        <Text style={s.title}>Rapports reçus</Text>
        <Text style={s.desc}>Rapports radiologiques transmis par vos radiologues contractés</Text>
      </View>

      <ScrollView style={s.content}>
        {loading ? (
          <ActivityIndicator color="#4f46e5" size="large" style={{ marginTop: 40 }} />
        ) : rapports.length === 0 ? (
          <View style={s.emptyCard}>
            <Text style={s.emptyIcon}>📋</Text>
            <Text style={s.emptyTitle}>Aucun rapport reçu pour le moment</Text>
            <Text style={s.emptyDesc}>Les rapports envoyés par vos radiologues apparaîtront ici</Text>
          </View>
        ) : (
          rapports.map((r, i) => (
            <TouchableOpacity
              key={r.id || i}
              style={s.card}
              onPress={() => navigation.navigate('PatientDetail', { patientId: r.patient_id })}
            >
              <View style={s.cardTop}>
                <View style={s.avatarBox}>
                  <Text style={s.avatarText}>{r.patient_nom?.charAt(0) || '?'}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.patientNom}>{r.patient_nom || 'Patient'}</Text>
                  <Text style={s.rapportMeta}>
                    🧠 {r.sequence_type || 'IRM'} • {r.metadata?.taille_mb || '—'} MB
                  </Text>
                </View>
                <View style={s.newBadge}>
                  <Text style={s.newBadgeText}>Nouveau</Text>
                </View>
              </View>

              {/* Rapport content */}
              {r.rapport && (
                <View style={s.rapportContent}>
                  {r.rapport.conclusion && (
                    <Text style={s.rapportConclusion}>📝 {r.rapport.conclusion}</Text>
                  )}
                  {r.rapport.observations && (
                    <Text style={s.rapportObs}>{r.rapport.observations}</Text>
                  )}
                </View>
              )}

              <View style={s.cardBottom}>
                <Text style={s.cardDetail}>👨‍⚕️ {r.radiologue_nom || 'Radiologue'}</Text>
                <Text style={s.cardDetail}>📅 {formatDate(r.envoye_at || r.uploaded_at)}</Text>
              </View>

              <TouchableOpacity style={s.voirBtn}>
                <Text style={s.voirText}>Voir le rapport →</Text>
              </TouchableOpacity>
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
  title: { fontSize: 22, fontWeight: 'bold', color: '#1e293b' },
  desc: { fontSize: 13, color: '#64748b', marginTop: 2 },
  content: { padding: 16 },

  // Empty
  emptyCard: { backgroundColor: '#fff', borderRadius: 12, padding: 40, alignItems: 'center', borderWidth: 0.5, borderColor: '#e2e8f0' },
  emptyIcon: { fontSize: 48, marginBottom: 12, opacity: 0.4 },
  emptyTitle: { fontSize: 15, fontWeight: '600', color: '#1e293b', marginBottom: 4 },
  emptyDesc: { fontSize: 13, color: '#94a3b8', textAlign: 'center' },

  // Card
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 0.5, borderColor: '#e2e8f0', elevation: 1 },
  cardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  avatarBox: { width: 42, height: 42, borderRadius: 10, backgroundColor: '#4f46e5', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  patientNom: { fontSize: 15, fontWeight: '600', color: '#1e293b', marginBottom: 2 },
  rapportMeta: { fontSize: 12, color: '#64748b' },
  newBadge: { backgroundColor: '#f0fdf4', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 0.5, borderColor: '#bbf7d0' },
  newBadgeText: { fontSize: 11, color: '#059669', fontWeight: '600' },

  rapportContent: { backgroundColor: '#f8f9fc', borderRadius: 8, padding: 12, marginBottom: 10 },
  rapportConclusion: { fontSize: 13, color: '#1e293b', fontWeight: '500', marginBottom: 4 },
  rapportObs: { fontSize: 12, color: '#64748b' },

  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  cardDetail: { fontSize: 12, color: '#94a3b8' },

  voirBtn: { backgroundColor: '#f1f5f9', borderRadius: 8, padding: 10, alignItems: 'center', borderWidth: 0.5, borderColor: '#e2e8f0' },
  voirText: { fontSize: 13, color: '#4f46e5', fontWeight: '600' },
})