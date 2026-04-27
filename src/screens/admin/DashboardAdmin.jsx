import React, { useEffect, useState } from 'react'
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Image, ActivityIndicator,
  TextInput, Modal
} from 'react-native'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'

export default function DashboardAdmin({ navigation }) {
  const { user, logout } = useAuth()
  const [stats, setStats] = useState(null)
  const [alertes, setAlertes] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showNotifs, setShowNotifs] = useState(false)
  const [notifs, setNotifs] = useState([])
  const [notifsLues, setNotifsLues] = useState(false)

  useEffect(() => {
    fetchStats()
    fetchNotifs()
  }, [])

  const fetchStats = async () => {
    try {
      const res = await api.get('/dashboard/stats')
      setStats(res.data.stats)
      setAlertes(res.data.alertes || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchNotifs = async () => {
    try {
      const res = await api.get('/notifications')
      setNotifs(res.data || [])
    } catch (err) {
      // notifications non disponibles
    }
  }

  const handleLogout = async () => {
    await logout()
    navigation.replace('Home')
  }

  const notifsNonLues = notifs.filter(n => !n.lu).length

  const menuItems = [
    { label: 'Utilisateurs', icon: '👥', screen: 'AdminUtilisateurs' },
    { label: 'Validations', icon: '✅', screen: 'AdminValidations' },
    { label: 'Liaisons', icon: '🔗', screen: 'AdminLiaisons' },
    { label: 'Paramètres', icon: '⚙️', screen: 'AdminParametres' },
  ]

  return (
    <View style={styles.wrapper}>

      {/* TOPBAR */}
      <View style={styles.topbar}>
        <Text style={styles.topbarTitle}>Dashboard</Text>
        <View style={styles.topbarRight}>
          {/* Search */}
          <View style={styles.searchBox}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher..."
              placeholderTextColor="#94a3b8"
              value={search}
              onChangeText={setSearch}
            />
          </View>
          {/* Notif Bell */}
          <TouchableOpacity style={styles.bellBtn} onPress={() => setShowNotifs(true)}>
            <Text style={styles.bellIcon}>🔔</Text>
            {notifsNonLues > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{notifsNonLues}</Text>
              </View>
            )}
          </TouchableOpacity>
          {/* Avatar */}
          <View style={styles.avatarTop}>
            <Text style={styles.avatarTopText}>
              {user?.prenom?.charAt(0)}{user?.nom?.charAt(0)}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.container}>

        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.logoRow}>
            <Image source={require('../../../assets/images/logo_sep.jpeg')} style={styles.logoImg} />
            <View>
              <Text style={styles.logoText}>
                <Text style={styles.logoNeuro}>Neuro </Text>
                <Text style={styles.logoPredict}>Predict MS</Text>
              </Text>
              <Text style={styles.logoSub}>IA MÉDICALE AVANCÉE</Text>
            </View>
          </View>
          <View style={styles.userCard}>
            <View style={styles.userAvatar}>
              <Text style={styles.userAvatarText}>
                {user?.prenom?.charAt(0)}{user?.nom?.charAt(0)}
              </Text>
            </View>
            <View>
              <Text style={styles.userName}>{user?.prenom} {user?.nom}</Text>
              <Text style={styles.userRole}>Administrateur</Text>
            </View>
          </View>
        </View>

        {/* NAVIGATION */}
        <View style={styles.navMenu}>
          <Text style={styles.navTitle}>NAVIGATION</Text>
          {menuItems.map((item, i) => (
            <TouchableOpacity
              key={i}
              style={styles.navItem}
              onPress={() => navigation.navigate(item.screen)}
            >
              <Text style={styles.navIcon}>{item.icon}</Text>
              <Text style={styles.navLabel}>{item.label}</Text>
              <Text style={styles.navArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* CONTENT */}
        <View style={styles.content}>
          <Text style={styles.pageTitle}>Dashboard</Text>
          <Text style={styles.greeting}>Bonjour, Dr. {user?.nom} 👋</Text>
          <Text style={styles.greetingDesc}>Voici votre vue d'ensemble — mise à jour automatique</Text>

          {loading ? (
            <ActivityIndicator color="#4f46e5" size="large" style={{ marginTop: 40 }} />
          ) : (
            <>
              <View style={styles.statsGrid}>
                {[
                  { label: 'Mes patients', value: stats?.total_patients || 0, color: '#eff6ff', border: '#bfdbfe', icon: '👥' },
                  { label: "Visites aujourd'hui", value: stats?.visites_aujourd_hui || 0, color: '#f0fdf4', border: '#bbf7d0', icon: '📅' },
                  { label: 'IRM en attente', value: stats?.irm_en_attente || 0, color: '#f5f3ff', border: '#ddd6fe', icon: '🧠' },
                  { label: 'Analyses en attente', value: stats?.analyses_en_attente || 0, color: '#fefce8', border: '#fde68a', icon: '🧪' },
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

              <View style={styles.alertesSection}>
                <Text style={styles.alertesTitle}>⚠️ Alertes patients</Text>
                {alertes.length === 0 ? (
                  <View style={styles.noAlertes}>
                    <Text style={styles.noAlertesIcon}>📈</Text>
                    <Text style={styles.noAlertesTitle}>Tout est en ordre ✓</Text>
                    <Text style={styles.noAlertesDesc}>Aucune alerte — tous vos patients sont à jour</Text>
                  </View>
                ) : (
                  alertes.map((a, i) => (
                    <View key={i} style={styles.alerteCard}>
                      <Text style={styles.alerteText}>{a.message}</Text>
                    </View>
                  ))
                )}
              </View>
            </>
          )}
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>→ Déconnexion</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* MODAL NOTIFICATIONS */}
      <Modal visible={showNotifs} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setShowNotifs(false)}>
          <View style={styles.notifsPanel}>
            <View style={styles.notifsHeader}>
              <Text style={styles.notifsTitle}>Notifications</Text>
              {notifsNonLues > 0 && (
                <View style={styles.notifsBadge}>
                  <Text style={styles.notifsBadgeText}>{notifsNonLues} nouvelles</Text>
                </View>
              )}
              <TouchableOpacity onPress={() => { setNotifsLues(true); setShowNotifs(false) }}>
                <Text style={styles.marquerLu}>✓ Tout marquer lu</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.notifsList}>
              {notifs.length === 0 ? (
                <>
                  {/* Notifs fictives si pas de backend */}
                  {[
                    { icon: '👤', titre: 'Nouveau compte', desc: 'sa wiwi a demandé un accès medecin', temps: 'Il y a 11h', lu: false },
                    { icon: '👤', titre: 'Nouveau compte', desc: 'bizdi nounou a demandé un accès medecin', temps: 'Il y a 11h', lu: false },
                    { icon: '👤', titre: 'Nouveau compte', desc: 'saa islem a demandé un accès laboratoire', temps: 'Il y a 11h', lu: false },
                    { icon: '🧠', titre: 'IRM en attente', desc: 'Nouvelle IRM de SA joujou à analyser', temps: 'Il y a 2j', lu: true },
                  ].map((n, i) => (
                    <View key={i} style={[styles.notifItem, !n.lu && styles.notifItemUnread]}>
                      <View style={[styles.notifIconBox, !n.lu && styles.notifIconBoxUnread]}>
                        <Text style={styles.notifIconText}>{n.icon}</Text>
                      </View>
                      <View style={styles.notifContent}>
                        <Text style={styles.notifTitre}>{n.titre}</Text>
                        <Text style={styles.notifDesc}>{n.desc}</Text>
                        <Text style={styles.notifTemps}>{n.temps}</Text>
                      </View>
                      {!n.lu && <View style={styles.notifDot} />}
                    </View>
                  ))}
                </>
              ) : (
                notifs.map((n, i) => (
                  <View key={i} style={[styles.notifItem, !n.lu && styles.notifItemUnread]}>
                    <View style={styles.notifIconBox}>
                      <Text style={styles.notifIconText}>🔔</Text>
                    </View>
                    <View style={styles.notifContent}>
                      <Text style={styles.notifTitre}>{n.titre}</Text>
                      <Text style={styles.notifDesc}>{n.message}</Text>
                    </View>
                    {!n.lu && <View style={styles.notifDot} />}
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#f8f9fc' },
  topbar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', paddingTop: 55, paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 0.5, borderBottomColor: '#e2e8f0' },
  topbarTitle: { fontSize: 16, fontWeight: '600', color: '#1e293b' },
  topbarRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f5f9', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, width: 140 },
  searchIcon: { fontSize: 13, marginRight: 6 },
  searchInput: { flex: 1, fontSize: 13, color: '#1e293b', padding: 0 },
  bellBtn: { position: 'relative', padding: 4 },
  bellIcon: { fontSize: 20 },
  badge: { position: 'absolute', top: 0, right: 0, backgroundColor: '#dc2626', borderRadius: 8, width: 16, height: 16, justifyContent: 'center', alignItems: 'center' },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  avatarTop: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#f97316', justifyContent: 'center', alignItems: 'center' },
  avatarTopText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  container: { flex: 1 },
  header: { backgroundColor: '#fff', padding: 24, borderBottomWidth: 0.5, borderBottomColor: '#e2e8f0' },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  logoImg: { width: 32, height: 32, borderRadius: 6 },
  logoText: { fontSize: 16, fontWeight: 'bold' },
  logoNeuro: { color: '#1e293b' },
  logoPredict: { color: '#4f46e5' },
  logoSub: { fontSize: 9, color: '#94a3b8', letterSpacing: 1 },
  userCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#f8f9fc', borderRadius: 12, padding: 12 },
  userAvatar: { width: 40, height: 40, borderRadius: 8, backgroundColor: '#f97316', justifyContent: 'center', alignItems: 'center' },
  userAvatarText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  userName: { fontSize: 14, fontWeight: '600', color: '#1e293b' },
  userRole: { fontSize: 12, color: '#f97316' },
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
  alertesTitle: { fontSize: 16, fontWeight: '600', color: '#1e293b', marginBottom: 16 },
  noAlertes: { alignItems: 'center', padding: 24 },
  noAlertesIcon: { fontSize: 40, marginBottom: 12 },
  noAlertesTitle: { fontSize: 16, fontWeight: '600', color: '#1e293b', marginBottom: 4 },
  noAlertesDesc: { fontSize: 13, color: '#64748b', textAlign: 'center' },
  alerteCard: { backgroundColor: '#fef2f2', borderRadius: 8, padding: 12, marginBottom: 8, borderWidth: 0.5, borderColor: '#fecaca' },
  alerteText: { fontSize: 13, color: '#dc2626' },
  logoutBtn: { margin: 20, padding: 16, alignItems: 'center' },
  logoutText: { fontSize: 14, color: '#94a3b8' },
  // Modal Notifs
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'flex-start', alignItems: 'flex-end', paddingTop: 100, paddingRight: 16 },
  notifsPanel: { backgroundColor: '#fff', borderRadius: 16, width: 320, maxHeight: 500, elevation: 10, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 20 },
  notifsHeader: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 0.5, borderBottomColor: '#e2e8f0', gap: 8 },
  notifsTitle: { fontSize: 15, fontWeight: '600', color: '#1e293b', flex: 1 },
  notifsBadge: { backgroundColor: '#4f46e5', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 2 },
  notifsBadgeText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  marquerLu: { fontSize: 12, color: '#4f46e5', fontWeight: '500' },
  notifsList: { maxHeight: 400 },
  notifItem: { flexDirection: 'row', padding: 14, borderBottomWidth: 0.5, borderBottomColor: '#f1f5f9', alignItems: 'flex-start' },
  notifItemUnread: { backgroundColor: '#fafafa' },
  notifIconBox: { width: 36, height: 36, borderRadius: 8, backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  notifIconBoxUnread: { backgroundColor: '#eef2ff' },
  notifIconText: { fontSize: 16 },
  notifContent: { flex: 1 },
  notifTitre: { fontSize: 13, fontWeight: '600', color: '#1e293b', marginBottom: 2 },
  notifDesc: { fontSize: 12, color: '#64748b', marginBottom: 2 },
  notifTemps: { fontSize: 11, color: '#94a3b8' },
  notifDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#4f46e5', marginTop: 4 },
})