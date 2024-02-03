import { trackService } from '../../src/service/trackService'
import { trackRepository } from '../../src/repository/trackRepository';

import { acrCloudApClient } from '../../src/api/acrCloudApClient';
import { mapTracks } from '../../src/util/mapper';
import { trackMetadataResponseSchema } from '../../src/model/api/validations/trackMetadataValidation';
import { isObjectEmpty } from '../../src/util/helper';
import { ErrorCodes } from '../../src/util/constants';
import TrackServiceError from '../../src/error/resolverError';

jest.mock('../../src/repository/trackRepository');
jest.mock('../../src/api/acrCloudApClient');
jest.mock('../../src/util/mapper');
jest.mock('../../src/model/api/validations/trackMetadataValidation');

describe('TrackService Queries', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });
  

  /*
    Get track by name and artistName
  */
  it('should return tracks from the repository when found', async () => {
    const mockTracks = [{ id: '1', name: 'Track 1', artistName: ['Artist'] }];
    (trackRepository.getTrackByNameAndArtist as jest.Mock).mockResolvedValue(mockTracks);

    const tracks = await trackService.getTrackByNameAndArtist('Track 1', 'Artist');

    expect(tracks).toEqual(mockTracks);
    expect(trackRepository.getTrackByNameAndArtist).toHaveBeenCalledWith('Track 1', 'Artist');
  });


  it('should fetch track data from external API and save it when not found in the repository', async () => {
    (trackRepository.getTrackByNameAndArtist as jest.Mock).mockResolvedValue([]);
    const externalTrackData = {};
    (acrCloudApClient.fetchTrackMetadata as jest.Mock).mockResolvedValue(externalTrackData);
    (trackMetadataResponseSchema.validate as jest.Mock).mockReturnValue({ error: null });
    const mappedTracks = [{}];
    (mapTracks as jest.Mock).mockReturnValue(mappedTracks);
    (trackRepository.insertMany as jest.Mock).mockResolvedValue(mappedTracks);

    const tracks = await trackService.getTrackByNameAndArtist('Track 1', 'Artist');

    expect(tracks).toEqual(mappedTracks);
    expect(acrCloudApClient.fetchTrackMetadata).toHaveBeenCalled();
    expect(trackMetadataResponseSchema.validate).toHaveBeenCalledWith(externalTrackData);
    expect(trackRepository.insertMany).toHaveBeenCalledWith(mappedTracks);
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

  /*
    Get all tracks
  */
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

  /*
    Get track by ID
  */
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


describe('TrackSeervicee UpdateTrack', () => {
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

    (isObjectEmpty as jest.Mock).mockReturnValue(false);

    const updatedTrack = await trackService.updateTrack(trackId, trackData);

    expect(trackRepository.updateTrack).toHaveBeenCalledWith(trackId, trackData);

    expect(updatedTrack).toEqual({ id: trackId, ...trackData });
  });

  // Test for error when provided input is empty
  it('should throw TrackServiceError when input is empty', async () => {
    const trackId = '1';
    const trackData = {}; // Empty track data

    // Mock isObjectEmpty to return true indicating the object is empty
    (isObjectEmpty as jest.Mock).mockReturnValue(true);

    // Expect the service method to throw TrackServiceError due to empty input
    await expect(trackService.updateTrack(trackId, trackData))
      .rejects.toThrow(new TrackServiceError("Invalid input", ErrorCodes.FAILED_TO_UPDATE_TRACK));
  });

  // Test for error when track is not found
  it('should throw TrackServiceError when track is not found', async () => {
    const trackId = '1';
    const trackData = {
      name: 'New Track Name',
      artistName: 'New Artist',
    };

    // Mock the repository's updateTrack to resolve with null indicating track not found
    (trackRepository.updateTrack as jest.Mock).mockResolvedValue(null);

    // Mock isObjectEmpty to return false indicating the object is not empty
    (isObjectEmpty as jest.Mock).mockReturnValue(false);

    // Expect the service method to throw TrackServiceError due to track not found
    await expect(trackService.updateTrack(trackId, trackData))
      .rejects.toThrow(new TrackServiceError("Failed to update track", ErrorCodes.TRACK_NOT_FOUND));
  });
});