import { trackService } from '../service/trackService';
import { ITrack } from '../model/track.model';
import { generateToken } from "../config/auth";

export const trackResolvers = {
  Query: {
    getTrackByNameAndArtist: async (_, { name, artistName }: { name: string, artistName: string }): Promise<ITrack[]> => {
      return await trackService.getTrackByNameAndArtist(name, artistName);
    },
    getAllTracks: async (): Promise<ITrack[]> => {
      return await trackService.getAllTracks();
    },
    getTrackById: async (_, { id }: { id: string }): Promise<ITrack> => {
      return await trackService.getTrackById(id);
    },
  },
  Mutation: {
    issueToken: (): String => {
      return generateToken();
    },
    updateTrack: async (_, { id, track }: { id: string, track: ITrack }): Promise<ITrack> => {
      return await trackService.updateTrack(id, track);
    },
    deleteTrack: async (_, { id }: { id: string }): Promise<{ message: string }> => {
      return await trackService.deleteTrack(id);
    },
  },
};
