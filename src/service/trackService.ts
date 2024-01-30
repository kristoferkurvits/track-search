import { Track, ITrack } from "../model/track.model";
import AcrCloudAPIClient from "../api/acrCloudApClient";
import AppConfig from "../config/appConfig";
import ResolverError from "../error/resolverError";

const config = AppConfig.getInstance();
const acrCloudApClient = new AcrCloudAPIClient(config.ACR_TOKEN);

class TrackService {
  async getTrackByNameAndArtist(name: string, artistName: string): Promise<ITrack> {
    let track = await Track.findOne({ name, artistName });
    if (!track) {
      const externalTrackData = await acrCloudApClient.fetchTrackMetadata({
        query: JSON.stringify({ "track": name, "artists": [artistName] }),
        format: 'json'
      });
      // Validate externalTrackData here before saving
      track = new Track(externalTrackData);
      await track.save();
    }
    return track;
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
