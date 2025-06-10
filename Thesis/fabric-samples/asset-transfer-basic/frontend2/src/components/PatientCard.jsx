import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Typography,
  Button,
  IconButton,
  Collapse,
  Box,
  Grid,
  Tooltip,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { styled } from '@mui/material/styles';

const ExpandMore = styled((props) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme, expand }) => ({
  transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
  marginLeft: 'auto',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest,
  }),
}));

function PatientCard({ patient }) {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const handleCreateEhr = () => {
    navigate('/doctor/create-ehr', { state: { patient } });
  };

  const handleShowEhrs = () => {
    navigate('/doctor/patient-ehrs', { state: { patient } });
  };

  return (
    <Card sx={{ mb: 2 }}>
      <CardHeader
        action={
          <ExpandMore
            expand={expanded}
            onClick={handleExpandClick}
            aria-expanded={expanded}
            aria-label="show more"
          >
            <ExpandMoreIcon />
          </ExpandMore>
        }
        title={
          <Typography variant="h6" component="div">
            {patient.name}
          </Typography>
        }
        subheader={`NID: ${patient.nid_no}`}
      />
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                <strong>Address:</strong> {patient.address}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                <strong>Blood Group:</strong> {patient.blood_group}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                <strong>Date of Birth:</strong> {patient.date_of_birth}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                <strong>Email:</strong> {patient.email}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                <strong>Father's Name:</strong> {patient.father_name}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                <strong>Gender:</strong> {patient.gender}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                <strong>Phone:</strong> {patient.phone}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
        <CardActions>
          <Tooltip title="Create New EHR">
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateEhr}
              sx={{ mr: 1 }}
            >
              Create EHR
            </Button>
          </Tooltip>
          <Tooltip title="View Previous EHRs">
            <Button
              variant="outlined"
              startIcon={<VisibilityIcon />}
              onClick={handleShowEhrs}
            >
              View EHRs
            </Button>
          </Tooltip>
        </CardActions>
      </Collapse>
    </Card>
  );
}

export default PatientCard;