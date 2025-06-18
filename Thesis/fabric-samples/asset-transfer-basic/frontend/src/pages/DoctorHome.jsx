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
    <div className="min-vh-100" style={{ 
      fontFamily: 'Poppins, sans-serif',
      background: 'transparent'
    }}>
      <Navbar onPatientList={handlePatientList} onCreateEhr={handleCreateEhr} />
      <div className="container pt-5">
        <div className="row justify-content-center">
          <div className="col-12">
            <div className="text-center mb-5">
              
            </div>
          </div>
        </div>
        {view === 'patient' && (
          <div className="row justify-content-center">
            <div className="col-12 col-lg-10">
              <div className="card border-0 shadow-lg" style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                borderRadius: '20px'
              }}>
                <div className="card-body p-4">
                  <PatientList />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DoctorHome;