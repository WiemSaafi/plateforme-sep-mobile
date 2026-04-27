import React, { useEffect, useState } from 'react'
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator, Alert
} from 'react-native'
import api from '../../services/api'

export default function AdminValidations({ navigation }) {
  const [validations, setValidations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchValidations() }, [])

  const fetchValidations = async () => {
    try {
      const res = await api.get('/admin/utilisateurs')
      setValidations(res.data.filter(u => u.statut === 'en_attente' || (!u.est_actif && u.role !== 'admin')))
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const getId = (u) => u.id || u._id

  const handleValider = async (id) => {
    try {
      await api.put(`/admin/utilisateurs/${id}/valider`)
      Alert.alert('✅ Succès', 'Compte activé avec succès')
      fetchValidations()
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
            fetchValidations()
          } catch (err) {
            Alert.alert('Erreur', err.response?.data?.detail || 'Impossible de refuser')
          }
        }
      }
    ])
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Retour</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Validations en attente</Text>
        <Text style={styles.subtitle}>Comptes en attente d'activation</Text>
      </View>

      {loading ? (
        <ActivityIndicator color="#4f46e5" size="large" style={{ marginTop: 40 }} />
      ) : (
        <ScrollView style={styles.list}>
          {validations.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>✅</Text>
              <Text style={styles.emptyTitle}>Aucune validation en attente</Text>
              <Text style={styles.emptyDesc}>Tous les comptes ont été traités</Text>
            </View>
          ) : (
            validations.map((u, index) => (
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
                    <View style={styles.roleBadge}>
                      <Text style={styles.roleText}>{u.role}</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.actions}>
                  <TouchableOpacity style={styles.validerBtn} onPress={() => handleValider(getId(u))}>
                    <Text style={styles.validerText}>✓ Valider</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.refuserBtn} onPress={() => handleRefuser(getId(u))}>
                    <Text style={styles.refuserText}>✕ Refuser</Text>
                  </TouchableOpacity>
                </View>
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
  list: { padding: 16 },
  empty: { alignItems: 'center', padding: 40 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: '#1e293b', marginBottom: 4 },
  emptyDesc: { fontSize: 13, color: '#64748b' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 0.5, borderColor: '#e2e8f0', elevation: 1 },
  cardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#4f46e5', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: '600', color: '#1e293b', marginBottom: 2 },
  email: { fontSize: 13, color: '#64748b', marginBottom: 6 },
  roleBadge: { backgroundColor: '#eef2ff', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3, alignSelf: 'flex-start', borderWidth: 0.5, borderColor: '#c7d2fe' },
  roleText: { fontSize: 12, fontWeight: '600', color: '#4f46e5' },
  actions: { flexDirection: 'row', gap: 10 },
  validerBtn: { flex: 1, backgroundColor: '#059669', borderRadius: 8, padding: 12, alignItems: 'center' },
  validerText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  refuserBtn: { flex: 1, backgroundColor: '#dc2626', borderRadius: 8, padding: 12, alignItems: 'center' },
  refuserText: { color: '#fff', fontWeight: '600', fontSize: 14 },
})