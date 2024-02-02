export interface ITrackMetadataResponse {
    data: ITrackExternal[];
}

interface ITrackExternal {
    name: string;
    disc_number: number;
    track_number: number;
    isrc: string;
    genres: string[];
    duration_ms: number;
    release_date: string;
    artists: IArtist[];
    album: IAlbum;
    external_metadata: IExternalMetadata;
    type: string;
    works: IWork[];
}

interface IArtist {
    name: string;
}

interface IAlbum {
    track_count: number;
    upc: string;
    release_date: string;
    label: string;
    cover: string;
    covers: {
        small: string;
        medium: string;
        large: string;
    };
}

interface IExternalMetadata {
    applemusic?: IAppleMusicMetadata[];
    deezer?: IDeezerMetadata[];
    youtube?: IYoutubeMetadata[];
    spotify?: ISpotifyMetadata[];
}

interface IAppleMusicMetadata {
    id: string;
    link: string;
    preview: string;
    artists: { id: string }[];
    album: {
        id: string;
        cover: string;
    };
}

interface IDeezerMetadata {
    id: string;
    link: string;
    artists: { id: number }[];
    album: {
        id: number;
        cover: string;
    };
}

interface IYoutubeMetadata {
    id: string;
    link: string;
    artists: {
        id: string;
        link: string;
    }[];
    album: {
        id: string;
        link: string;
    };
}

interface ISpotifyMetadata {
    id: string;
    link: string;
    preview: string;
    artists: { id: string }[];
    album: {
        id: string;
        cover: string;
    };
}

interface IWork {
    iswc: string;
    contributors: IContributor[];
    name: string;
}

interface IContributor {
    name: string;
    ipi: number;
    roles: string[];
}
