import jwt from 'jsonwebtoken';
import AppConfig from './appConfig';
import AuthenticationError from '../error/authenticationError';
import { ErrorCodes } from '../util/constants';
import TrackServiceError from '../error/resolverError';
import logger from "../config/loggerConfig";

const config = AppConfig.getInstance();

export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, config.JWT_SECRET);
  } catch (error) {
    logger.error("Failed to verify jwt token");
    throw new AuthenticationError('Valid authentication required', ErrorCodes.ACCESS_DENIED);
  }
};


export const generateToken = (): string => {
  try {
    const payload = {
      sub: "user_id",
      iat: Math.floor(Date.now() / 1000), // Issued at time
      exp: Math.floor(Date.now() / 1000) + (60 * 60), // 1 HOUR
    };
    return jwt.sign(payload, config.JWT_SECRET);
  } catch (error) {
    logger.error(`Error while generating token`, error);
    throw new TrackServiceError("Failed to generate token", ErrorCodes.FAILED_TO_UPDATE_TRACK, 503);
  }
};
