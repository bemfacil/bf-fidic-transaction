import { SQSEvent, SQSHandler } from 'aws-lambda';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const consumeMessage: SQSHandler = async (event: SQSEvent) => {
  try {
    console.info('consumeMessage ')
    for (const record of event.Records) {
      const body = JSON.parse(record.body);
      console.log('Processando mensagem:', body);

      await prisma.transacao.create({
        data: {
          external_id: body.external_id,
          nsu: body.nsu,
          valor: body.valor,
          modalidade: body.modalidade,
          bandeira: body.bandeira,
          create_date: new Date(),
          update_date: new Date()
        },
      });
    }
  } catch (error) {
    console.error('Erro ao processar mensagem:', error);
  } finally {
    await prisma.$disconnect();
  }

  // O Lambda de SQS não precisa retornar nada.
  return;
};
