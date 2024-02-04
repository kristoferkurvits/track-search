import { GraphQLError } from 'graphql';
import TrackServiceError from '../error/resolverError';
import ApiError from '../error/apiError';
import AuthenticationError from '../error/authenticationError';
import NotFoundError from '../error/notFoundError';
import logger from "../config/loggerConfig";

export const formatGraphQLError = (error: GraphQLError) => {
  if (error.originalError instanceof TrackServiceError ||
    error.originalError instanceof ApiError ||
    error.originalError instanceof NotFoundError) {
    return {
      message: error.originalError.message,
      code: error.originalError.code,
      locations: error.locations,
      path: error.path,
      extensions: {
        http: {
          status: error.originalError.statusCode
        }
      }
    };
  }

  if (error instanceof AuthenticationError) {
    return {
      message: error.message,
      code: error.statusCode,
      extensions: {
        http: {
          status: error.statusCode
        }
      }
    };
  }

  logger.error(JSON.stringify(error, null, 2));
  return {
    message: error.message,
    code: error.extensions.code,
    locations: error.locations,
    path: error.path
  };
};
