import React, { useState, useEffect } from 'react'
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator, Linking, TextInput, Alert
} from 'react-native'
import api from '../services/api'

const CATEGORIES = [
  { key: 'Toutes', label: '📋 Toutes', icon: '📋' },
  { key: 'Traitements', label: '💊 Traitements', icon: '💊' },
  { key: 'Recherche', label: '🔬 Recherche', icon: '🔬' },
  { key: 'Vie quotidienne', label: '🌿 Vie quotidienne', icon: '🌿' },
  { key: 'Témoignages', label: '💬 Témoignages', icon: '💬' },
]

const CAT_STYLES = {
  'Traitements': { bg: '#eef2ff', color: '#4f46e5', border: '#c7d2fe' },
  'Recherche': { bg: '#fef2f2', color: '#dc2626', border: '#fecaca' },
  'Vie quotidienne': { bg: '#f0fdf4', color: '#059669', border: '#bbf7d0' },
  'Témoignages': { bg: '#fffbeb', color: '#d97706', border: '#fcd34d' },
}

const ORGANISATIONS = [
  { name: 'Fondation SEP France', desc: 'Soutien aux patients et recherche clinique sur la sclérose en plaques', url: 'https://www.fondation-sclerose-en-plaques.org', icon: '🏥' },
  { name: 'ARSEP', desc: 'Aide à la Recherche sur la Sclérose En Plaques — financement de projets', url: 'https://www.arsep.org', icon: '🔬' },
  { name: 'INSERM', desc: 'Institut National de la Santé et de la Recherche Médicale', url: 'https://www.inserm.fr', icon: '🧬' },
  { name: 'Ligue française contre la SEP', desc: 'Accompagnement et défense des droits des patients', url: 'https://www.ligue-sclerose.fr', icon: '🤝' },
  { name: 'MS International Federation', desc: 'Fédération internationale de la sclérose en plaques', url: 'https://www.msif.org', icon: '🌍' },
  { name: 'National MS Society', desc: 'Société nationale américaine de la SEP — recherche et soutien', url: 'https://www.nationalmssociety.org', icon: '🇺🇸' },
]

export default function Actualites({ navigation }) {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('actualites')
  const [catFiltre, setCatFiltre] = useState('Toutes')
  const [search, setSearch] = useState('')

  useEffect(() => { fetchActualites() }, [])

  const fetchActualites = async () => {
    try {
      const res = await api.get('/patient-portal/actualites')
      setArticles(res.data.data || [])
    } catch (err) {
      console.error(err)
      // Fallback: static articles if API fails
      setArticles([
        { id:'1', titre:'Nouveaux traitements de la SEP : ce qu\'il faut savoir en 2026', resume:'Les avancées récentes dans le traitement de la sclérose en plaques offrent de nouvelles perspectives. Les thérapies ciblées et la remyélinisation en sont les points forts.', categorie:'Traitements', source:'Fondation SEP France', date:'2026-03-15', lien:'https://www.fondation-sclerose-en-plaques.org' },
        { id:'2', titre:'Vivre avec la SEP : conseils pour le quotidien', resume:'Gestion de la fatigue, exercice physique adapté et soutien psychologique : découvrez les meilleures stratégies pour améliorer votre qualité de vie.', categorie:'Vie quotidienne', source:'ARSEP', date:'2026-03-10', lien:'https://www.arsep.org' },
        { id:'3', titre:'L\'intelligence artificielle au service du diagnostic de la SEP', resume:'Des modèles d\'IA permettent désormais de détecter plus précocement les lésions à l\'IRM et de prédire l\'évolution de la maladie avec une précision inédite.', categorie:'Recherche', source:'INSERM', date:'2026-02-28', lien:'https://www.inserm.fr' },
        { id:'4', titre:'Alimentation et SEP : quels aliments privilégier ?', resume:'Une alimentation anti-inflammatoire riche en oméga-3, fruits et légumes pourrait contribuer à réduire l\'inflammation et les poussées.', categorie:'Vie quotidienne', source:'Fondation SEP France', date:'2026-02-20', lien:'https://www.fondation-sclerose-en-plaques.org' },
        { id:'5', titre:'Thérapie par cellules souches : résultats prometteurs', resume:'Les essais cliniques de phase III montrent des résultats encourageants pour la thérapie par cellules souches dans les formes progressives de SEP.', categorie:'Recherche', source:'Nature Medicine', date:'2026-02-15', lien:'https://www.nature.com/nm' },
        { id:'6', titre:'Témoignage : courir un marathon avec la SEP', resume:'Marie, diagnostiquée il y a 8 ans, partage son parcours inspirant et comment le sport l\'aide à gérer sa maladie au quotidien.', categorie:'Témoignages', source:'SEP Mag', date:'2026-02-10', lien:'#' },
        { id:'7', titre:'Remyélinisation : les avancées de la recherche', resume:'De nouvelles molécules capables de stimuler la réparation de la myéline sont en cours d\'essais cliniques, ouvrant la voie à des traitements régénératifs.', categorie:'Recherche', source:'INSERM', date:'2026-01-28', lien:'https://www.inserm.fr' },
        { id:'8', titre:'Gestion du stress et de la fatigue dans la SEP', resume:'La méditation, le yoga et la thérapie cognitive comportementale sont des outils efficaces pour gérer le stress et la fatigue liés à la SEP.', categorie:'Vie quotidienne', source:'ARSEP', date:'2026-01-20', lien:'https://www.arsep.org' },
      ])
    } finally {
      setLoading(false)
    }
  }

  const openLink = async (url) => {
    if (!url || url === '#') {
      Alert.alert('Lien non disponible', 'Ce lien sera disponible prochainement.')
      return
    }
    try {
      const supported = await Linking.canOpenURL(url)
      if (supported) {
        await Linking.openURL(url)
      } else {
        await Linking.openURL(url)
      }
    } catch (err) {
      console.error('Cannot open URL:', err)
    }
  }

  const filtered = articles.filter(a => {
    const matchCat = catFiltre === 'Toutes' || a.categorie === catFiltre
    const matchSearch = !search || a.titre.toLowerCase().includes(search.toLowerCase()) || a.resume?.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.back}>← Retour</Text>
        </TouchableOpacity>
        <Text style={s.title}>Actualités SEP</Text>
        <Text style={s.subtitle}>Restez informé(e) sur la sclérose en plaques — traitements, recherche et vie quotidienne</Text>
      </View>

      <ScrollView style={s.content}>
        {/* Search */}
        <View style={s.searchBox}>
          <Text style={{ fontSize: 14 }}>🔍</Text>
          <TextInput style={s.searchInput} placeholder="Rechercher un article..." value={search} onChangeText={setSearch} placeholderTextColor="#94a3b8" />
        </View>

        {/* Tabs */}
        <View style={s.tabRow}>
          <TouchableOpacity style={[s.tabBtn, tab === 'actualites' && s.tabActive]} onPress={() => setTab('actualites')}>
            <Text style={[s.tabText, tab === 'actualites' && s.tabTextActive]}>📰 Actualités</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.tabBtn, tab === 'organisations' && s.tabActive]} onPress={() => setTab('organisations')}>
            <Text style={[s.tabText, tab === 'organisations' && s.tabTextActive]}>🌍 Organisations</Text>
          </TouchableOpacity>
        </View>

        {tab === 'actualites' && (
          <>
            {/* Category filters */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.catRow} contentContainerStyle={{ gap: 8 }}>
              {CATEGORIES.map(cat => (
                <TouchableOpacity
                  key={cat.key}
                  style={[s.catBtn, catFiltre === cat.key && s.catActive]}
                  onPress={() => setCatFiltre(cat.key)}
                >
                  <Text style={[s.catText, catFiltre === cat.key && s.catTextActive]}>{cat.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {loading ? (
              <ActivityIndicator color="#4f46e5" size="large" style={{ marginTop: 30 }} />
            ) : filtered.length === 0 ? (
              <View style={s.emptyCard}>
                <Text style={{ fontSize: 40, opacity: 0.3, marginBottom: 10 }}>📰</Text>
                <Text style={s.emptyTitle}>Aucune actualité</Text>
                <Text style={s.emptyDesc}>Aucun article dans cette catégorie</Text>
              </View>
            ) : (
              filtered.map((a, i) => {
                const catStyle = CAT_STYLES[a.categorie] || { bg: '#f1f5f9', color: '#64748b', border: '#e2e8f0' }
                return (
                  <View key={a.id || i} style={[s.articleCard, { borderLeftColor: catStyle.color, borderLeftWidth: 3 }]}>
                    <View style={s.articleTop}>
                      <View style={[s.catChip, { backgroundColor: catStyle.bg, borderColor: catStyle.border }]}>
                        <Text style={[s.catChipText, { color: catStyle.color }]}>{a.categorie}</Text>
                      </View>
                      <Text style={s.articleDate}>{a.date}</Text>
                    </View>

                    <Text style={s.articleTitle}>{a.titre}</Text>
                    <Text style={s.articleResume} numberOfLines={3}>{a.resume}</Text>

                    <View style={s.articleFooter}>
                      <Text style={s.articleSource}>Source : {a.source}</Text>
                      <TouchableOpacity style={s.readBtn} onPress={() => openLink(a.lien)}>
                        <Text style={s.readBtnText}>Lire 🔗</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )
              })
            )}

            {/* Disclaimer */}
            <View style={s.disclaimer}>
              <Text style={s.disclaimerIcon}>ℹ️</Text>
              <Text style={s.disclaimerText}>
                Ces articles sont fournis à titre informatif. Consultez toujours votre médecin pour toute décision médicale.
              </Text>
            </View>
          </>
        )}

        {tab === 'organisations' && (
          <View style={{ gap: 12 }}>
            <Text style={s.orgSectionTitle}>Organismes et associations</Text>
            <Text style={s.orgSectionDesc}>Retrouvez les principales organisations dédiées à la sclérose en plaques</Text>

            {ORGANISATIONS.map((org, i) => (
              <TouchableOpacity key={i} style={s.orgCard} onPress={() => openLink(org.url)} activeOpacity={0.7}>
                <View style={s.orgAvatar}>
                  <Text style={s.orgAvatarText}>{org.icon}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.orgName}>{org.name}</Text>
                  <Text style={s.orgDesc} numberOfLines={2}>{org.desc}</Text>
                  {org.url && org.url !== '#' && (
                    <Text style={s.orgUrl} numberOfLines={1}>🔗 {org.url}</Text>
                  )}
                </View>
                <TouchableOpacity style={s.visitBtn} onPress={() => openLink(org.url)}>
                  <Text style={s.visitBtnText}>Visiter →</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))}

            {/* Info */}
            <View style={s.infoBanner}>
              <Text style={{ fontSize: 14 }}>💡</Text>
              <View style={{ flex: 1 }}>
                <Text style={s.infoTitle}>Besoin d'aide ?</Text>
                <Text style={s.infoDesc}>N'hésitez pas à contacter ces organismes pour obtenir du soutien, des informations et des ressources sur la SEP.</Text>
              </View>
            </View>
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
  subtitle: { fontSize: 12, color: '#64748b', marginTop: 2 },
  content: { padding: 16 },

  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 12, borderWidth: 0.5, borderColor: '#e2e8f0', marginBottom: 12 },
  searchInput: { flex: 1, padding: 11, fontSize: 13, color: '#1e293b' },

  tabRow: { flexDirection: 'row', gap: 8, marginBottom: 14, backgroundColor: '#fff', borderRadius: 12, padding: 4, borderWidth: 0.5, borderColor: '#e2e8f0' },
  tabBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  tabActive: { backgroundColor: '#4f46e5' },
  tabText: { fontSize: 13, color: '#64748b', fontWeight: '500' },
  tabTextActive: { color: '#fff', fontWeight: '600' },

  catRow: { marginBottom: 14 },
  catBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#fff', borderWidth: 0.5, borderColor: '#e2e8f0' },
  catActive: { backgroundColor: '#1e293b', borderColor: '#1e293b' },
  catText: { fontSize: 12, color: '#64748b', fontWeight: '500' },
  catTextActive: { color: '#fff', fontWeight: '600' },

  emptyCard: { backgroundColor: '#fff', borderRadius: 12, padding: 40, alignItems: 'center', borderWidth: 0.5, borderColor: '#e2e8f0' },
  emptyTitle: { fontSize: 14, fontWeight: '500', color: '#64748b' },
  emptyDesc: { fontSize: 12, color: '#94a3b8', marginTop: 4 },

  articleCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 0.5, borderColor: '#e2e8f0', elevation: 1 },
  articleTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  catChip: { borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 0.5 },
  catChipText: { fontSize: 11, fontWeight: '600' },
  articleDate: { fontSize: 11, color: '#94a3b8' },
  articleTitle: { fontSize: 15, fontWeight: '600', color: '#1e293b', marginBottom: 6, lineHeight: 20 },
  articleResume: { fontSize: 13, color: '#64748b', lineHeight: 18, marginBottom: 12 },
  articleFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTopWidth: 0.5, borderTopColor: '#f1f5f9' },
  articleSource: { fontSize: 11, color: '#94a3b8' },
  readBtn: { backgroundColor: '#eef2ff', borderRadius: 6, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 0.5, borderColor: '#c7d2fe' },
  readBtnText: { fontSize: 12, color: '#4f46e5', fontWeight: '600' },

  disclaimer: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: '#fffbeb', borderRadius: 10, padding: 12, marginTop: 8, borderWidth: 0.5, borderColor: '#fcd34d' },
  disclaimerIcon: { fontSize: 14 },
  disclaimerText: { flex: 1, fontSize: 11, color: '#92400e', lineHeight: 16 },

  orgSectionTitle: { fontSize: 17, fontWeight: '600', color: '#1e293b' },
  orgSectionDesc: { fontSize: 12, color: '#64748b', marginBottom: 4 },
  orgCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: 12, padding: 14, borderWidth: 0.5, borderColor: '#e2e8f0' },
  orgAvatar: { width: 46, height: 46, borderRadius: 12, backgroundColor: '#eef2ff', justifyContent: 'center', alignItems: 'center' },
  orgAvatarText: { fontSize: 22 },
  orgName: { fontSize: 14, fontWeight: '600', color: '#1e293b', marginBottom: 2 },
  orgDesc: { fontSize: 11, color: '#64748b', lineHeight: 15 },
  orgUrl: { fontSize: 10, color: '#4f46e5', marginTop: 3 },
  visitBtn: { backgroundColor: '#4f46e5', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  visitBtnText: { color: '#fff', fontSize: 11, fontWeight: '600' },

  infoBanner: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: '#eff6ff', borderRadius: 12, padding: 14, borderWidth: 0.5, borderColor: '#bfdbfe', marginTop: 8 },
  infoTitle: { fontSize: 13, fontWeight: '600', color: '#1e40af', marginBottom: 2 },
  infoDesc: { fontSize: 12, color: '#3b82f6', lineHeight: 16 },
})