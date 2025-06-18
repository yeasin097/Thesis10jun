import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

// IMPORTANT: Ensure you have Bootstrap 5 and Bootstrap Icons linked in your project.
// Example:
// In public/index.html:
// <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
// <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons/font/bootstrap-icons.css" rel="stylesheet">
// <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>


function PatientCard({ patient }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();
  // State for permission is not strictly needed for rendering, but kept for clarity if you want to display it
  // const [hasPermission, setHasPermission] = useState(false);

  const checkPermission = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/patient/permission/requests/${patient.nid_no}`);
      const permissions = response.data.permissions;
      // Assuming 'd0001' is the current doctor's ID
      const doctorPermission = permissions.find(p => p.doctor_id === 'd0001' && p.permission_given);
      // setHasPermission(!!doctorPermission); // If you need to update a UI element based on this state
      return !!doctorPermission;
    } catch (error) {
      console.error('Error checking permission:', error);
      toast.error('Failed to verify permissions.', {
        position: "top-center",
        autoClose: 3000,
      });
      return false;
    }
  };

  const requestPermission = async () => {
    try {
      await axios.post('http://localhost:8000/patient/permission/request', {
        patient_nid: patient.nid_no,
        doctor_id: 'd0001' // Assuming 'd0001' is the current doctor's ID
      });
      toast.success('Permission request sent to patient', {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.error === 'Permission request already exists') {
        toast.info('Permission request already sent', {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } else {
        console.error('Failed to send permission request:', error);
        toast.error('Failed to send permission request', {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    }
  };

  const handleCreateEhr = async () => {
    const permissionGranted = await checkPermission();
    if (!permissionGranted) {
      toast.info('Permission needed to create EHR. Sending request...', {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      await requestPermission();
    } else {
      navigate('/doctor/create-ehr', { state: { patient } });
    }
  };

  const handleShowEhrs = async () => {
    const permissionGranted = await checkPermission();
    if (!permissionGranted) {
      toast.info('Permission needed to view EHRs. Sending request...', {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      await requestPermission();
    } else {
      navigate('/doctor/patient-ehrs', { state: { patient } });
    }
  };

  return (
    <div className="col-12">
      <div
        className="card border-0 shadow-sm rounded-3 mb-3"
        style={{
          backgroundColor: '#fff',
          transition: 'all 0.3s ease',
          overflow: 'hidden',
        }}
      >
        <div
          className="card-header bg-light d-flex justify-content-between align-items-center"
          onClick={() => setIsExpanded(!isExpanded)}
          style={{
            cursor: 'pointer',
            padding: '8px 15px',
            borderBottom: isExpanded ? '1px solid #e9ecef' : 'none',
          }}
        >
          <div>
            <h5 className="mb-1 text-primary fw-bold" style={{ fontSize: '1.1rem' }}>
              {patient.name}
            </h5>
            <div className="d-flex align-items-center">
              <span className="text-muted me-3" style={{ fontSize: '0.9rem' }}>
                NID: {patient.nid_no}
              </span>
              <span className="text-muted" style={{ fontSize: '0.9rem' }}>
                Phone: {patient.phone || 'N/A'}
              </span>
            </div>
          </div>
          <i
            className={`bi ${isExpanded ? 'bi-chevron-up' : 'bi-chevron-down'} text-success`}
            style={{ fontSize: '1.1rem' }}
          ></i>
        </div>
        {isExpanded && (
          <div
            className="card-body"
            style={{
              padding: '15px 20px',
              minHeight: '200px',
              backgroundColor: '#f9f9f9',
            }}
          >
            <p className="mb-2" style={{ fontSize: '0.95rem', lineHeight: '1.5' }}>
              <strong>Address:</strong> {patient.address || 'N/A'}
            </p>
            <p className="mb-2" style={{ fontSize: '0.95rem', lineHeight: '1.5' }}>
              <strong>Blood Group:</strong> {patient.blood_group || 'N/A'}
            </p>
            <p className="mb-2" style={{ fontSize: '0.95rem', lineHeight: '1.5' }}>
              <strong>Date of Birth:</strong> {patient.date_of_birth || 'N/A'}
            </p>
            <p className="mb-2" style={{ fontSize: '0.95rem', lineHeight: '1.5' }}>
              <strong>Email:</strong> {patient.email || 'N/A'}
            </p>
            <p className="mb-2" style={{ fontSize: '0.95rem', lineHeight: '1.5' }}>
              <strong>Father's Name:</strong> {patient.father_name || 'N/A'}
            </p>
            <p className="mb-2" style={{ fontSize: '0.95rem', lineHeight: '1.5' }}>
              <strong>Gender:</strong> {patient.gender || 'N/A'}
            </p>
            <div className="d-flex justify-content-between mt-3">
              <button
                className="btn fw-medium px-4 py-2 rounded-pill"
                onClick={handleCreateEhr}
                style={{
                  backgroundColor: '#007bff',
                  borderColor: '#007bff',
                  color: '#fff',
                  transition: 'all 0.3s',
                }}
                onMouseEnter={(e) => (e.target.style.backgroundColor = '#0056b3')}
                onMouseLeave={(e) => (e.target.style.backgroundColor = '#007bff')}
              >
                Create EHR
              </button>
              <button
                className="btn fw-medium px-4 py-2 rounded-pill"
                onClick={handleShowEhrs}
                style={{
                  backgroundColor: '#17a2b8',
                  borderColor: '#17a2b8',
                  color: '#fff',
                  transition: 'all 0.3s',
                }}
                onMouseEnter={(e) => (e.target.style.backgroundColor = '#117a8b')}
                onMouseLeave={(e) => (e.target.style.backgroundColor = '#17a2b8')}
              >
                Show EHRs
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PatientCard;