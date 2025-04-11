import dotenv from "dotenv";

dotenv.config();

export const elasticConfig = {
  node: process.env.ELASTICSEARCH_NODE || 'http://localhost:9200',
  auth: {
    apiKey: process.env.ELASTICSEARCH_API_KEY,
  }
};