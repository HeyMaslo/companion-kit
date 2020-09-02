import Identify from 'common/models/Identify';

export enum JobStatuses {
    InProcess = 'in_process',
    Success = 'success',
    Error = 'error',
}

export enum JobTypes {
    Export = 'export',
    Import = 'import',
}

export type ServiceJob = {
    /** Google job ID  */
    jobId: string;
    timestamp: number,
    status: JobStatuses;
    type: JobTypes,
    description?: string;
};

export type ServiceJobIded = Identify<ServiceJob>;
