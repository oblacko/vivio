// Test script for Grok API request
const testPayload = {
  "input": "{\"mode\":\"normal\",\"image_urls\":[\"https://storage.railway.app/versatile-folder-gz8mby-z/images/1768614662257-HbwW7S4TzmDjIVuD3zgcBzt44S2Fk7mZxqNErcrygKQo4z8ARuc5y8uWQM885RaYnWVipuTTXcwXeuQni_0vbeac.jpg\"],\"index\":0,\"prompt\":\"Cinematic video with natural, subtle movements. The subject should have gentle, organic motion that brings it to life naturally. Professional cinematography style with smooth transitions, warm lighting, and authentic expressions. The movement should feel real and engaging, creating a captivating 6-second video experience. Vertical format 9:16, cinematic quality.\"}",
  "callBackUrl": "https://vivio-three.vercel.app/api/generate/callback",
  "model": "grok-imagine/image-to-video"
};

console.log("📤 Sending test request to Grok API...");
console.log("Payload:", JSON.stringify(testPayload, null, 2));

fetch('http://localhost:3000/api/generate/initiate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    imageUrl: "https://storage.railway.app/versatile-folder-gz8mby-z/images/1768614662257-HbwW7S4TzmDjIVuD3zgcBzt44S2Fk7mZxqNErcrygKQo4z8ARuc5y8uWQM885RaYnWVipuTTXcwXeuQni_0vbeac.jpg",
    userId: "test-user",
  }),
})
.then(response => {
  console.log(`📥 Response status: ${response.status}`);
  return response.json();
})
.then(data => {
  console.log("📥 Response data:", JSON.stringify(data, null, 2));
})
.catch(error => {
  console.error("❌ Request failed:", error);
});