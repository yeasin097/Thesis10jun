import { useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function EhrForm({ doctorId, hospitalId, nidNo, patient }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    diagnoses: [],
    medications: [], // Flat array of medication strings
    test_results: {
      blood_pressure: '',
      allergy: '',
      cholesterol: '',
    },
    notes: '',
  });
  const [fingerprint, setFingerprint] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const diagnosisOptions = [
    'Tuberculosis', 'Influenza (Flu)', 'Diabetes Mellitus', 'Hypertension', 'Asthma',
    'Chronic Obstructive Pulmonary Disease (COPD)', 'Pneumonia', 'Bronchitis', 'Malaria', 'Dengue Fever',
    'Hepatitis A', 'Hepatitis B', 'Hepatitis C', 'Cirrhosis', 'Gastritis',
    'Peptic Ulcer Disease', 'Appendicitis', 'Cholecystitis', 'Pancreatitis', 'Irritable Bowel Syndrome (IBS)',
    'Crohn’s Disease', 'Ulcerative Colitis', 'Arthritis', 'Osteoporosis', 'Rheumatoid Arthritis',
    'Gout', 'Migraine', 'Epilepsy', 'Stroke', 'Parkinson’s Disease',
    'Alzheimer’s Disease', 'Depression', 'Anxiety Disorder', 'Bipolar Disorder', 'Schizophrenia',
    'Coronary Artery Disease', 'Heart Failure', 'Arrhythmia', 'Myocardial Infarction', 'Anemia',
    'Leukemia', 'Lymphoma', 'Thyroiditis', 'Hyperthyroidism', 'Hypothyroidism',
    'Kidney Stones', 'Chronic Kidney Disease', 'Urinary Tract Infection (UTI)', 'Prostatitis', 'Erectile Dysfunction',
    'Cataract', 'Glaucoma', 'Conjunctivitis'
  ];

  const medicationOptions = [
    'Ranitidine 150mg', 'Chloroquine 250mg', 'Metformin 500mg', 'Amlodipine 5mg', 'Paracetamol 500mg',
    'Ibuprofen 400mg', 'Aspirin 75mg', 'Losartan 50mg', 'Atorvastatin 20mg', 'Simvastatin 40mg',
    'Omeprazole 20mg', 'Pantoprazole 40mg', 'Esomeprazole 40mg', 'Levothyroxine 100mcg', 'Methotrexate 2.5mg',
    'Prednisolone 5mg', 'Hydrocortisone 10mg', 'Salbutamol 100mcg Inhaler', 'Budesonide 200mcg Inhaler', 'Montelukast 10mg',
    'Cetirizine 10mg', 'Loratadine 10mg', 'Fexofenadine 180mg', 'Amoxicillin 500mg', 'Azithromycin 250mg',
    'Ciprofloxacin 500mg', 'Doxycycline 100mg', 'Clarithromycin 500mg', 'Metronidazole 400mg', 'Fluconazole 150mg',
    'Acyclovir 400mg', 'Valacyclovir 500mg', 'Gabapentin 300mg', 'Pregabalin 75mg', 'Amitriptyline 25mg',
    'Sertraline 50mg', 'Fluoxetine 20mg', 'Citalopram 20mg', 'Escitalopram 10mg', 'Diazepam 5mg',
    'Alprazolam 0.5mg', 'Clonazepam 0.5mg', 'Insulin Glargine 100U/mL', 'Metoprolol 50mg', 'Carvedilol 6.25mg',
    'Bisoprolol 5mg', 'Enalapril 10mg', 'Lisinopril 20mg', 'Warfarin 5mg', 'Clopidogrel 75mg',
    'Heparin 5000U', 'Furosemide 40mg', 'Spironolactone 25mg'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('test_results.')) {
      const key = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        test_results: { ...prev.test_results, [key]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAddDiagnosis = (diagnosis) => {
    if (diagnosis && !formData.diagnoses.includes(diagnosis)) {
      setFormData((prev) => ({ ...prev, diagnoses: [...prev.diagnoses, diagnosis] }));
    }
  };

  const handleAddMedication = (medication) => {
    if (medication && !formData.medications.includes(medication)) {
      setFormData((prev) => ({ ...prev, medications: [...prev.medications, medication] }));
    }
  };

  const handleRemoveMedication = (index) => {
    setFormData((prev) => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== index)
    }));
  };

  const handleFingerprintChange = (e) => {
    setFingerprint(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMessage('');
    setLoading(true);

    const currentDate = new Date().toISOString().split('T')[0];
    const ehrDetails = {
      visit_date: currentDate,
      address: patient?.address || 'Unknown',
      blood_group: patient?.blood_group || 'Unknown***',
      date_of_birth: patient?.date_of_birth || 'Unknown',
      gender: patient?.gender || 'Unknown',
      diagnosis: formData.diagnoses.join(', ') || 'None',
      medications: formData.medications, // Use flat array to match Python script
      test_results: formData.test_results,
      notes: formData.notes || '',
    };

    if (nidNo) {
      const payload = {
        doctor_id: doctorId,
        hospital_id: hospitalId,
        ehr_details: JSON.stringify(ehrDetails),
        nid_no: nidNo,
      };

      try {
        const response = await axios.post('http://localhost:8000/ehr/create/nid', payload);
        setStatusMessage(`✅ EHR created successfully | Response: ${JSON.stringify(response.data)}`);
      } catch (error) {
        console.log('Error response:', error.response?.data); // Added for debugging
        setStatusMessage(`❌ Error creating EHR | ${error.response?.data?.error || error.message}`);
      } finally {
        setLoading(false);
      }
    } else {
      if (!fingerprint) {
        setStatusMessage('⚠️ Please upload a fingerprint image.');
        setLoading(false);
        return;
      }

      if (!patient) {
        const findData = new FormData();
        findData.append('fingerprint', fingerprint);

        try {
          const findResponse = await axios.post('http://localhost:8000/patient/find', findData, { timeout: 30000 });
          const patientInfo = JSON.parse(findResponse.data.patient_info);
          ehrDetails.address = patientInfo.address;
          ehrDetails.blood_group = patientInfo.blood_group;
          ehrDetails.date_of_birth = patientInfo.date_of_birth;
          ehrDetails.gender = patientInfo.gender;
        } catch (error) {
          console.log('Error finding patient:', error.response?.data); // Added for debugging
          setStatusMessage(`❌ Error finding patient | ${error.response?.data?.error || error.message}`);
          setLoading(false);
          return;
        }
      }

      const data = new FormData();
      data.append('fingerprint', fingerprint);
      data.append('doctor_id', doctorId);
      data.append('hospital_id', hospitalId);
      data.append('ehr_details', JSON.stringify(ehrDetails));

      try {
        const response = await axios.post('http://localhost:8000/ehr/create', data, { timeout: 30000 });
        setStatusMessage(`✅ EHR created successfully | Response: ${JSON.stringify(response.data)}`);
        setFormData({
          diagnoses: [],
          medications: [],
          test_results: { blood_pressure: '', allergy: '', cholesterol: '' },
          notes: '',
        });
        setFingerprint(null);
        fileInputRef.current.value = '';
      } catch (error) {
        console.log('Error response:', error.response?.data); // Added for debugging
        setStatusMessage(`❌ Error creating EHR | ${error.response?.data?.error || error.message}`);
      } finally {
        setLoading(false);
      }
    }
  };

  if (!doctorId || !hospitalId) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light" style={{ fontFamily: 'Poppins, sans-serif' }}>
        <div className="text-center">
          <h2 className="text-danger fw-bold">Missing Required Data</h2>
          <p className="text-muted">Doctor ID and Hospital ID are required to create an EHR.</p>
        </div>
      </div>
    );
  }

  const currentDate = new Date().toISOString().split('T')[0];

  return (
    <div className="min-vh-100 bg-light py-5" style={{ fontFamily: 'Poppins, sans-serif' }}>
      <div className="container">
        <div className="card shadow-lg rounded-4 mx-auto border-0" style={{ maxWidth: '800px' }}>
          <div className="card-header bg-teal text-white rounded-top-4 p-4">
            <h2 className="mb-0 fw-bold text-center text-black">Create Electronic Health Record</h2>
          </div>
          <div className="card-body p-5">
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="form-label fw-medium text-muted"><i className="bi bi-person-fill me-2 text-teal"></i>Doctor ID</label>
                <input
                  type="text"
                  className="form-control border-0 bg-light py-3 rounded-3"
                  value={doctorId}
                  disabled
                  style={{ fontSize: '1.1rem' }}
                />
              </div>
              <div className="mb-4">
                <label className="form-label fw-medium text-muted"><i className="bi bi-hospital-fill me-2 text-teal"></i>Hospital ID</label>
                <input
                  type="text"
                  className="form-control border-0 bg-light py-3 rounded-3"
                  value={hospitalId}
                  disabled
                  style={{ fontSize: '1.1rem' }}
                />
              </div>
              {nidNo && (
                <div className="mb-4">
                  <label className="form-label fw-medium text-muted"><i className="bi bi-fingerprint me-2 text-teal"></i>NID Number</label>
                  <input
                    type="text"
                    className="form-control border-0 bg-light py-3 rounded-3"
                    value={nidNo}
                    disabled
                    style={{ fontSize: '1.1rem' }}
                  />
                </div>
              )}
              <div className="mb-4">
                <label className="form-label fw-medium text-muted"><i className="bi bi-calendar-fill me-2 text-teal"></i>Visit Date</label>
                <input
                  type="text"
                  className="form-control border-0 bg-light py-3 rounded-3"
                  value={currentDate}
                  disabled
                  style={{ fontSize: '1.1rem' }}
                />
              </div>
              <div className="mb-4">
                <label className="form-label fw-medium text-muted"><i className="bi bi-clipboard-fill me-2 text-teal"></i>Diagnoses</label>
                <select
                  className="form-select py-3 rounded-3 mb-2"
                  onChange={(e) => handleAddDiagnosis(e.target.value)}
                  defaultValue=""
                  style={{ fontSize: '1.1rem' }}
                >
                  <option value="" disabled>Select a diagnosis</option>
                  {diagnosisOptions.map((option, index) => (
                    <option key={index} value={option}>{option}</option>
                  ))}
                </select>
                {formData.diagnoses.length > 0 && (
                  <div className="d-flex flex-wrap gap-2 mt-2">
                    {formData.diagnoses.map((diag, index) => (
                      <span
                        key={index}
                        className="badge py-2 px-3 rounded-pill fw-normal"
                        style={{ backgroundColor: '#007bff', color: 'white', fontSize: '0.9rem' }}
                      >
                        {diag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="mb-4">
                <label className="form-label fw-medium text-muted"><i className="bi bi-capsule me-2 text-teal"></i>Medications</label>
                <select
                  className="form-select py-3 rounded-3 mb-2"
                  onChange={(e) => handleAddMedication(e.target.value)}
                  defaultValue=""
                  style={{ fontSize: '1.1rem' }}
                >
                  <option value="" disabled>Select a medication</option>
                  {medicationOptions.map((option, index) => (
                    <option key={index} value={option}>{option}</option>
                  ))}
                </select>
                {formData.medications.length > 0 && (
                  <div className="mt-2">
                    {formData.medications.map((med, index) => (
                      <div key={index} className="d-flex align-items-center gap-2 mb-2">
                        <span
                          className="badge py-2 px-3 rounded-pill fw-normal"
                          style={{ backgroundColor: '#00c4cc', color: 'white', fontSize: '0.9rem' }}
                        >
                          {med}
                        </span>
                        <button
                          type="button"
                          className="btn btn-danger btn-sm rounded-circle"
                          onClick={() => handleRemoveMedication(index)}
                          style={{ width: '24px', height: '24px', padding: '0', lineHeight: '1' }}
                        >
                          <i className="bi bi-x"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="mb-4">
                <label className="form-label fw-medium text-muted"><i className="bi bi-heart-pulse-fill me-2 text-teal"></i>Test Results</label>
                <input
                  type="text"
                  className="form-control border-0 border-bottom py-3 mb-3"
                  name="test_results.blood_pressure"
                  value={formData.test_results.blood_pressure}
                  onChange={handleInputChange}
                  placeholder="Blood Pressure (e.g., 135/90)"
                  style={{ fontSize: '1.1rem' }}
                />
                <input
                  type="text"
                  className="form-control border-0 border-bottom py-3 mb-3"
                  name="test_results.allergy"
                  value={formData.test_results.allergy}
                  onChange={handleInputChange}
                  placeholder="Allergy (e.g., Shellfish)"
                  style={{ fontSize: '1.1rem' }}
                />
                <input
                  type="text"
                  className="form-control border-0 border-bottom py-3"
                  name="test_results.cholesterol"
                  value={formData.test_results.cholesterol}
                  onChange={handleInputChange}
                  placeholder="Cholesterol (e.g., 250 mg/dL)"
                  style={{ fontSize: '1.1rem' }}
                />
              </div>
              <div className="mb-4">
                <label htmlFor="notes" className="form-label fw-medium text-muted"><i className="bi bi-chat-square-text-fill me-2 text-teal"></i>Comments</label>
                <textarea
                  className="form-control rounded-3 py-3"
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows="4"
                  placeholder="e.g., Advised to quit smoking and avoid alcohol."
                  style={{ fontSize: '1.1rem', border: '1px solid #e9ecef' }}
                />
              </div>
              {!nidNo && (
                <div className="mb-4">
                  <label htmlFor="fingerprint" className="form-label fw-medium text-muted"><i className="bi bi-fingerprint me-2 text-teal"></i>Fingerprint Image</label>
                  <input
                    type="file"
                    className="form-control py-3 rounded-3"
                    id="fingerprint"
                    accept=".bmp"
                    onChange={handleFingerprintChange}
                    ref={fileInputRef}
                    style={{ fontSize: '1.1rem' }}
                  />
                </div>
              )}
              <button
                type="submit"
                className="btn w-100 py-3 fw-semibold text-white"
                disabled={loading}
                style={{
                  background: 'linear-gradient(90deg, #00c4cc, #007bff)',
                  borderRadius: '8px',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                }}
                onMouseEnter={(e) => !loading && (e.target.style.transform = 'scale(1.03)', e.target.style.boxShadow = '0 8px 20px rgba(0, 196, 204, 0.3)')}
                onMouseLeave={(e) => !loading && (e.target.style.transform = 'scale(1)', e.target.style.boxShadow = 'none')}
              >
                {loading ? 'Submitting...' : 'Create EHR'}
              </button>
            </form>
            {statusMessage && (
              <div className={`alert mt-4 shadow-sm rounded-3 d-flex align-items-center ${statusMessage.includes('❌') ? 'alert-danger' : 'alert-success'}`}
                style={{ backgroundColor: statusMessage.includes('❌') ? '#fce8e6' : '#e6f7f8', border: statusMessage.includes('❌') ? '1px solid #dc3545' : '1px solid #00c4cc' }}>
                <i className={`bi ${statusMessage.includes('❌') ? 'bi-x-circle-fill text-danger' : 'bi-check-circle-fill text-teal'} me-2`}></i>
                {statusMessage}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default EhrForm;