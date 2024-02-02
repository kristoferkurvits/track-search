import { ITrackMetadataResponse } from "../model/api/acrCloudApiResponse.model";
import { ITrack } from "../model/track.model";

export function mapTracks(response: ITrackMetadataResponse): ITrack[] {
  return response.data.map((sourceTrack) => ({
    name: sourceTrack.name,
    artistName: sourceTrack.artists.map((artist) => artist.name),
    duration: sourceTrack.duration_ms,
    ISRC: sourceTrack.isrc,
    releaseDate: sourceTrack.release_date != null ? new Date(sourceTrack.release_date) : null,
    createdAt: new Date(),
    updatedAt: new Date(),
  })) as ITrack[];
}