import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Typography,
  Card,
  CardHeader,
  CardContent,
  Grid,
  Button,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  Divider,
  Paper,
} from '@mui/material';
import { API_ENDPOINTS } from '../config';

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
          const response = await axios.post(API_ENDPOINTS.PATIENT_EHRS, { nid_no: patient.nid_no }, {
            headers: { 'Content-Type': 'application/json' },
          });
          const ehrs = Array.isArray(response.data.ehrs) ? response.data.ehrs : [];
          const normalizedEhrs = ehrs.map(ehr => ({
            ...ehr,
            details: typeof ehr.details === 'string' ? JSON.parse(ehr.details) : ehr.details
          }));
          setEhrData(normalizedEhrs);
          
          if (normalizedEhrs.length > 0) {
            const firstEhrDetails = normalizedEhrs[0].details;
            setPatientInfo({
              bloodGroup: firstEhrDetails.blood_group || 'Unknown',
              dateOfBirth: firstEhrDetails.date_of_birth || 'Unknown',
              address: firstEhrDetails.address || 'Unknown',
              previousDiagnoses: extractPreviousDiagnoses(normalizedEhrs)
            });
          }
          
          setError(null);
        } catch (err) {
          console.error('Fetch error:', err);
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
    const diagnoses = ehrs
      .filter(ehr => ehr.details?.diagnosis)
      .map(ehr => ehr.details.diagnosis);
    return [...new Set(diagnoses)];
  };

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 'Unknown';
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleCreateEhr = () => {
    navigate('/doctor/create-ehr', { state: { patient } });
  };

  if (!patient) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">No patient selected</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Patient Electronic Health Records
      </Typography>
      
      {patientInfo && (
        <Card sx={{ mb: 4 }}>
          <CardHeader 
            title={`Patient Information (NID: ${patient.nid_no})`}
            sx={{ bgcolor: 'primary.main', color: 'white' }}
          />
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <List>
                  <ListItem>
                    <ListItemText 
                      primary="Name" 
                      secondary={patient.name || 'N/A'} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Blood Group" 
                      secondary={patientInfo.bloodGroup} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Age" 
                      secondary={`${calculateAge(patientInfo.dateOfBirth)} years`} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Date of Birth" 
                      secondary={patientInfo.dateOfBirth} 
                    />
                  </ListItem>
                </List>
              </Grid>
              <Grid item xs={12} md={6}>
                <List>
                  <ListItem>
                    <ListItemText 
                      primary="Address" 
                      secondary={patientInfo.address} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Previous Diagnoses" 
                      secondary={
                        patientInfo.previousDiagnoses.length > 0 
                          ? patientInfo.previousDiagnoses.join(', ')
                          : 'No previous diagnoses'
                      } 
                    />
                  </ListItem>
                </List>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      <Typography variant="h5" gutterBottom>
        EHR Records
      </Typography>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {!loading && !error && ehrData.length === 0 && (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="text.secondary" gutterBottom>
            No EHR records found for this patient.
          </Typography>
          <Button 
            variant="contained" 
            onClick={handleCreateEhr}
            sx={{ mt: 2 }}
          >
            Create New EHR
          </Button>
        </Paper>
      )}

      {!loading && !error && ehrData.length > 0 && (
        <Box>
          {ehrData.map((ehr, index) => (
            <Card key={index} sx={{ mb: 3 }}>
              <CardHeader 
                title={`EHR ID: ${ehr.ehr_id.substring(0, 12)}...`}
                subheader={new Date(ehr.details.created_at || Date.now()).toLocaleDateString()}
                sx={{ bgcolor: 'info.main', color: 'white' }}
              />
              <CardContent>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2">Doctor ID: {ehr.doctor_id || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2">Hospital ID: {ehr.hospital_id || 'N/A'}</Typography>
                  </Grid>
                </Grid>

                <Card sx={{ mt: 2, mb: 2 }}>
                  <CardHeader title="Clinical Information" />
                  <CardContent>
                    <Typography variant="subtitle2" gutterBottom>
                      Diagnosis: {ehr.details?.diagnosis || 'N/A'}
                    </Typography>
                    <Typography variant="subtitle2" gutterBottom>
                      Medications:
                    </Typography>
                    <List>
                      {ehr.details?.medications?.length > 0 ? (
                        ehr.details.medications.map((med, i) => (
                          <ListItem key={i}>
                            <ListItemText primary={med[0] || 'Unknown'} />
                          </ListItem>
                        ))
                      ) : (
                        <ListItem>
                          <ListItemText primary="No medications listed" />
                        </ListItem>
                      )}
                    </List>
                  </CardContent>
                </Card>

                <Card sx={{ mt: 2, mb: 2 }}>
                  <CardHeader title="Test Results" />
                  <CardContent>
                    <List>
                      <ListItem>
                        <ListItemText 
                          primary="Blood Pressure" 
                          secondary={ehr.details?.test_results?.blood_pressure || 'N/A'} 
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary="Allergy" 
                          secondary={ehr.details?.test_results?.allergy || 'N/A'} 
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary="Cholesterol" 
                          secondary={ehr.details?.test_results?.cholesterol || 'N/A'} 
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>

                <Typography variant="subtitle2" gutterBottom>
                  Notes: {ehr.details?.notes || 'N/A'}
                </Typography>
              </CardContent>
            </Card>
          ))}
          
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Button 
              variant="contained" 
              onClick={handleCreateEhr}
            >
              Create New EHR
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
}

export default DoctorEhrView;