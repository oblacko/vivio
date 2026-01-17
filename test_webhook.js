// Тест webhook обработки
const webhookData = {
  "code": 501,
  "data": {
    "completeTime": 1768656361000,
    "costTime": 25,
    "createTime": 1768656335000,
    "failCode": "500",
    "failMsg": "Inappropriate content, please try another prompt.",
    "model": "grok-imagine/image-to-video",
    "param": "{\"input\":\"{\\\"mode\\\":\\\"normal\\\",\\\"image_urls\\\":[\\\"https://kys5ym2tdhdegnqp.public.blob.vercel-storage.com/images/1768656326001-HbwW7S4TzmDjIVuD3zgcBzt44S2Fk7mZxqNErcrygKQo4z8ARuc5y8uWQM885RaYnWVipuTTXcwXeuQni_0vbeac.jpg\\\"],\\\"index\\\":0,\\\"prompt\\\":\\\"Cinematic video with natural, subtle movements. The subject should have gentle, organic motion that brings it to life naturally. Professional cinematography style with smooth transitions, warm lighting, and authentic expressions. The movement should feel real and engaging, creating a captivating 6-second video experience. Vertical format 9:16, cinematic quality.\\\"}\",\"callBackUrl\":\"https://vivio-three.vercel.app/api/generate/callback\",\"model\":\"grok-imagine/image-to-video\"}",
    "state": "fail",
    "taskId": "d4e8ec16f0513610e48a431d2c649c53",
    "updateTime": 1768656361000
  },
  "msg": "Playground task failed."
};

console.log("Test webhook data:", JSON.stringify(webhookData, null, 2));

// Имитация HTTP запроса
const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3003,
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