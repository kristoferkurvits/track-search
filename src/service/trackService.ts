import { ITrack } from "../model/track.model";
import { ITrackMetadataResponse } from "../model/api/acrCloudApiResponse.model";
import { acrCloudApClient } from "../api/acrCloudApClient";
import TrackServiceError from "../error/resolverError";
import { ITrackRepository, trackRepository } from "../repository/trackRepository";
import { ErrorCodes } from '../util/constants';
import { trackMetadataResponseSchema } from "../model/api/validations/trackMetadataValidation";
import { mapTracks } from "../util/mapper";
import { isObjectEmpty } from "../util/helper";
import NotFoundError from "../error/notFoundError";
import logger from "../config/loggerConfig";


class TrackService {
  constructor(private trackRepository: ITrackRepository) { }

  /*
    *Aim of the fetchArtistsInBackground function*
    Example:
      When the function getTrackByNameAndArtist is called for the first time with the payload:
      { 
        "name": "The Recipe",
        "artistName": "Dr. Dre"
      }

      and entries do not exist in the Database, The External API receives 1 track where the artists are
      ["Kendrick Lamar", "Dr. Dre"]. When the second call is made with payload:
      
      { 
        "name": "The Recipe",
        "artistName": "Kendrick Lamar"
      }

      An entry is found from the Database which is then returned.
      The problem is that in that case, the External API would return 2 tracks.
      Function fetchTrackWithCoArtist makes sure that all the tracks get fetched by all the possible artists.

      Alternative would be to store tracks by single artist but then there would be ISRC duplications
      which is not desired outcome when wanting to fetch Tracks by ISRC.
  */


  private async fetchTrackWithCoArtist(alreadyFetchedTracks: ITrack[], originalArtistName: string, name: string) {
    // Collect ISRC codes from already fetched tracks to avoid duplication.
    let existingISRCCodes = new Set(alreadyFetchedTracks.map(track => track.ISRC));
    
    // Aggregate all artist names from fetched tracks, excluding the original artist.
    let artistNames = alreadyFetchedTracks
      .flatMap(track => track.artistName)
      .filter(artistName => artistName !== originalArtistName);
 
      // Remove duplicates
    let uniqueArtistNames = [...new Set(artistNames)];

    // Fetch additional tracks for each unique co-artist asynchronously.
    const fetchPromises = uniqueArtistNames.map(async artist => {
      const additionalTrackData = await acrCloudApClient.fetchTrackMetadata({
        query: JSON.stringify({ "track": name, "artists": [artist] }),
        format: 'json'
      });

      // Validate the response from the external API.
      const validationResult = trackMetadataResponseSchema.validate(additionalTrackData);
      if (validationResult.error) {
        logger.error("Validation failed for additional track data:", validationResult.error.details);
        return []; // Return an empty array to indicate no tracks to insert
      }

      // Filter out tracks with ISRC codes already in the database.
      return additionalTrackData.data.filter(track => !existingISRCCodes.has(track.isrc));
    });

    // Wait for all fetch operations to complete and flatten the result.
    const tracksArrays = await Promise.all(fetchPromises);
    const newTracks = tracksArrays.flat();

    if (newTracks.length > 0) {
      await trackRepository.insertMany(mapTracks(newTracks));
    }
  }


  async getTrackByNameAndArtist(name: string, artistName: string): Promise<ITrack[]> {
    let tracks = await this.trackRepository.getTrackByNameAndArtist(name, artistName);

    // If not found, fetch from the external API
    if (tracks.length === 0) {
      const externalTrackData: ITrackMetadataResponse = await acrCloudApClient.fetchTrackMetadata({
        query: JSON.stringify({ "track": name, "artists": [artistName] }),
        format: 'json'
      });

      // Validate the response from the external API.
      const validationResult = trackMetadataResponseSchema.validate(externalTrackData);
      if (validationResult.error) {
        logger.error(validationResult.error.details);
        throw new TrackServiceError("Failed to validate external track data", ErrorCodes.VALIDATION_ERROR, 422);
      }

      // Store the fetched tracks and fetch additional tracks by co-artists with same track name.
      let result = await trackRepository.insertMany(mapTracks(externalTrackData.data));
      this.fetchTrackWithCoArtist(result, artistName, name);
      return result;

    }
    return tracks;
  }

  async getAllTracks(): Promise<ITrack[]> {
    return await this.trackRepository.getAllTracks();
  }

  async getTrackById(id: string): Promise<ITrack> {
    const track = await this.trackRepository.getTrackById(id);
    if (!track) {
      throw new NotFoundError('Track not found', ErrorCodes.TRACK_NOT_FOUND);
    }
    return track;
  }

  async updateTrack(id: string, track: ITrack): Promise<ITrack> {
    if (isObjectEmpty(track)) {
      throw new TrackServiceError("Invalid input", ErrorCodes.FAILED_TO_UPDATE_TRACK, 400);
    }
    const trackDoc = await this.trackRepository.updateTrack(id, track);
    if (!trackDoc) {
      throw new NotFoundError("Failed to update track", ErrorCodes.TRACK_NOT_FOUND);
    }
    return trackDoc;
  }

  async deleteTrack(id: string): Promise<{ message: string, data: ITrack }> {
    const track = await this.trackRepository.deleteTrack(id);
    if (!track) {
      throw new NotFoundError('Track not found', ErrorCodes.TRACK_NOT_FOUND);
    }
    return { message: "Track deleted successfully", data: track };
  }
}

export const trackService = new TrackService(trackRepository);
export default TrackService;