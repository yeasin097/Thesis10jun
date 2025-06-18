import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

function PatientHome() {
  const location = useLocation();
  const patient = location.state?.patient;
  const [ehrData, setEhrData] = useState([]);
  const [loadingEhrs, setLoadingEhrs] = useState(false);
  const [errorEhrs, setErrorEhrs] = useState(null);
  const [permissionRequests, setPermissionRequests] = useState([]);
  const [loadingPermissions, setLoadingPermissions] = useState(false);

  useEffect(() => {
    if (patient) {
      fetchEhrs();
      fetchPermissionRequests();
    }
  }, [patient]);

  const fetchPermissionRequests = async () => {
    if (!patient) return;
    
    setLoadingPermissions(true);
    try {
      const response = await axios.get(`http://localhost:8000/patient/permission/requests/${patient.nid_no}`);
      setPermissionRequests(response.data.permissions.filter(p => !p.permission_given));
    } catch (error) {
      console.error('Error fetching permission requests:', error);
    } finally {
      setLoadingPermissions(false);
    }
  };

  const handlePermissionResponse = async (doctorId, accept) => {
    try {
      await axios.post('http://localhost:8000/patient/permission/update', {
        patient_nid: patient.nid_no,
        doctor_id: doctorId,
        permission_given: accept
      });

      toast.success(`Permission ${accept ? 'granted' : 'denied'} successfully`, {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      // Refresh permission requests
      fetchPermissionRequests();
    } catch (error) {
      toast.error('Failed to update permission', {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  const fetchEhrs = async () => {
    setLoadingEhrs(true);
    try {
      const response = await axios.post('http://localhost:8000/patient/ehrs', { nid_no: patient.nid_no }, {
        headers: { 'Content-Type': 'application/json' },
      });
      const ehrs = Array.isArray(response.data.ehrs) ? response.data.ehrs : [];
      const normalizedEhrs = ehrs.map(ehr => ({
        ...ehr,
        details: typeof ehr.details === 'string' ? JSON.parse(ehr.details) : ehr.details
      }));
      setEhrData(normalizedEhrs);
      setErrorEhrs(null);
    } catch (err) {
      setErrorEhrs(err.response?.data?.error || 'Failed to fetch EHRs.');
      setEhrData([]);
    } finally {
      setLoadingEhrs(false);
    }
  };

  if (!patient) {
    return (
      <div className="container py-5 text-center">
        <h2>No Patient Data</h2>
        <p>Please log in again.</p>
        <Link to="/patient/login" className="btn btn-primary">Back to Login</Link>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <h2 className="text-center mb-4">Welcome, {patient.name}</h2>
      
      {/* Permission Requests Section */}
      {permissionRequests.length > 0 && (
        <div className="row justify-content-center mb-4">
          <div className="col-md-8">
            <div className="card shadow-sm">
              <div className="card-header bg-warning text-dark">
                <h5 className="mb-0">Pending Permission Requests</h5>
              </div>
              <div className="card-body">
                {permissionRequests.map((request, index) => (
                  <div key={index} className="d-flex justify-content-between align-items-center mb-3 p-3 border rounded">
                    <div>
                      <p className="mb-1"><strong>Doctor ID:</strong> {request.doctor_id}</p>
                      <p className="mb-0 text-muted small">
                        Requested on: {new Date(request.request_date).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <button
                        className="btn btn-success btn-sm me-2"
                        onClick={() => handlePermissionResponse(request.doctor_id, true)}
                      >
                        Accept
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handlePermissionResponse(request.doctor_id, false)}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Patient Information Card */}
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">Patient Information</h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6 mb-3">
                  <p><strong>Name:</strong> {patient.name}</p>
                  <p><strong>NID Number:</strong> {patient.nid_no}</p>
                  <p><strong>Gender:</strong> {patient.gender}</p>
                  <p><strong>Date of Birth:</strong> {patient.date_of_birth}</p>
                </div>
                <div className="col-md-6 mb-3">
                  <p><strong>Address:</strong> {patient.address}</p>
                  <p><strong>Blood Group:</strong> {patient.blood_group}</p>
                  <p><strong>Email:</strong> {patient.email}</p>
                  <p><strong>Phone:</strong> {patient.phone}</p>
                </div>
              </div>
              <p><strong>Father's Name:</strong> {patient.father_name}</p>
            </div>
            <div className="card-footer text-center">
              <Link to="/patient/login" className="btn btn-outline-primary">Logout</Link>
            </div>
          </div>

          {/* EHR Section */}
          <div className="mt-4">
            <h5 className="mb-3">Your Electronic Health Records (EHRs)</h5>
            {loadingEhrs && <div className="text-center">Loading EHRs...</div>}
            {errorEhrs && <div className="alert alert-danger">{errorEhrs}</div>}
            {!loadingEhrs && !errorEhrs && ehrData.length === 0 && (
              <p className="text-muted">No EHR records found.</p>
            )}
            {!loadingEhrs && !errorEhrs && ehrData.length > 0 && ehrData.map((ehr, index) => (
              <div key={index} className="card mb-3 shadow-sm">
                <div className="card-header bg-info">
                  <strong>Date of Visit:</strong> {ehr.details?.visit_date}
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-6">
                      <p><strong>Patient ID:</strong> {ehr.patient_id || 'N/A'}</p>
                      <p><strong>Doctor ID:</strong> {ehr.doctor_id || 'N/A'}</p>
                      <p><strong>Hospital ID:</strong> {ehr.hospital_id || 'N/A'}</p>
                    </div>
                    <div className="col-md-6">
                      <p><strong>Diagnosis:</strong> {ehr.details?.diagnosis || 'N/A'}</p>
                      <p><strong>Medications:</strong></p>
                      <ul>
                        {ehr.details?.medications?.length > 0 ? (
                          ehr.details.medications.map((med, i) => (
                            <li key={i}>{med || 'Unknown'}</li>
                          ))
                        ) : (
                          <li>No medications listed</li>
                        )}
                      </ul>
                    </div>
                  </div>
                  <p><strong>Test Results:</strong></p>
                  <ul>
                    <li>Blood Pressure: {ehr.details?.test_results?.blood_pressure || 'N/A'}</li>
                    <li>Allergy: {ehr.details?.test_results?.allergy || 'N/A'}</li>
                    <li>Cholesterol: {ehr.details?.test_results?.cholesterol || 'N/A'}</li>
                  </ul>
                  <p><strong>Notes:</strong> {ehr.details?.notes || 'N/A'}</p>
                  <p><strong>CID:</strong> {ehr.cid || 'N/A'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PatientHome;