'use strict';

const { WorkloadModuleBase } = require('@hyperledger/caliper-core');
const crypto = require('node:crypto');

class EHRCreationWorkload extends WorkloadModuleBase {
    constructor() {
        super();
        this.txIndex = 0;
        this.workerIndex = 0;
        this.baseNid = 5000000000; // Starting point for NIDs
    }

    async initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext) {
        await super.initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext);
        this.workerIndex = workerIndex;
        this.totalWorkers = totalWorkers;
        this.assets = roundArguments.assets || 50; // Default to 50 EHRs
    }

    async submitTransaction() {
        this.txIndex++;

        // Calculate NID for this transaction (distribute 50 NIDs across workers)
        const nidIndex = this.workerIndex * Math.ceil(this.assets / this.totalWorkers) + this.txIndex;
        if (nidIndex > 50) return; // Stop after 50 patients (NID 5000000050)

        const nid = this.baseNid + nidIndex;
        if (nid > 5000000050) return; // Ensure we don’t exceed NID 5000000050

        // Generate patient hash using your getHash function
        const patientHash = this.getHash(nid.toString());

        // Generate a unique EHR ID
        const ehrId = `ehr_${patientHash}_${Date.now()}`;

        // Generate random EHR details
        const ehrDetails = {
            visit_date: this.generateRandomDate(2020, 2025),
            address: `Address ${nidIndex}, Test City`,
            blood_group: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'][Math.floor(Math.random() * 8)],
            date_of_birth: this.generateRandomDate(1960, 2000),
            gender: Math.random() > 0.5 ? 'Male' : 'Female',
            diagnosis: `Disease ${nidIndex % 5}, General Condition`,
            medications: [`Medication ${nidIndex % 4}`],
            test_results: {
                blood_pressure: `${90 + Math.floor(Math.random() * 90)}/${60 + Math.floor(Math.random() * 60)}`,
                allergy: ['Dust', 'Pollen', 'None'][Math.floor(Math.random() * 3)],
                cholesterol: `${150 + Math.floor(Math.random() * 150)} mg/dL`
            },
            notes: `Notes for patient ${nidIndex}`
        };

        const ehrInfo = {
            ehr_id: ehrId,
            patient_id: patientHash, // Hashed NID as patient_id
            doctor_id: `d${String(Math.floor(Math.random() * 3) + 1).padStart(4, '0')}`, // e.g., d0001
            hospital_id: `h${String(Math.floor(Math.random() * 3) + 1).padStart(3, '0')}`, // e.g., h001
            cid: `ipfs_${ehrId}`, // Mock IPFS CID
            ehr_details: ehrDetails
        };

        // Debug log
        console.log('Submitting transaction with args:', {
            ehrId: ehrId,
            ehrInfo: JSON.stringify(ehrInfo)
        });

        const args = {
            contractId: 'ehr',
            contractFunction: 'CreateEHR',
            contractArguments: [ehrId, JSON.stringify(ehrInfo)],
            invokerIdentity: 'User1',
            readOnly: false
        };

        try {
            await this.sutAdapter.sendRequests(args);
        } catch (error) {
            console.error('Transaction error details:', {
                message: error.message,
                stack: error.stack,
                args: args.contractArguments
            });
            throw error;
        }
    }

    // Helper function to generate random date
    generateRandomDate(startYear, endYear) {
        const start = new Date(startYear, 0, 1);
        const end = new Date(endYear, 11, 31);
        const randomDate = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
        return randomDate.toISOString().split('T')[0]; // Format: YYYY-MM-DD
    }

    // Your getHash function
    getHash(value, algorithm = 'sha256') {
        return crypto.createHash(algorithm).update(value).digest('hex');
    }
}

function createWorkloadModule() {
    return new EHRCreationWorkload();
}

module.exports.createWorkloadModule = createWorkloadModule;