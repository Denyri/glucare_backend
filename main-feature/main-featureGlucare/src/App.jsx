import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import Dashboard from './pages/Dashboard'
import Analisis from './pages/Analisis';
import Kuesioner from './pages/Kuesioner';
import ModeLab from './pages/ModeLab';
import HasilAnalisis from './pages/HasilAnalisis';
import Rencana90Hari from './pages/Rencana90-Hari';
import Evaluasi from './pages/Evaluasi';
import Pencapaian from './pages/Pencapaian';
import SettingAndProfile from './pages/SettingAndProfile';
import EditProfile from './pages/EditProfile';
import BantuandanDukungan from './pages/BantuandanDukungan';
import KebijakanPrivasi from './pages/KebijakanPrivasi';
import UbahPassword from './pages/UbahPassword';
import WelcomePage from './pages/WelcomePage';
import Tentang from './pages/Tentang';
import FiturUtama from './pages/FiturUtama';
import CaraKerja from './pages/CaraKerja';
import HubungiKami from './pages/HubungiKami';
import Auth from './pages/Auth';
import InputData from './pages/InputData';
import StabilisasiDasar from './pages/StabilisasiDasar';
import OptimasiMetabolik from './pages/OptimasiMetabolik';
import Konsolidasi from './pages/Konsolidasi';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import ForgotPassword from './pages/ForgetPassword';

function App() {

  return (

    <>

      <ScrollToTop />
    
      <Routes>
        <Route element={<PublicRoute />}>
          <Route path='/' element={<WelcomePage />} />
          <Route path='/tentang' element={<Tentang />}/>
          <Route path='/fitur' element={<FiturUtama />}/>
          <Route path='/cara-kerja' element={<CaraKerja />}/>
          <Route path='/hubungi'element={<HubungiKami />}/>
          <Route path='/login' element={<Auth />}/>
          <Route path='/forgot-password' element={<ForgotPassword />}/>
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path='/input' element={<InputData />}/>
          <Route path='/beranda' element={<Dashboard />} />
          <Route path='/analisis' element={<Analisis />} />
          <Route path="/kuesioner" element={<Kuesioner />} />
          <Route path="/modeLab" element={<ModeLab />}/>
          <Route path="/hasil" element={<HasilAnalisis />}/>
          <Route path="/rencana" element={<Rencana90Hari />}/>
          <Route path="/evaluasi" element={<Evaluasi />}/>
          <Route path="/pencapaian" element={<Pencapaian />}/>
          <Route path="/stabilisasi" element={<StabilisasiDasar />}/>
          <Route path="/optimasi" element={<OptimasiMetabolik />}/>
          <Route path="/konsolidasi" element={<Konsolidasi />}/>
          <Route path="/pengaturan" element={<SettingAndProfile />}/>
          <Route path="/editprofile" element={<EditProfile />}/>
          <Route path="/bantuan-dan-dukungan" element={<BantuandanDukungan/>}/>
          <Route path="/privasi-layanan" element={<KebijakanPrivasi/>}/>
          <Route path="/ubahpassword" element={<UbahPassword/>}/>
        </Route>
      </Routes> 
    </> 
  );
}

export default App;

