import ResolverError from "../error/resolverError";
import { trackService } from '../service/trackService';
import { ITrack } from '../model/track.model';
import { generateToken } from "../config/auth";
import { ErrorCodes } from '../util/constants';

export const trackResolvers = {
  Query: {
    getTrackByNameAndArtist: async (_, { name, artistName }): Promise<ITrack[]> => {
      try {
        return await trackService.getTrackByNameAndArtist(name, artistName);
      } catch (error) {
        console.error("Error while fetching track by name and artist ", error);
        throw new ResolverError("Failed to fetch the track", ErrorCodes.FAILED_TO_GET_TRACK);
      }
    },
    getAllTracks: async (): Promise<ITrack[]> => {
      try {
        return await trackService.getAllTracks();
      } catch (error) {
        console.error("Error while fetching all tracks: ", error);
        throw new ResolverError("Failed to fetch tracks", ErrorCodes.FAILED_TO_GET_TRACKS);

      }
    },
    getTrackById: async (_, { id }): Promise<ITrack> => {
      try {
        return await trackService.getTrackById(id);
      } catch (error) {
        console.error("Error while fetching track by ID: ", error);
        throw new ResolverError("Failed to fetch track by ID", ErrorCodes.FAILED_TO_GET_TRACK);
      }
    },
  },
  Mutation: {
    issueToken: (): String => {
      try {
        console.log("issueToken mutation");
        return generateToken();
      }catch (error) {
        console.error(`Error while generating token`, error);
        throw new ResolverError("Failed to generate token", ErrorCodes.FAILED_TO_UPDATE_TRACK);
      }
    },
    updateTrack: async (_, { id, input }): Promise<ITrack> => {
      try {
        return await trackService.updateTrack(id, input);
      } catch (error) {
        console.error(`Error while updating track with ID: ${id}`, error);
        throw new ResolverError("Failed to update track", ErrorCodes.FAILED_TO_UPDATE_TRACK);
      }
    },
    deleteTrack: async (_, { id }): Promise<{ message: string, id: string }> => {
      try {
        return await trackService.deleteTrack(id);
      } catch (error) {
        console.error("Error while deleting track: ", error);
        throw new ResolverError("Failed to delete the track", ErrorCodes.FAILED_TO_DELETE_TRACK);
      }
    },
  },
};
