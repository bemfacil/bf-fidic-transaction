import { consumeMessage } from './consumer'; // Importe a função do consumer

// Simulação de um evento SQS
const event = {
  Records: [
    {
      messageId: '1047111e-e15e-4319-af9e-2ba452042d51',
      receiptHandle: 'AQEBtRA25MyfzxOTlQchHs5Bnzj+Oou0+9ouz5VMi2nf7eLYIuNK9+R4ICBbGjH9pxUg1hRek85KYW6kqnwss+dNdysa8YGwAKCGwYT0NqM9U19/WpNGiTGnMXePyXqvWENa997pelyFGQ3G3bkv2Ft3aYGt3ECIv6/sOD9jHhpGKS2u5i0uJjYV5oLkV2kTtOQLo38uFGwiP3cY50sU/Cyx1L5D1T4A/WjIRUmzBco+uCupMophKcr+5GOm8twkArEiKfiUV6LuGldOMpFaii/6G8+clLYCU1V/klD3YwmEYa+O6hN6aHPxy6uwuJymxNVFoN1ufOYkEbkAyvnqm9Y0YpDDe1tza+WNYb09lZSUS899BMUsdueEWSNkuQWZGwq9lSW03pX4AIaK/FxttaB5Gg==',
      body: JSON.stringify({
        "external_id":"RET_1211",
        "parcela_cod":"RET_0002_1",
        "nsu": "0004",
        "valor": 1000,
        "mdr": 1,
        "bandeira": "MCC",
        "modalidade": "C",
        "adquirente": "Vero",
        "data_vencimento":"2024-11-28"
      }),
      attributes: {},
      messageAttributes: {},
      md5OfBody: 'aa86cd6e9fddb283e1b26ace333bd770',
      eventSource: 'aws:sqs',
      eventSourceARN: 'arn:aws:sqs:us-east-1:754145173228:gateway-hook-hml',
      awsRegion: 'us-east-1',
    }
  ]
};

// Chamando o Lambda consumer localmente
consumeMessage(event as any, {} as any, (error: any, result: any) => {
  if (error) {
    console.error('Erro:', error);
  } else {
    console.log('Resultado:', result);
  }
});
