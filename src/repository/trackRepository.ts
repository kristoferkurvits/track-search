import { ErrorCodes } from "../util/constants";
import { ITrack, Track } from "../model/track.model";
import { connectToDatabase } from "../database/mongodb";
import TrackServiceError from "../error/resolverError";
import logger from "../config/loggerConfig";
import { buildFlexibleRegex } from "../util/helper";

export interface ITrackRepository {
  getTrackByNameAndArtist(name: string, artistName: string): Promise<ITrack[]>;
  getAllTracks(): Promise<ITrack[]>;
  getTrackById(id: string): Promise<ITrack>;
  insertMany(tracks: ITrack[]): Promise<ITrack[]>;
  updateTrack(id: string, input: Partial<ITrack>): Promise<ITrack>;
  deleteTrack(id: string): Promise<ITrack>;
}

class TrackRepository implements ITrackRepository {
  constructor() {
    connectToDatabase();
  }


  async getTrackByNameAndArtist(name: string, artistName: string): Promise<ITrack[]> {
    try {
      return await Track.find({
        //Using Regex to better match External API search function
        name: { $regex: buildFlexibleRegex(name)},
        artistName: { $regex: buildFlexibleRegex(artistName)}
      }).exec();
    } catch (error) {
      logger.error("Error while fetching track by name and artist: ", error);
      throw new TrackServiceError("Failed to fetch tracks by name and artist", ErrorCodes.FAILED_TO_GET_TRACK, 503);
    }
  }

  async getAllTracks(): Promise<ITrack[]> {
    try {
      return await Track.find({}).exec();
    }
    catch (error) {
      logger.error("Error while fetching all tracks: ", error);
      throw new TrackServiceError("Failed to fetch tracks", ErrorCodes.FAILED_TO_GET_TRACKS, 503);
    }
  }

  async getTrackById(id: string): Promise<ITrack> {
    try {
      return await Track.findById(id).exec();
    } catch (error) {
      logger.error(`Error in getTrackById for ID ${id}: `, error);
      throw new TrackServiceError('Failed to fetch track by ID', ErrorCodes.FAILED_TO_GET_TRACK, 503);
    }
  }

  async insertMany(tracks: ITrack[]): Promise<ITrack[]> {
    try {
      return await Track.insertMany(tracks);
    } catch (error) {
      logger.error("Error in insertMany: ", error);
      throw new TrackServiceError('Failed to insert tracks', ErrorCodes.FAILED_TO_INSERT_TRACKS, 503);
    }
  }

  async updateTrack(id: string, input: ITrack): Promise<ITrack> {
    try {
      return await Track.findByIdAndUpdate(id, { $set: input }, { new: true }).exec();
    } catch (error) {
      logger.error(`Error in updateTrack for ID ${id}: `, error);
      throw new TrackServiceError('Failed to update track', ErrorCodes.FAILED_TO_UPDATE_TRACK, 503);
    }
  }

  async deleteTrack(id: string): Promise<ITrack> {
    try {
      return await Track.findByIdAndDelete(id).exec();
    } catch (error) {
      logger.error(`Error in deleteTrack for ID ${id}: `, error);
      throw new TrackServiceError('Failed to delete track', ErrorCodes.FAILED_TO_DELETE_TRACK, 503);
    }
  }
}

export const trackRepository = new TrackRepository();
