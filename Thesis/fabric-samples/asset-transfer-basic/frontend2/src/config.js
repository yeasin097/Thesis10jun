export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const API_ENDPOINTS = {
  PATIENTS: `${API_URL}/patient`,
  PATIENT_ALL: `${API_URL}/patient/all`,
  PATIENT_EHRS: `${API_URL}/patient/ehrs`,
  // Add other endpoints as needed
}; 