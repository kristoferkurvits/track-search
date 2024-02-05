import { ITrackExternal, ITrackMetadataResponse } from "../model/api/acrCloudApiResponse.model";
import { ITrack } from "../model/track.model";

export function mapTracks(response: ITrackExternal[]): ITrack[] {
  return response.map((sourceTrack) => ({
    name: sourceTrack.name,
    artistName: sourceTrack.artists.map((artist) => artist.name),
    duration: sourceTrack.duration_ms,
    ISRC: sourceTrack.isrc,
    releaseDate: sourceTrack?.album?.release_date != null ? new Date(sourceTrack?.album?.release_date) : null,
    createdAt: new Date(),
    updatedAt: new Date(),
  })) as ITrack[];
}