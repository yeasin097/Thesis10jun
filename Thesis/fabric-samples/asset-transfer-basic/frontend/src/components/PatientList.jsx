import { useState, useEffect } from 'react';
import axios from 'axios';
import PatientCard from './PatientCard';

function PatientList() {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await axios.get('http://localhost:8000/patient/all');
        const data = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
        const patientList = data.map(item => JSON.parse(item));
        setPatients(patientList);
        setFilteredPatients([]); // Initialize with empty array to show no patients initially
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch patient data.');
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredPatients([]); // Show no patients if search term is empty
    } else {
      const filtered = patients.filter(
        patient =>
          patient.name.toLowerCase() === searchTerm.toLowerCase() ||
          patient.nid_no === searchTerm
      );
      setFilteredPatients(filtered);
    }
  }, [searchTerm, patients]);

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center py-5">
        <div className="card border-0 shadow-lg" style={{ 
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px'
        }}>
          <div className="card-body p-4 text-center">
            <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}></div>
            <span className="ms-3 text-primary fs-5">Loading patients...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="d-flex align-items-center justify-content-center py-5">
        <div className="card border-0 shadow-lg" style={{ 
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px'
        }}>
          <div className="card-body p-4 text-center">
            <i className="bi bi-exclamation-triangle text-danger" style={{ fontSize: '2rem' }}></i>
            <span className="ms-3 text-danger fs-5">{error}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-4" style={{ background: 'transparent' }}>
      <div className="container">
        <div className="text-center mb-5">
          <h2 className="h3 text-primary fw-bold mb-4">
            <i className="bi bi-people me-2"></i>
            Patient Search
          </h2>
          <div className="row justify-content-center">
            <div className="col-md-8 col-lg-6">
              <div className="position-relative">
                <input
                  type="text"
                  className="form-control form-control-lg rounded-pill ps-5 shadow-sm"
                  placeholder="Search by name or NID (exact match)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ 
                    border: '2px solid #007bff',
                    fontSize: '1.1rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)'
                  }}
                />
                <i
                  className="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-4 text-primary"
                  style={{ fontSize: '1.2rem' }}
                ></i>
              </div>
            </div>
          </div>
        </div>
        
        {filteredPatients.length === 0 && searchTerm.trim() !== '' && (
          <div className="text-center">
            <div className="card border-0 shadow-lg d-inline-block" style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              borderRadius: '15px'
            }}>
              <div className="card-body px-4 py-3">
                <p className="text-muted mb-0 fs-5">No patients found for "{searchTerm}".</p>
              </div>
            </div>
          </div>
        )}
        
        {filteredPatients.length === 0 && searchTerm.trim() === '' && (
          <div className="text-center">
            <div className="card border-0 shadow-lg d-inline-block" style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              borderRadius: '15px'
            }}>
              <div className="card-body px-4 py-3">
                <p className="text-muted mb-0 fs-5">
                  <i className="bi bi-search me-2"></i>
                  Please enter a name or NID to search.
                </p>
              </div>
            </div>
          </div>
        )}
        
        <div className="row g-4">
          {filteredPatients.map((patient, index) => (
            <PatientCard key={index} patient={patient} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default PatientList;