import React, { useEffect, useState } from 'react'
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator, Alert
} from 'react-native'
import api from '../../services/api'

export default function AdminLiaisons({ navigation }) {
  const [liaisons, setLiaisons] = useState([])
  const [radiologues, setRadiologues] = useState([])
  const [medecins, setMedecins] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selectedRadio, setSelectedRadio] = useState(null)
  const [selectedMedecin, setSelectedMedecin] = useState(null)
  const [showRadioPicker, setShowRadioPicker] = useState(false)
  const [showMedecinPicker, setShowMedecinPicker] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => { fetchAll() }, [])

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [resC, resU] = await Promise.all([
        api.get('/contrats'),
        api.get('/admin/utilisateurs'),
      ])
      setLiaisons(resC.data || [])
      const users = Array.isArray(resU.data) ? resU.data : resU.data?.data || []
      setRadiologues(users.filter(u => u.role === 'radiologue' && (u.est_actif || u.statut === 'actif')))
      setMedecins(users.filter(u => u.role === 'medecin' && (u.est_actif || u.statut === 'actif')))
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const showMsg = (text) => {
    setMessage(text)
    setTimeout(() => setMessage(''), 4000)
  }

  const handleCreer = async () => {
    if (!selectedRadio || !selectedMedecin) {
      showMsg('⚠️ Sélectionnez un radiologue et un médecin')
      return
    }
    try {
      await api.post('/contrats', {
        radiologue_id: selectedRadio.id || selectedRadio._id,
        medecin_id: selectedMedecin.id || selectedMedecin._id,
      })
      showMsg('✅ Liaison créée avec succès')
      setShowForm(false)
      setSelectedRadio(null)
      setSelectedMedecin(null)
      fetchAll()
    } catch (err) {
      const detail = err.response?.data?.detail || 'Erreur'
      showMsg('❌ ' + (typeof detail === 'string' ? detail : JSON.stringify(detail)))
    }
  }

  const handleSupprimer = async (id) => {
    Alert.alert('Supprimer', 'Voulez-vous supprimer cette liaison ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer', style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/contrats/${id}`)
            showMsg('✅ Liaison supprimée')
            fetchAll()
          } catch (err) {
            showMsg('❌ Impossible de supprimer')
          }
        }
      }
    ])
  }

  const formatDate = (d) => {
    if (!d) return '—'
    try { return new Date(d).toLocaleDateString('fr-FR') } catch { return '—' }
  }

  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.back}>← Retour</Text>
        </TouchableOpacity>
        <View style={s.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={s.title}>Liaisons Radiologue — Médecin</Text>
            <Text style={s.subtitle}>Gérez les contrats entre radiologues et médecins</Text>
          </View>
          <TouchableOpacity style={s.addBtn} onPress={() => setShowForm(!showForm)}>
            <Text style={s.addBtnText}>+ Nouvelle</Text>
          </TouchableOpacity>
        </View>

        {/* Message feedback */}
        {message ? (
          <View style={[s.msgBanner, {
            backgroundColor: message.includes('✅') ? '#f0fdf4' : message.includes('⚠️') ? '#fffbeb' : '#fef2f2',
            borderColor: message.includes('✅') ? '#bbf7d0' : message.includes('⚠️') ? '#fde68a' : '#fecaca',
          }]}>
            <Text style={[s.msgText, {
              color: message.includes('✅') ? '#166534' : message.includes('⚠️') ? '#92400e' : '#991b1b',
            }]}>{message}</Text>
          </View>
        ) : null}
      </View>

      <ScrollView style={s.content} keyboardShouldPersistTaps="handled">

        {/* Create form */}
        {showForm && (
          <View style={s.formCard}>
            <View style={s.formTop}>
              <Text style={s.formTitle}>Créer une liaison</Text>
              <TouchableOpacity onPress={() => setShowForm(false)}>
                <Text style={s.formClose}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Radiologue picker */}
            <Text style={s.formLabel}>🔬 Radiologue</Text>
            <TouchableOpacity style={s.pickerBtn} onPress={() => { setShowRadioPicker(!showRadioPicker); setShowMedecinPicker(false) }}>
              <Text style={s.pickerText}>{selectedRadio ? `${selectedRadio.prenom} ${selectedRadio.nom}` : 'Sélectionner un radiologue'}</Text>
              <Text style={s.pickerArrow}>▼</Text>
            </TouchableOpacity>
            {showRadioPicker && (
              <View style={s.pickerMenu}>
                <ScrollView style={{ maxHeight: 150 }}>
                  {radiologues.length === 0 ? (
                    <Text style={s.pickerEmpty}>Aucun radiologue actif</Text>
                  ) : (
                    radiologues.map(r => (
                      <TouchableOpacity key={r.id || r._id} style={[s.pickerItem, selectedRadio?.id === r.id && s.pickerItemActive]}
                        onPress={() => { setSelectedRadio(r); setShowRadioPicker(false) }}>
                        <Text style={[s.pickerItemText, selectedRadio?.id === r.id && { color: '#fff' }]}>{r.prenom} {r.nom}</Text>
                      </TouchableOpacity>
                    ))
                  )}
                </ScrollView>
              </View>
            )}

            {/* Médecin picker */}
            <Text style={[s.formLabel, { marginTop: 10 }]}>👨‍⚕️ Médecin</Text>
            <TouchableOpacity style={s.pickerBtn} onPress={() => { setShowMedecinPicker(!showMedecinPicker); setShowRadioPicker(false) }}>
              <Text style={s.pickerText}>{selectedMedecin ? `Dr. ${selectedMedecin.prenom} ${selectedMedecin.nom}` : 'Sélectionner un médecin'}</Text>
              <Text style={s.pickerArrow}>▼</Text>
            </TouchableOpacity>
            {showMedecinPicker && (
              <View style={s.pickerMenu}>
                <ScrollView style={{ maxHeight: 150 }}>
                  {medecins.length === 0 ? (
                    <Text style={s.pickerEmpty}>Aucun médecin actif</Text>
                  ) : (
                    medecins.map(m => (
                      <TouchableOpacity key={m.id || m._id} style={[s.pickerItem, selectedMedecin?.id === m.id && s.pickerItemActive]}
                        onPress={() => { setSelectedMedecin(m); setShowMedecinPicker(false) }}>
                        <Text style={[s.pickerItemText, selectedMedecin?.id === m.id && { color: '#fff' }]}>Dr. {m.prenom} {m.nom}</Text>
                      </TouchableOpacity>
                    ))
                  )}
                </ScrollView>
              </View>
            )}

            <View style={s.formActions}>
              <TouchableOpacity style={s.cancelBtn} onPress={() => setShowForm(false)}>
                <Text style={s.cancelText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.createBtn} onPress={handleCreer}>
                <Text style={s.createText}>Créer la liaison</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* List */}
        {loading ? (
          <ActivityIndicator color="#4f46e5" size="large" style={{ marginTop: 40 }} />
        ) : liaisons.length === 0 ? (
          <View style={s.empty}>
            <Text style={s.emptyIcon}>🔗</Text>
            <Text style={s.emptyTitle}>Aucune liaison configurée</Text>
            <Text style={s.emptyDesc}>Créez des liaisons entre radiologues et médecins pour permettre l'envoi de rapports</Text>
          </View>
        ) : (
          liaisons.map((l, i) => (
            <View key={l.id || l._id || i} style={s.card}>
              <View style={s.cardContent}>
                <View style={s.userCol}>
                  <View style={[s.userAvatar, { backgroundColor: '#e0f2fe' }]}>
                    <Text style={[s.userAvatarText, { color: '#0891b2' }]}>{(l.radiologue_nom || l.radiologue?.prenom || '?')[0]}</Text>
                  </View>
                  <Text style={s.roleLabel}>🔬 Radiologue</Text>
                  <Text style={s.userName}>{l.radiologue_nom || `${l.radiologue?.prenom} ${l.radiologue?.nom}` || '—'}</Text>
                </View>

                <View style={s.linkDivider}>
                  <Text style={{ fontSize: 18 }}>🔗</Text>
                </View>

                <View style={s.userCol}>
                  <View style={[s.userAvatar, { backgroundColor: '#ede9fe' }]}>
                    <Text style={[s.userAvatarText, { color: '#7c3aed' }]}>{(l.medecin_nom || l.medecin?.prenom || '?')[0]}</Text>
                  </View>
                  <Text style={s.roleLabel}>👨‍⚕️ Médecin</Text>
                  <Text style={s.userName}>{l.medecin_nom || `${l.medecin?.prenom} ${l.medecin?.nom}` || '—'}</Text>
                </View>
              </View>

              <View style={s.cardFooter}>
                <Text style={s.dateText}>📅 {formatDate(l.created_at)}</Text>
                <TouchableOpacity style={s.supprimerBtn} onPress={() => handleSupprimer(l.id || l._id)}>
                  <Text style={s.supprimerText}>🗑 Supprimer</Text>
                </TouchableOpacity>
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
  headerRow: { flexDirection: 'row', alignItems: 'flex-start' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#1e293b', marginBottom: 4 },
  subtitle: { fontSize: 13, color: '#64748b' },
  addBtn: { backgroundColor: '#0f172a', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10 },
  addBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  content: { padding: 16 },

  // Message
  msgBanner: { marginTop: 10, borderRadius: 8, padding: 12, borderWidth: 0.5 },
  msgText: { fontSize: 13, fontWeight: '500' },

  // Form
  formCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 0.5, borderColor: '#e2e8f0', elevation: 2 },
  formTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  formTitle: { fontSize: 16, fontWeight: '700', color: '#1e293b' },
  formClose: { fontSize: 18, color: '#94a3b8' },
  formLabel: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 },
  pickerBtn: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8f9fc', borderRadius: 8, padding: 12, borderWidth: 0.5, borderColor: '#e2e8f0' },
  pickerText: { fontSize: 13, color: '#1e293b' },
  pickerArrow: { fontSize: 10, color: '#94a3b8' },
  pickerMenu: { backgroundColor: '#fff', borderRadius: 8, borderWidth: 0.5, borderColor: '#e2e8f0', elevation: 4, marginTop: 4, overflow: 'hidden' },
  pickerItem: { paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: '#f1f5f9' },
  pickerItemActive: { backgroundColor: '#4f46e5' },
  pickerItemText: { fontSize: 13, color: '#374151' },
  pickerEmpty: { padding: 14, fontSize: 13, color: '#94a3b8', textAlign: 'center' },
  formActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 16 },
  cancelBtn: { backgroundColor: '#f1f5f9', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 10, borderWidth: 0.5, borderColor: '#e2e8f0' },
  cancelText: { color: '#64748b', fontSize: 13 },
  createBtn: { backgroundColor: '#0f172a', borderRadius: 8, paddingHorizontal: 18, paddingVertical: 10 },
  createText: { color: '#fff', fontSize: 13, fontWeight: '600' },

  // Empty
  empty: { alignItems: 'center', padding: 40, backgroundColor: '#fff', borderRadius: 12, borderWidth: 0.5, borderColor: '#e2e8f0' },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: '#1e293b', marginBottom: 8 },
  emptyDesc: { fontSize: 13, color: '#64748b', textAlign: 'center', lineHeight: 20 },

  // Card
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 0.5, borderColor: '#e2e8f0', elevation: 1 },
  cardContent: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  userCol: { flex: 1, alignItems: 'center' },
  userAvatar: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
  userAvatarText: { fontSize: 16, fontWeight: '700' },
  roleLabel: { fontSize: 11, color: '#94a3b8', marginBottom: 2 },
  userName: { fontSize: 13, fontWeight: '600', color: '#1e293b', textAlign: 'center' },
  linkDivider: { paddingHorizontal: 8 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTopWidth: 0.5, borderTopColor: '#f1f5f9' },
  dateText: { fontSize: 12, color: '#94a3b8' },
  supprimerBtn: { backgroundColor: '#fef2f2', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 0.5, borderColor: '#fecaca' },
  supprimerText: { color: '#dc2626', fontWeight: '600', fontSize: 12 },
})