import { AxiosRequestConfig, AxiosResponse } from "axios";
import {ITrackSearchParams} from "../model/api/acrCloudApiRequest.model";

import { ITrackMetadataResponse } from "../model/api/acrCloudApiResponse.model";
import { HttpClient } from "../config/HttpClientConfig";
import ApiError from "../error/apiError";
import { ErrorCodes } from '../util/constants';
import AppConfig from "../config/appConfig";

const config = AppConfig.getInstance();

const ACR_BASE_URL = config.ACR_BASE_URL;

class AcrCloudAPIClient {
  private httpClient = HttpClient.getInstance();
  private readonly token: string;

  constructor(token: string) {
    this.token = token;
  }

  public async fetchTrackMetadata(params: ITrackSearchParams): Promise<ITrackMetadataResponse> {
    const config: AxiosRequestConfig = {
      method: 'get',
      url: ACR_BASE_URL+'/external-metadata/tracks',
      params: {
        ...params,
        query: params.query && typeof params.query === 'object' ? JSON.stringify(params.query) : params.query,
      },
      headers: {
        "Authorization": `Bearer ${this.token}`
      }
    };

    try {
      const response: AxiosResponse = await this.httpClient.request(config);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch track metadata:', error);
      throw new ApiError("Failed to fetch track metadata", ErrorCodes.FAILED_TO_FETCH_TRACK_METADATA)
    }
  }
}

export const acrCloudApClient = new AcrCloudAPIClient(config.ACR_TOKEN);
