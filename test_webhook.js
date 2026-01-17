// Тест webhook обработки - успешное завершение
const webhookData = {
  "code": 200,
  "data": {
    "completeTime": 1768659471000,
    "costTime": 28,
    "createTime": 1768659443000,
    "model": "grok-imagine/image-to-video",
    "param": "{\"input\":\"{\\\"mode\\\":\\\"normal\\\",\\\"image_urls\\\":[\\\"https://kys5ym2tdhdegnqp.public.blob.vercel-storage.com/images/1768659439435-HbwW7S4TzmDjIVuD3zgcBzt44S2Fk7mZxqNErcrygKQo4z8ARuc5y8uWQM885RaYnWVipuTTXcwXeuQni_0vbeac.jpg\\\"],\\\"index\\\":0,\\\"prompt\\\":\\\"Cinematic video with natural, subtle movements. The subject should have gentle, organic motion that brings it to life naturally. Professional cinematography style with smooth transitions, warm lighting, and authentic expressions. The movement should feel real and engaging, creating a captivating 6-second video experience. Vertical format 9:16, cinematic quality.\\\"}\",\"callBackUrl\":\"https://vivio-three.vercel.app/api/generate/callback\",\"model\":\"grok-imagine/image-to-video\"}",
    "resultJson": "{\"resultUrls\":[\"https://tempfile.aiquickdraw.com/r/users/7044d27f-61f4-4c93-b679-3900e253cbe9/generated/448e299f-dd32-48f0-8ec1-ecc457a50755/generated_video.mp4\"]}",
    "state": "success",
    "taskId": "0b44dda58c4340b4ffb62f7fcd470350",
    "updateTime": 1768659471000
  },
  "msg": "Playground task completed successfully."
};

console.log("Test webhook data:", JSON.stringify(webhookData, null, 2));

// Имитация HTTP запроса
const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/generate/callback',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
};

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers:`, res.headers);

  res.on('data', (chunk) => {
    console.log(`Response: ${chunk}`);
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.write(JSON.stringify(webhookData));
req.end();