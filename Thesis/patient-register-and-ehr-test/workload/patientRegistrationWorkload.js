'use strict';

const { WorkloadModuleBase } = require('@hyperledger/caliper-core');

class PatientRegistrationWorkload extends WorkloadModuleBase {
    constructor() {
        super();
        this.txIndex = 0;
        this.workerIndex = 0;
        this.baseNid = 5000000001; // Starting point adjusted
    }

    async initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext) {
        await super.initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext);
        this.workerIndex = workerIndex;
        this.totalWorkers = totalWorkers;
        this.assets = roundArguments.assets || 150; // Default to 50 patients
    }

    async submitTransaction() {
        this.txIndex++;

        // Calculate NID for this transaction (distribute 50 NIDs across workers)
        const nidIndex = this.workerIndex * Math.ceil(this.assets / this.totalWorkers) + this.txIndex;
        if (nidIndex > 150) return; // Stop after 50 patients (NID 5000000150)

        const nid = this.baseNid + nidIndex;
        if (nid > 5000000150) return; // Ensure we don’t exceed NID 5000000150

        // Create sample patient data
        const patientData = {
            name: `Test Patient ${nidIndex}`,
            nid_no: `${nid}`,
            date_of_birth: this.generateRandomDate(1960, 2000),
            blood_group: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'][Math.floor(Math.random() * 8)],
            address: `Address ${nidIndex}, Bangladesh`,
            father_name: `Father ${nidIndex}`,
            phone: `019${Math.floor(10000000 + Math.random() * 90000000)}`,
            email: `patient${nidIndex}@example.com`
        };

        // Generate hash from nid_no
        const timestamp = Date.now();
        const hash = `hash_${patientData.nid_no + timestamp}`;

        // Debug log
        console.log('Submitting patient registration with args:', {
            patientData: JSON.stringify(patientData),
            hash: hash
        });

        const args = {
            contractId: 'patient',
            contractFunction: 'CreatePatient',
            contractArguments: [JSON.stringify(patientData), hash],
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
        return randomDate.toISOString().split('T')[0];
    }
}

function createWorkloadModule() {
    return new PatientRegistrationWorkload();
}

module.exports.createWorkloadModule = createWorkloadModule;