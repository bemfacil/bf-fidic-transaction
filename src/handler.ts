import { APIGatewayProxyHandler } from 'aws-lambda';
import { SQS } from 'aws-sdk';

const sqs = new SQS();

export const sendMessage: APIGatewayProxyHandler = async (event) => {
  let body;

  if (typeof event.body === 'string') {
    body = JSON.parse(event.body);
  } else {
    body = event.body;
  }

  const params = {
    QueueUrl: process.env.SQS_QUEUE_URL as string,
    MessageBody: JSON.stringify(body),
  };
  try {
    await sqs.sendMessage(params).promise();
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Mensagem enviada com sucesso!' }),
    };
  } catch (error) {
    console.error('Erro ao enviar mensagem: ', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Erro ao enviar mensagem' }),
    };
  }
};
