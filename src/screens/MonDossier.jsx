import React, { useState, useEffect } from 'react'
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator, LinearGradient
} from 'react-native'
import api from '../services/api'

export default function MonDossier({ navigation }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchDossier() }, [])

  const fetchDossier = async () => {
    try {
      const res = await api.get('/patient-portal/mon-dossier')
      setData(res.data)
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
      return dt.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    } catch { return String(d) }
  }

  if (loading) return (
    <View style={s.container}>
      <ActivityIndicator color="#4f46e5" size="large" style={{ marginTop: 100 }} />
    </View>
  )

  const patient = data?.patient
  const resume = data?.resume

  if (!patient) return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.back}>← Retour</Text>
        </TouchableOpacity>
        <Text style={s.title}>Mon dossier</Text>
      </View>
      <View style={s.emptyContainer}>
        <View style={s.emptyIconBox}><Text style={{ fontSize: 26 }}>👤</Text></View>
        <Text style={s.emptyTitle}>Dossier non trouvé</Text>
        <Text style={s.emptyDesc}>Contactez votre médecin pour lier votre dossier.</Text>
      </View>
    </View>
  )

  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.back}>← Retour</Text>
        </TouchableOpacity>
        <Text style={s.title}>Mon dossier médical</Text>
        <Text style={s.subtitle}>Vos informations personnelles et votre résumé clinique</Text>
      </View>

      <ScrollView style={s.content}>
        {/* Premium Patient Card */}
        <View style={s.profileCard}>
          {/* Decorative circles */}
          <View style={s.decorCircle1} />
          <View style={s.decorCircle2} />

          <View style={s.profileContent}>
            <View style={s.avatar}>
              <Text style={s.avatarText}>
                {(patient.prenom || '?')[0]}{(patient.nom || '?')[0]}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.profileName}>{patient.prenom} {patient.nom}</Text>
              <View style={s.profileBadgeRow}>
                <View style={s.sexBadge}>
                  <Text style={s.sexBadgeText}>
                    {patient.sexe === 'F' ? 'Féminin' : 'Masculin'}
                  </Text>
                </View>
                <Text style={s.profileDob}>
                  Né(e) le {formatDate(patient.date_naissance)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Informations personnelles */}
        <View style={s.card}>
          <View style={s.cardHeader}>
            <View style={[s.cardIconBox, { backgroundColor: '#eef2ff', borderColor: '#c7d2fe' }]}>
              <Text style={{ fontSize: 14 }}>👤</Text>
            </View>
            <Text style={s.cardTitle}>Informations personnelles</Text>
          </View>

          {[
            { icon: '👤', label: 'NOM COMPLET', value: `${patient.prenom} ${patient.nom}` },
            { icon: '📅', label: 'DATE DE NAISSANCE', value: formatDate(patient.date_naissance) },
            { icon: '📧', label: 'EMAIL', value: patient.contact?.email || '—' },
            { icon: '📞', label: 'TÉLÉPHONE', value: patient.contact?.telephone || '—' },
            { icon: '📍', label: 'ADRESSE', value: patient.contact?.adresse || '—' },
          ].map(({ icon, label, value }) => (
            <View key={label} style={s.infoRow}>
              <View style={s.infoIconBox}>
                <Text style={{ fontSize: 13 }}>{icon}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.infoLabel}>{label}</Text>
                <Text style={s.infoValue}>{value}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Résumé clinique */}
        <View style={s.card}>
          <View style={s.cardHeader}>
            <View style={[s.cardIconBox, { backgroundColor: '#ecfdf5', borderColor: '#a7f3d0' }]}>
              <Text style={{ fontSize: 14 }}>❤️</Text>
            </View>
            <Text style={s.cardTitle}>Résumé clinique</Text>
          </View>

          <View style={s.statsGrid}>
            {[
              { label: 'Visites', value: resume?.total_visites || 0, icon: '📋', color: '#2563eb', bg: '#eff6ff' },
              { label: 'IRM réalisées', value: resume?.total_irm || 0, icon: '🧠', color: '#7c3aed', bg: '#f5f3ff' },
              { label: 'Dernier EDSS', value: resume?.dernier_edss ?? '—', icon: '🛡️', color: '#d97706', bg: '#fffbeb' },
            ].map(({ label, value, icon, color, bg }) => (
              <View key={label} style={[s.statCard, { backgroundColor: bg }]}>
                <View style={[s.statIconBox, { borderColor: color + '30' }]}>
                  <Text style={{ fontSize: 18 }}>{icon}</Text>
                </View>
                <Text style={[s.statNum, { color }]}>{value}</Text>
                <Text style={s.statLabel}>{label}</Text>
              </View>
            ))}
          </View>

          {/* Info note */}
          <View style={s.noteBox}>
            <Text style={s.noteText}>
              💡 <Text style={{ fontWeight: '600' }}>Note :</Text> Ces informations sont mises à jour par votre médecin traitant. Pour toute question, consultez lors de votre prochaine visite.
            </Text>
          </View>
        </View>

        {/* Accès rapide */}
        <View style={s.card}>
          <View style={s.cardHeader}>
            <View style={[s.cardIconBox, { backgroundColor: '#fef2f2', borderColor: '#fecaca' }]}>
              <Text style={{ fontSize: 14 }}>🔗</Text>
            </View>
            <Text style={s.cardTitle}>Accès rapide</Text>
          </View>
          {[
            { label: 'Mon Évolution', icon: '📈', screen: 'MonEvolution', desc: 'Score EDSS et tests' },
            { label: 'Mes Rapports', icon: '📄', screen: 'MesRapports', desc: 'Analyses IA' },
            { label: 'Rendez-vous', icon: '📅', screen: 'RendezVous', desc: 'Planifier une visite' },
            { label: 'Actualités SEP', icon: '📰', screen: 'Actualites', desc: 'Ressources et infos' },
          ].map((link, i) => (
            <TouchableOpacity key={i} style={s.linkItem} onPress={() => navigation.navigate(link.screen)}>
              <View style={s.linkIconBox}>
                <Text style={{ fontSize: 16 }}>{link.icon}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.linkText}>{link.label}</Text>
                <Text style={s.linkDesc}>{link.desc}</Text>
              </View>
              <Text style={s.linkArrow}>→</Text>
            </TouchableOpacity>
          ))}
        </View>
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

  // Empty state
  emptyContainer: { alignItems: 'center', justifyContent: 'center', flex: 1, padding: 40 },
  emptyIconBox: { width: 56, height: 56, borderRadius: 14, backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca', justifyContent: 'center', alignItems: 'center', marginBottom: 14 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: '#1e293b', marginBottom: 6 },
  emptyDesc: { fontSize: 13, color: '#94a3b8', textAlign: 'center' },

  // Profile card (gradient)
  profileCard: {
    backgroundColor: '#4f46e5', borderRadius: 20, padding: 28, marginBottom: 16,
    position: 'relative', overflow: 'hidden',
    shadowColor: '#4f46e5', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 6,
  },
  decorCircle1: { position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.08)' },
  decorCircle2: { position: 'absolute', bottom: -20, right: 60, width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.05)' },
  profileContent: { flexDirection: 'row', alignItems: 'center', gap: 16, zIndex: 1 },
  avatar: {
    width: 68, height: 68, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
  },
  avatarText: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  profileName: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 6 },
  profileBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  sexBadge: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 3 },
  sexBadgeText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  profileDob: { color: 'rgba(255,255,255,0.8)', fontSize: 12 },

  // Card
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 18, marginBottom: 16, borderWidth: 0.5, borderColor: '#e2e8f0' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 18 },
  cardIconBox: { width: 36, height: 36, borderRadius: 10, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#1e293b' },

  // Info rows
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: '#f8f9fc' },
  infoIconBox: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#f8f9fc', justifyContent: 'center', alignItems: 'center' },
  infoLabel: { fontSize: 10, color: '#94a3b8', fontWeight: '500', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 2 },
  infoValue: { fontSize: 14, fontWeight: '500', color: '#1e293b' },

  // Stats grid
  statsGrid: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  statCard: { flex: 1, borderRadius: 14, padding: 14, alignItems: 'center' },
  statIconBox: { width: 42, height: 42, borderRadius: 10, backgroundColor: '#fff', borderWidth: 1, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  statNum: { fontSize: 28, fontWeight: 'bold', marginBottom: 4 },
  statLabel: { fontSize: 11, color: '#6b7280', fontWeight: '500' },

  // Note
  noteBox: { backgroundColor: '#f8f9fc', borderRadius: 10, padding: 14, borderWidth: 0.5, borderColor: '#e2e8f0' },
  noteText: { fontSize: 12, color: '#6b7280', lineHeight: 18 },

  // Quick links
  linkItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: '#f8f9fc' },
  linkIconBox: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#f8f9fc', justifyContent: 'center', alignItems: 'center', borderWidth: 0.5, borderColor: '#e2e8f0' },
  linkText: { fontSize: 14, fontWeight: '500', color: '#1e293b' },
  linkDesc: { fontSize: 11, color: '#94a3b8', marginTop: 1 },
  linkArrow: { fontSize: 16, color: '#4f46e5', fontWeight: '600' },
})