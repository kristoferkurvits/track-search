import 'dotenv/config';
import { ApolloServer } from 'apollo-server';
import { apolloServerConfig } from './config/apolloConfig';

const server = new ApolloServer(apolloServerConfig);

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});