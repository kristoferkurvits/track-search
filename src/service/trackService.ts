import { Track, ITrack } from "../model/track.model";
import AcrCloudAPIClient from "../api/acrCloudApClient";
import AppConfig from "../config/appConfig";
import ResolverError from "../error/resolverError";
import { ErrorCodes } from '../util/constants';
import {trackMetadataResponseSchema} from "../model/api/validations/trackMetadataValidation";
import { mapTracks } from "../util/mapper";

const config = AppConfig.getInstance();
const acrCloudApClient = new AcrCloudAPIClient(config.ACR_TOKEN);

class TrackService {
  async getTrackByNameAndArtist(name: string, artistName: string): Promise<ITrack[]> {
    let tracks = await Track.find({
      //The reason of using regex is that external API returns different versions of a song, e.g remixes etc. So im looking for multiple matches.
      name: { $regex: `^${name}`, $options: 'i' },
      artistName 
      }).exec() as ITrack[];
    if (tracks.length === 0) {
      const externalTrackData = await acrCloudApClient.fetchTrackMetadata({
        query: JSON.stringify({ "track": name, "artists": [artistName] }),
        format: 'json'
      });
      trackMetadataResponseSchema.validate(externalTrackData);
      tracks = mapTracks(externalTrackData);
      await Track.insertMany(tracks);
    }
    return tracks;
  }

  async getAllTracks(): Promise<ITrack[]> {
    return await Track.find({});
  }

  async getTrackById(id: string): Promise<ITrack> {
    const track = await Track.findById(id);
    if (!track) {
      throw new ResolverError('Track not found', ErrorCodes.TRACK_NOT_FOUND);
    }
    return track;
  }

  async updateTrack(id: string, input: any): Promise<ITrack> {
    const track = await Track.findByIdAndUpdate(id, input, { new: true });
    if (!track) {
      throw new ResolverError("Failed to update track", ErrorCodes.TRACK_NOT_FOUND);
    }
    return track;
  }

  async deleteTrack(id: string): Promise<{ message: string, id: string }> {
    const track = await Track.findByIdAndDelete(id);
    if (!track) {
      throw new ResolverError('Track not found', ErrorCodes.TRACK_NOT_FOUND);
    }
    return { message: "Track deleted successfully", id };
  }
}

export const trackService = new TrackService();
