import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import logger from "../config/loggerConfig";

export class HttpClient {
  private static instance: AxiosInstance;

  private constructor() {}

  public static getInstance(): AxiosInstance {
    if (!HttpClient.instance) {
      const config: AxiosRequestConfig = {
        headers: {
          'Content-Type': 'application/json'
        }
      };

      HttpClient.instance = axios.create(config);

      HttpClient.instance.interceptors.response.use(
        (response) => response,
        (error) => {
          logger.error('HTTP Client Error:', error);
          return Promise.reject(error);
        }
      );
    }

    return HttpClient.instance;
  }
}
