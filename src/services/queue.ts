import {connect, Channel, ConsumeMessage, ChannelModel} from 'amqplib';
import dotenv from 'dotenv';
import elasticService from './elastic';

dotenv.config();

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';
const QUEUE_NAME = 'plan-operations';

let connection: ChannelModel | null = null;
let channel: Channel | null = null;

export const initializeQueue = async () => {
  try {
    connection = await connect(RABBITMQ_URL);
    channel = await connection.createChannel();

    await channel.assertQueue(QUEUE_NAME, { durable: true });

    console.log('RabbitMQ queue initialized');

    startConsumer();
  } catch (error) {
    console.error('Error initializing RabbitMQ:', error);
  }
};

export const sendToQueue = async (operation: string, data: any) => {
  try {
    if (!channel) {
      throw new Error('RabbitMQ channel not initialized');
    }

    const message = {
      operation,
      data,
      timestamp: new Date().toISOString()
    };

    channel.sendToQueue(
      QUEUE_NAME,
      Buffer.from(JSON.stringify(message)),
      { persistent: true }
    );

    return true;
  } catch (error) {
    console.error('Error sending message to queue:', error);
    throw error;
  }
};

const startConsumer = async () => {
  try {
    if (!channel) {
      throw new Error('RabbitMQ channel not initialized');
    }

    await channel.consume(QUEUE_NAME, async (msg: ConsumeMessage | null) => {
      if (msg) {
        try {
          const message = JSON.parse(msg.content.toString());
          console.log(`Processing queue message: ${message.operation}`);

          switch (message.operation) {
            case 'CREATE':
              await elasticService.indexPlan(message.data);
              break;
            case 'UPDATE':
              await elasticService.updatePlanIndex(message.data);
              break;
            case 'DELETE':
              await elasticService.deletePlanIndex(message.data.objectId);
              break;
            default:
              console.warn(`Unknown operation: ${message.operation}`);
          }

          channel!.ack(msg);
        } catch (error) {
          console.error('Error processing queue message:', error);
          // Negative acknowledgment - message will be requeued
          channel!.nack(msg, false, true);
        }
      }
    });

    console.log('Queue consumer started');
  } catch (error) {
    console.error('Error starting queue consumer:', error);
  }
};

export const closeQueue = async () => {
  if (channel) await channel.close();
  if (connection) await connection.close();
};

export default {
  initializeQueue,
  sendToQueue,
  closeQueue
};