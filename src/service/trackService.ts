import { Track, ITrack } from "../model/track.model";
import AcrCloudAPIClient from "../api/acrCloudApClient";
import AppConfig from "../config/appConfig";
import TrackServiceError from "../error/resolverError";

import {ITrackRepository, trackRepository} from "../repository/trackRepository";

import { ErrorCodes } from '../util/constants';
import { trackMetadataResponseSchema } from "../model/api/validations/trackMetadataValidation";
import { mapTracks } from "../util/mapper";
import { isObjectEmpty } from "../util/helper";

const config = AppConfig.getInstance();
const acrCloudApClient = new AcrCloudAPIClient(config.ACR_TOKEN);

class TrackService {
  constructor(private trackRepository: ITrackRepository) {}

  async getTrackByNameAndArtist(name: string, artistName: string): Promise<ITrack[]> {
    let tracks = await this.trackRepository.getTrackByNameAndArtist(name, artistName);

    if (tracks.length === 0) {
      const externalTrackData = await acrCloudApClient.fetchTrackMetadata({
        query: JSON.stringify({ "track": name, "artists": [artistName] }),
        format: 'json'
      });
      let validationResult = trackMetadataResponseSchema.validate(externalTrackData);
      if(validationResult.error) {
        console.error(validationResult.error.details);
        throw new TrackServiceError("Failed to validate external track data", ErrorCodes.VALIDATION_ERROR);
      }
      console.log("before");
      tracks = mapTracks(externalTrackData);
      console.log(tracks);
      return await this.trackRepository.insertMany(tracks);
    }
    return tracks;
  }

  async getAllTracks(): Promise<ITrack[]> {
    return await this.trackRepository.getAllTracks();
  }

  async getTrackById(id: string): Promise<ITrack> {
    const track = await this.trackRepository.getTrackById(id);
    if (!track) {
      throw new TrackServiceError('Track not found', ErrorCodes.TRACK_NOT_FOUND);
    }
    return track;
  }

  async updateTrack(id: string, track: ITrack): Promise<ITrack> {
    if (isObjectEmpty(track)) {
      throw new TrackServiceError("Invalid input", ErrorCodes.FAILED_TO_UPDATE_TRACK);
    }
    const trackDoc = await this.trackRepository.updateTrack(id, track);
    if (!trackDoc) {
      throw new TrackServiceError("Failed to update track", ErrorCodes.TRACK_NOT_FOUND);
    }
    return trackDoc;
  }

  async deleteTrack(id: string): Promise<{ message: string }> {
    const track = await this.trackRepository.deleteTrack(id);
    if (!track) {
      throw new TrackServiceError('Track not found', ErrorCodes.TRACK_NOT_FOUND);
    }
    return { message: "Track deleted successfully"};
  }
}

export const trackService = new TrackService(trackRepository);
