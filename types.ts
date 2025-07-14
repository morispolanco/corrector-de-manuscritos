
export enum AppState {
    IDLE = 'IDLE',
    PROCESSING = 'PROCESSING',
    REVIEWING = 'REVIEWING',
}

export enum ChapterStatus {
    PENDING = 'PENDING',
    PROCESSING = 'PROCESSING',
    REVIEWING = 'REVIEWING',
    DONE = 'DONE',
}

export interface Chapter {
    id: string;
    title: string;
    originalContent: string;
    correctedContent: string;
    status: ChapterStatus;
}
