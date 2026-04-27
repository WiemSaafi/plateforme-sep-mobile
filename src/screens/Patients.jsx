import React, { useState, useEffect, useCallback } from 'react'
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, TextInput, ActivityIndicator,
  RefreshControl, Alert
} from 'react-native'
import api from '../services/api'

export default function Patients({ navigation }) {
  const [search, setSearch] = useState('')
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [filtre, setFiltre] = useState('actifs')
  const [sexeFilter, setSexeFilter] = useState('tous')
  const [showSexeMenu, setShowSexeMenu] = useState(false)
  const [showNewForm, setShowNewForm] = useState(false)
  const [formNom, setFormNom] = useState('')
  const [formPrenom, setFormPrenom] = useState('')
  const [formDate, setFormDate] = useState('')
  const [formSexe, setFormSexe] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [formTel, setFormTel] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => { fetchPatients() }, [filtre])

  const fetchPatients = useCallback(async (manual = false) => {
    if (manual) setRefreshing(true)
    try {
      const endpoint = filtre === 'actifs' ? '/patients/' : '/patients/archived'
      const res = await api.get(endpoint)
      setPatients(res.data.data || [])
    } catch (err) {
      console.error(err)
      setPatients([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [filtre])

  const handleArchive = async (patient) => {
    Alert.alert(
      'Archiver le patient',
      `Voulez-vous archiver ${patient.prenom} ${patient.nom} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Archiver',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.put(`/patients/${patient.id}/archive`)
              fetchPatients()
            } catch (err) {
              Alert.alert('Erreur', 'Impossible d\'archiver ce patient')
            }
          }
        }
      ]
    )
  }

  const handleCreatePatient = async () => {
    if (!formNom || !formPrenom || !formDate) {
      Alert.alert('Erreur', 'Nom, Prénom et Date de naissance sont obligatoires')
      return
    }
    setSubmitting(true)
    try {
      await api.post('/patients/', {
        nom: formNom,
        prenom: formPrenom,
        date_naissance: formDate,
        sexe: formSexe === 'Masculin' ? 'M' : formSexe === 'Féminin' ? 'F' : null,
        contact: {
          email: formEmail || null,
          telephone: formTel || null,
        }
      })
      setShowNewForm(false)
      setFormNom(''); setFormPrenom(''); setFormDate(''); setFormSexe(''); setFormEmail(''); setFormTel('')
      fetchPatients()
    } catch (err) {
      let msg = err.response?.data?.detail || 'Impossible de créer le patient'
      if (typeof msg !== 'string') msg = JSON.stringify(msg)
      Alert.alert('Erreur', String(msg))
    } finally {
      setSubmitting(false)
    }
  }

  const filtered = patients.filter(p => {
    const nom = `${p.prenom} ${p.nom}`.toLowerCase()
    const matchSearch = nom.includes(search.toLowerCase())
    const matchSexe = sexeFilter === 'tous' || p.sexe === sexeFilter
    return matchSearch && matchSexe
  })

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Retour</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Patients</Text>
        <Text style={styles.subtitle}>
          {patients.length} patient{patients.length > 1 ? 's' : ''} {filtre === 'actifs' ? 'enregistré' : 'archivé'}{patients.length > 1 ? 's' : ''}
        </Text>
      </View>

      {/* TABS + Nouveau patient */}
      <View style={styles.tabsRow}>
        <View style={{ flexDirection: 'row', gap: 8, flex: 1 }}>
          <TouchableOpacity
            style={[styles.tab, filtre === 'actifs' && styles.tabActive]}
            onPress={() => { setFiltre('actifs'); setLoading(true) }}
          >
            <Text style={[styles.tabText, filtre === 'actifs' && styles.tabTextActive]}>Actifs</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, filtre === 'archives' && styles.tabActive]}
            onPress={() => { setFiltre('archives'); setLoading(true) }}
          >
            <Text style={[styles.tabText, filtre === 'archives' && styles.tabTextActive]}>Archivés</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.newPatientBtn} onPress={() => setShowNewForm(!showNewForm)}>
          <Text style={styles.newPatientText}>+ Nouveau patient</Text>
        </TouchableOpacity>
      </View>

      {/* FORMULAIRE NOUVEAU PATIENT */}
      {showNewForm && (
        <View style={styles.formCard}>
          <View style={styles.formHeader}>
            <Text style={styles.formTitle}>👤 Nouveau patient</Text>
            <Text style={styles.formDesc}>Remplissez les informations du patient</Text>
          </View>
          <View style={styles.formRow}>
            <View style={styles.formField}>
              <Text style={styles.formLabel}>Nom *</Text>
              <TextInput style={styles.formInput} placeholder="Nom du patient" value={formNom} onChangeText={setFormNom} placeholderTextColor="#94a3b8" />
            </View>
            <View style={styles.formField}>
              <Text style={styles.formLabel}>Prénom *</Text>
              <TextInput style={styles.formInput} placeholder="Prénom du patient" value={formPrenom} onChangeText={setFormPrenom} placeholderTextColor="#94a3b8" />
            </View>
          </View>
          <View style={styles.formRow}>
            <View style={styles.formField}>
              <Text style={styles.formLabel}>Date de naissance *</Text>
              <TextInput style={styles.formInput} placeholder="AAAA-MM-JJ" value={formDate} onChangeText={setFormDate} placeholderTextColor="#94a3b8" />
            </View>
            <View style={styles.formField}>
              <Text style={styles.formLabel}>Sexe</Text>
              <View style={styles.sexeRow}>
                {['Masculin', 'Féminin'].map(s => (
                  <TouchableOpacity key={s} style={[styles.sexeOption, formSexe === s && styles.sexeOptionActive]} onPress={() => setFormSexe(s)}>
                    <Text style={[styles.sexeOptionText, formSexe === s && styles.sexeOptionTextActive]}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
          <View style={styles.formRow}>
            <View style={styles.formField}>
              <Text style={styles.formLabel}>Email</Text>
              <TextInput style={styles.formInput} placeholder="email@exemple.com" value={formEmail} onChangeText={setFormEmail} keyboardType="email-address" placeholderTextColor="#94a3b8" />
            </View>
            <View style={styles.formField}>
              <Text style={styles.formLabel}>Téléphone</Text>
              <TextInput style={styles.formInput} placeholder="+216 XX XXX XXX" value={formTel} onChangeText={setFormTel} keyboardType="phone-pad" placeholderTextColor="#94a3b8" />
            </View>
          </View>
          <View style={styles.formActions}>
            <TouchableOpacity style={styles.submitBtn} onPress={handleCreatePatient} disabled={submitting}>
              <Text style={styles.submitText}>{submitting ? 'Envoi...' : 'Enregistrer'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowNewForm(false)}>
              <Text style={styles.cancelText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* SEARCH + FILTER ROW */}
      <View style={styles.filterRow}>
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.search}
            placeholder="Rechercher par nom ou prénom…"
            placeholderTextColor="#94a3b8"
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <TouchableOpacity
          style={styles.sexeDropdown}
          onPress={() => setShowSexeMenu(!showSexeMenu)}
        >
          <Text style={styles.sexeDropdownText}>
            {sexeFilter === 'tous' ? 'Tous' : sexeFilter === 'Masculin' ? '♂ Masculin' : '♀ Féminin'}
          </Text>
          <Text style={styles.sexeArrow}>▼</Text>
        </TouchableOpacity>
      </View>

      {/* Sexe dropdown menu */}
      {showSexeMenu && (
        <View style={styles.sexeMenu}>
          {[
            { key: 'tous', label: 'Tous les sexes' },
            { key: 'Masculin', label: '♂ Masculin' },
            { key: 'Féminin', label: '♀ Féminin' },
          ].map(opt => (
            <TouchableOpacity
              key={opt.key}
              style={[styles.sexeMenuItem, sexeFilter === opt.key && styles.sexeMenuItemActive]}
              onPress={() => { setSexeFilter(opt.key); setShowSexeMenu(false) }}
            >
              <Text style={[styles.sexeMenuText, sexeFilter === opt.key && styles.sexeMenuTextActive]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* TABLE HEADER */}
      <View style={styles.tableHeader}>
        <Text style={[styles.thText, { flex: 2 }]}>PATIENT</Text>
        <Text style={[styles.thText, { flex: 1.2 }]}>NAISSANCE</Text>
        <Text style={[styles.thText, { flex: 0.8 }]}>SEXE</Text>
        <Text style={[styles.thText, { flex: 1.2, textAlign: 'right' }]}>ACTIONS</Text>
      </View>

      {/* LIST */}
      {loading ? (
        <ActivityIndicator color="#4f46e5" size="large" style={{ marginTop: 40 }} />
      ) : (
        <ScrollView
          style={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchPatients(true)} colors={['#4f46e5']} />}
        >
          {filtered.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>{filtre === 'actifs' ? '👥' : '📦'}</Text>
              <Text style={styles.emptyTitle}>
                {filtre === 'actifs' ? 'Aucun patient trouvé' : 'Aucun patient archivé'}
              </Text>
              <Text style={styles.emptyDesc}>
                {filtre === 'actifs'
                  ? 'Les patients enregistrés apparaîtront ici'
                  : 'Les patients archivés apparaîtront ici'}
              </Text>
            </View>
          ) : (
            filtered.map((p, i) => (
              <View key={p.id || i} style={styles.row}>
                {/* Avatar + Name */}
                <View style={[styles.cell, { flex: 2, flexDirection: 'row', alignItems: 'center', gap: 10 }]}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {p.prenom?.charAt(0)}{p.nom?.charAt(0)}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.name}>{p.prenom} {p.nom}</Text>
                    <Text style={styles.patientId}>#{(p.id || '').slice(-8)}</Text>
                  </View>
                </View>

                {/* Date naissance */}
                <View style={[styles.cell, { flex: 1.2 }]}>
                  <Text style={styles.cellText}>{p.date_naissance || '—'}</Text>
                </View>

                {/* Sexe Badge */}
                <View style={[styles.cell, { flex: 0.8 }]}>
                  {p.sexe ? (
                    <View style={[
                      styles.sexeBadge,
                      p.sexe === 'Féminin'
                        ? { backgroundColor: '#fdf2f8', borderColor: '#fbcfe8' }
                        : { backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }
                    ]}>
                      <Text style={[
                        styles.sexeText,
                        { color: p.sexe === 'Féminin' ? '#db2777' : '#2563eb' }
                      ]}>{p.sexe}</Text>
                    </View>
                  ) : (
                    <Text style={styles.cellText}>—</Text>
                  )}
                </View>

                {/* Actions */}
                <View style={[styles.cell, { flex: 1.2, flexDirection: 'row', justifyContent: 'flex-end', gap: 8 }]}>
                  <TouchableOpacity
                    style={styles.voirBtn}
                    onPress={() => navigation.navigate('PatientDetail', { patientId: p.id, patient: p })}
                  >
                    <Text style={styles.voirText}>Voir →</Text>
                  </TouchableOpacity>
                  {filtre === 'actifs' && (
                    <TouchableOpacity
                      style={styles.archiveBtn}
                      onPress={() => handleArchive(p)}
                    >
                      <Text style={styles.archiveIcon}>🗃️</Text>
                    </TouchableOpacity>
                  )}
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
  title: { fontSize: 24, fontWeight: 'bold', color: '#1e293b' },
  subtitle: { fontSize: 13, color: '#64748b', marginTop: 2 },

  // Tabs
  tabsRow: { flexDirection: 'row', backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 12, gap: 8, borderBottomWidth: 0.5, borderBottomColor: '#e2e8f0' },
  tab: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, backgroundColor: '#f1f5f9', borderWidth: 0.5, borderColor: '#e2e8f0' },
  tabActive: { backgroundColor: '#4f46e5', borderColor: '#4f46e5' },
  tabText: { color: '#64748b', fontSize: 14, fontWeight: '500' },
  tabTextActive: { color: '#fff', fontWeight: '600' },

  // Filter row
  filterRow: { flexDirection: 'row', padding: 12, gap: 10, backgroundColor: '#fff', borderBottomWidth: 0.5, borderBottomColor: '#e2e8f0' },
  searchContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8f9fc', borderRadius: 10, paddingHorizontal: 12, borderWidth: 0.5, borderColor: '#e2e8f0' },
  searchIcon: { fontSize: 14, marginRight: 6 },
  search: { flex: 1, padding: 10, color: '#1e293b', fontSize: 13 },
  sexeDropdown: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8f9fc', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 0.5, borderColor: '#e2e8f0', gap: 6 },
  sexeDropdownText: { fontSize: 13, color: '#374151', fontWeight: '500' },
  sexeArrow: { fontSize: 10, color: '#94a3b8' },

  // Sexe menu
  sexeMenu: { position: 'absolute', top: 220, right: 16, backgroundColor: '#fff', borderRadius: 10, padding: 4, zIndex: 100, elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, borderWidth: 0.5, borderColor: '#e2e8f0', minWidth: 160 },
  sexeMenuItem: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 6 },
  sexeMenuItemActive: { backgroundColor: '#4f46e5' },
  sexeMenuText: { fontSize: 13, color: '#374151' },
  sexeMenuTextActive: { color: '#fff', fontWeight: '600' },

  // Table header
  tableHeader: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#f8f9fc', borderBottomWidth: 0.5, borderBottomColor: '#e2e8f0' },
  thText: { fontSize: 10, fontWeight: '600', color: '#94a3b8', letterSpacing: 0.5, textTransform: 'uppercase' },

  // List
  list: { flex: 1 },
  empty: { alignItems: 'center', padding: 50 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: '#1e293b', marginBottom: 4 },
  emptyDesc: { fontSize: 13, color: '#64748b', textAlign: 'center' },

  // Row
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, backgroundColor: '#fff', borderBottomWidth: 0.5, borderBottomColor: '#f1f5f9' },
  cell: { justifyContent: 'center' },
  cellText: { fontSize: 13, color: '#374151' },

  // Avatar
  avatar: { width: 38, height: 38, borderRadius: 10, backgroundColor: '#4f46e5', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  name: { fontSize: 14, fontWeight: '600', color: '#1e293b' },
  patientId: { fontSize: 11, color: '#94a3b8', marginTop: 1 },

  // Sexe badge
  sexeBadge: { borderRadius: 12, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 0.5, alignSelf: 'flex-start' },
  sexeText: { fontSize: 11, fontWeight: '500' },

  // Actions
  voirBtn: { backgroundColor: '#f1f5f9', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 7, borderWidth: 0.5, borderColor: '#e2e8f0' },
  voirText: { fontSize: 12, color: '#4f46e5', fontWeight: '600' },
  archiveBtn: { backgroundColor: '#fef2f2', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 6, borderWidth: 0.5, borderColor: '#fecaca' },
  archiveIcon: { fontSize: 14 },

  // Nouveau patient button
  newPatientBtn: { backgroundColor: '#4f46e5', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 10 },
  newPatientText: { color: '#fff', fontSize: 13, fontWeight: '600' },

  // Form
  formCard: { backgroundColor: '#fff', margin: 12, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#e2e8f0', elevation: 2 },
  formHeader: { marginBottom: 16 },
  formTitle: { fontSize: 16, fontWeight: '600', color: '#1e293b' },
  formDesc: { fontSize: 12, color: '#94a3b8', marginTop: 2 },
  formRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  formField: { flex: 1 },
  formLabel: { fontSize: 12, color: '#64748b', marginBottom: 4, fontWeight: '500' },
  formInput: { backgroundColor: '#f8f9fc', borderRadius: 8, padding: 12, fontSize: 13, color: '#1e293b', borderWidth: 0.5, borderColor: '#e2e8f0' },
  sexeRow: { flexDirection: 'row', gap: 6 },
  sexeOption: { flex: 1, backgroundColor: '#f1f5f9', borderRadius: 8, paddingVertical: 10, alignItems: 'center', borderWidth: 0.5, borderColor: '#e2e8f0' },
  sexeOptionActive: { backgroundColor: '#4f46e5', borderColor: '#4f46e5' },
  sexeOptionText: { fontSize: 12, color: '#64748b', fontWeight: '500' },
  sexeOptionTextActive: { color: '#fff', fontWeight: '600' },
  formActions: { flexDirection: 'row', gap: 10, marginTop: 4 },
  submitBtn: { backgroundColor: '#4f46e5', borderRadius: 8, paddingHorizontal: 20, paddingVertical: 12 },
  submitText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  cancelBtn: { backgroundColor: '#f1f5f9', borderRadius: 8, paddingHorizontal: 20, paddingVertical: 12, borderWidth: 0.5, borderColor: '#e2e8f0' },
  cancelText: { color: '#64748b', fontSize: 14, fontWeight: '500' },
})