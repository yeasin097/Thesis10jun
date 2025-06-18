import { useLocation } from 'react-router-dom';
import EhrForm from '../components/EhrForm';

function CreateEhr() {
  const { state } = useLocation();
  const patient = state?.patient;

  return (
    <div className="min-vh-100 py-5" style={{ 
      fontFamily: 'Poppins, sans-serif',
      background: 'transparent'
    }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12">
            <div className="text-center mb-5">
              {patient && (
                <div className="card border-0 shadow-lg d-inline-block" style={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '15px'
                }}>
                  <div className="card-body px-4 py-3">
                    <p className="text-dark mb-0" style={{ fontSize: '1.1rem' }}>
                      Creating EHR for <strong>{patient.name}</strong> (NID: {patient.nid_no})
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="row justify-content-center">
          <div className="col-12 col-lg-10">
            <div className="card border-0 shadow-lg" style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              borderRadius: '20px'
            }}>
              <div className="card-body p-4">
                <EhrForm doctorId="d0001" hospitalId="h001" nidNo={patient?.nid_no} patient={patient} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateEhr;