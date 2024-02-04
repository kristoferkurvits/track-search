import { trackService } from '../../src/service/trackService'
import { trackRepository } from '../../src/repository/trackRepository';

import { acrCloudApClient } from '../../src/api/acrCloudApClient';
import { mapTracks } from '../../src/util/mapper';
import { trackMetadataResponseSchema } from '../../src/model/api/validations/trackMetadataValidation';
import { isObjectEmpty } from '../../src/util/helper';
import { ErrorCodes } from '../../src/util/constants';
import TrackServiceError from '../../src/error/resolverError';
import NotFoundError from '../../src/error/notFoundError';

jest.mock('../../src/repository/trackRepository');
jest.mock('../../src/api/acrCloudApClient');
jest.mock('../../src/model/api/validations/trackMetadataValidation');

describe('getTrackByNameAndArtist', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });
  
  it('should return tracks from the repository when found', async () => {
    const mockTracks = [{ id: '1', name: 'Track 1', artistName: ['Artist'] }];
    (trackRepository.getTrackByNameAndArtist as jest.Mock).mockResolvedValue(mockTracks);

    const tracks = await trackService.getTrackByNameAndArtist('Track 1', 'Artist');

    expect(tracks).toEqual(mockTracks);
    expect(trackRepository.getTrackByNameAndArtist).toHaveBeenCalledWith('Track 1', 'Artist');
  });

  it('should fetch and insert tracks with co-artists when not found in the repository', async () => {
    (trackRepository.getTrackByNameAndArtist as jest.Mock).mockResolvedValue([]);

    const mockExternalTracks = [
      { name: 'The Recipe', artists: [{ name: 'Dr. Dre' }, { name: 'Kendrick Lamar' }], duration_ms: 300000, isrc: '12345', release_date: '2012-04-01' }
    ];
    const mockInsertedTracks = mapTracks(mockExternalTracks);

    (acrCloudApClient.fetchTrackMetadata as jest.Mock).mockResolvedValueOnce({ data: mockExternalTracks });
    
    (trackRepository.insertMany as jest.Mock).mockResolvedValue(mockInsertedTracks)

    const mockCoArtistTracks = [
      { name: 'The Recipe', artists: [{ name: 'Kendrick Lamar' }], duration_ms: 300000, isrc: '67890', release_date: '2012-04-01' }
    ];
    (acrCloudApClient.fetchTrackMetadata as jest.Mock).mockResolvedValueOnce({ data: mockCoArtistTracks });

    (trackMetadataResponseSchema.validate as jest.Mock).mockReturnValue({ value: {}, error: null });

    (trackRepository.insertMany as jest.Mock).mockImplementation(tracks => Promise.resolve(tracks));

    const tracks = await trackService.getTrackByNameAndArtist('The Recipe', 'Dr. Dre');

    expect(tracks).toHaveLength(1);
    expect(acrCloudApClient.fetchTrackMetadata).toHaveBeenCalledTimes(2);
    expect(trackRepository.insertMany).toHaveBeenCalledTimes(1);
  });


  it('should throw TrackServiceError when external track data validation fails', async () => {
    (trackRepository.getTrackByNameAndArtist as jest.Mock).mockResolvedValue([]);
    const externalTrackData = { /* invalid structure as returned by the external API */ };
    (acrCloudApClient.fetchTrackMetadata as jest.Mock).mockResolvedValue(externalTrackData);
    const validationError = new Error('Validation error');
    (trackMetadataResponseSchema.validate as jest.Mock).mockReturnValue({ error: validationError });

    await expect(trackService.getTrackByNameAndArtist('Invalid Track', 'Artist'))
      .rejects.toThrow('Failed to validate external track data');
  });

});


describe('getAllTracks', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should return all tracks', async () => {
    // Mock data that the repository would return
    const mockTracks = [
      { id: '1', name: 'Track 1', artistName: ['Artist 1'], /* other fields */ },
      { id: '2', name: 'Track 2', artistName: ['Artist 2'], /* other fields */ }
    ];

    (trackRepository.getAllTracks as jest.Mock).mockResolvedValue(mockTracks);

    const tracks = await trackService.getAllTracks();

    expect(tracks).toEqual(mockTracks);
    expect(trackRepository.getAllTracks).toHaveBeenCalled();
  });

});


describe('getTrackById', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should return a track when found by id', async () => {
    const mockTrack = { id: '1', name: 'Track 1', artistName: ['Artist'], /* other fields */ };

    (trackRepository.getTrackById as jest.Mock).mockResolvedValue(mockTrack);

    const track = await trackService.getTrackById('1');

    expect(track).toEqual(mockTrack);
    expect(trackRepository.getTrackById).toHaveBeenCalledWith('1');
  });

  it('should throw TrackServiceError when a track is not found', async () => {
    (trackRepository.getTrackById as jest.Mock).mockResolvedValue(null);

    await expect(trackService.getTrackById('nonexistent-id'))
      .rejects.toThrow('Track not found');
  });

});


describe('updateTrack', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should update the track when valid input is provided', async () => {
    const trackId = '1';
    const trackData = {
      name: 'New Track Name',
      artistName: ['New Artist'],
      duration: 123,
      ISRC: "f24c2c2a",
      releaseDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    (trackRepository.updateTrack as jest.Mock).mockResolvedValue({
      id: trackId,
      ...trackData,
    });

    const updatedTrack = await trackService.updateTrack(trackId, trackData);

    expect(trackRepository.updateTrack).toHaveBeenCalledWith(trackId, trackData);

    expect(updatedTrack).toEqual({ id: trackId, ...trackData });
  });

  it('should throw TrackServiceError when input is empty', async () => {
    const trackId = '1';
    const trackData = {};

    await expect(trackService.updateTrack(trackId, trackData))
      .rejects.toThrow(new TrackServiceError("Invalid input", ErrorCodes.FAILED_TO_UPDATE_TRACK, 503));
  });

  it('should throw TrackServiceError when track is not found', async () => {
    const trackId = '1';
    const trackData = {
      name: 'New Track Name',
      artistName: ['New Artist'],
    };

    // Mock the repository's updateTrack to resolve with null indicating track not found
    (trackRepository.updateTrack as jest.Mock).mockResolvedValue(null);

    // Expect the service method to throw TrackServiceError due to track not found
    await expect(trackService.updateTrack(trackId, trackData))
      .rejects.toThrow(new NotFoundError("Failed to update track", ErrorCodes.TRACK_NOT_FOUND));
  });
});

describe('deleteTrack', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should delete a track and return a success message', async () => {
    const id = '12312';
    const doc = { _id: id, name: 'dada' };

    (trackRepository.deleteTrack as jest.Mock).mockReturnValue(doc);

    const result = await trackService.deleteTrack(id);

    expect(result.message).toBe('Track deleted successfully');
    expect(result.data).toBe(doc);
  });

  it('should throw an error if the track is not found', async () => {
    (trackRepository.deleteTrack as jest.Mock).mockReturnValue(null);

    const id = 'non_existent_track_id';

    await expect(trackService.deleteTrack(id))
      .rejects.toThrow(new NotFoundError("Track not found", ErrorCodes.TRACK_NOT_FOUND));
    }
  );
});