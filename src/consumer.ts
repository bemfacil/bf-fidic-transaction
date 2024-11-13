import { SQSEvent, SQSHandler } from 'aws-lambda';
import { ArrangementStatusEnum, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const consumeMessage: SQSHandler = async (event: SQSEvent) => {
  try {
    console.info('consumeMessage ')
    for (const record of event.Records) {
      const body = JSON.parse(record.body);
      console.log('Processando mensagem:', body);
      let data_vencimento = new Date(body.data_vencimento);
      let arranjo_envio = await verificaArranjo(data_vencimento, body.modalidade, body.bandeira);
      await prisma.fidicTransaction.create({
        data: {
          shipping_arrangement_id: arranjo_envio.id,
          external_id: body.external_id,
          installment_cod: body.parcela_cod,
          nsu: body.nsu,
          amount: body.valor,
          mdr: body.mdr,
          flag: body.bandeira,
          modality: body.modalidade,
          acquirer: body.adquirente,
          maturity_date: data_vencimento,
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
  console.info('verificaArranjo', {
    maturity_date: data_vencimento,
    modality: modalidade,
    flag: bandeira
  });
  let arranjo = await prisma.arrangement.findUnique({
    where: {
      arrangement_group: {
        maturity_date: data_vencimento,
        modality: modalidade,
        flag: bandeira
      }
    }
  });
  if (arranjo) {
    let arranjoEnvio = await prisma.shippingArrangement.findMany({
      where: {
        arrangement_id: arranjo.id,
        status: ArrangementStatusEnum.CREATED
      }
    });
    if (arranjoEnvio.length) {
      return arranjoEnvio[0];
    }
  }
  if (!arranjo_envio) {
    if (!arranjo) {
      const arranjo_data = {
        maturity_date: data_vencimento,
        payment_date: data_vencimento,
        flag: bandeira,
        modality: modalidade,
        create_date: new Date(),
        update_date: new Date()
      };
      console.info('cria arranjo ', arranjo_data);
      arranjo = await prisma.arrangement.create({
        data: arranjo_data
      });
    }
    arranjo_envio = await prisma.shippingArrangement.create({
      data: {
        arrangement_id: arranjo.id,
        amount_sent: null,
        amount: 0,
        create_date: new Date(),
        update_date: new Date()
      }
    });
  }
  return arranjo_envio;
}

