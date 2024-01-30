export interface ITrackSearchParams {
    source_url?: string;
    isrc?: string;
    acr_id?: string;
    platforms?: string;
    query?: string;
    format?: 'text' | 'json';
    include_works?: number;
}