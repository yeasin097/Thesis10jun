import express from 'express';
import upload from '../middleware/upload.js';
import { 
    registerPatient, 
    findPatientInfo, 
    getPatientEHRs, 
    getAllPatients,
    requestPermission,
    checkPermissionRequests,
    updatePermission
} from '../services/patientService.js';
import { getContract, utf8Decoder, getAllFromContract } from '../services/fabricService.js';

const router = express.Router();

router.post('/register', upload.single('fingerprint'), registerPatient);
router.post('/find', upload.single('fingerprint'), findPatientInfo);
router.post('/ehrs', upload.single('fingerprint'), getPatientEHRs);
router.get('/all', async (req, res) => {
    try {
        const result = await getAllFromContract('GetAll', 'patient');
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Permission routes
router.post('/permission/request', requestPermission);
router.get('/permission/requests/:patient_nid', checkPermissionRequests);
router.post('/permission/update', updatePermission);

export default router; 