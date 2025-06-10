import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  IconButton,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PeopleIcon from '@mui/icons-material/People';
import Navbar from '../components/Navbar';
import PatientList from '../components/PatientList';
import Layout from '../components/Layout';

function DoctorHome() {
  const [view, setView] = useState('patient');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if we're coming from a navigation with state
    if (location.state?.view) {
      setView(location.state.view);
    }
  }, [location]);

  const handleCreateEhr = () => {
    navigate('/doctor/create-ehr');
  };

  const handlePatientList = () => {
    setView('patient');
  };

  const handleViewChange = (newView) => {
    setView(newView);
    // Update URL without navigation
    window.history.replaceState({ view: newView }, '', '/doctor');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar onPatientList={handlePatientList} onCreateEhr={handleCreateEhr} />
      
      <Layout>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Welcome, Doctor
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Manage your patients and their electronic health records
          </Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'scale(1.02)',
                }
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <PeopleIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                  <Typography variant="h6">Patient Management</Typography>
                </Box>
                <Typography color="text.secondary">
                  View and manage your patient list. Access patient records and medical history.
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => handleViewChange('patient')}
                  startIcon={<PeopleIcon />}
                  disabled={view === 'patient'}
                >
                  View Patients
                </Button>
              </CardActions>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'scale(1.02)',
                }
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <AddIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                  <Typography variant="h6">Create New EHR</Typography>
                </Box>
                <Typography color="text.secondary">
                  Create a new electronic health record for your patients. Add diagnoses, prescriptions, and medical notes.
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleCreateEhr}
                  startIcon={<AddIcon />}
                >
                  Create EHR
                </Button>
              </CardActions>
            </Card>
          </Grid>
        </Grid>

        {view === 'patient' && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h5" gutterBottom>
              Patient List
            </Typography>
            <PatientList />
          </Box>
        )}
      </Layout>
    </Box>
  );
}

export default DoctorHome;