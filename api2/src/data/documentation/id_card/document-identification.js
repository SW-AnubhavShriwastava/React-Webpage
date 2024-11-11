const documentIdentificationDoc = {
  id: 'document-identification',
  title: 'Document-Identification',
  description: 'Identifies the type of card, its side, and determines if the image is blurry or grayscale.',
  version: '1.0.0',
  category: 'id_card',
  status: 'active',
  pricing: {
    credits: 2,
    description: 'Each API call costs 2 credits'
  },
  baseUrl: 'http://localhost:5000/api/v1',
  endpoint: '/document-identification',
  method: 'POST',
  authentication: {
    type: 'Bearer Token',
    description: 'Requires an API token or JWT token in the Authorization header'
  },
  requestBody: {
    type: 'multipart/form-data',
    required: true,
    fields: [
      {
        name: 'image',
        type: 'file',
        required: true,
        description: 'Image file to analyze (JPEG, PNG)',
        maxSize: '5MB'
      }
    ]
  },
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
      value: 'multipart/form-data'
    }
  ],
  response: {
    success: {
      status: 200,
      example: {
        success: true,
        data: {
          card: ["pan"],
          is_grayscale: false,
          is_blur: false
        },
        creditsRemaining: 98
      }
    },
    error: {
      status: 422,
      example: {
        success: false,
        message: "No image file provided"
      }
    }
  },
  codeExamples: {
    curl: `curl -X POST "http://localhost:5000/api/v1/document-identification" -H "Authorization: Bearer your_token_here" -F "image=@/path/to/your/image.jpg"`,
    python: `
import requests

url = "http://localhost:5000/api/v1/document-identification"
headers = {
    "Authorization": "Bearer your_token_here"
}

files = {
    'image': ('image.jpg', open('/path/to/your/image.jpg', 'rb'), 'image/jpeg')
}

response = requests.post(url, headers=headers, files=files)
print(response.json())
    `,
    nodejs: `
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const url = 'http://localhost:5000/api/v1/document-identification';
const formData = new FormData();
formData.append('image', fs.createReadStream('/path/to/your/image.jpg'));

const headers = {
    'Authorization': 'Bearer your_token_here',
    ...formData.getHeaders()
};

axios.post(url, formData, { headers })
    .then(response => console.log(response.data))
    .catch(error => console.error(error));
    `,
    powershell: `
$filePath = "/path/to/your/image.jpg"
$headers = @{
    "Authorization" = "Bearer your_token_here"
}

$form = @{
    image = Get-Item -Path $filePath
}

Invoke-RestMethod -Uri "http://localhost:5000/api/v1/document-identification" -Method Post -Headers $headers -Form $form | ConvertTo-Json
    `
  }
};

module.exports = { documentIdentificationDoc }; 