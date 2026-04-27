import { createStackNavigator } from '@react-navigation/stack'
import { AuthProvider, useAuth } from '../src/context/AuthContext'
import Home from '../src/screens/Home'
import Login from '../src/screens/Login'
import Inscription from '../src/screens/Inscription'
import Dashboard from '../src/screens/Dashboard'
import Patients from '../src/screens/Patients'
import Agenda from '../src/screens/Agenda'
import RapportsRecus from '../src/screens/RapportsRecus'
import ChatIA from '../src/screens/ChatIA'
import MonDossier from '../src/screens/MonDossier'
import MonEvolution from '../src/screens/MonEvolution'
import RendezVous from '../src/screens/RendezVous'
import MesRapports from '../src/screens/MesRapports'
import Actualites from '../src/screens/Actualites'
import IRMQueue from '../src/screens/IRMQueue'
import DashboardAdmin from '../src/screens/admin/DashboardAdmin'
import AdminUtilisateurs from '../src/screens/admin/AdminUtilisateurs'
import AdminValidations from '../src/screens/admin/AdminValidations'
import AdminLiaisons from '../src/screens/admin/AdminLiaisons'
import AdminParametres from '../src/screens/admin/AdminParametres'
import PatientDetail from '../src/screens/PatientDetail'
import Visites from '../src/screens/Visites'
import RapportDetail from '../src/screens/RapportDetail'
import Analyses from '../src/screens/Analyses'
import Resultats from '../src/screens/Resultats'
const Stack = createStackNavigator()

function AppNavigator() {
  const { user, loading } = useAuth()

  if (loading) return null

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <>
          {user.role === 'admin' ? (
            <Stack.Screen name="Dashboard" component={DashboardAdmin} />
          ) : (
            <Stack.Screen name="Dashboard" component={Dashboard} />
          )}
          <Stack.Screen name="Patients" component={Patients} />
          <Stack.Screen name="Agenda" component={Agenda} />
          <Stack.Screen name="Rapports" component={RapportsRecus} />
          <Stack.Screen name="ChatIA" component={ChatIA} />
          <Stack.Screen name="MonDossier" component={MonDossier} />
          <Stack.Screen name="MonEvolution" component={MonEvolution} />
          <Stack.Screen name="RendezVous" component={RendezVous} />
          <Stack.Screen name="MesRapports" component={MesRapports} />
          <Stack.Screen name="Actualites" component={Actualites} />
          <Stack.Screen name="IRMQueue" component={IRMQueue} />
          <Stack.Screen name="AdminUtilisateurs" component={AdminUtilisateurs} />
          <Stack.Screen name="AdminValidations" component={AdminValidations} />
          <Stack.Screen name="AdminLiaisons" component={AdminLiaisons} />
          <Stack.Screen name="AdminParametres" component={AdminParametres} />
          <Stack.Screen name="Visites" component={Visites} />
          <Stack.Screen name="PatientDetail" component={PatientDetail} />
          <Stack.Screen name="RapportDetail" component={RapportDetail} />
          <Stack.Screen name="Analyses" component={Analyses} />
          <Stack.Screen name="Resultats" component={Resultats} />
        </>
      ) : (
        <>
          <Stack.Screen name="Home" component={Home} />
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Inscription" component={Inscription} />
        </>
      )}
    </Stack.Navigator>
  )
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  )
}