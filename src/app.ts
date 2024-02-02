import 'dotenv/config';
import { ApolloServer } from 'apollo-server';
import { apolloServerConfig } from './config/apolloConfig';
import { connectToDatabase } from './database/mongodb';


async function startApolloServer() {
  await connectToDatabase();

  const server = new ApolloServer(apolloServerConfig);

  const { url } = await server.listen();
  console.log(`🚀 Server ready at ${url}`);
}

startApolloServer().catch(err => {
  console.error('Failed to start Apollo Server:', err);
});