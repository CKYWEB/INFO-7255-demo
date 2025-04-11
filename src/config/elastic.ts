import dotenv from "dotenv";

dotenv.config();

export const elasticConfig = {
  node: process.env.ELASTICSEARCH_NODE || 'http://localhost:9200',
  auth: {
    apiKey: {
      id: process.env.ELASTICSEARCH_API_ID || 'foo',
      api_key: process.env.ELASTICSEARCH_API_KEY || 'bar',
    },
  }
};