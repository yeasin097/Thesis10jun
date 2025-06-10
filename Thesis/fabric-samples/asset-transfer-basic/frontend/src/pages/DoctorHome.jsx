import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import PatientList from '../components/PatientList';

function DoctorHome() {
  const [view, setView] = useState('patient');
  const navigate = useNavigate();

  const handleCreateEhr = () => navigate('/doctor/create-ehr');
  const handlePatientList = () => setView('patient');

  return (
    <div className="min-vh-100 bg-light" style={{ fontFamily: 'Poppins, sans-serif' }}>
      <Navbar onPatientList={handlePatientList} onCreateEhr={handleCreateEhr} />
      <div className="container pt-5">
        {view === 'patient' && <PatientList />}
      </div>
    </div>
  );
}

export default DoctorHome;