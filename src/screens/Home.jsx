import React from 'react'
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Dimensions, Image, Linking
} from 'react-native'

const { width } = Dimensions.get('window')

const organisations = [
  { nom: 'Ministère de la Santé', soustitre: 'Portail officiel — Santé publique', desc: 'Site officiel du Ministère de la santé tunisien : centres de soins et programmes de prévention.', url: 'https://www.santetunisie.rns.tn', pays: 'Tunisie', couleur: '#f97316' },
  { nom: 'ATSEP — Assoc. Tunisienne SEP', soustitre: 'Accompagnement & Soutien patients', desc: 'Association dédiée à l\'accompagnement des patients SEP en Tunisie : aide sociale et plaidoyer.', url: 'https://www.facebook.com', pays: 'Tunisie', couleur: '#22c55e' },
  { nom: 'Association Tunisienne de Neurologie', soustitre: 'Neuro Tunisia — Recherche & Formation', desc: 'Association des neurologues tunisiens : congrès annuels, formations et recherche sur la SEP.', url: 'https://neurotunisia.tn', pays: 'Tunisie', couleur: '#8b5cf6' },
  { nom: 'Institut Mongi Ben Hamida', soustitre: 'Institut National de Neurologie — La Rabta', desc: 'Centre de référence pour la neurologie en Tunisie, spécialisé dans le diagnostic de la SEP.', url: 'https://fr.wikipedia.org/wiki/Institut_national_de_neurologie_de_Tunis', pays: 'Tunisie', couleur: '#f97316' },
  { nom: 'MSIF — Fédération Internationale', soustitre: 'Multiple Sclerosis International Federation', desc: 'Réseau mondial reliant les organisations SEP de 100+ pays pour la recherche et les soins.', url: 'https://www.msif.org', pays: 'International', couleur: '#8b5cf6' },
  { nom: 'National MS Society', soustitre: 'Recherche & Programmes — USA', desc: 'Organisation leader dans le financement de la recherche SEP et le soutien aux patients.', url: 'https://www.nationalmssociety.org', pays: 'International', couleur: '#f97316' },
]

const actualites = [
  { emoji: '🔬', text: 'Centre de référence neurologique en Tunisie' },
  { emoji: '💉', text: 'Nouveaux anticorps monoclonaux : réduction de 95% des poussées' },
  { emoji: '🎗️', text: 'Journée mondiale de la SEP — 30 mai 2025' },
  { emoji: '🤖', text: 'L\'IA prédit les poussées avec 89% de précision' },
]

export default function Home({ navigation }) {
  const formes = [
    { pct: '85%', nom: 'SEP Récurrente-Rémittente (RRMS)', desc: 'Poussées suivies de rémissions partielles ou complètes', color: '#4f46e5' },
    { pct: '10%', nom: 'SEP Secondairement Progressive (SPMS)', desc: 'Évolution progressive après une phase récurrente-rémittente', color: '#0891b2' },
    { pct: '5%', nom: 'SEP Primaire Progressive (PPMS)', desc: 'Aggravation progressive dès le début', color: '#d97706' },
  ]

  const comprendre = [
    { icon: '🧠', titre: "Qu'est-ce que la SEP ?", desc: "La sclérose en plaques est une maladie auto-immune qui attaque la gaine de myéline." },
    { icon: '⚡', titre: 'Symptômes principaux', desc: 'Fatigue extrême, troubles de la vision, engourdissements, difficultés motrices.' },
    { icon: '💊', titre: 'Traitements disponibles', desc: 'Plus de 20 traitements de fond disponibles : immunomodulateurs, anticorps monoclonaux.' },
    { icon: '❤️', titre: 'Vivre avec la SEP', desc: "Un diagnostic précoce et un suivi régulier permettent de maintenir une bonne qualité de vie." },
  ]

  const historique = [
    { year: '1868', text: 'Jean-Martin Charcot décrit la SEP pour la première fois' },
    { year: '1960', text: 'Premiers traitements par corticostéroïdes' },
    { year: '1993', text: 'Premier traitement de fond approuvé (Interféron bêta-1b)' },
    { year: '2004', text: 'Introduction du Natalizumab, thérapie ciblée' },
    { year: '2010', text: 'Premier traitement oral (Fingolimod) approuvé' },
    { year: '2017', text: 'Ocrelizumab: premier traitement pour la PPMS' },
    { year: '2024', text: 'Thérapies par cellules souches en essais cliniques avancés' },
  ]

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image source={require('../../assets/images/logo_sep.jpeg')} style={styles.logoImg} />
          <View>
            <Text style={styles.logo}>
              <Text style={styles.logoNeuro}>Neuro </Text>
              <Text style={styles.logoPredict}>Predict MS</Text>
            </Text>
            <Text style={styles.logoSub}>IA MÉDICALE AVANCÉE</Text>
          </View>
        </View>
      </View>

      {/* HERO */}
      <View style={styles.hero}>
        <View style={styles.heroBadge}>
          <Text style={styles.heroBadgeText}>✨ Neuro Predict MS — IA Médicale Avancée</Text>
        </View>
        <Text style={styles.heroTitle}>
          Comprendre la{' '}
          <Text style={styles.heroTitlePurple}>Sclérose en Plaques</Text>
        </Text>
        <Text style={styles.heroDesc}>
          Accédez aux dernières actualités, statistiques mondiales et avancées de la recherche. Notre plateforme utilise l'intelligence artificielle pour améliorer le diagnostic et le suivi de la SEP.
        </Text>
        <View style={styles.heroButtons}>
          <TouchableOpacity style={styles.btnPrimary} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.btnPrimaryText}>Se connecter →</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnSecondary} onPress={() => navigation.navigate('Inscription')}>
            <Text style={styles.btnSecondaryText}>S'inscrire</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.statsRow}>
          {[
            { value: '2,8M', label: 'Patients dans le monde' },
            { value: '99.3%', label: 'Précision IA' },
            { value: '200+', label: 'Pays concernés' },
          ].map((s, i) => (
            <View key={i} style={styles.statItem}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* LA SEP EN CHIFFRES */}
      <View style={styles.section}>
        <View style={styles.sectionBadge}>
          <Text style={styles.sectionBadgeText}>📊 Données mondiales</Text>
        </View>
        <Text style={styles.sectionTitle}>La SEP en chiffres</Text>
        <Text style={styles.sectionDesc}>Statistiques issues de l'Atlas de la SEP (MSIF) et de l'OMS</Text>
        <View style={styles.chiffresGrid}>
          {[
            { icon: '🌍', val: '2,8M', label: 'Personnes atteintes dans le monde', sub: "Source: Atlas of MS (2020)" },
            { icon: '👥', val: '3:1', label: 'Ratio femmes / hommes', sub: 'Les femmes sont 3x plus touchées' },
            { icon: '📅', val: '20-40', label: 'Âge moyen au diagnostic', sub: 'Jeunes adultes principalement' },
            { icon: '🌐', val: '200+', label: 'Pays concernés', sub: 'Présente sur tous les continents' },
            { icon: '📈', val: '143/100k', label: 'Prévalence en Europe', sub: 'Pour 100 000 personnes' },
            { icon: '🔬', val: '~130k', label: 'Nouveaux cas / an', sub: 'Augmentation depuis 2013' },
          ].map((c, i) => (
            <View key={i} style={[styles.chiffreCard, i === 1 && styles.chiffreCardHighlight]}>
              <Text style={styles.chiffreIcon}>{c.icon}</Text>
              <Text style={[styles.chiffreVal, i === 1 && styles.chiffreValHighlight]}>{c.val}</Text>
              <Text style={styles.chiffreLabel}>{c.label}</Text>
              <Text style={styles.chiffreSub}>{c.sub}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* LES FORMES */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Les formes de la maladie</Text>
        {formes.map((f, i) => (
          <View key={i} style={styles.formeCard}>
            <View style={[styles.formeBar, { backgroundColor: f.color }]} />
            <View style={styles.formeContent}>
              <Text style={[styles.formePct, { color: f.color }]}>{f.pct}</Text>
              <View style={styles.formeBadge}><Text style={styles.formeBadgeText}>des cas</Text></View>
              <Text style={styles.formeNom}>{f.nom}</Text>
              <Text style={styles.formeDesc}>{f.desc}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* COMPRENDRE & AGIR */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Comprendre & Agir</Text>
        <Text style={styles.sectionDesc}>La sclérose en plaques est une maladie neurologique chronique.</Text>
        {comprendre.map((c, i) => (
          <View key={i} style={styles.comprendreCard}>
            <Text style={styles.comprendreIcon}>{c.icon}</Text>
            <View style={styles.comprendreText}>
              <Text style={styles.comprendre_titre}>{c.titre}</Text>
              <Text style={styles.comprendreDesc}>{c.desc}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* HISTOIRE */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Histoire de la SEP</Text>
        <Text style={styles.sectionDesc}>Les grandes étapes dans la compréhension et le traitement</Text>
        {historique.map((h, i) => (
          <View key={i} style={styles.timelineItem}>
            <View style={styles.timelineDot} />
            <Text style={styles.timelineYear}>{h.year}</Text>
            <Text style={styles.timelineText}>{h.text}</Text>
          </View>
        ))}
      </View>

      {/* ACTUALITES TICKER */}
      <View style={styles.tickerSection}>
        <View style={styles.tickerBadge}>
          <Text style={styles.tickerBadgeText}>TN 🤍 SEP EN TUNISIE & DANS LE MONDE</Text>
        </View>
        <Text style={styles.sectionTitle}>Actualités & <Text style={styles.heroTitlePurple}>Ressources</Text></Text>
        <Text style={styles.sectionDesc}>Découvrez les organisations tunisiennes et internationales qui se battent contre la Sclérose En Plaques.</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.ticker}>
          {actualites.map((a, i) => (
            <View key={i} style={styles.tickerItem}>
              <Text style={styles.tickerText}>{a.emoji} {a.text}</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* ORGANISATIONS */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🌐 Organisations & Ressources</Text>
        {organisations.map((org, i) => (
          <View key={i} style={styles.orgCard}>
            <View style={styles.orgTop}>
              <View style={styles.orgLeft}>
                <Text style={styles.orgNom}>{org.nom}</Text>
                <Text style={[styles.orgSoustitre, { color: org.couleur }]}>{org.soustitre}</Text>
              </View>
              <View style={[styles.paysBadge, org.pays === 'Tunisie' ? styles.paysTunisie : styles.paysInternational]}>
                <Text style={styles.paysText}>{org.pays}</Text>
              </View>
            </View>
            <Text style={styles.orgDesc}>{org.desc}</Text>
            <View style={styles.orgBottom}>
              <Text style={styles.orgUrl}>🔗 {org.url.replace('https://', '')}</Text>
              <TouchableOpacity style={styles.visitBtn} onPress={() => Linking.openURL(org.url)}>
                <Text style={styles.visitBtnText}>Visiter →</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>

      {/* CTA */}
      <View style={styles.cta}>
        <Text style={styles.ctaTitle}>Rejoignez Neuro Predict MS</Text>
        <Text style={styles.ctaDesc}>Professionnels de santé, accédez à des outils IA avancés pour le diagnostic et le suivi de vos patients.</Text>
        <TouchableOpacity style={styles.ctaBtnWhite} onPress={() => navigation.navigate('Inscription')}>
          <Text style={styles.ctaBtnWhiteText}>Créer un compte →</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.ctaBtnOutline} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.ctaBtnOutlineText}>Se connecter</Text>
        </TouchableOpacity>
      </View>

      {/* FOOTER */}
      <View style={styles.footer}>
        <View style={styles.footerTop}>
        <Image source={require('../../assets/images/logo_sep.jpeg')} style={styles.footerLogoImg} />
          <Text style={styles.footerLogo}>Neuro Predict MS</Text>
        </View>
        <Text style={styles.footerDesc}>Plateforme d'intelligence artificielle médicale pour le diagnostic, le suivi et la recherche sur la sclérose en plaques.</Text>
        <View style={styles.footerDivider} />
        <View style={styles.footerTeam}>
          <Image source={require('../../assets/images/logo_team.png')} style={styles.teamLogoImg} />
          <View>
            <Text style={styles.footerDevBy}>DÉVELOPPÉ PAR</Text>
            <Text style={styles.footerTeamName}>Neuronova</Text>
            <Text style={styles.footerTeamDesc}>Groupe d'innovation en neurologie et intelligence artificielle</Text>
          </View>
        </View>
        <Text style={styles.footerCopy}>© 2026 Neuro Predict MS. Données issues de l'Atlas of MS & WHO.</Text>
      </View>

    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fc' },
  header: { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 16, backgroundColor: '#fff', borderBottomWidth: 0.5, borderBottomColor: '#e2e8f0' },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logoImg: { width: 36, height: 36, borderRadius: 8 },
  logo: { fontSize: 18, fontWeight: 'bold' },
  logoNeuro: { color: '#1e293b' },
  logoPredict: { color: '#4f46e5' },
  logoSub: { fontSize: 9, color: '#94a3b8', letterSpacing: 1 },
  hero: { padding: 24, backgroundColor: '#f0f4ff' },
  heroBadge: { backgroundColor: '#eef2ff', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, alignSelf: 'flex-start', marginBottom: 16, borderWidth: 0.5, borderColor: '#c7d2fe' },
  heroBadgeText: { color: '#4f46e5', fontSize: 12, fontWeight: '500' },
  heroTitle: { fontSize: 26, fontWeight: 'bold', color: '#1e293b', lineHeight: 34, marginBottom: 12 },
  heroTitlePurple: { color: '#4f46e5' },
  heroDesc: { fontSize: 13, color: '#64748b', lineHeight: 22, marginBottom: 24 },
  heroButtons: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  btnPrimary: { backgroundColor: '#4f46e5', borderRadius: 10, paddingHorizontal: 20, paddingVertical: 12, flex: 1, alignItems: 'center' },
  btnPrimaryText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  btnSecondary: { backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 20, paddingVertical: 12, flex: 1, alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0' },
  btnSecondaryText: { color: '#1e293b', fontWeight: '600', fontSize: 14 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  statItem: { alignItems: 'center', flex: 1 },
  statValue: { fontSize: 18, fontWeight: 'bold', color: '#1e293b' },
  statLabel: { fontSize: 10, color: '#64748b', textAlign: 'center', marginTop: 2 },
  section: { padding: 24, backgroundColor: '#fff', marginTop: 8 },
  sectionBadge: { backgroundColor: '#f1f5f9', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, alignSelf: 'center', marginBottom: 12 },
  sectionBadgeText: { color: '#475569', fontSize: 12 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#1e293b', textAlign: 'center', marginBottom: 8 },
  sectionDesc: { fontSize: 13, color: '#64748b', textAlign: 'center', lineHeight: 20, marginBottom: 20 },
  chiffresGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chiffreCard: { width: (width - 58) / 2, backgroundColor: '#f8f9fc', borderRadius: 12, padding: 12, borderWidth: 0.5, borderColor: '#e2e8f0' },
  chiffreCardHighlight: { backgroundColor: '#fff', borderColor: '#c7d2fe', elevation: 3 },
  chiffreIcon: { fontSize: 18, marginBottom: 6 },
  chiffreVal: { fontSize: 20, fontWeight: 'bold', color: '#1e293b', marginBottom: 4 },
  chiffreValHighlight: { color: '#4f46e5' },
  chiffreLabel: { fontSize: 11, color: '#374151', fontWeight: '500', marginBottom: 4 },
  chiffreSub: { fontSize: 10, color: '#94a3b8' },
  formeCard: { borderRadius: 12, backgroundColor: '#f8f9fc', marginBottom: 12, overflow: 'hidden', borderWidth: 0.5, borderColor: '#e2e8f0', flexDirection: 'row' },
  formeBar: { width: 4 },
  formeContent: { padding: 14, flex: 1 },
  formePct: { fontSize: 22, fontWeight: 'bold' },
  formeBadge: { backgroundColor: '#f1f5f9', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2, alignSelf: 'flex-start', marginVertical: 4 },
  formeBadgeText: { fontSize: 11, color: '#64748b' },
  formeNom: { fontSize: 13, fontWeight: '600', color: '#1e293b', marginBottom: 4 },
  formeDesc: { fontSize: 12, color: '#64748b', lineHeight: 18 },
  comprendreCard: { flexDirection: 'row', backgroundColor: '#f8f9fc', borderRadius: 12, padding: 14, marginBottom: 12, borderWidth: 0.5, borderColor: '#e2e8f0', alignItems: 'flex-start' },
  comprendreIcon: { fontSize: 22, marginRight: 12 },
  comprendreText: { flex: 1 },
  comprendre_titre: { fontSize: 14, fontWeight: '600', color: '#1e293b', marginBottom: 4 },
  comprendreDesc: { fontSize: 12, color: '#64748b', lineHeight: 18 },
  timelineItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 14, paddingLeft: 8 },
  timelineDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#4f46e5', marginRight: 10, marginTop: 4 },
  timelineYear: { fontSize: 13, fontWeight: 'bold', color: '#4f46e5', width: 40, marginRight: 10 },
  timelineText: { fontSize: 13, color: '#374151', flex: 1, lineHeight: 20 },
  tickerSection: { padding: 24, backgroundColor: '#f0f4ff', marginTop: 8 },
  tickerBadge: { backgroundColor: '#1e293b', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, alignSelf: 'center', marginBottom: 16 },
  tickerBadgeText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  ticker: { maxHeight: 50, marginTop: 8 },
  tickerItem: { backgroundColor: '#fff', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, marginRight: 12, borderWidth: 0.5, borderColor: '#e2e8f0' },
  tickerText: { fontSize: 13, color: '#374151', fontWeight: '500' },
  orgCard: { backgroundColor: '#f8f9fc', borderRadius: 12, padding: 16, marginBottom: 14, borderWidth: 0.5, borderColor: '#e2e8f0' },
  orgTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  orgLeft: { flex: 1, marginRight: 8 },
  orgNom: { fontSize: 15, fontWeight: '700', color: '#1e293b', marginBottom: 2 },
  orgSoustitre: { fontSize: 12, fontWeight: '500' },
  paysBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
  paysTunisie: { backgroundColor: '#fef2f2' },
  paysInternational: { backgroundColor: '#fff7ed' },
  paysText: { fontSize: 11, fontWeight: '600', color: '#dc2626' },
  orgDesc: { fontSize: 12, color: '#64748b', lineHeight: 18, marginBottom: 12 },
  orgBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orgUrl: { fontSize: 11, color: '#94a3b8', flex: 1 },
  visitBtn: { backgroundColor: '#fff', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: '#e2e8f0' },
  visitBtnText: { fontSize: 13, color: '#4f46e5', fontWeight: '600' },
  cta: { margin: 16, backgroundColor: '#4f46e5', borderRadius: 16, padding: 24, alignItems: 'center' },
  ctaTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff', textAlign: 'center', marginBottom: 8 },
  ctaDesc: { fontSize: 13, color: '#c7d2fe', textAlign: 'center', lineHeight: 20, marginBottom: 20 },
  ctaBtnWhite: { backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 24, paddingVertical: 12, marginBottom: 10, width: '100%', alignItems: 'center' },
  ctaBtnWhiteText: { color: '#4f46e5', fontWeight: '600', fontSize: 14 },
  ctaBtnOutline: { borderWidth: 1, borderColor: '#fff', borderRadius: 10, paddingHorizontal: 24, paddingVertical: 12, width: '100%', alignItems: 'center' },
  ctaBtnOutlineText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  footer: { backgroundColor: '#0f172a', padding: 24 },
  footerTop: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  footerLogoImg: { width: 28, height: 28, borderRadius: 6 },
  footerLogo: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
  footerDesc: { fontSize: 12, color: '#94a3b8', lineHeight: 18, marginBottom: 16 },
  footerDivider: { height: 0.5, backgroundColor: '#334155', marginBottom: 16 },
  footerTeam: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 16, backgroundColor: '#1e293b', borderRadius: 12, padding: 14 },
  teamLogoImg: { width: 48, height: 48, borderRadius: 24 },
  footerDevBy: { fontSize: 10, color: '#94a3b8', letterSpacing: 1, marginBottom: 2 },
  footerTeamName: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 2 },
  footerTeamDesc: { fontSize: 11, color: '#94a3b8' },
  footerCopy: { fontSize: 11, color: '#475569', textAlign: 'center' },
})