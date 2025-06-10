import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  TextField,
  CircularProgress,
  Alert,
  Typography,
  IconButton,
  Tooltip,
  Paper,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { API_ENDPOINTS } from '../config';

function PatientList() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await axios.get(API_ENDPOINTS.PATIENT_ALL);
        const data = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
        const patientList = data.map(item => JSON.parse(item));
        setPatients(patientList);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch patient data.');
        setLoading(false);
        toast.error('Failed to fetch patient data');
      }
    };

    fetchPatients();
  }, []);

  const filteredPatients = patients.filter(
    patient =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.nid_no.includes(searchTerm)
  );

  const columns = [
    { field: 'name', headerName: 'Patient Name', flex: 1 },
    { field: 'nid_no', headerName: 'NID Number', flex: 1 },
    { field: 'age', headerName: 'Age', flex: 0.5 },
    { field: 'gender', headerName: 'Gender', flex: 0.5 },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 0.5,
      sortable: false,
      renderCell: (params) => (
        <Tooltip title="View Patient Details">
          <IconButton
            onClick={() => navigate('/doctor/patient-ehrs', { state: { patient: params.row } })}
            color="primary"
          >
            <VisibilityIcon />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography variant="h5" component="h2">
          Patient List
        </Typography>
        <Paper
          component="form"
          sx={{ p: '2px 4px', display: 'flex', alignItems: 'center', width: 400 }}
        >
          <SearchIcon sx={{ color: 'action.active', mx: 1 }} />
          <TextField
            fullWidth
            variant="standard"
            placeholder="Search by name or NID"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ ml: 1, flex: 1 }}
          />
        </Paper>
      </Box>

      <Paper sx={{ height: 400, width: '100%' }}>
        <DataGrid
          rows={filteredPatients}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5]}
          disableSelectionOnClick
          sx={{
            '& .MuiDataGrid-cell': {
              display: 'flex',
              alignItems: 'center',
            },
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: 'primary.main',
              color: 'white',
            },
          }}
        />
      </Paper>
    </Box>
  );
}

export default PatientList;