import React, { useState, useEffect } from 'react'
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, TextInput, Alert, ActivityIndicator
} from 'react-native'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

const QUALITES = ['Bonne', 'Moyenne', 'Mauvaise']
const LOCALISATIONS = ['Périventriculaire', 'Sous-cortical', 'Cortical', 'Infratentoriel', 'Médullaire', 'Corpus callosum']
const CONCLUSIONS = [
  'Pas de nouvelles lésions détectées',
  'Lésions stables par rapport à l\'examen précédent',
  'Nouvelles lésions en hypersignal FLAIR détectées',
  'Lésions prenant le contraste — activité inflammatoire',
  'Atrophie cérébrale progressive',
  'Lésions médullaires associées',
]

export default function RapportDetail({ route, navigation }) {
  const { user } = useAuth()
  const irm = route.params?.irm || {}
  const isRadiologue = user?.role === 'radiologue'

  const [qualite, setQualite] = useState(irm.rapport?.qualite_image || '')
  const [nouvLesions, setNouvLesions] = useState(irm.rapport?.nouvelles_lesions || null)
  const [localisations, setLocalisations] = useState(irm.rapport?.localisation || [])
  const [contraste, setContraste] = useState(irm.rapport?.prise_contraste || null)
  const [conclusion, setConclusion] = useState(irm.rapport?.conclusion || '')
  const [conclusionCustom, setConclusionCustom] = useState(irm.rapport?.conclusion_custom || '')
  const [recommandations, setRecommandations] = useState(irm.rapport?.recommandations || '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(!!irm.rapport)
  const [medecins, setMedecins] = useState([])
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (isRadiologue) {
      api.get('/medecins/').then(res => {
        setMedecins(Array.isArray(res.data) ? res.data : [])
      }).catch(() => {})
    }
  }, [])

  const toggleLocalisation = (loc) => {
    setLocalisations(prev => prev.includes(loc) ? prev.filter(l => l !== loc) : [...prev, loc])
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const rapport = {
        qualite_image: qualite,
        nouvelles_lesions: nouvLesions,
        localisation: localisations,
        prise_contraste: contraste,
        conclusion: conclusion || conclusionCustom,
        conclusion_custom: conclusionCustom,
        recommandations,
      }
      await api.post(`/patients/${irm.patient_id}/irm/${irm.id}/rapport`, rapport)
      setSaved(true)
      Alert.alert('✅ Succès', 'Rapport sauvegardé !')
    } catch (err) {
      let msg = err.response?.data?.detail || 'Erreur lors de la sauvegarde'
      if (typeof msg !== 'string') msg = JSON.stringify(msg)
      Alert.alert('Erreur', msg)
    } finally {
      setSaving(false)
    }
  }

  const handleEnvoyer = async (medecinId) => {
    setSending(true)
    try {
      await api.post(`/patients/${irm.patient_id}/irm/${irm.id}/envoyer`, { medecin_id: medecinId })
      Alert.alert('✅ Envoyé', 'Rapport envoyé au médecin !')
    } catch (err) {
      let msg = err.response?.data?.detail || 'Erreur'
      if (typeof msg !== 'string') msg = JSON.stringify(msg)
      Alert.alert('Erreur', msg)
    } finally {
      setSending(false)
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
        <Text style={s.title}>Rapport radiologique</Text>
        <Text style={s.subtitle}>{irm.patient_nom || 'Patient'} — {irm.sequence_type || 'FLAIR'}</Text>
      </View>

      <ScrollView style={s.content}>
        {saved && (
          <View style={s.savedBanner}>
            <Text style={s.savedText}>✅ Rapport sauvegardé !</Text>
          </View>
        )}

        {/* RAPPORT FORM / VIEW */}
        <View style={s.formCard}>
          {/* Qualité */}
          <Text style={s.sectionTitle}>Qualité de l'image</Text>
          <View style={s.optionsRow}>
            {QUALITES.map(q => (
              <TouchableOpacity key={q} style={[s.optionBtn, qualite === q && s.optionBtnActive]} onPress={() => isRadiologue && setQualite(q)} disabled={!isRadiologue}>
                <Text style={[s.optionText, qualite === q && s.optionTextActive]}>{q.toLowerCase()}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Nouvelles lésions */}
          <Text style={s.sectionTitle}>Nouvelles lésions détectées ?</Text>
          <View style={s.optionsRow}>
            <TouchableOpacity style={[s.optionBtn, nouvLesions === true && s.optionBtnActive]} onPress={() => isRadiologue && setNouvLesions(true)} disabled={!isRadiologue}>
              <Text style={[s.optionText, nouvLesions === true && s.optionTextActive]}>Oui</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.optionBtn, s.optionBtnDanger, nouvLesions === false && s.optionBtnDangerActive]} onPress={() => isRadiologue && setNouvLesions(false)} disabled={!isRadiologue}>
              <Text style={[s.optionText, nouvLesions === false && s.optionTextDangerActive]}>Non</Text>
            </TouchableOpacity>
          </View>

          {/* Localisation */}
          <Text style={s.sectionTitle}>Localisation des lésions</Text>
          <View style={s.optionsWrap}>
            {LOCALISATIONS.map(loc => (
              <TouchableOpacity key={loc} style={[s.optionBtn, localisations.includes(loc) && s.optionBtnActive]} onPress={() => isRadiologue && toggleLocalisation(loc)} disabled={!isRadiologue}>
                <Text style={[s.optionText, localisations.includes(loc) && s.optionTextActive]}>{loc}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Contraste */}
          <Text style={s.sectionTitle}>Prise de contraste (activité inflammatoire) ?</Text>
          <View style={s.optionsRow}>
            <TouchableOpacity style={[s.optionBtn, contraste === true && s.optionBtnActive]} onPress={() => isRadiologue && setContraste(true)} disabled={!isRadiologue}>
              <Text style={[s.optionText, contraste === true && s.optionTextActive]}>Oui — lésions actives</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.optionBtn, contraste === false && { backgroundColor: '#1e293b', borderColor: '#1e293b' }]} onPress={() => isRadiologue && setContraste(false)} disabled={!isRadiologue}>
              <Text style={[s.optionText, contraste === false && { color: '#fff' }]}>Non</Text>
            </TouchableOpacity>
          </View>

          {/* Conclusion */}
          <Text style={s.sectionTitle}>Conclusion</Text>
          {CONCLUSIONS.map(c => (
            <TouchableOpacity key={c} style={[s.conclusionBtn, conclusion === c && s.conclusionBtnActive]} onPress={() => { if (isRadiologue) { setConclusion(c); setConclusionCustom('') } }} disabled={!isRadiologue}>
              <Text style={[s.conclusionText, conclusion === c && s.conclusionTextActive]}>{c}</Text>
            </TouchableOpacity>
          ))}
          {isRadiologue && (
            <TextInput style={s.textArea} placeholder="Ou saisir une conclusion personnalisée..." value={conclusionCustom} onChangeText={(t) => { setConclusionCustom(t); setConclusion('') }} multiline placeholderTextColor="#94a3b8" editable={isRadiologue} />
          )}

          {/* Recommandations */}
          <Text style={s.sectionTitle}>Recommandations</Text>
          <TextInput style={s.textArea} placeholder="Recommandations pour le médecin traitant..." value={recommandations} onChangeText={setRecommandations} multiline placeholderTextColor="#94a3b8" editable={isRadiologue} />

          {/* Save button */}
          {isRadiologue && (
            <TouchableOpacity style={[s.saveBtn, saved && s.saveBtnDone]} onPress={handleSave} disabled={saving}>
              <Text style={s.saveBtnText}>{saving ? 'Sauvegarde...' : saved ? '📄 Rapport sauvegardé ✓' : '💾 Sauvegarder le rapport'}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Envoyer au médecin */}
        {isRadiologue && saved && (
          <View style={s.envoyerCard}>
            <Text style={s.envoyerTitle}>✨ Envoyer au médecin contracté</Text>
            {medecins.length === 0 ? (
              <Text style={s.envoyerEmpty}>Aucun médecin contracté. Demandez à l'administrateur d'établir une liaison.</Text>
            ) : (
              medecins.map(m => (
                <TouchableOpacity key={m.id} style={s.medecinBtn} onPress={() => handleEnvoyer(m.id)} disabled={sending}>
                  <Text style={s.medecinName}>👨‍⚕️ {m.prenom} {m.nom}</Text>
                  <Text style={s.envoyerBtnText}>{sending ? '...' : 'Envoyer →'}</Text>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}

        {/* View-only rapport for non-radiologue */}
        {!isRadiologue && irm.rapport && (
          <View style={s.readOnlyCard}>
            {irm.rapport.conclusion && (
              <View style={s.readRow}>
                <Text style={s.readLabel}>Conclusion:</Text>
                <Text style={s.readValue}>{irm.rapport.conclusion}</Text>
              </View>
            )}
            {irm.rapport.recommandations && (
              <View style={s.readRow}>
                <Text style={s.readLabel}>Recommandations:</Text>
                <Text style={s.readValue}>{irm.rapport.recommandations}</Text>
              </View>
            )}
            {irm.radiologue_nom && (
              <Text style={s.readInfo}>👨‍⚕️ Rédigé par: {irm.radiologue_nom}</Text>
            )}
            <Text style={s.readInfo}>📅 {formatDate(irm.uploaded_at)}</Text>
          </View>
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
  subtitle: { fontSize: 13, color: '#64748b', marginTop: 2 },
  content: { padding: 16 },

  savedBanner: { backgroundColor: '#f0fdf4', borderRadius: 10, padding: 12, marginBottom: 16, borderWidth: 0.5, borderColor: '#bbf7d0' },
  savedText: { color: '#059669', fontSize: 13, fontWeight: '600', textAlign: 'center' },

  formCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 0.5, borderColor: '#e2e8f0' },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: '#1e293b', marginBottom: 8, marginTop: 16 },
  optionsRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  optionsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  optionBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, backgroundColor: '#f8f9fc', borderWidth: 1, borderColor: '#e2e8f0' },
  optionBtnActive: { backgroundColor: '#4f46e5', borderColor: '#4f46e5' },
  optionBtnDanger: { borderColor: '#e2e8f0' },
  optionBtnDangerActive: { backgroundColor: '#dc2626', borderColor: '#dc2626' },
  optionText: { fontSize: 13, color: '#374151', fontWeight: '500' },
  optionTextActive: { color: '#fff' },
  optionTextDangerActive: { color: '#fff' },

  conclusionBtn: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8, backgroundColor: '#f8f9fc', borderWidth: 0.5, borderColor: '#e2e8f0', marginBottom: 6 },
  conclusionBtnActive: { backgroundColor: '#eef2ff', borderColor: '#4f46e5' },
  conclusionText: { fontSize: 13, color: '#374151' },
  conclusionTextActive: { color: '#4f46e5', fontWeight: '600' },

  textArea: { backgroundColor: '#f8f9fc', borderRadius: 8, padding: 12, fontSize: 13, color: '#1e293b', borderWidth: 0.5, borderColor: '#e2e8f0', height: 80, textAlignVertical: 'top', marginTop: 8 },

  saveBtn: { backgroundColor: '#4f46e5', borderRadius: 10, padding: 16, alignItems: 'center', marginTop: 20 },
  saveBtnDone: { backgroundColor: '#059669' },
  saveBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },

  envoyerCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 0.5, borderColor: '#e2e8f0' },
  envoyerTitle: { fontSize: 15, fontWeight: '600', color: '#1e293b', marginBottom: 8 },
  envoyerEmpty: { fontSize: 13, color: '#94a3b8' },
  medecinBtn: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8f9fc', borderRadius: 8, padding: 12, marginBottom: 8, borderWidth: 0.5, borderColor: '#e2e8f0' },
  medecinName: { fontSize: 13, color: '#1e293b', fontWeight: '500' },
  envoyerBtnText: { fontSize: 13, color: '#4f46e5', fontWeight: '600' },

  readOnlyCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 0.5, borderColor: '#e2e8f0' },
  readRow: { marginBottom: 12 },
  readLabel: { fontSize: 12, fontWeight: '600', color: '#64748b', marginBottom: 4 },
  readValue: { fontSize: 14, color: '#1e293b' },
  readInfo: { fontSize: 12, color: '#94a3b8', marginTop: 4 },
})
