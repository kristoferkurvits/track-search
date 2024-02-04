import 'dotenv/config';
import { ApolloServer } from 'apollo-server';
import { apolloServerConfig } from './config/apolloConfig';
import logger from "./config/loggerConfig";

async function startApolloServer() {
  const server = new ApolloServer(apolloServerConfig);

  const { url } = await server.listen();
  logger.info(`🚀 Server ready at ${url}`);
}

startApolloServer().catch(err => {
  logger.error('Failed to start Apollo Server:', err);
});