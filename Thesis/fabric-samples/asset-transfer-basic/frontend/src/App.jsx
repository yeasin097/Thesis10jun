import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Home from './pages/Home';
import PatientHome from './pages/PatientHome';
import PatientLogin from './pages/PatientLogin';
import DoctorHome from './pages/DoctorHome';
import ResearcherHome from './pages/ResearcherHome';
import ResearcherHome2 from './pages/ResearcherHome2';
import ResearcherHome3 from './pages/ResearcherHome3';
import CreateEhr from './pages/CreateEhr';
import DoctorEhrView from './components/DoctorEhrView'

function App() {
  return (
    <div className="min-vh-100">
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/patient/home" element={<PatientHome />} />
        <Route path="/patient/login" element={<PatientLogin />} />
        <Route path="/doctor" element={<DoctorHome />} />
        <Route path="/doctor/create-ehr" element={<CreateEhr />} />
        <Route path="/doctor/patient-ehrs" element={<DoctorEhrView />} />
        <Route path="/researcher" element={<ResearcherHome />} />
        <Route path="/researcher2" element={<ResearcherHome2 />} />
        <Route path="/researcher3" element={<ResearcherHome3 />} />
      </Routes>
    </div>
  );
}

export default App;