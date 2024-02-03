import DatabaseError from "../error/databaseError";
import { ErrorCodes } from "../util/constants";
import { ITrack, Track } from "../model/track.model";
import { connectToDatabase } from "../database/mongodb";
import mongoose from "mongoose";

export interface ITrackRepository {
  getTrackByNameAndArtist(name: string, artistName: string): Promise<ITrack[]>;
  getAllTracks(): Promise<ITrack[]>;
  getTrackById(id: string): Promise<ITrack>;
  getTrackByISRC(isrc: string, session: mongoose.ClientSession): Promise<ITrack>
  insertMany(tracks: ITrack[], session: mongoose.ClientSession): Promise<ITrack[]>;
  updateTrack(id: string, input: Partial<ITrack>): Promise<ITrack>;
  deleteTrack(id: string): Promise<ITrack>;
}

class TrackRepository implements ITrackRepository {
  constructor() {
    connectToDatabase();
  }

  async getTrackByISRC(isrc: string, session: mongoose.ClientSession): Promise<ITrack> {
    try {
      return await Track.findOne({ isrc: isrc }, null, { session }).exec();
    } catch (error) {
      console.log(error);
    }
  }


  async getTrackByNameAndArtist(name: string, artistName: string): Promise<ITrack[]> {
    try {
      return await Track.find({
        //The reason of using regex is that external API returns different versions of a song, e.g remixes etc. So im looking for multiple matches.
        name: { $regex: `^${name}`, $options: 'i' },
        artistName
      }).exec();
    } catch (error) {
      console.error("Error while fetching track by name and artist: ", error);
      throw new DatabaseError("Failed to fetch tracks by name and artist", ErrorCodes.FAILED_TO_GET_TRACK);
    }
  }

  async getAllTracks(): Promise<ITrack[]> {
    try {
      return await Track.find({}).exec();
    }
    catch (error) {
      console.error("Error while fetching all tracks: ", error);
      throw new DatabaseError("Failed to fetch tracks", ErrorCodes.FAILED_TO_GET_TRACKS);
    }
  }

  async getTrackById(id: string): Promise<ITrack> {
    try {
      return await Track.findById(id).exec();
    } catch (error) {
      console.error(`Error in getTrackById for ID ${id}: `, error);
      throw new DatabaseError('Failed to fetch track by ID', ErrorCodes.FAILED_TO_GET_TRACK);
    }
  }

  async insertMany(tracks: ITrack[], session: mongoose.ClientSession): Promise<ITrack[]> {
    try {
      return await Track.insertMany(tracks, { session });
    } catch (error) {
      console.error("Error in insertMany: ", error);
      throw new DatabaseError('Failed to insert tracks', ErrorCodes.FAILED_TO_INSERT_TRACKS);
    }
  }

  async updateTrack(id: string, input: ITrack): Promise<ITrack> {
    try {
      return await Track.findByIdAndUpdate(id, { $set: input }, { new: true }).exec();
    } catch (error) {
      console.error(`Error in updateTrack for ID ${id}: `, error);
      throw new DatabaseError('Failed to update track', ErrorCodes.FAILED_TO_UPDATE_TRACK);
    }
  }

  async deleteTrack(id: string): Promise<ITrack> {
    try {
      return await Track.findByIdAndDelete(id).exec();
    } catch (error) {
      console.error(`Error in deleteTrack for ID ${id}: `, error);
      throw new DatabaseError('Failed to delete track', ErrorCodes.FAILED_TO_DELETE_TRACK);
    }
  }
}

export const trackRepository = new TrackRepository();
