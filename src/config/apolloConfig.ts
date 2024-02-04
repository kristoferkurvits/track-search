import { formatGraphQLError } from './errorConfig';
import { typeDefs } from '../graphql/schema';
import { trackResolvers } from '../resolver/trackResolvers';
import { verifyToken } from './auth';
import { v4 as uuidv4 } from 'uuid';
import logger from "../config/loggerConfig";

const { parse } = require('graphql');


export const apolloServerConfig = {
    path: "/graphql",
    typeDefs,
    resolvers: trackResolvers,
    formatError: formatGraphQLError,
    introspection: true,
    context: ({ req }) => {
        const requestId = uuidv4();
        logger.info(`Incoming request ${requestId}: ${req.body.operationName}`);

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

