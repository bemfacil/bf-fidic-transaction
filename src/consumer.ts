import { SQSEvent, SQSHandler } from 'aws-lambda';
import { ArranjoStatusEnum, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const consumeMessage: SQSHandler = async (event: SQSEvent) => {
  try {
    console.info('consumeMessage ')
    for (const record of event.Records) {
      const body = JSON.parse(record.body);
      console.log('Processando mensagem:', body);
      let data_vencimento = new Date(body.data_vencimento);
      let arranjo_envio = await verificaArranjo(data_vencimento, body.modalidade, body.bandeira);
      await prisma.transacao.create({
        data: {
          arranjo_envio_id: arranjo_envio.id,
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
async function verificaArranjo(data_vencimento: Date, modalidade: string, bandeira: string) {
  let arranjo_envio = null;
  let arranjo = await prisma.arranjo.findUnique({
    where: {
      arranjo_group: {
        data_vencimento,
        modalidade: modalidade,
        bandeira: bandeira
      }
    }
  });
  if (arranjo) {
    let arranjoEnvio = await prisma.arranjoEnvio.findMany({
      where: {
        arranjo_id: arranjo.id,
        status: ArranjoStatusEnum.CRIADO
      }
    });
    if (arranjoEnvio.length) {
      return arranjoEnvio[0];
    }
  }
  if (!arranjo_envio) {
    if (!arranjo) {
      arranjo = await prisma.arranjo.create({
        data: {
          data_vencimento,
          data_pagamento: data_vencimento,
          bandeira: bandeira,
          modalidade: modalidade,
          create_date: new Date(),
          update_date: new Date()
        }
      });
    }
    arranjo_envio = await prisma.arranjoEnvio.create({
      data: {
        arranjo_id: arranjo.id,
        valor_enviado: null,
        valor: 0,
        create_date: new Date(),
        update_date: new Date()
      }
    });
  }
  return arranjo_envio;
}

