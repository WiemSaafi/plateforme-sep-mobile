import React, { useState } from 'react'
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, TextInput, Switch, Alert
} from 'react-native'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'

export default function AdminParametres({ navigation }) {
  const { user } = useAuth()
  const [onglet, setOnglet] = useState('profil')
  const [prenom, setPrenom] = useState(user?.prenom || '')
  const [nom, setNom] = useState(user?.nom || '')
  const [mdpActuel, setMdpActuel] = useState('')
  const [mdpNouveau, setMdpNouveau] = useState('')
  const [mdpConfirm, setMdpConfirm] = useState('')
  const [notifs, setNotifs] = useState({
    nouveau_compte: true,
    rapport_irm: true,
    analyse_bio: false,
    visite: true,
    validation: true,
  })
  const [modeMainenance, setModeMaintenance] = useState(false)
  const [validationAuto, setValidationAuto] = useState(false)

  const handleSaveProfil = async () => {
    try {
      await api.put('/auth/me', { prenom, nom })
      Alert.alert('✅ Succès', 'Profil mis à jour')
    } catch (err) {
      Alert.alert('Erreur', 'Impossible de mettre à jour')
    }
  }

  const handleSavePassword = async () => {
    if (mdpNouveau !== mdpConfirm) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas')
      return
    }
    if (mdpNouveau.length < 8) {
      Alert.alert('Erreur', 'Minimum 8 caractères')
      return
    }
    try {
      await api.put('/auth/change-password', {
        mot_de_passe_actuel: mdpActuel,
        nouveau_mot_de_passe: mdpNouveau
      })
      Alert.alert('✅ Succès', 'Mot de passe mis à jour')
      setMdpActuel('')
      setMdpNouveau('')
      setMdpConfirm('')
    } catch (err) {
      Alert.alert('Erreur', 'Mot de passe actuel incorrect')
    }
  }

  const onglets = [
    { key: 'profil', label: '👤 Profil' },
    { key: 'securite', label: '🔒 Sécurité' },
    { key: 'notifs', label: '🔔 Notifs' },
    { key: 'systeme', label: '⚙️ Système' },
  ]

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Retour</Text>
        </TouchableOpacity>
        <View style={styles.titleRow}>
          <View style={styles.titleIcon}><Text style={{ fontSize: 20 }}>⚙️</Text></View>
          <View>
            <Text style={styles.title}>Paramètres</Text>
            <Text style={styles.subtitle}>Configuration générale de la plateforme</Text>
          </View>
        </View>
      </View>

      {/* Onglets */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.onglets}>
        {onglets.map(o => (
          <TouchableOpacity
            key={o.key}
            style={[styles.onglet, onglet === o.key && styles.ongletActive]}
            onPress={() => setOnglet(o.key)}
          >
            <Text style={[styles.ongletText, onglet === o.key && styles.ongletTextActive]}>
              {o.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.content}>

        {/* PROFIL */}
        {onglet === 'profil' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>👤 Informations personnelles</Text>
            <Text style={styles.label}>Prénom</Text>
            <TextInput style={styles.input} value={prenom} onChangeText={setPrenom} />
            <Text style={styles.label}>Nom</Text>
            <TextInput style={styles.input} value={nom} onChangeText={setNom} />
            <Text style={styles.label}>Adresse e-mail</Text>
            <View style={styles.inputDisabled}>
              <Text style={styles.inputDisabledText}>{user?.email}</Text>
            </View>
            <Text style={styles.label}>Rôle</Text>
            <View style={styles.roleRow}>
              <Text style={styles.roleValue}>Admin</Text>
              <Text style={styles.roleNonModif}>Non modifiable</Text>
            </View>
            <View style={styles.btnRow}>
              <TouchableOpacity style={styles.btnSecondary} onPress={() => { setPrenom(user?.prenom); setNom(user?.nom) }}>
                <Text style={styles.btnSecondaryText}>Réinitialiser</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnPrimary} onPress={handleSaveProfil}>
                <Text style={styles.btnPrimaryText}>Enregistrer</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* SECURITE */}
        {onglet === 'securite' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔒 Changer le mot de passe</Text>
            <Text style={styles.label}>Mot de passe actuel</Text>
            <TextInput style={styles.input} value={mdpActuel} onChangeText={setMdpActuel} secureTextEntry placeholder="••••••••" placeholderTextColor="#94a3b8" />
            <Text style={styles.label}>Nouveau mot de passe</Text>
            <TextInput style={styles.input} value={mdpNouveau} onChangeText={setMdpNouveau} secureTextEntry placeholder="Min. 8 caractères" placeholderTextColor="#94a3b8" />
            <Text style={styles.label}>Confirmer le mot de passe</Text>
            <TextInput style={styles.input} value={mdpConfirm} onChangeText={setMdpConfirm} secureTextEntry placeholder="Retapez le mot de passe" placeholderTextColor="#94a3b8" />
            {mdpNouveau && mdpConfirm && mdpNouveau !== mdpConfirm && (
              <View style={styles.mismatchBanner}>
                <Text style={styles.mismatchText}>⚠️ Les mots de passe ne correspondent pas</Text>
              </View>
            )}
            <View style={styles.exigences}>
              <Text style={styles.exigTitle}>Exigences du mot de passe :</Text>
              {[
                { label: 'Minimum 8 caractères', ok: mdpNouveau.length >= 8 },
                { label: 'Au moins une majuscule', ok: /[A-Z]/.test(mdpNouveau) },
                { label: 'Au moins un chiffre', ok: /[0-9]/.test(mdpNouveau) },
                { label: 'Au moins un caractère spécial', ok: /[^a-zA-Z0-9]/.test(mdpNouveau) },
              ].map((e, i) => (
                <Text key={i} style={[styles.exigItem, { color: e.ok ? '#059669' : '#94a3b8' }]}>✓ {e.label}</Text>
              ))}
            </View>
            <View style={styles.btnRow}>
              <TouchableOpacity style={styles.btnSecondary} onPress={() => { setMdpActuel(''); setMdpNouveau(''); setMdpConfirm('') }}>
                <Text style={styles.btnSecondaryText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnPrimary} onPress={handleSavePassword}>
                <Text style={styles.btnPrimaryText}>🔒 Mettre à jour</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* NOTIFICATIONS */}
        {onglet === 'notifs' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔔 Préférences de notification</Text>
            {[
              { key: 'nouveau_compte', label: 'Nouvel utilisateur inscrit', desc: 'Alerte quand un nouveau compte est créé' },
              { key: 'rapport_irm', label: 'Rapport IRM terminé', desc: 'Alerte quand un rapport IRM est finalisé' },
              { key: 'analyse_bio', label: 'Analyse biologique terminée', desc: "Alerte quand une analyse est complétée" },
              { key: 'visite', label: 'Nouvelle visite clinique', desc: "Alerte quand une visite est enregistrée" },
              { key: 'validation', label: 'Compte en attente de validation', desc: "Alerte quand un compte nécessite une approbation" },
            ].map(n => (
              <View key={n.key} style={styles.notifRow}>
                <View style={styles.notifInfo}>
                  <Text style={styles.notifLabel}>{n.label}</Text>
                  <Text style={styles.notifDesc}>{n.desc}</Text>
                </View>
                <Switch
                  value={notifs[n.key]}
                  onValueChange={v => setNotifs(prev => ({ ...prev, [n.key]: v }))}
                  trackColor={{ true: '#4f46e5' }}
                />
              </View>
            ))}
            <TouchableOpacity style={styles.btnPrimary}>
              <Text style={styles.btnPrimaryText}>Enregistrer</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* SYSTEME */}
        {onglet === 'systeme' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⚙️ Options avancées</Text>
            <View style={styles.notifRow}>
              <View style={styles.notifInfo}>
                <Text style={styles.notifLabel}>Mode maintenance</Text>
                <Text style={styles.notifDesc}>Désactive l'accès public à la plateforme</Text>
              </View>
              <Switch value={modeMainenance} onValueChange={setModeMaintenance} trackColor={{ true: '#4f46e5' }} />
            </View>
            {modeMainenance && (
              <View style={styles.maintenanceWarn}>
                <Text style={styles.maintenanceText}>
                  ⚠️ Le mode maintenance empêchera tous les utilisateurs (sauf admin) d'accéder à la plateforme.
                </Text>
              </View>
            )}
            <View style={styles.notifRow}>
              <View style={styles.notifInfo}>
                <Text style={styles.notifLabel}>Validation automatique</Text>
                <Text style={styles.notifDesc}>Activer les comptes sans validation manuelle</Text>
              </View>
              <Switch value={validationAuto} onValueChange={setValidationAuto} trackColor={{ true: '#4f46e5' }} />
            </View>

            <Text style={[styles.sectionTitle, { marginTop: 16 }]}>📊 Informations système</Text>
            {[
              { label: 'Version', value: 'v1.0.0' },
              { label: 'Backend', value: 'FastAPI 0.111' },
              { label: 'Base de données', value: 'MongoDB Atlas' },
              { label: 'Frontend', value: 'React Native + Expo' },
              { label: 'Environnement', value: 'Développement' },
              { label: 'Dernière MAJ', value: '26/04/2026' },
            ].map((s, i) => (
              <View key={i} style={styles.sysRow}>
                <Text style={styles.sysLabel}>{s.label}</Text>
                <Text style={styles.sysValue}>{s.value}</Text>
              </View>
            ))}
            <TouchableOpacity style={styles.btnPrimary}>
              <Text style={styles.btnPrimaryText}>Enregistrer tout</Text>
            </TouchableOpacity>
          </View>
        )}

      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fc' },
  header: { padding: 20, paddingTop: 60, backgroundColor: '#fff', borderBottomWidth: 0.5, borderBottomColor: '#e2e8f0' },
  back: { color: '#4f46e5', fontSize: 15, marginBottom: 12 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  titleIcon: { width: 44, height: 44, borderRadius: 10, backgroundColor: '#eef2ff', justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#1e293b' },
  subtitle: { fontSize: 13, color: '#64748b' },
  onglets: { backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 12, maxHeight: 60, borderBottomWidth: 0.5, borderBottomColor: '#e2e8f0' },
  onglet: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, marginRight: 8, backgroundColor: '#f1f5f9' },
  ongletActive: { backgroundColor: '#4f46e5' },
  ongletText: { color: '#64748b', fontSize: 13, fontWeight: '500' },
  ongletTextActive: { color: '#fff', fontWeight: '600' },
  content: { padding: 16 },
  section: { backgroundColor: '#fff', borderRadius: 12, padding: 16, borderWidth: 0.5, borderColor: '#e2e8f0' },
  sectionTitle: { fontSize: 15, fontWeight: '600', color: '#1e293b', marginBottom: 16, paddingBottom: 12, borderBottomWidth: 0.5, borderBottomColor: '#e2e8f0' },
  label: { fontSize: 13, fontWeight: '500', color: '#374151', marginBottom: 6 },
  input: { backgroundColor: '#f1f5f9', borderRadius: 8, padding: 12, marginBottom: 14, color: '#1e293b', fontSize: 14, borderWidth: 0.5, borderColor: '#e2e8f0' },
  inputDisabled: { backgroundColor: '#f8f9fc', borderRadius: 8, padding: 12, marginBottom: 14, borderWidth: 0.5, borderColor: '#e2e8f0' },
  inputDisabledText: { color: '#94a3b8', fontSize: 14 },
  roleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f1f5f9', borderRadius: 8, padding: 12, marginBottom: 20, borderWidth: 0.5, borderColor: '#e2e8f0' },
  roleValue: { fontSize: 14, color: '#1e293b', fontWeight: '500' },
  roleNonModif: { fontSize: 12, color: '#4f46e5' },
  btnRow: { flexDirection: 'row', gap: 10, marginTop: 8 },
  btnPrimary: { flex: 1, backgroundColor: '#4f46e5', borderRadius: 8, padding: 14, alignItems: 'center' },
  btnPrimaryText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  btnSecondary: { flex: 1, backgroundColor: '#f1f5f9', borderRadius: 8, padding: 14, alignItems: 'center', borderWidth: 0.5, borderColor: '#e2e8f0' },
  btnSecondaryText: { color: '#374151', fontWeight: '600', fontSize: 14 },
  exigences: { backgroundColor: '#f8f9fc', borderRadius: 8, padding: 12, marginBottom: 16, borderWidth: 0.5, borderColor: '#e2e8f0' },
  exigTitle: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 8 },
  exigItem: { fontSize: 12, color: '#64748b', marginBottom: 4 },
  notifRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: '#f1f5f9' },
  notifInfo: { flex: 1, marginRight: 12 },
  notifLabel: { fontSize: 14, fontWeight: '500', color: '#1e293b', marginBottom: 2 },
  notifDesc: { fontSize: 12, color: '#64748b' },
  sysRow: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#f8f9fc', borderRadius: 8, padding: 12, marginBottom: 8, borderWidth: 0.5, borderColor: '#e2e8f0' },
  sysLabel: { fontSize: 13, color: '#64748b' },
  sysValue: { fontSize: 13, fontWeight: '600', color: '#1e293b' },
  mismatchBanner: { backgroundColor: '#fef2f2', borderRadius: 8, padding: 10, marginBottom: 14, borderWidth: 0.5, borderColor: '#fecaca' },
  mismatchText: { color: '#991b1b', fontSize: 13, fontWeight: '500' },
  maintenanceWarn: { backgroundColor: '#fffbeb', borderRadius: 8, padding: 12, marginBottom: 8, borderWidth: 0.5, borderColor: '#fcd34d' },
  maintenanceText: { color: '#92400e', fontSize: 12, lineHeight: 18 },
})