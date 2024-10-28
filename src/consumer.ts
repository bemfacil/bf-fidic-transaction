import { SQSEvent, SQSHandler } from 'aws-lambda';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const consumeMessage: SQSHandler = async (event: SQSEvent) => {
  try {
    console.info('consumeMessage ')
    for (const record of event.Records) {
      const body = JSON.parse(record.body);
      console.log('Processando mensagem:', body);
      let data_vencimento = new Date(body.data_vencimento);
      await prisma.transacao.create({
        data: {
          external_id: body.external_id,
          parcela_cod: body.parcela_cod,
          nsu: body.nsu,
          valor: body.valor,
          mdr: body.mdr,
          bandeira: body.bandeira,
          modalidade: body.modalidade,
          adquirente: body.adquirente,
          data_vencimento: data_vencimento,
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
