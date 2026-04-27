import React, { useEffect, useState, useCallback } from 'react'
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Image, ActivityIndicator, RefreshControl
} from 'react-native'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

export default function Dashboard({ navigation }) {
  const { user, logout } = useAuth()
  const [stats, setStats] = useState(null)
  const [alertes, setAlertes] = useState([])
  const [irmAttenteList, setIrmAttenteList] = useState([])
  const [rapportsList, setRapportsList] = useState([])
  const [notifications, setNotifications] = useState([])
  const [showNotifs, setShowNotifs] = useState(false)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [patientDossier, setPatientDossier] = useState(null)
  const [patientEvolution, setPatientEvolution] = useState(null)

  const fetchStats = useCallback(async (manual = false) => {
    if (manual) setRefreshing(true)
    try {
      // For patient role, use patient-portal endpoints
      const userRole = user?.role === 'laboratoire' ? 'laborantin' : user?.role
      if (userRole === 'patient') {
        try {
          const [dossierRes, evolRes] = await Promise.all([
            api.get('/patient-portal/mon-dossier'),
            api.get('/patient-portal/mon-evolution'),
          ])
          setPatientDossier(dossierRes.data)
          setPatientEvolution(evolRes.data)
          setStats({
            total_visites: dossierRes.data.resume?.total_visites || 0,
            total_irm: dossierRes.data.resume?.total_irm || 0,
            dernier_edss: dossierRes.data.resume?.dernier_edss,
          })
        } catch(e) {
          console.log('Patient portal error:', e.response?.status)
          setStats({ total_visites: 0, total_irm: 0, dernier_edss: null })
        }
      } else {
        const res = await api.get('/dashboard/stats')
        setStats(res.data.stats)
        setAlertes(res.data.alertes || [])
        setIrmAttenteList(res.data.irm_attente_list || [])
        setRapportsList(res.data.rapports_list || [])
      }
      try {
        const nRes = await api.get('/notifications')
        setNotifications(Array.isArray(nRes.data) ? nRes.data : [])
      } catch(e) {}
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [user])

  useEffect(() => {
    fetchStats()
    const interval = setInterval(() => fetchStats(), 30000)
    return () => clearInterval(interval)
  }, [fetchStats])

  const handleLogout = async () => {
    await logout()
  }

  const rawRole = user?.role
  const role = rawRole === 'laboratoire' ? 'laborantin' : rawRole

  const menuMedecin = [
    { label: '👥 Patients', screen: 'Patients' },
    { label: '🏥 Visites cliniques', screen: 'Visites' },
    { label: '🧠 IRM', screen: 'IRMQueue' },
    { label: '📋 Rapports reçus', screen: 'Rapports' },
    { label: '📅 Agenda', screen: 'Agenda' },
    { label: '💬 Assistant IA', screen: 'ChatIA' },
  ]

  const menuPatient = [
    { label: '📁 Mon Dossier', screen: 'MonDossier' },
    { label: '📈 Mon Evolution', screen: 'MonEvolution' },
    { label: '📄 Mes Rapports', screen: 'MesRapports' },
    { label: '📅 Rendez-vous', screen: 'RendezVous' },
    { label: '📰 Actualités SEP', screen: 'Actualites' },
  ]

  const menuRadiologue = [
    { label: '🖼️ File IRM', screen: 'IRMQueue' },
    { label: '📋 Mes Rapports', screen: 'MesRapports' },
  ]
  const menuLaborantin = [
    { label: '🧪 Analyses', screen: 'Analyses' },
    { label: '📊 Résultats', screen: 'Resultats' },
  ]

  const getMenu = () => {
    if (role === 'medecin') return menuMedecin
    if (role === 'patient') return menuPatient
    if (role === 'radiologue') return menuRadiologue
    if (role === 'laborantin') return menuLaborantin
    return []
  }

  const alerteConfig = {
    danger: { color: '#dc2626', bg: '#fef2f2', border: '#fecaca', label: 'Critique' },
    warning: { color: '#d97706', bg: '#fffbeb', border: '#fcd34d', label: 'Attention' },
    info: { color: '#2563eb', bg: '#eff6ff', border: '#93c5fd', label: 'Info' },
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchStats(true)} colors={['#4f46e5']} />}
    >
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <Image source={require('../../assets/images/logo_sep.jpeg')} style={styles.logoImg} />
          <View>
            <Text style={styles.logoText}>
              <Text style={styles.logoNeuro}>Neuro </Text>
              <Text style={styles.logoPredict}>Predict MS</Text>
            </Text>
            <Text style={styles.logoSub}>IA MÉDICALE AVANCÉE</Text>
          </View>
        </View>
        <View style={styles.userCard}>
          <View style={[styles.userAvatar, { backgroundColor: '#4f46e5' }]}>
            <Text style={styles.userAvatarText}>
              {user?.prenom?.charAt(0)}{user?.nom?.charAt(0)}
            </Text>
          </View>
          <View>
            <Text style={styles.userName}>{user?.prenom} {user?.nom}</Text>
            <Text style={[styles.userRole, { color: '#4f46e5' }]}>{user?.role}</Text>
          </View>
        </View>

        {/* Notifications bell */}
        <View style={styles.notifRow}>
          <TouchableOpacity style={styles.bellBtn} onPress={() => setShowNotifs(!showNotifs)}>
            <Text style={{ fontSize: 20 }}>🔔</Text>
            {notifications.length > 0 && (
              <View style={styles.bellBadge}>
                <Text style={styles.bellBadgeText}>{notifications.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {showNotifs && (
          <View style={styles.notifPanel}>
            <View style={styles.notifPanelHeader}>
              <Text style={styles.notifPanelTitle}>Notifications</Text>
              <TouchableOpacity onPress={() => setShowNotifs(false)}>
                <Text style={styles.notifCloseBtn}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 350 }}>
              {notifications.length === 0 ? (
                <Text style={styles.notifEmpty}>Aucune notification</Text>
              ) : (
                notifications.map((n, i) => {
                  const icons = { irm_pending: '🧠', irm: '🧠', visite: '📅', analyse: '🧪', user: '👤' }
                  return (
                    <View key={n.id || i} style={styles.notifItem}>
                      <Text style={{ fontSize: 16, marginRight: 10 }}>{icons[n.type] || '📌'}</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.notifItemTitle}>{n.title}</Text>
                        <Text style={styles.notifItemMsg} numberOfLines={2}>{n.message}</Text>
                        <Text style={styles.notifItemTime}>{n.time}</Text>
                      </View>
                      <TouchableOpacity
                        style={styles.notifDismissBtn}
                        onPress={() => setNotifications(prev => prev.filter((_, idx) => idx !== i))}
                      >
                        <Text style={styles.notifDismissText}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  )
                })
              )}
            </ScrollView>
          </View>
        )}
      </View>

      {/* NAVIGATION */}
      <View style={styles.navMenu}>
        <Text style={styles.navTitle}>NAVIGATION</Text>
        {getMenu().map((item, i) => (
          <TouchableOpacity
            key={i}
            style={styles.navItem}
            onPress={() => navigation.navigate(item.screen)}
          >
            <Text style={styles.navIcon}>{item.label.split(' ')[0]}</Text>
            <Text style={styles.navLabel}>{item.label.split(' ').slice(1).join(' ')}</Text>
            <Text style={styles.navArrow}>›</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* DASHBOARD CONTENT */}
      <View style={styles.content}>
        <Text style={styles.pageTitle}>Dashboard</Text>
        <Text style={styles.greeting}>
          Bonjour, {role === 'medecin' ? 'Dr. ' : ''}{user?.prenom} {user?.nom} 👋
        </Text>
        <Text style={styles.greetingDesc}>
          {role === 'radiologue' ? "File d'imagerie — vue radiologue" : role === 'laborantin' ? "Espace laboratoire" : role === 'patient' ? "Bienvenue sur votre espace patient — suivez l'évolution de votre santé" : "Voici votre vue d'ensemble — mise à jour automatique"}
        </Text>

        {loading ? (
          <ActivityIndicator color="#4f46e5" size="large" style={{ marginTop: 40 }} />
        ) : (
          <>
            {/* Stats */}
            {role === 'medecin' && stats && (
              <View style={styles.statsGrid}>
                {[
                  { label: 'Mes patients', value: stats.total_patients || 0, color: '#eff6ff', border: '#bfdbfe', icon: '👥' },
                  { label: "Visites aujourd'hui", value: stats.visites_aujourdhui || stats.visites_aujourd_hui || 0, color: '#f0fdf4', border: '#bbf7d0', icon: '📅' },
                  { label: 'IRM en attente', value: stats.irm_en_attente || 0, color: '#f5f3ff', border: '#ddd6fe', icon: '🧠' },
                  { label: 'Analyses en attente', value: stats.analyses_en_attente || 0, color: '#fefce8', border: '#fde68a', icon: '🧪' },
                ].map((s, i) => (
                  <View key={i} style={[styles.statCard, { backgroundColor: s.color, borderColor: s.border }]}>
                    <View style={styles.statTop}>
                      <Text style={styles.statLabel}>{s.label}</Text>
                      <Text style={styles.statIcon}>{s.icon}</Text>
                    </View>
                    <Text style={styles.statValue}>{s.value}</Text>
                    <Text style={styles.statLink}>Voir détails →</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Stats Radiologue */}
            {role === 'radiologue' && stats && (
              <View style={styles.statsGrid}>
                {[
                  { label: 'IRM en attente', value: stats.irm_en_attente || 0, color: '#fef2f2', border: '#fecaca', icon: '⏳', screen: 'IRMQueue' },
                  { label: 'Rapports rédigés', value: stats.rapports_rediges || 0, color: '#f0fdf4', border: '#bbf7d0', icon: '📋', screen: 'MesRapports' },
                  { label: 'Envoyés aux médecins', value: stats.rapports_envoyes || 0, color: '#eff6ff', border: '#bfdbfe', icon: '📤', screen: null },
                  { label: 'Médecins contractés', value: stats.medecins_contractes || 0, color: '#fefce8', border: '#fde68a', icon: '👨‍⚕️', screen: null },
                ].map((s, i) => (
                  <TouchableOpacity key={i} style={[styles.statCard, { backgroundColor: s.color, borderColor: s.border }]} onPress={() => s.screen && navigation.navigate(s.screen)}>
                    <View style={styles.statTop}>
                      <Text style={styles.statLabel}>{s.label}</Text>
                      <Text style={styles.statIcon}>{s.icon}</Text>
                    </View>
                    <Text style={styles.statValue}>{s.value}</Text>
                    {s.screen && <Text style={styles.statLink}>Voir détails →</Text>}
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Stats Patient */}
            {role === 'patient' && stats && (
              <>
                <View style={styles.statsGrid}>
                  {[
                    { label: 'Mon dossier', value: '—', color: '#fef2f2', border: '#fecaca', icon: '👤', screen: 'MonDossier' },
                    { label: 'Visites cliniques', value: stats.total_visites || 0, color: '#f0fdf4', border: '#bbf7d0', icon: '📋', desc: 'Consultations enregistrées', screen: 'MonEvolution' },
                    { label: 'IRM', value: stats.total_irm || 0, color: '#f5f3ff', border: '#ddd6fe', icon: '🧠', desc: 'Imageries réalisées', screen: null },
                    { label: 'Dernier EDSS', value: stats.dernier_edss ?? '—', color: '#fefce8', border: '#fde68a', icon: '🔴', desc: 'Score de handicap', screen: 'MonEvolution' },
                  ].map((s, i) => (
                    <TouchableOpacity key={i} style={[styles.statCard, { backgroundColor: s.color, borderColor: s.border }]} onPress={() => s.screen && navigation.navigate(s.screen)}>
                      <View style={styles.statTop}>
                        <Text style={styles.statLabel}>{s.label}</Text>
                        <Text style={styles.statIcon}>{s.icon}</Text>
                      </View>
                      <Text style={styles.statValue}>{s.value}</Text>
                      {s.desc && <Text style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>{s.desc}</Text>}
                      <Text style={styles.statLink}>Voir détails →</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Évolution EDSS */}
                <View style={styles.sectionCard}>
                  <View style={styles.sectionHeader}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Text style={{ fontSize: 14 }}>📈</Text>
                      <Text style={styles.sectionTitle}>Évolution EDSS</Text>
                    </View>
                    <TouchableOpacity onPress={() => navigation.navigate('MonEvolution')}>
                      <Text style={styles.sectionLink}>Voir tout →</Text>
                    </TouchableOpacity>
                  </View>
                  {patientEvolution?.evolution_edss?.length > 0 ? (
                    <View style={{ alignItems: 'center', paddingVertical: 10 }}>
                      <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
                        {patientEvolution.evolution_edss.map((e, i) => (
                          <View key={i} style={{ alignItems: 'center', paddingHorizontal: 8 }}>
                            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#4f46e5' }}>{e.score}</Text>
                            <Text style={{ fontSize: 10, color: '#94a3b8' }}>{e.date}</Text>
                          </View>
                        ))}
                      </View>
                      <View style={[styles.tendanceBadge, {
                        backgroundColor: patientEvolution?.tendance === 'progression' ? '#fef2f2' : patientEvolution?.tendance === 'amelioration' ? '#f0fdf4' : '#eff6ff',
                        borderColor: patientEvolution?.tendance === 'progression' ? '#fecaca' : patientEvolution?.tendance === 'amelioration' ? '#bbf7d0' : '#bfdbfe',
                      }]}>
                        <Text style={{ fontSize: 12, fontWeight: '600', color: patientEvolution?.tendance === 'progression' ? '#dc2626' : patientEvolution?.tendance === 'amelioration' ? '#059669' : '#2563eb' }}>
                          — {patientEvolution?.tendance === 'progression' ? 'Progression' : patientEvolution?.tendance === 'amelioration' ? 'Amélioration' : 'Stable'}
                        </Text>
                      </View>
                    </View>
                  ) : (
                    <View style={{ alignItems: 'center', paddingVertical: 16 }}>
                      <Text style={{ fontSize: 30, opacity: 0.3 }}>💛</Text>
                      <Text style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>Pas encore de données EDSS</Text>
                    </View>
                  )}
                </View>

                {/* Organisations SEP */}
                <View style={styles.sectionCard}>
                  <View style={styles.sectionHeader}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Text style={{ fontSize: 14 }}>🌍</Text>
                      <Text style={styles.sectionTitle}>Organisations SEP</Text>
                    </View>
                    <TouchableOpacity onPress={() => navigation.navigate('Actualites')}>
                      <Text style={styles.sectionLink}>Voir plus →</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={{ gap: 8 }}>
                    {[
                      { name: 'Fondation SEP France', desc: 'Soutien et recherche' },
                      { name: 'ARSEP', desc: 'Aide à la recherche SEP' },
                      { name: 'INSERM', desc: 'Institut de recherche' },
                    ].map((org, i) => (
                      <View key={i} style={styles.orgItem}>
                        <View style={styles.orgIcon}><Text style={{ fontSize: 12 }}>🌐</Text></View>
                        <View>
                          <Text style={styles.orgName}>{org.name}</Text>
                          <Text style={styles.orgDesc}>{org.desc}</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              </>
            )}

            {/* Stats Laborantin */}
            {role === 'laborantin' && stats && (
              <View style={styles.statsGrid}>
                {[
                  { label: 'Total', value: stats.total_analyses || 0, color: '#eff6ff', border: '#bfdbfe', icon: '🧪' },
                  { label: 'En attente', value: stats.en_attente || 0, color: '#fefce8', border: '#fde68a', icon: '⏳' },
                  { label: 'Terminées', value: stats.terminees || 0, color: '#f0fdf4', border: '#bbf7d0', icon: '✅' },
                ].map((s, i) => (
                  <TouchableOpacity key={i} style={[styles.statCard, { backgroundColor: s.color, borderColor: s.border }]} onPress={() => navigation.navigate('Analyses')}>
                    <View style={styles.statTop}>
                      <Text style={styles.statLabel}>{s.label}</Text>
                      <Text style={styles.statIcon}>{s.icon}</Text>
                    </View>
                    <Text style={styles.statValue}>{s.value}</Text>
                    <Text style={styles.statLink}>Voir détails →</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Radiologue: IRM en attente + Rapports récents */}
            {role === 'radiologue' && (
              <View style={{ marginTop: 16 }}>
                {/* IRM en attente */}
                <View style={styles.sectionCard}>
                  <View style={styles.sectionHeader}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Text style={{ fontSize: 14 }}>⏳</Text>
                      <Text style={styles.sectionTitle}>IRM en attente</Text>
                      <View style={styles.countBadge}><Text style={styles.countText}>{stats?.irm_en_attente || 0}</Text></View>
                    </View>
                    <TouchableOpacity onPress={() => navigation.navigate('IRMQueue')}>
                      <Text style={styles.sectionLink}>Voir tout →</Text>
                    </TouchableOpacity>
                  </View>
                  {irmAttenteList.length === 0 ? (
                    <Text style={styles.sectionEmpty}>Aucune IRM en attente</Text>
                  ) : (
                    irmAttenteList.map((irm, i) => {
                      const d = irm.uploaded_at ? new Date(irm.uploaded_at) : null
                      const dateStr = d ? `${d.getDate()}/${d.getMonth()+1 < 10 ? '0' : ''}${d.getMonth()+1}` : '—'
                      return (
                        <TouchableOpacity key={irm.id || i} style={styles.listItem} onPress={() => navigation.navigate('IRMQueue')}>
                          <View style={styles.flair}><Text style={styles.flairText}>{irm.sequence_type || 'FLAIR'}</Text></View>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.listName}>{irm.patient_nom}</Text>
                            <Text style={styles.listMeta}>{irm.metadata?.nb_slices || '—'} coupes • {irm.metadata?.taille_mb || '—'} MB</Text>
                          </View>
                          <Text style={styles.listDate}>{dateStr}</Text>
                        </TouchableOpacity>
                      )
                    })
                  )}
                </View>

                {/* Rapports récents */}
                <View style={styles.sectionCard}>
                  <View style={styles.sectionHeader}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Text style={{ fontSize: 14 }}>📋</Text>
                      <Text style={styles.sectionTitle}>Rapports récents</Text>
                      <View style={styles.countBadge}><Text style={styles.countText}>{stats?.rapports_rediges || 0}</Text></View>
                    </View>
                    <TouchableOpacity onPress={() => navigation.navigate('MesRapports')}>
                      <Text style={styles.sectionLink}>Tous →</Text>
                    </TouchableOpacity>
                  </View>
                  {rapportsList.length === 0 ? (
                    <Text style={styles.sectionEmpty}>Aucun rapport</Text>
                  ) : (
                    rapportsList.map((r, i) => (
                      <TouchableOpacity key={r.id || i} style={styles.listItem} onPress={() => navigation.navigate('MesRapports')}>
                        <View style={[styles.listDot, { backgroundColor: r.statut === 'envoye' ? '#059669' : '#d97706' }]} />
                        <View style={{ flex: 1 }}>
                          <Text style={styles.listName}>{r.patient_nom}</Text>
                          <Text style={styles.listMeta}>{r.sequence_type || 'FLAIR'}</Text>
                        </View>
                        <Text style={[styles.listStatus, { color: r.statut === 'envoye' ? '#059669' : '#d97706' }]}>
                          {r.statut === 'envoye' ? 'Envoyé' : "En attente d'envoi"}
                        </Text>
                      </TouchableOpacity>
                    ))
                  )}
                </View>
              </View>
            )}

            {role === 'medecin' && (
              <View style={styles.alertesSection}>
                <View style={styles.alertesHeader}>
                  <Text style={styles.alertesTitle}>⚠️ Alertes patients</Text>
                  {alertes.length > 0 && (
                    <View style={styles.alertesBadge}>
                      <Text style={styles.alertesBadgeText}>{alertes.length} alerte{alertes.length > 1 ? 's' : ''}</Text>
                    </View>
                  )}
                </View>
                {alertes.length === 0 ? (
                  <View style={styles.noAlertes}>
                    <Text style={styles.noAlertesIcon}>📈</Text>
                    <Text style={styles.noAlertesTitle}>Tout est en ordre ✓</Text>
                    <Text style={styles.noAlertesDesc}>Aucune alerte — tous vos patients sont à jour</Text>
                  </View>
                ) : (
                  alertes.map((a, i) => {
                    const config = alerteConfig[a.niveau] || alerteConfig.info
                    return (
                      <TouchableOpacity
                        key={i}
                        style={[styles.alerteCard, { backgroundColor: config.bg, borderColor: config.border }]}
                        onPress={() => navigation.navigate('Patients')}
                      >
                        <View style={styles.alerteTop}>
                          <Text style={[styles.alerteNom, { color: config.color }]}>{a.patient_nom}</Text>
                          <View style={[styles.alerteNiveau, { backgroundColor: config.color + '20', borderColor: config.color }]}>
                            <Text style={[styles.alerteNiveauText, { color: config.color }]}>{config.label}</Text>
                          </View>
                        </View>
                        <Text style={[styles.alerteMessage, { color: config.color }]}>{a.message}</Text>
                        <Text style={styles.alerteDetails}>{a.details}</Text>
                        <Text style={[styles.alerteVoir, { color: config.color }]}>Voir →</Text>
                      </TouchableOpacity>
                    )
                  })
                )}
              </View>
            )}
          </>
        )}
      </View>

      {/* LOGOUT */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>→ Déconnexion</Text>
      </TouchableOpacity>

    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fc' },
  header: { backgroundColor: '#fff', padding: 24, paddingTop: 60, borderBottomWidth: 0.5, borderBottomColor: '#e2e8f0' },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  logoImg: { width: 32, height: 32, borderRadius: 6 },
  logoText: { fontSize: 16, fontWeight: 'bold' },
  logoNeuro: { color: '#1e293b' },
  logoPredict: { color: '#4f46e5' },
  logoSub: { fontSize: 9, color: '#94a3b8', letterSpacing: 1 },
  userCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#f8f9fc', borderRadius: 12, padding: 12 },
  userAvatar: { width: 40, height: 40, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  userAvatarText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  userName: { fontSize: 14, fontWeight: '600', color: '#1e293b' },
  userRole: { fontSize: 12, textTransform: 'capitalize' },
  navMenu: { backgroundColor: '#fff', padding: 16, marginTop: 8 },
  navTitle: { fontSize: 10, color: '#94a3b8', letterSpacing: 1, marginBottom: 8, fontWeight: '600' },
  navItem: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 10, marginBottom: 4 },
  navIcon: { fontSize: 18, marginRight: 12 },
  navLabel: { flex: 1, fontSize: 14, color: '#374151', fontWeight: '500' },
  navArrow: { fontSize: 18, color: '#94a3b8' },
  content: { padding: 20 },
  pageTitle: { fontSize: 13, color: '#94a3b8', marginBottom: 8 },
  greeting: { fontSize: 22, fontWeight: 'bold', color: '#1e293b', marginBottom: 4 },
  greetingDesc: { fontSize: 13, color: '#64748b', marginBottom: 20 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 },
  statCard: { width: '47%', borderRadius: 12, padding: 14, borderWidth: 1 },
  statTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  statLabel: { fontSize: 12, color: '#64748b', flex: 1 },
  statIcon: { fontSize: 18 },
  statValue: { fontSize: 28, fontWeight: 'bold', color: '#1e293b', marginBottom: 8 },
  statLink: { fontSize: 12, color: '#4f46e5' },
  alertesSection: { backgroundColor: '#fff', borderRadius: 12, padding: 16, borderWidth: 0.5, borderColor: '#e2e8f0' },
  alertesHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 10 },
  alertesTitle: { fontSize: 16, fontWeight: '600', color: '#1e293b', flex: 1 },
  alertesBadge: { backgroundColor: '#fef3c7', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 2, borderWidth: 0.5, borderColor: '#fcd34d' },
  alertesBadgeText: { fontSize: 11, color: '#d97706', fontWeight: '600' },
  noAlertes: { alignItems: 'center', padding: 24 },
  noAlertesIcon: { fontSize: 40, marginBottom: 12 },
  noAlertesTitle: { fontSize: 16, fontWeight: '600', color: '#1e293b', marginBottom: 4 },
  noAlertesDesc: { fontSize: 13, color: '#64748b', textAlign: 'center' },
  alerteCard: { borderRadius: 10, padding: 14, marginBottom: 10, borderWidth: 0.5 },
  alerteTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  alerteNom: { fontSize: 14, fontWeight: '600' },
  alerteNiveau: { borderRadius: 12, paddingHorizontal: 8, paddingVertical: 2, borderWidth: 0.5 },
  alerteNiveauText: { fontSize: 11, fontWeight: '600' },
  alerteMessage: { fontSize: 13, fontWeight: '500', marginBottom: 4 },
  alerteDetails: { fontSize: 12, color: '#64748b', marginBottom: 6 },
  alerteVoir: { fontSize: 12, fontWeight: '600' },
  logoutBtn: { margin: 20, padding: 16, alignItems: 'center' },
  logoutText: { fontSize: 14, color: '#94a3b8' },

  notifRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 },
  bellBtn: { position: 'relative', padding: 8 },
  bellBadge: { position: 'absolute', top: 2, right: 2, backgroundColor: '#dc2626', borderRadius: 10, minWidth: 18, height: 18, justifyContent: 'center', alignItems: 'center' },
  bellBadgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  notifPanel: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginTop: 8, borderWidth: 0.5, borderColor: '#e2e8f0', elevation: 3 },
  notifPanelHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, paddingBottom: 8, borderBottomWidth: 0.5, borderBottomColor: '#f1f5f9' },
  notifPanelTitle: { fontSize: 15, fontWeight: '600', color: '#1e293b' },
  notifCloseBtn: { fontSize: 16, color: '#94a3b8', padding: 4 },
  notifEmpty: { fontSize: 13, color: '#94a3b8', textAlign: 'center', padding: 10 },
  notifItem: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: '#f1f5f9' },
  notifItemTitle: { fontSize: 13, fontWeight: '600', color: '#1e293b', marginBottom: 2 },
  notifItemMsg: { fontSize: 12, color: '#64748b' },
  notifItemTime: { fontSize: 11, color: '#94a3b8', marginTop: 2 },
  notifDismissBtn: { padding: 6, marginLeft: 6 },
  notifDismissText: { fontSize: 14, color: '#dc2626', fontWeight: '600' },

  // Radiologue sections
  sectionCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 0.5, borderColor: '#e2e8f0' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingBottom: 10, borderBottomWidth: 0.5, borderBottomColor: '#f1f5f9' },
  sectionTitle: { fontSize: 15, fontWeight: '600', color: '#1e293b' },
  sectionLink: { fontSize: 13, color: '#4f46e5', fontWeight: '500' },
  sectionEmpty: { fontSize: 13, color: '#94a3b8', textAlign: 'center', padding: 16 },
  countBadge: { backgroundColor: '#eef2ff', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
  countText: { fontSize: 12, color: '#4f46e5', fontWeight: '600' },
  listItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: '#f8f9fc', gap: 10 },
  listName: { fontSize: 14, fontWeight: '500', color: '#1e293b', marginBottom: 1 },
  listMeta: { fontSize: 12, color: '#94a3b8' },
  listDate: { fontSize: 12, color: '#64748b' },
  listStatus: { fontSize: 11, fontWeight: '600' },
  listDot: { width: 8, height: 8, borderRadius: 4 },
  flair: { backgroundColor: '#dc2626', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  flairText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },

  // Patient styles
  tendanceBadge: { marginTop: 10, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 0.5 },
  orgItem: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, borderBottomWidth: 0.5, borderBottomColor: '#f8f9fc' },
  orgIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center' },
  orgName: { fontSize: 13, fontWeight: '500', color: '#1e293b' },
  orgDesc: { fontSize: 11, color: '#94a3b8' },
})