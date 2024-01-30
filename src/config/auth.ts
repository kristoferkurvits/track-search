import jwt from 'jsonwebtoken';
import AppConfig from './appConfig';
import AuthenticationError from '../error/authenticationError';
const config = AppConfig.getInstance();

export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, config.JWT_SECRET);
  } catch (error) {
    throw new AuthenticationError('Valid authentication required', ErrorCodes.ACCESS_DENIED);
  }
};


export const generateToken = (requestId: string) => {
  const payload = {
    sub: requestId,
    iat: Math.floor(Date.now() / 1000), // Issued at time
    exp: Math.floor(Date.now() / 1000) + (60 * 60), //1 HOUR
  };

  return jwt.sign(payload, config.JWT_SECRET);
};