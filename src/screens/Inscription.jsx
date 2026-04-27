import React, { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, ScrollView, Image
} from 'react-native'
import api from '../services/api'

const roles = [
  { key: 'medecin', label: 'Médecin', desc: 'Consultation, visites, prédictions IA', icon: '👨‍⚕️' },
  { key: 'radiologue', label: 'Radiologue', desc: 'Upload et analyse des IRM', icon: '🔬' },
  { key: 'laborantin', label: 'Laboratoire', desc: 'Résultats biologiques', icon: '🧪' },
  { key: 'patient', label: 'Patient', desc: 'Suivi de votre maladie et rapports', icon: '❤️' },
]

export default function Inscription({ navigation }) {
  const [nom, setNom] = useState('')
  const [prenom, setPrenom] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('medecin')
  const [loading, setLoading] = useState(false)

  const handleInscription = async () => {
    if (!nom || !prenom || !email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs')
      return
    }
    setLoading(true)
    try {
      await api.post('/auth/inscription', {
        nom,
        prenom,
        email,
        mot_de_passe: password,
        role
      })
      Alert.alert(
        'Demande envoyée !',
        'Votre demande a été envoyée. Un administrateur validera votre compte.',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      )
    } catch (error) {
      Alert.alert('Erreur', error.response?.data?.detail || 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* LOGO */}
      <View style={styles.logoRow}>
        <Image source={require('../../assets/images/logo_sep.jpeg')} style={styles.logoImg} />
        <Text style={styles.logoText}>
          <Text style={styles.logoNeuro}>Neuro </Text>
          <Text style={styles.logoPredict}>Predict MS</Text>
        </Text>
      </View>

      {/* FORM */}
      <View style={styles.form}>
        <Text style={styles.title}>Créer un compte</Text>
        <Text style={styles.subtitle}>Rejoignez la plateforme médicale SEP</Text>

        {/* Nom + Prénom */}
        <View style={styles.row}>
          <View style={styles.halfField}>
            <Text style={styles.label}>Nom *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ben Salem"
              placeholderTextColor="#94a3b8"
              value={nom}
              onChangeText={setNom}
            />
          </View>
          <View style={styles.halfField}>
            <Text style={styles.label}>Prénom *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ahmed"
              placeholderTextColor="#94a3b8"
              value={prenom}
              onChangeText={setPrenom}
            />
          </View>
        </View>

        <Text style={styles.label}>Email professionnel *</Text>
        <TextInput
          style={styles.input}
          placeholder="admin@sep.com"
          placeholderTextColor="#94a3b8"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Mot de passe *</Text>
        <TextInput
          style={styles.input}
          placeholder="••••••••"
          placeholderTextColor="#94a3b8"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <Text style={styles.label}>Votre rôle *</Text>
        {roles.map(r => (
          <TouchableOpacity
            key={r.key}
            style={[styles.roleCard, role === r.key && styles.roleCardActive]}
            onPress={() => setRole(r.key)}
          >
            <Text style={styles.roleIcon}>{r.icon}</Text>
            <View style={styles.roleText}>
              <Text style={[styles.roleLabel, role === r.key && styles.roleLabelActive]}>{r.label}</Text>
              <Text style={styles.roleDesc}>{r.desc}</Text>
            </View>
            {role === r.key && <Text style={styles.roleCheck}>✓</Text>}
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={styles.button} onPress={handleInscription} disabled={loading}>
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.buttonText}>Envoyer la demande →</Text>
          }
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Déjà un compte ? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.footerLink}>Se connecter</Text>
          </TouchableOpacity>
        </View>
      </View>

    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fc' },
  content: { paddingBottom: 40 },
  logoRow: { flexDirection: 'row', alignItems: 'center', padding: 24, paddingTop: 60, gap: 10 },
  logoImg: { width: 32, height: 32, borderRadius: 6 },
  logoText: { fontSize: 18, fontWeight: 'bold' },
  logoNeuro: { color: '#1e293b' },
  logoPredict: { color: '#4f46e5' },
  form: { backgroundColor: '#fff', margin: 16, borderRadius: 16, padding: 24, elevation: 2 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1e293b', marginBottom: 4 },
  subtitle: { fontSize: 13, color: '#64748b', marginBottom: 24 },
  row: { flexDirection: 'row', gap: 12 },
  halfField: { flex: 1 },
  label: { fontSize: 13, fontWeight: '500', color: '#374151', marginBottom: 6 },
  input: { backgroundColor: '#f1f5f9', borderRadius: 10, padding: 14, marginBottom: 16, color: '#1e293b', fontSize: 14, borderWidth: 0.5, borderColor: '#e2e8f0' },
  roleCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8f9fc', borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#e2e8f0' },
  roleCardActive: { backgroundColor: '#eef2ff', borderColor: '#4f46e5' },
  roleIcon: { fontSize: 20, marginRight: 12 },
  roleText: { flex: 1 },
  roleLabel: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 2 },
  roleLabelActive: { color: '#4f46e5' },
  roleDesc: { fontSize: 12, color: '#94a3b8' },
  roleCheck: { fontSize: 16, color: '#4f46e5', fontWeight: 'bold' },
  button: { backgroundColor: '#4f46e5', borderRadius: 10, padding: 16, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 16 },
  footerText: { color: '#64748b', fontSize: 14 },
  footerLink: { color: '#4f46e5', fontSize: 14, fontWeight: '600' },
})