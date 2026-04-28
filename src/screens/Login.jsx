import React, { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, ScrollView, Image
} from 'react-native'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

export default function Login({ navigation }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()

const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs')
      return
    }
    setLoading(true)
    try {
      const response = await api.post('/auth/login', {
        email: email,
        mot_de_passe: password
      })
      await login(response.data.user, response.data.access_token)
    } catch (error) {
      if (!error.response) {
        // Network error (timeout, no connection, wrong IP)
        Alert.alert(
          '🌐 Erreur de connexion',
          'Impossible de joindre le serveur. Vérifiez que le backend est démarré et que vous êtes sur le même réseau.',
          [{ text: 'OK' }]
        )
      } else {
        const message = error.response?.data?.detail
        if (message?.includes('pas encore validé') || message?.includes('attente') || message?.includes('actif')) {
          Alert.alert(
            '⏳ Compte en attente',
            'Votre compte est en attente de validation par l\'administrateur. Vous recevrez une confirmation une fois votre compte activé.',
            [{ text: 'OK' }]
          )
        } else {
          Alert.alert('Erreur', 'Email ou mot de passe incorrect')
        }
      }
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

      {/* ILLUSTRATION */}
      <View style={styles.illustration}>
        <View style={styles.illustrationCircle}>
          <View style={styles.brainBox}>
            <Text style={styles.brainEmoji}>🧠</Text>
          </View>
          <View style={[styles.floatBox, { top: 10, right: 20, backgroundColor: '#fef3c7' }]}>
            <Text style={{ fontSize: 16 }}>✨</Text>
          </View>
          <View style={[styles.floatBox, { bottom: 20, left: 10, backgroundColor: '#dcfce7' }]}>
            <Text style={{ fontSize: 16 }}>📈</Text>
          </View>
          <View style={[styles.floatBox, { bottom: 10, right: 30, backgroundColor: '#ede9fe' }]}>
            <Text style={{ fontSize: 16 }}>🛡️</Text>
          </View>
        </View>
        <Text style={styles.illustrationTitle}>Intelligence Artificielle</Text>
        <Text style={styles.illustrationSubtitle}>pour la Neurologie</Text>
        <Text style={styles.illustrationDesc}>Classification SEP • Prédiction de lésions • Chat IA médical</Text>
        <View style={styles.tagsRow}>
          <View style={[styles.tag, { borderColor: '#4f46e5' }]}>
            <Text style={[styles.tagText, { color: '#4f46e5' }]}>Classification IA</Text>
          </View>
          <View style={[styles.tag, { borderColor: '#0891b2' }]}>
            <Text style={[styles.tagText, { color: '#0891b2' }]}>Segmentation IA</Text>
          </View>
          <View style={[styles.tag, { borderColor: '#7c3aed' }]}>
            <Text style={[styles.tagText, { color: '#7c3aed' }]}>Assistant IA SEP</Text>
          </View>
        </View>
      </View>

      {/* FORM */}
      <View style={styles.form}>
        <Text style={styles.welcome}>Bienvenue 👋</Text>
        <Text style={styles.subtitle}>Connectez-vous à votre espace médical</Text>

        <Text style={styles.label}>Email professionnel</Text>
        <TextInput
          style={styles.input}
          placeholder="admin@sep.com"
          placeholderTextColor="#94a3b8"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Mot de passe</Text>
        <TextInput
          style={styles.input}
          placeholder="••••••••"
          placeholderTextColor="#94a3b8"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.buttonText}>Se connecter →</Text>
          }
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Pas encore de compte ? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Inscription')}>
            <Text style={styles.footerLink}>S'inscrire</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.navigate('Home')}>
          <Text style={styles.backText}>← Retour à l'accueil</Text>
        </TouchableOpacity>
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
  illustration: { alignItems: 'center', paddingVertical: 24, backgroundColor: 'linear-gradient(135deg, #eef2ff, #f0f9ff)', paddingHorizontal: 24 },
  illustrationCircle: { width: 180, height: 180, borderRadius: 90, backgroundColor: '#eef2ff', justifyContent: 'center', alignItems: 'center', marginBottom: 16, position: 'relative' },
  brainBox: { width: 70, height: 70, borderRadius: 16, backgroundColor: '#4f46e5', justifyContent: 'center', alignItems: 'center' },
  brainEmoji: { fontSize: 32 },
  floatBox: { position: 'absolute', width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  illustrationTitle: { fontSize: 20, fontWeight: 'bold', color: '#1e293b', textAlign: 'center' },
  illustrationSubtitle: { fontSize: 20, fontWeight: 'bold', color: '#4f46e5', textAlign: 'center', marginBottom: 8 },
  illustrationDesc: { fontSize: 13, color: '#64748b', textAlign: 'center', marginBottom: 16 },
  tagsRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'center' },
  tag: { borderWidth: 1, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  tagText: { fontSize: 12, fontWeight: '500' },
  form: { backgroundColor: '#fff', margin: 16, borderRadius: 16, padding: 24, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  welcome: { fontSize: 24, fontWeight: 'bold', color: '#1e293b', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#64748b', marginBottom: 24 },
  label: { fontSize: 13, fontWeight: '500', color: '#374151', marginBottom: 6 },
  input: { backgroundColor: '#f1f5f9', borderRadius: 10, padding: 14, marginBottom: 16, color: '#1e293b', fontSize: 15, borderWidth: 0.5, borderColor: '#e2e8f0' },
  button: { backgroundColor: '#4f46e5', borderRadius: 10, padding: 16, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 16 },
  footerText: { color: '#64748b', fontSize: 14 },
  footerLink: { color: '#4f46e5', fontSize: 14, fontWeight: '600' },
  backBtn: { alignItems: 'center', marginTop: 12 },
  backText: { color: '#94a3b8', fontSize: 13 },
})