import { GraphQLError } from 'graphql';
import ResolverError from '../error/resolverError';
import ApiError from '../error/apiError';

export const formatGraphQLError = (error: GraphQLError) => {
  if (error.originalError instanceof ResolverError ||
    error.originalError instanceof ApiError
    ) {
    return {
      message: error.message,
      code: error.originalError.code,
      locations: error.locations,
      path: error.path,
    };
  }
  console.log(JSON.stringify(error, null, 2));
  return {
    message: 'Internal Server Error',
    code: 'INTERNAL_SERVER_ERROR',
    locations: error.locations,
    path: error.path,
  };
};
