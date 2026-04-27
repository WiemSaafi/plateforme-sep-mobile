import React, { useEffect, useState } from 'react'
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator, Alert
} from 'react-native'
import api from '../../services/api'

export default function AdminUtilisateurs({ navigation }) {
  const [onglet, setOnglet] = useState('attente')
  const [utilisateurs, setUtilisateurs] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => { fetchUtilisateurs() }, [])

  const fetchUtilisateurs = async () => {
    try {
      const res = await api.get('/admin/utilisateurs')
      setUtilisateurs(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const getId = (u) => u.id || u._id

  const showMsg = (text) => {
    setMessage(text)
    setTimeout(() => setMessage(''), 3000)
  }

  const handleValider = async (id) => {
    try {
      await api.put(`/admin/utilisateurs/${id}/valider`)
      showMsg('✅ Compte validé avec succès')
      fetchUtilisateurs()
    } catch (err) {
      Alert.alert('Erreur', err.response?.data?.detail || 'Impossible de valider')
    }
  }

  const handleRefuser = async (id) => {
    Alert.alert('Refuser', 'Voulez-vous refuser ce compte ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Refuser', style: 'destructive',
        onPress: async () => {
          try {
            await api.put(`/admin/utilisateurs/${id}/refuser`)
            Alert.alert('✅ Compte refusé')
            fetchUtilisateurs()
          } catch (err) {
            Alert.alert('Erreur', err.response?.data?.detail || 'Impossible de refuser')
          }
        }
      }
    ])
  }

  const roleColors = {
    medecin: '#4f46e5',
    radiologue: '#0891b2',
    laborantin: '#d97706',
    laboratoire: '#d97706',
    patient: '#059669',
    admin: '#dc2626',
  }

  const nonAdmin = utilisateurs.filter(u => u.role !== 'admin')
  const enAttente = nonAdmin.filter(u => !u.est_actif && u.statut !== 'refuse')
  const actifs = nonAdmin.filter(u => u.est_actif || u.statut === 'actif')
  const liste = onglet === 'attente' ? enAttente : actifs

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Retour</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Gestion des utilisateurs</Text>
        <Text style={styles.subtitle}>Validation et suivi des comptes</Text>

        {/* Message feedback */}
        {message ? (
          <View style={[styles.messageBanner, message.includes('✅') ? styles.msgSuccess : styles.msgError]}>
            <Text style={[styles.msgText, { color: message.includes('✅') ? '#166534' : '#991b1b' }]}>{message}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.onglets}>
        <TouchableOpacity
          style={[styles.onglet, onglet === 'attente' && styles.ongletActive]}
          onPress={() => setOnglet('attente')}
        >
          <Text style={[styles.ongletText, onglet === 'attente' && styles.ongletTextActive]}>
            ⏳ En attente ({enAttente.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.onglet, onglet === 'actifs' && styles.ongletActive]}
          onPress={() => setOnglet('actifs')}
        >
          <Text style={[styles.ongletText, onglet === 'actifs' && styles.ongletTextActive]}>
            ✅ Actifs ({actifs.length})
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator color="#4f46e5" size="large" style={{ marginTop: 40 }} />
      ) : (
        <ScrollView style={styles.list}>
          {liste.length === 0 ? (
            <Text style={styles.empty}>Aucun utilisateur</Text>
          ) : (
            liste.map((u, index) => (
              <View key={getId(u) || index} style={styles.card}>
                <View style={styles.cardTop}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {u.prenom?.charAt(0)}{u.nom?.charAt(0)}
                    </Text>
                  </View>
                  <View style={styles.info}>
                    <Text style={styles.name}>{u.prenom} {u.nom}</Text>
                    <Text style={styles.email}>{u.email}</Text>
                    <View style={[styles.roleBadge, { backgroundColor: (roleColors[u.role] || '#4f46e5') + '20', borderColor: roleColors[u.role] || '#4f46e5' }]}>
                      <Text style={[styles.roleText, { color: roleColors[u.role] || '#4f46e5' }]}>{u.role}</Text>
                    </View>
                  </View>
                </View>
                {onglet === 'attente' ? (
                  <View style={styles.actions}>
                    <TouchableOpacity style={styles.validerBtn} onPress={() => handleValider(getId(u))}>
                      <Text style={styles.validerText}>✓ Valider</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.refuserBtn} onPress={() => handleRefuser(getId(u))}>
                      <Text style={styles.refuserText}>✕ Refuser</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.activeRow}>
                    <View style={styles.activeBadge}>
                      <Text style={styles.activeText}>✅ Actif</Text>
                    </View>
                    <TouchableOpacity style={styles.deactivateBtn} onPress={() => handleRefuser(getId(u))}>
                      <Text style={styles.deactivateText}>Désactiver</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))
          )}
        </ScrollView>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fc' },
  header: { padding: 20, paddingTop: 60, backgroundColor: '#fff', borderBottomWidth: 0.5, borderBottomColor: '#e2e8f0' },
  back: { color: '#4f46e5', fontSize: 15, marginBottom: 8 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1e293b', marginBottom: 4 },
  subtitle: { fontSize: 13, color: '#64748b' },
  onglets: { flexDirection: 'row', padding: 16, gap: 10, backgroundColor: '#fff', borderBottomWidth: 0.5, borderBottomColor: '#e2e8f0' },
  onglet: { flex: 1, padding: 10, borderRadius: 10, backgroundColor: '#f1f5f9', alignItems: 'center', borderWidth: 0.5, borderColor: '#e2e8f0' },
  ongletActive: { backgroundColor: '#4f46e5', borderColor: '#4f46e5' },
  ongletText: { color: '#64748b', fontSize: 13, fontWeight: '500' },
  ongletTextActive: { color: '#fff', fontWeight: '600' },
  list: { padding: 16 },
  empty: { textAlign: 'center', color: '#94a3b8', marginTop: 40, fontSize: 15 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 0.5, borderColor: '#e2e8f0', elevation: 1 },
  cardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#4f46e5', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: '600', color: '#1e293b', marginBottom: 2 },
  email: { fontSize: 13, color: '#64748b', marginBottom: 6 },
  roleBadge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3, alignSelf: 'flex-start', borderWidth: 0.5 },
  roleText: { fontSize: 12, fontWeight: '600' },
  actions: { flexDirection: 'row', gap: 10 },
  validerBtn: { flex: 1, backgroundColor: '#059669', borderRadius: 8, padding: 12, alignItems: 'center' },
  validerText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  refuserBtn: { flex: 1, backgroundColor: '#dc2626', borderRadius: 8, padding: 12, alignItems: 'center' },
  refuserText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  activeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  activeBadge: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  activeText: { color: '#059669', fontSize: 13, fontWeight: '500' },
  deactivateBtn: { backgroundColor: '#fef2f2', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 0.5, borderColor: '#fecaca' },
  deactivateText: { color: '#dc2626', fontSize: 12, fontWeight: '600' },
  messageBanner: { marginTop: 10, borderRadius: 8, padding: 12, borderWidth: 0.5 },
  msgSuccess: { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' },
  msgError: { backgroundColor: '#fef2f2', borderColor: '#fecaca' },
  msgText: { fontSize: 13, fontWeight: '500' },
})