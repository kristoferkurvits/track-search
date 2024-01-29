import ResolverError from "../error/resolverError";

import {Track, ITrack} from "../model/track.model";
import AcrCloudAPIClient from "../api/acrCloudApClient";
import AppConfig from "../config/appConfig";

const config = AppConfig.getInstance();
const acrCloudApClient = new AcrCloudAPIClient(config.ACR_TOKEN);


const trackResolvers = {
  Query: {
    getTrackByNameAndArtist: async (_, { name, artistName }): Promise<ITrack> => {
      let track = null;
    try {
      track = await Track.findOne({ name, artistName });
      if (!track) {
        //TODO create and pass query params to request
        const externalTrackData = await acrCloudApClient.fetchTrackMetadata();
        // Validate externalTrackData here before saving
        track = new Track(externalTrackData);
        await track.save();
      }
    } catch (error) {
      console.error("Error while fetching track by name and artist ", error);
      throw new ResolverError("Failed to fetch the track", ErrorCodes.FAILED_TO_GET_TRACK);
    }
    return track;
    },
    //Consider implementing pagination
    getAllTracks: async (): Promise<ITrack[]> => {
      try {
        return await Track.find({});
      } catch(error) {
        console.error("Error while fetching tracks: ", error);
        throw new ResolverError("Failed to fetch tracks", ErrorCodes.FAILED_TO_GET_TRACKS);
      }
        
    },
    getTrackById: async (_, { id }): Promise<ITrack> => {
      try {
        const track = await Track.findById(id);
        if (!track) {
          throw new ResolverError('Track not found', ErrorCodes.TRACK_NOT_FOUND);
        }
        return track;
      } catch (error) {
        console.error("Error while fetching track by ID: ", error);
        throw new ResolverError("Failed to fetch track by ID", ErrorCodes.FAILED_TO_GET_TRACK);
      }
      },
  },
  Mutation: {
    updateTrack: async (_, { id, input }): Promise<ITrack> => {
      try {
        const track = await Track.findByIdAndUpdate(id, input, { new: true });
        if (!track) {
          throw new ResolverError("Failed to update track", ErrorCodes.TRACK_NOT_FOUND);
        }
        return track;
      } catch (error) {
        console.error("Error while updating track with ID: " + id, error);
        throw new ResolverError("Failed to update track with ID: " + id, ErrorCodes.FAILED_TO_GET_TRACK);
      }
        
    },
    deleteTrack: async (_, { id }) => {
      try {
        const track = await Track.findByIdAndDelete(id);
        if (!track) {
          throw new ResolverError('Track not found', ErrorCodes.TRACK_NOT_FOUND);
        }
        return { message: "Track deleted successfully", id };
      } catch (error) {
        console.error("Error while deleting track: ", error);
        throw new ResolverError("Failed to delete the track", ErrorCodes.FAILED_TO_DELETE_TRACK);
      }
    },
  },
};