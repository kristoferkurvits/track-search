import 'dotenv/config';
import { ApolloServer } from 'apollo-server';
import { apolloServerConfig } from './config/apolloConfig';

async function startApolloServer() {
  const server = new ApolloServer(apolloServerConfig);

  const { url } = await server.listen();
  console.log(`🚀 Server ready at ${url}`);
}

startApolloServer().catch(err => {
  console.error('Failed to start Apollo Server:', err);
});