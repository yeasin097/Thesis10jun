export const initializeFabric = async () => {
    try {
        client = await newGrpcConnection();
        gateway = connect({
            client,
            identity: await newIdentity(),
            signer: await newSigner(),
            hash: hash.sha256,
            evaluateOptions: () => ({ deadline: Date.now() + 5000 }),
            endorseOptions: () => ({ deadline: Date.now() + 15000 }),
            submitOptions: () => ({ deadline: Date.now() + 5000 }),
            commitStatusOptions: () => ({ deadline: Date.now() + 60000 }),
        });
        const network = gateway.getNetwork(channelName);
        contractPatient = network.getContract('patient');
        contractDoctor = network.getContract('doctor');
        contractEHR = network.getContract('ehr');
        contractResearch = network.getContract('research');
        console.log('Successfully connected to Fabric network and initialized all contracts');
    } catch (error) {
        console.error('Failed to initialize Fabric connection:', error);
        throw error;
    }
};