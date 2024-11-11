const swaroopWelcomeDoc = {
  id: 'swaroop-welcome',
  title: 'Swaroop-Welcome API',
  description: 'Trial API that returns a welcome message. Used for testing API integration, authentication, and credit system.',
  version: '1.0.0',
  category: 'trial',
  status: 'active',
  pricing: {
    credits: 1,
    description: 'Each API call costs 1 credit'
  },
  baseUrl: 'http://localhost:5000/api/v1',
  endpoint: '/welcome',
  method: 'POST',
  authentication: {
    type: 'Bearer Token',
    description: 'Requires an API token or JWT token in the Authorization header'
  },
  requestBody: {
    type: 'json',
    required: false,
    fields: []
  },
  parameters: [],
  headers: [
    {
      name: 'Authorization',
      type: 'string',
      required: true,
      description: 'Bearer {your_token}'
    },
    {
      name: 'Content-Type',
      type: 'string',
      required: true,
      description: 'application/json',
      value: 'application/json'
    }
  ],
  response: {
    success: {
      status: 200,
      example: {
        success: true,
        data: {
          message: 'Welcome to Swaroop AI API!',
          timestamp: '2024-02-20T10:30:00Z',
          user: {
            name: 'John Doe',
            email: 'john@example.com'
          }
        },
        creditsRemaining: 99
      }
    },
    error: {
      status: 401,
      example: {
        success: false,
        message: 'Invalid or expired token'
      }
    }
  },
  codeExamples: {
    curl: `curl -X POST "http://localhost:5000/api/v1/welcome" -H "Authorization: Bearer your_token_here" -H "Content-Type: application/json"`,
    python: `
import requests

url = "http://localhost:5000/api/v1/welcome"
headers = {
    "Authorization": "Bearer your_token_here",
    "Content-Type": "application/json"
}

response = requests.post(url, headers=headers)
print(response.json())
    `,
    nodejs: `
const axios = require('axios');

const url = 'http://localhost:5000/api/v1/welcome';
const headers = {
    'Authorization': 'Bearer your_token_here',
    'Content-Type': 'application/json'
};

axios.post(url, {}, { headers })
    .then(response => console.log(response.data))
    .catch(error => console.error(error));
    `,
    powershell: `
$headers = @{
    "Authorization" = "Bearer your_token_here"
    "Content-Type" = "application/json"
}

Invoke-RestMethod -Uri "http://localhost:5000/api/v1/welcome" -Method Post -Headers $headers | ConvertTo-Json
    `
  }
};

module.exports = { swaroopWelcomeDoc }; 