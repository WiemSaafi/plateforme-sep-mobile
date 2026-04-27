import React, { useState, useRef, useEffect } from 'react'
import {
  View, Text, StyleSheet, ScrollView,
  TextInput, TouchableOpacity, KeyboardAvoidingView, Platform,
  ActivityIndicator
} from 'react-native'
import api from '../services/api'

const SUGGESTIONS = [
  'Que signifie un EDSS de 3.5 ?',
  'Quels sont les DMT de 1ère ligne pour la SEP ?',
  'Comment interpréter des lésions T2 périventriculaires ?',
  'Quelle surveillance pour un patient sous natalizumab ?',
]

export default function ChatIA({ navigation }) {
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([])
  const [patients, setPatients] = useState([])
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [showPatientPicker, setShowPatientPicker] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const scrollRef = useRef()

  useEffect(() => {
    api.get('/patients/').then(res => {
      setPatients(res.data.data || [])
    }).catch(() => {})
  }, [])

  const sendMessage = async (text) => {
    const msg = text || message.trim()
    if (!msg) return

    const userMsg = { id: Date.now(), role: 'user', content: msg }
    setMessages(prev => [...prev, userMsg])
    setMessage('')
    setIsTyping(true)
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100)

    try {
      const historique = messages.map(m => ({ role: m.role, content: m.content }))
      const res = await api.post('/chat/message', {
        message: msg,
        patient_id: selectedPatient?.id || null,
        historique,
      })
      const aiMsg = { id: Date.now() + 1, role: 'assistant', content: res.data.reponse }
      setMessages(prev => [...prev, aiMsg])
    } catch (err) {
      let errMsg = err.response?.data?.detail || 'Erreur de connexion au serveur IA'
      if (typeof errMsg !== 'string') errMsg = JSON.stringify(errMsg)
      const aiMsg = { id: Date.now() + 1, role: 'assistant', content: `⚠️ ${errMsg}` }
      setMessages(prev => [...prev, aiMsg])
    } finally {
      setIsTyping(false)
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 200)
    }
  }

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      {/* HEADER */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.back}>← Retour</Text>
        </TouchableOpacity>
        <View style={s.headerInfo}>
          <View style={s.headerIcon}><Text style={{ fontSize: 20 }}>🧠</Text></View>
          <View>
            <Text style={s.headerTitle}>Assistant IA SEP</Text>
            <Text style={s.headerSub}>Spécialisé en neurologie — Sclérose En Plaques</Text>
          </View>
        </View>

        {/* Patient selector */}
        <TouchableOpacity style={s.patientSelector} onPress={() => setShowPatientPicker(!showPatientPicker)}>
          <Text style={s.patientSelectorLabel}>Patient (optionnel) :</Text>
          <Text style={s.patientSelectorValue}>
            {selectedPatient ? `${selectedPatient.prenom} ${selectedPatient.nom}` : '— Aucun patient —'}
          </Text>
          <Text style={s.pickerArrow}>▼</Text>
        </TouchableOpacity>

        {showPatientPicker && (
          <View style={s.pickerMenu}>
            <TouchableOpacity style={[s.pickerItem, !selectedPatient && s.pickerItemActive]} onPress={() => { setSelectedPatient(null); setShowPatientPicker(false) }}>
              <Text style={[s.pickerText, !selectedPatient && s.pickerTextActive]}>— Aucun patient —</Text>
            </TouchableOpacity>
            {patients.map(p => (
              <TouchableOpacity key={p.id} style={[s.pickerItem, selectedPatient?.id === p.id && s.pickerItemActive]} onPress={() => { setSelectedPatient(p); setShowPatientPicker(false) }}>
                <Text style={[s.pickerText, selectedPatient?.id === p.id && s.pickerTextActive]}>{p.prenom} {p.nom}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* MESSAGES */}
      <ScrollView ref={scrollRef} style={s.messages} contentContainerStyle={{ padding: 16, paddingBottom: 20 }}>
        {messages.length === 0 && (
          <View style={s.welcome}>
            <View style={s.welcomeIcon}><Text style={{ fontSize: 36 }}>🧠</Text></View>
            <Text style={s.welcomeTitle}>Assistant IA — SEP</Text>
            <Text style={s.welcomeDesc}>
              Posez vos questions cliniques sur la Sclérose En Plaques.{'\n'}
              Sélectionnez un patient pour obtenir des réponses contextualisées.
            </Text>
            <View style={s.suggestionsWrap}>
              {SUGGESTIONS.map((q, i) => (
                <TouchableOpacity key={i} style={s.suggestBtn} onPress={() => sendMessage(q)}>
                  <Text style={s.suggestText}>{q}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={s.disclaimer}>L'IA est une aide à la décision clinique — ne remplace pas le jugement médical.</Text>
          </View>
        )}

        {messages.map(msg => (
          <View key={msg.id} style={[s.bubble, msg.role === 'user' ? s.bubbleUser : s.bubbleAI]}>
            {msg.role === 'assistant' && <Text style={s.aiLabel}>🧠 Assistant IA SEP</Text>}
            <Text style={[s.bubbleText, msg.role === 'user' ? s.textUser : s.textAI]}>{msg.content}</Text>
          </View>
        ))}

        {isTyping && (
          <View style={[s.bubble, s.bubbleAI]}>
            <Text style={s.aiLabel}>🧠 Assistant IA SEP</Text>
            <ActivityIndicator color="#4f46e5" size="small" />
            <Text style={s.typingText}>Analyse en cours...</Text>
          </View>
        )}
      </ScrollView>

      {/* INPUT */}
      <View style={s.inputRow}>
        <TextInput
          style={s.input}
          placeholder="Posez votre question sur la SEP..."
          placeholderTextColor="#94a3b8"
          value={message}
          onChangeText={setMessage}
          multiline
          onSubmitEditing={() => sendMessage()}
        />
        <TouchableOpacity style={[s.sendBtn, !message.trim() && { opacity: 0.5 }]} onPress={() => sendMessage()} disabled={isTyping || !message.trim()}>
          <Text style={s.sendText}>➤</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fc' },
  header: { padding: 16, paddingTop: 60, backgroundColor: '#fff', borderBottomWidth: 0.5, borderBottomColor: '#e2e8f0' },
  back: { color: '#4f46e5', fontSize: 15, marginBottom: 8 },
  headerInfo: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  headerIcon: { width: 42, height: 42, borderRadius: 10, backgroundColor: '#eef2ff', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 17, fontWeight: 'bold', color: '#1e293b' },
  headerSub: { fontSize: 12, color: '#64748b' },

  patientSelector: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8f9fc', borderRadius: 8, padding: 10, borderWidth: 0.5, borderColor: '#e2e8f0', gap: 6 },
  patientSelectorLabel: { fontSize: 12, color: '#64748b' },
  patientSelectorValue: { fontSize: 13, color: '#1e293b', fontWeight: '500', flex: 1 },
  pickerArrow: { fontSize: 10, color: '#94a3b8' },
  pickerMenu: { backgroundColor: '#fff', borderRadius: 8, marginTop: 4, borderWidth: 0.5, borderColor: '#e2e8f0', elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, zIndex: 50 },
  pickerItem: { paddingHorizontal: 14, paddingVertical: 10 },
  pickerItemActive: { backgroundColor: '#4f46e5' },
  pickerText: { fontSize: 13, color: '#374151' },
  pickerTextActive: { color: '#fff', fontWeight: '600' },

  messages: { flex: 1 },
  welcome: { alignItems: 'center', paddingTop: 30, paddingBottom: 20 },
  welcomeIcon: { width: 72, height: 72, borderRadius: 20, backgroundColor: '#eef2ff', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  welcomeTitle: { fontSize: 20, fontWeight: 'bold', color: '#1e293b', marginBottom: 8 },
  welcomeDesc: { fontSize: 13, color: '#64748b', textAlign: 'center', lineHeight: 20, marginBottom: 20, paddingHorizontal: 20 },
  suggestionsWrap: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, paddingHorizontal: 10, marginBottom: 20 },
  suggestBtn: { backgroundColor: '#fff', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: '#c7d2fe' },
  suggestText: { fontSize: 12, color: '#4f46e5', fontWeight: '500' },
  disclaimer: { fontSize: 11, color: '#94a3b8', textAlign: 'center', fontStyle: 'italic' },

  bubble: { maxWidth: '85%', borderRadius: 14, padding: 14, marginBottom: 10 },
  bubbleUser: { backgroundColor: '#4f46e5', alignSelf: 'flex-end' },
  bubbleAI: { backgroundColor: '#fff', alignSelf: 'flex-start', borderWidth: 0.5, borderColor: '#e2e8f0' },
  aiLabel: { fontSize: 11, color: '#4f46e5', marginBottom: 6, fontWeight: '600' },
  bubbleText: { fontSize: 14, lineHeight: 22 },
  textUser: { color: '#fff' },
  textAI: { color: '#1e293b' },
  typingText: { fontSize: 12, color: '#94a3b8', marginTop: 4 },

  inputRow: { flexDirection: 'row', padding: 12, borderTopWidth: 0.5, borderTopColor: '#e2e8f0', alignItems: 'flex-end', gap: 10, backgroundColor: '#fff' },
  input: { flex: 1, backgroundColor: '#f8f9fc', borderRadius: 12, padding: 14, color: '#1e293b', fontSize: 14, borderWidth: 0.5, borderColor: '#e2e8f0', maxHeight: 100 },
  sendBtn: { backgroundColor: '#4f46e5', borderRadius: 12, width: 46, height: 46, justifyContent: 'center', alignItems: 'center' },
  sendText: { color: '#fff', fontSize: 18 },
})