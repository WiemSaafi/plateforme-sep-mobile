import React, { useState, useEffect } from 'react'
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator, TextInput, Image
} from 'react-native'
import api from '../services/api'

export default function IRMQueue({ navigation }) {
  const [irms, setIrms] = useState([])
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtre, setFiltre] = useState('toutes')
  const [search, setSearch] = useState('')
  const [viewerData, setViewerData] = useState({})
  const [viewerLoading, setViewerLoading] = useState({})

  useEffect(() => { fetchAll() }, [])

  const fetchAll = async () => {
    try {
      const pRes = await api.get('/patients/')
      const pList = pRes.data.data || []
      setPatients(pList)

      const allIrms = []
      for (const p of pList) {
        try {
          const iRes = await api.get(`/patients/${p.id}/irm`)
          const iData = iRes.data.data || iRes.data || []
          const arr = Array.isArray(iData) ? iData : []
          arr.forEach(irm => {
            allIrms.push({
              ...irm,
              patient_nom: `${p.prenom} ${p.nom}`,
            })
          })
        } catch (e) {}
      }
      allIrms.sort((a, b) => {
        const da = a.uploaded_at || ''
        const db = b.uploaded_at || ''
        return String(db).localeCompare(String(da))
      })
      setIrms(allIrms)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const loadSlice = async (irm, coupeIdx) => {
    const key = irm.id
    setViewerLoading(prev => ({...prev, [key]: true}))
    try {
      const coupe = coupeIdx !== undefined ? coupeIdx : undefined
      const url = `/patients/${irm.patient_id}/irm/${irm.id}/coupe${coupe !== undefined ? `?coupe=${coupe}` : ''}`
      const res = await api.get(url)
      setViewerData(prev => ({
        ...prev,
        [key]: {
          image: res.data.image,
          coupe_actuelle: res.data.coupe_actuelle,
          nb_coupes: res.data.nb_coupes,
          visible: true,
        }
      }))
    } catch (e) {
      console.error(e)
      setViewerData(prev => ({...prev, [key]: { error: true, visible: true }}))
    } finally {
      setViewerLoading(prev => ({...prev, [key]: false}))
    }
  }

  const toggleViewer = (irm) => {
    const key = irm.id
    if (viewerData[key]?.visible) {
      setViewerData(prev => { const n = {...prev}; delete n[key]; return n })
    } else {
      loadSlice(irm)
    }
  }

  const changeSlice = (irm, delta) => {
    const key = irm.id
    const data = viewerData[key]
    if (!data) return
    const newCoupe = Math.max(0, Math.min(data.nb_coupes - 1, data.coupe_actuelle + delta))
    loadSlice(irm, newCoupe)
  }

  const totalIrm = irms.length
  const enAttente = irms.filter(i => i.statut === 'pending').length
  const analysees = irms.filter(i => i.statut === 'analysee').length

  const filtered = irms.filter(i => {
    const matchFiltre = filtre === 'toutes' ||
      (filtre === 'pending' && i.statut === 'pending') ||
      (filtre === 'analysee' && i.statut === 'analysee')
    const matchSearch = !search || i.patient_nom?.toLowerCase().includes(search.toLowerCase())
    return matchFiltre && matchSearch
  })

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
        <Text style={s.title}>File d'IRM</Text>
        <Text style={s.desc}>Images à analyser et rapports radiologiques</Text>
      </View>

      {loading ? (
        <ActivityIndicator color="#4f46e5" size="large" style={{ marginTop: 40 }} />
      ) : (
        <ScrollView style={s.content}>
          {/* STATS */}
          <View style={s.statsRow}>
            <View style={s.statCard}>
              <Text style={[s.statNum, { color: '#2563eb' }]}>{totalIrm}</Text>
              <Text style={s.statLabel}>Total IRM</Text>
            </View>
            <View style={s.statCard}>
              <Text style={[s.statNum, { color: '#d97706' }]}>{enAttente}</Text>
              <Text style={s.statLabel}>En attente</Text>
            </View>
            <View style={s.statCard}>
              <Text style={[s.statNum, { color: '#059669' }]}>{analysees}</Text>
              <Text style={s.statLabel}>Analysées</Text>
            </View>
          </View>

          {/* SEARCH + FILTERS */}
          <View style={s.filterRow}>
            <View style={s.searchBox}>
              <Text style={{ fontSize: 14 }}>🔍</Text>
              <TextInput style={s.searchInput} placeholder="Rechercher un patient..." value={search} onChangeText={setSearch} placeholderTextColor="#94a3b8" />
            </View>
          </View>
          <View style={s.filterBtns}>
            {[
              { key: 'toutes', label: 'Toutes' },
              { key: 'pending', label: '⏳ En attente' },
              { key: 'analysee', label: '✅ Analysées' },
            ].map(f => (
              <TouchableOpacity key={f.key} style={[s.filterBtn, filtre === f.key && s.filterBtnActive]} onPress={() => setFiltre(f.key)}>
                <Text style={[s.filterText, filtre === f.key && s.filterTextActive]}>{f.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* IRM LIST */}
          {filtered.length === 0 ? (
            <View style={s.emptyCard}>
              <Text style={s.emptyText}>Aucune IRM trouvée</Text>
            </View>
          ) : (
            filtered.map((irm, i) => (
              <View key={irm.id || i} style={s.irmCard}>
                {/* IRM INFO */}
                <View style={s.irmInfo}>
                  <View style={s.seqBadge}>
                    <Text style={s.seqText}>{irm.sequence_type || 'FLAIR'}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.irmPatient}>{irm.patient_nom}</Text>
                    <Text style={s.irmMeta}>{irm.metadata?.nb_slices || '—'} coupes • {irm.metadata?.taille_mb || '—'} MB</Text>
                    <Text style={s.irmDate}>Uploadé le {formatDate(irm.uploaded_at)}</Text>
                  </View>
                </View>

                {/* ACTION BUTTONS */}
                <View style={s.irmActions}>
                  <View style={[s.statutBadge, irm.statut === 'pending' ? s.statutPending : s.statutDone]}>
                    <Text style={[s.statutText, { color: irm.statut === 'pending' ? '#d97706' : '#059669' }]}>
                      {irm.statut === 'pending' ? '⏳ En attente' : '✅ Analysée'}
                    </Text>
                  </View>
                  <TouchableOpacity style={s.vizBtn} onPress={() => toggleViewer(irm)}>
                    <Text style={s.vizText}>{viewerData[irm.id]?.visible ? '🙈 Masquer' : '👁 Visualiser'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={s.predBtn} onPress={() => navigation.navigate('PatientDetail', { patientId: irm.patient_id })}>
                    <Text style={s.predText}>✨ Prédiction IA</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={s.rapBtn} onPress={() => navigation.navigate('RapportDetail', { irm })}>
                    <Text style={s.rapText}>📄 Voir rapport</Text>
                  </TouchableOpacity>
                </View>

                {/* IRM IMAGE VIEWER */}
                {viewerData[irm.id]?.visible && (
                  <View style={s.viewerBox}>
                    {viewerLoading[irm.id] ? (
                      <View style={s.viewerLoading}>
                        <ActivityIndicator color="#fff" size="large" />
                        <Text style={s.viewerLoadingText}>Chargement...</Text>
                      </View>
                    ) : viewerData[irm.id]?.error ? (
                      <Text style={s.viewerError}>❌ Impossible de charger l'image IRM</Text>
                    ) : (
                      <>
                        <Text style={s.viewerSliceLabel}>
                          Coupe {(viewerData[irm.id]?.coupe_actuelle || 0) + 1} / {viewerData[irm.id]?.nb_coupes || '?'}
                        </Text>
                        <Image
                          source={{ uri: viewerData[irm.id]?.image }}
                          style={s.viewerImage}
                          resizeMode="contain"
                        />
                        {/* SLIDER */}
                        <View style={s.sliderRow}>
                          <TouchableOpacity style={s.sliderBtn} onPress={() => changeSlice(irm, -1)}>
                            <Text style={s.sliderBtnText}>◀</Text>
                          </TouchableOpacity>
                          <View style={s.sliderTrack}>
                            <View style={[s.sliderFill, {
                              width: `${((viewerData[irm.id]?.coupe_actuelle || 0) / Math.max(1, (viewerData[irm.id]?.nb_coupes || 1) - 1)) * 100}%`
                            }]} />
                            <View style={[s.sliderThumb, {
                              left: `${((viewerData[irm.id]?.coupe_actuelle || 0) / Math.max(1, (viewerData[irm.id]?.nb_coupes || 1) - 1)) * 100}%`
                            }]} />
                          </View>
                          <TouchableOpacity style={s.sliderBtn} onPress={() => changeSlice(irm, 1)}>
                            <Text style={s.sliderBtnText}>▶</Text>
                          </TouchableOpacity>
                        </View>
                      </>
                    )}
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

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fc' },
  header: { padding: 20, paddingTop: 60, backgroundColor: '#fff', borderBottomWidth: 0.5, borderBottomColor: '#e2e8f0' },
  back: { color: '#4f46e5', fontSize: 15, marginBottom: 8 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1e293b' },
  desc: { fontSize: 13, color: '#64748b', marginTop: 2 },
  content: { padding: 16 },

  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statCard: { flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 14, alignItems: 'flex-start', borderWidth: 0.5, borderColor: '#e2e8f0' },
  statNum: { fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  statLabel: { fontSize: 12, color: '#64748b' },

  filterRow: { marginBottom: 8 },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 8, paddingHorizontal: 10, borderWidth: 0.5, borderColor: '#e2e8f0' },
  searchInput: { flex: 1, padding: 8, fontSize: 13, color: '#1e293b' },
  filterBtns: { flexDirection: 'row', gap: 8, marginBottom: 16, flexWrap: 'wrap' },
  filterBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, backgroundColor: '#fff', borderWidth: 0.5, borderColor: '#e2e8f0' },
  filterBtnActive: { backgroundColor: '#1e293b', borderColor: '#1e293b' },
  filterText: { fontSize: 12, color: '#64748b', fontWeight: '500' },
  filterTextActive: { color: '#fff', fontWeight: '600' },

  irmCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 0.5, borderColor: '#e2e8f0', elevation: 1 },
  irmInfo: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
  seqBadge: { backgroundColor: '#dc2626', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
  seqText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  irmPatient: { fontSize: 15, fontWeight: '600', color: '#1e293b', marginBottom: 2 },
  irmMeta: { fontSize: 12, color: '#64748b' },
  irmDate: { fontSize: 11, color: '#94a3b8', marginTop: 2 },
  irmActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  statutBadge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 0.5 },
  statutPending: { backgroundColor: '#fffbeb', borderColor: '#fcd34d' },
  statutDone: { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' },
  statutText: { fontSize: 12, fontWeight: '600' },
  vizBtn: { backgroundColor: '#eff6ff', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 0.5, borderColor: '#bfdbfe' },
  vizText: { fontSize: 12, color: '#2563eb', fontWeight: '600' },
  predBtn: { backgroundColor: '#1e293b', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  predText: { fontSize: 12, color: '#fff', fontWeight: '600' },
  rapBtn: { backgroundColor: '#f0fdf4', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 0.5, borderColor: '#bbf7d0' },
  rapText: { fontSize: 12, color: '#059669', fontWeight: '600' },

  // Viewer
  viewerBox: { marginTop: 12, backgroundColor: '#0f172a', borderRadius: 10, overflow: 'hidden' },
  viewerSliceLabel: { color: '#4ade80', fontSize: 12, fontWeight: '600', padding: 10, paddingBottom: 0 },
  viewerImage: { width: '100%', height: 280, backgroundColor: '#0f172a' },
  viewerLoading: { alignItems: 'center', padding: 40 },
  viewerLoadingText: { color: '#94a3b8', fontSize: 12, marginTop: 8 },
  viewerError: { color: '#f87171', fontSize: 13, padding: 20, textAlign: 'center' },
  sliderRow: { flexDirection: 'row', alignItems: 'center', padding: 10, gap: 8 },
  sliderBtn: { backgroundColor: '#1e293b', borderRadius: 6, width: 32, height: 32, justifyContent: 'center', alignItems: 'center', borderWidth: 0.5, borderColor: '#334155' },
  sliderBtnText: { color: '#fff', fontSize: 14 },
  sliderTrack: { flex: 1, height: 6, backgroundColor: '#1e293b', borderRadius: 3, position: 'relative' },
  sliderFill: { position: 'absolute', left: 0, top: 0, height: 6, backgroundColor: '#3b82f6', borderRadius: 3 },
  sliderThumb: { position: 'absolute', top: -5, width: 16, height: 16, borderRadius: 8, backgroundColor: '#3b82f6', borderWidth: 2, borderColor: '#fff', marginLeft: -8 },

  emptyCard: { backgroundColor: '#fff', borderRadius: 12, padding: 40, alignItems: 'center', borderWidth: 0.5, borderColor: '#e2e8f0' },
  emptyText: { fontSize: 14, color: '#94a3b8' },
})