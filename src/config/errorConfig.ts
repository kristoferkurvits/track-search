import { GraphQLError } from 'graphql';
import TrackServiceError from '../error/resolverError';
import ApiError from '../error/apiError';

export const formatGraphQLError = (error: GraphQLError) => {
  if (error.originalError instanceof TrackServiceError ||
    error.originalError instanceof ApiError
    ) {
    return {
      message: error.originalError.message,
      code: error.originalError.code,
      locations: error.locations,
      path: error.path,
    };
  }
  console.error(JSON.stringify(error, null, 2));
  return {
    message: error.message,
    code: error.extensions.code,
    locations: error.locations,
    path: error.path,
  };
};
