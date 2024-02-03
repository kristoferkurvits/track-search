import { formatGraphQLError } from './errorConfig';
import { typeDefs } from '../graphql/schema';
import { trackResolvers } from '../resolver/trackResolvers';
import { verifyToken } from './auth';
import { v4 as uuidv4 } from 'uuid';
import { config } from 'dotenv';
import AppConfig from './appConfig';

const { parse } = require('graphql');
const appConfig = AppConfig.getInstance();

const rateLimits = new Map();

const WINDOW_SIZE_IN_HOURS = 1;
const WINDOW_LOG_INTERVAL_IN_MINUTES = 1;
const MAX_REQUESTS_PER_WINDOW = 5;

setInterval(() => {
    rateLimits.clear();
  }, WINDOW_SIZE_IN_HOURS * 60 * 60 * 1000);
  
  setInterval(() => {
    console.log(rateLimits);
  }, WINDOW_LOG_INTERVAL_IN_MINUTES * 60 * 1000);

  const rateLimitPlugin = {
    async requestDidStart(requestContext) {
      const { context, request } = requestContext;
  
      requestContext.overallCachePolicy = {
        maxAge: 60,
        scope: 'PRIVATE',
      };
  
      const queryName = request.operationName;
      const ip = request.http.headers.get('x-forwarded-for');
  
      if (queryName === 'issueToken') {
        const key = `${ip}:${queryName}`;
        const current = rateLimits.get(key) || { count: 0, timestamp: Date.now() };
  
        if (Date.now() - current.timestamp > 60 * 1000) {  // Reset every 60 seconds
          rateLimits.set(key, { count: 1, timestamp: Date.now() });
        } else {
          if (current.count >= MAX_REQUESTS_PER_WINDOW) {
            throw new Error('Rate limit exceeded');
          }
          rateLimits.set(key, { ...current, count: current.count + 1 });
        }
      }
    }
  };

export const apolloServerConfig = {
    typeDefs,
    resolvers: trackResolvers,
    formatError: formatGraphQLError,
    introspection: true,
    context: ({ req }) => {
        const requestId = uuidv4();
        console.log(`Incoming request ${requestId}: ${req.body.operationName}`);

        var tokenMutation = parse(req.body.query).definitions[0].selectionSet.selections[0].name.value;
        if (tokenMutation === "issueToken" || req.body.operationName === "IntrospectionQuery") {
            return {
                requestId: requestId
            };
        }

        const tokenWithBearer = req.headers.authorization || '';
        const token = tokenWithBearer.split(' ')[1];
        const user = verifyToken(token);

        return {
            requestId: requestId,
            user: user
        };
    },
};

