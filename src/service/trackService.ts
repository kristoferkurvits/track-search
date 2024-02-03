import { ITrack } from "../model/track.model";
import { ITrackMetadataResponse } from "../model/api/acrCloudApiResponse.model";
import { acrCloudApClient } from "../api/acrCloudApClient";
import AppConfig from "../config/appConfig";
import TrackServiceError from "../error/resolverError";

import { ITrackRepository, trackRepository } from "../repository/trackRepository";

import { ErrorCodes } from '../util/constants';
import { trackMetadataResponseSchema } from "../model/api/validations/trackMetadataValidation";
import { mapTracks } from "../util/mapper";
import { isObjectEmpty } from "../util/helper";

const config = AppConfig.getInstance();

class TrackService {
  constructor(private trackRepository: ITrackRepository) { }

  /*
    *Aim of the fetchArtistsInBackground function*
    Example:
      When fetchTrackWithCoArtist is called for the first time with the payload:
      { 
        "name": "The Recipe",
        "artistName": "Dr. Dre"
      }

      and entries are missing in the Database, The External API receives 1 track where the artists are
      ["Kendrick Lamar", "Dr. Dre"]. When second call is made with payload:
      
      { 
        "name": "The Recipe",
        "artistName": "Kendrick Lamar"
      }
      An entry is found from the Database.
      The problem is that the External API would return another track.
      Function fetchTrackWithCoArtist makes sure that all the tracks get fetched by all the possible artists.

      Alternative would be to store tracks by single artist but then there would be ISRC duplications
      which is not desired outcome when wanting to fetch Tracks by ISRC.
  */


  async fetchTrackWithCoArtist(alreadyFetchedTracks: ITrack[], originalArtistName: string, name: string) {
    let existingISRCCodes = new Set();
    let artistsToFetch = new Set();
    for (const track of alreadyFetchedTracks) {
      existingISRCCodes.add(track.ISRC);
      track.artistName
        .filter(name  => name !== originalArtistName)
        .map(name => artistsToFetch.add(name));
    }

    for (let artist of artistsToFetch) {
      // Fetch additional track data from the external API.
      const additionalTrackData: ITrackMetadataResponse = await acrCloudApClient.fetchTrackMetadata({
        query: JSON.stringify({ "track": name, "artists": [artist] }),
        format: 'json'
      });

      // Validate the fetched track data.
      let validationResult = trackMetadataResponseSchema.validate(additionalTrackData);
      if (validationResult.error) {
        console.error("Validation failed for additional track data:", validationResult.error.details);
        continue; // Skip this track as the data is invalid.
      }
      let uniqueNewISRCs = new Set();
      for (let additionalTrack of additionalTrackData.data) {
        if (!existingISRCCodes.has(additionalTrack.isrc)) {
          uniqueNewISRCs.add(additionalTrack.isrc);
        }
      }

      const newTracks = additionalTrackData.data.filter(track => uniqueNewISRCs.has(track.isrc));
      if (newTracks.length > 0) {
        await trackRepository.insertMany(mapTracks(newTracks));
      }
    }
  }

  async getTrackByNameAndArtist(name: string, artistName: string): Promise<ITrack[]> {
    let tracks = await this.trackRepository.getTrackByNameAndArtist(name, artistName);

    if (tracks.length === 0) {
      const externalTrackData: ITrackMetadataResponse = await acrCloudApClient.fetchTrackMetadata({
        query: JSON.stringify({ "track": name, "artists": [artistName] }),
        format: 'json'
      });

      let validationResult = trackMetadataResponseSchema.validate(externalTrackData);
      if (validationResult.error) {
        console.error(validationResult.error.details);
        throw new TrackServiceError("Failed to validate external track data", ErrorCodes.VALIDATION_ERROR);
      }

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
    return { message: "Track deleted successfully" };
  }
}

export const trackService = new TrackService(trackRepository);
