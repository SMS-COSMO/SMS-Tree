import process from 'node:process';

export default defineEventHandler(async (event) => {
  setResponseHeaders(event, {
    'Access-Control-Allow-Methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Expose-Headers': '*',
  });
  if (getMethod(event) === 'OPTIONS') {
    event.res.statusCode = 204;
    event.res.statusMessage = 'No Content.';
    return 'OK';
  }

  const body = await readBody(event);
  const splitText = body.text.match(/.{1,500}/g);

  const res = [];
  for (const seg of splitText) {
    const response = await $fetch<[{
      label: 'Human' | 'ChatGPT';
      score: number;
    },
    ][]>(
      'https://api-inference.huggingface.co/models/Hello-SimpleAI/chatgpt-detector-roberta-chinese',
      {
        headers: {
          Authorization: `Bearer ${process.env.HUGGING_FACE_API_KEY}`,
        },
        method: 'POST',
        body: JSON.stringify({
          text: seg,
        }),
      },
    );

    res.push([response[0]]);
  }

  return res;
});
