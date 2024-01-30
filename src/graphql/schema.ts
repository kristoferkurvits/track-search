import { gql } from 'apollo-server';
import fs from 'fs';
import path from 'path';

const schemaFilePath = path.join(__dirname, 'schema.graphql');
const typeDefs = gql(fs.readFileSync(schemaFilePath, 'utf-8'));

export { typeDefs };