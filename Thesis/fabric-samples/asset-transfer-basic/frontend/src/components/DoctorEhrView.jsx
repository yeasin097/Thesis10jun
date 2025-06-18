import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

function DoctorEhrView() {
  const location = useLocation();
  const navigate = useNavigate();
  const patient = location.state?.patient;
  const [ehrData, setEhrData] = useState([]);
  const [patientInfo, setPatientInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (patient) {
      const fetchEhrs = async () => {
        setLoading(true);
        try {
          const response = await axios.post('http://localhost:8000/patient/ehrs', { nid_no: patient.nid_no }, {
            headers: { 'Content-Type': 'application/json' },
          });
          const ehrs = Array.isArray(response.data.ehrs) ? response.data.ehrs : [];
          const normalizedEhrs = ehrs.map(ehr => ({
            ...ehr,
            details: typeof ehr.details === 'string' ? JSON.parse(ehr.details) : ehr.details,
          }));
          setEhrData(normalizedEhrs);
          if (normalizedEhrs.length > 0) {
            const firstEhrDetails = normalizedEhrs[0].details;
            setPatientInfo({
              bloodGroup: firstEhrDetails.blood_group || 'Unknown',
              dateOfBirth: firstEhrDetails.date_of_birth || 'Unknown',
              address: firstEhrDetails.address || 'Unknown',
              previousDiagnoses: extractPreviousDiagnoses(normalizedEhrs),
            });
          }
          setError(null);
        } catch (err) {
          setError(err.response?.data?.error || 'Failed to fetch EHRs.');
          setEhrData([]);
        } finally {
          setLoading(false);
        }
      };
      fetchEhrs();
    }
  }, [patient]);

  const extractPreviousDiagnoses = (ehrs) => {
    // Map EHRs to an array of { diagnosis, visit_date } objects, filter out missing diagnoses
    const diagnosesWithDates = ehrs
      .filter(ehr => ehr.details?.diagnosis && ehr.details?.visit_date)
      .map(ehr => ({
        diagnosis: ehr.details.diagnosis,
        visit_date: ehr.details.visit_date,
      }));
    
    // Remove duplicates based on diagnosis while keeping the latest visit_date
    const uniqueDiagnoses = [];
    const seenDiagnoses = new Set();
    
    for (const entry of diagnosesWithDates.reverse()) { // Reverse to prioritize latest dates
      if (!seenDiagnoses.has(entry.diagnosis)) {
        seenDiagnoses.add(entry.diagnosis);
        uniqueDiagnoses.push(entry);
      }
    }
    
    return uniqueDiagnoses.reverse(); // Reverse back to maintain original order
  };

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth || dateOfBirth === 'Unknown') return 'Unknown';
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };

  const handleCreateEhr = () => navigate('/doctor/create-ehr', { state: { patient } });

  if (!patient) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ background: 'transparent' }}>
        <div className="card border-0 shadow-lg" style={{ 
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px'
        }}>
          <div className="card-body p-4">
            <h3 className="text-primary fw-semibold mb-0">No patient selected</h3>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 py-5" style={{ 
      fontFamily: 'Poppins, sans-serif',
      background: 'transparent'
    }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12">
            <div className="text-center mb-5">
              <h1 className="display-4 text-white fw-bold mb-3" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.7)' }}>
                Patient EHR Records
              </h1>
              <div className="card border-0 shadow-lg d-inline-block" style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                borderRadius: '15px'
              }}>
                <div className="card-body px-4 py-3">
                  <p className="text-dark mb-0" style={{ fontSize: '1.1rem' }}>
                    <strong>{patient.name}</strong> (NID: {patient.nid_no})
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {patientInfo && (
          <div className="row justify-content-center mb-5">
            <div className="col-12 col-lg-10">
              <div className="card border-0 shadow-lg" style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                borderRadius: '20px'
              }}>
                <div className="card-body p-4">
                  <h3 className="h4 fw-semibold text-primary mb-4">Patient Information</h3>
                  <div className="row">
                    <div className="col-md-6 mb-4">
                      <p className="fw-semibold text-muted"><i className="bi bi-person-fill me-2 text-primary"></i>Name: {patient.name || 'N/A'}</p>
                      <p className="fw-semibold text-muted"><i className="bi bi-droplet-fill me-2 text-primary"></i>Blood Group: {patientInfo.bloodGroup}</p>
                      <p className="fw-semibold text-muted"><i className="bi bi-calendar-fill me-2 text-primary"></i>Age: {calculateAge(patientInfo.dateOfBirth)} years</p>
                      <p className="fw-semibold text-muted"><i className="bi bi-cake-fill me-2 text-primary"></i>Date of Birth: {patientInfo.dateOfBirth}</p>
                    </div>
                    <div className="col-md-6 mb-4">
                      <p className="fw-semibold text-muted"><i className="bi bi-geo-alt-fill me-2 text-primary"></i>Address: {patientInfo.address}</p>
                      <p className="fw-semibold text-muted"><i className="bi bi-clipboard-fill me-2 text-primary"></i>Previous Diagnoses:</p>
                      {patientInfo.previousDiagnoses.length > 0 ? (
                        <ul className="list-unstyled ps-4">
                          {patientInfo.previousDiagnoses.map((entry, idx) => (
                            <li key={idx} className="text-muted">
                              • {entry.diagnosis} <span className="text-primary fw-light">({new Date(entry.visit_date).toLocaleDateString()})</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-muted ps-4">No previous diagnoses</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="row justify-content-center">
          <div className="col-12 col-lg-10">
            <div className="card border-0 shadow-lg" style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              borderRadius: '20px'
            }}>
              <div className="card-body p-4">
                <h3 className="h4 fw-semibold text-primary mb-4">EHR Records</h3>
                {loading && <div className="text-center text-muted mb-4"><i className="bi bi-hourglass-split me-2"></i>Loading EHRs...</div>}
                {error && (
                  <div className="alert alert-danger shadow-sm mb-4 rounded-3 d-flex align-items-center" style={{ backgroundColor: '#fce8e6', border: '1px solid #dc3545' }}>
                    <i className="bi bi-x-circle-fill me-2 text-danger"></i>{error}
                  </div>
                )}
                {!loading && !error && ehrData.length === 0 && (
                  <div className="text-center">
                    <p className="text-muted mb-4">No EHR records found for this patient.</p>
                    <button
                      className="btn text-white fw-semibold px-5 py-3"
                      onClick={handleCreateEhr}
                      style={{
                        background: 'linear-gradient(90deg, #007bff, #0056b3)',
                        borderRadius: '15px',
                        transition: 'transform 0.3s, box-shadow 0.3s',
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'scale(1.05)';
                        e.target.style.boxShadow = '0 8px 20px rgba(0, 123, 255, 0.3)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'scale(1)';
                        e.target.style.boxShadow = 'none';
                      }}
                    >
                      Create New EHR
                    </button>
                  </div>
                )}
                {!loading && !error && ehrData.length > 0 && (
                  <div>
                    {ehrData.map((ehr, index) => (
                      <div key={index} className="card shadow-lg rounded-4 mb-4 border-0" style={{ transition: 'transform 0.3s' }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                        <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center fw-semibold rounded-top-4 p-3">
                          <span>EHR ID: {ehr.ehr_id.substring(0, 12)}...</span>
                          <span className="badge bg-light text-primary">
                            {new Date(ehr.details.visit_date || Date.now()).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="card-body p-4">
                          <div className="row mb-3">
                            <div className="col-md-6">
                              <p className="fw-semibold text-muted"><i className="bi bi-person-fill me-2 text-primary"></i>Doctor ID: {ehr.doctor_id || 'N/A'}</p>
                              <p className="fw-semibold text-muted"><i className="bi bi-hospital-fill me-2 text-primary"></i>Hospital ID: {ehr.hospital_id || 'N/A'}</p>
                            </div>
                            <div className="col-md-6">
                              <p className="fw-semibold text-muted"><i className="bi bi-clipboard-fill me-2 text-primary"></i>Diagnosis: {ehr.details?.diagnosis || 'N/A'}</p>
                              <p className="fw-semibold text-muted"><i className="bi bi-capsule me-2 text-primary"></i>Medications:</p>
                              <ul className="list-unstyled ps-4">
                                {ehr.details?.medications?.length > 0 ? (
                                  ehr.details.medications.map((med, i) => (
                                    <li key={i} className="text-muted">{med || 'Unknown'}</li>
                                  ))
                                ) : (
                                  <li className="text-muted">No medications listed</li>
                                )}
                              </ul>
                            </div>
                          </div>
                          <div className="card mb-3 border-light shadow-sm rounded-3">
                            <div className="card-header bg-light fw-semibold p-3">Test Results</div>
                            <div className="card-body p-3">
                              <ul className="list-group list-group-flush">
                                <li className="list-group-item text-muted"><strong>Blood Pressure:</strong> {ehr.details?.test_results?.blood_pressure || 'N/A'}</li>
                                <li className="list-group-item text-muted"><strong>Allergy:</strong> {ehr.details?.test_results?.allergy || 'N/A'}</li>
                                <li className="list-group-item text-muted"><strong>Cholesterol:</strong> {ehr.details?.test_results?.cholesterol || 'N/A'}</li>
                              </ul>
                            </div>
                          </div>
                          <p className="fw-semibold text-muted"><i className="bi bi-chat-square-text-fill me-2 text-primary"></i>Notes: {ehr.details?.notes || 'N/A'}</p>
                        </div>
                      </div>
                    ))}
                    <div className="text-center mt-5">
                      <button
                        className="btn text-white fw-semibold px-5 py-3"
                        onClick={handleCreateEhr}
                        style={{
                          background: 'linear-gradient(90deg, #007bff, #0056b3)',
                          borderRadius: '15px',
                          transition: 'transform 0.3s, box-shadow 0.3s',
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.transform = 'scale(1.05)';
                          e.target.style.boxShadow = '0 8px 20px rgba(0, 123, 255, 0.3)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = 'scale(1)';
                          e.target.style.boxShadow = 'none';
                        }}
                      >
                        Create New EHR
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DoctorEhrView;