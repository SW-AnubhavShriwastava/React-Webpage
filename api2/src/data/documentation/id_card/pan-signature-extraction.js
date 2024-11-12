const panSignatureExtractionDoc = {
  id: 'pan-signature-extraction',
  title: 'PAN-Signature-Extraction',
  description: 'Extracts signature of the person from PAN card images.',
  version: '1.0.0',
  category: 'id_card',
  status: 'active',
  pricing: {
    credits: 1,
    description: 'Each API call costs 1 credit'
  },
  baseUrl: 'http://localhost:5000/api/v1',
  endpoint: '/pan-signature-extraction',
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
        description: 'PAN card image file (JPEG, PNG)',
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
      contentType: 'image/png',
      description: 'Returns the extracted signature as a PNG image'
    },
    error: {
      status: 422,
      example: {
        success: false,
        message: "No image file provided or invalid image format"
      }
    }
  },
  codeExamples: {
    curl: `curl -X POST "http://localhost:5000/api/v1/pan-signature-extraction" -H "Authorization: Bearer your_token_here" -F "image=@/path/to/your/pan.jpg" --output signature.png`,
    python: `
import requests

url = "http://localhost:5000/api/v1/pan-signature-extraction"
headers = {
    "Authorization": "Bearer your_token_here"
}

files = {
    'image': ('pan.jpg', open('/path/to/your/pan.jpg', 'rb'), 'image/jpeg')
}

response = requests.post(url, headers=headers, files=files)

# Save the signature image
if response.status_code == 200:
    with open('signature.png', 'wb') as f:
        f.write(response.content)
    `,
    nodejs: `
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const url = 'http://localhost:5000/api/v1/pan-signature-extraction';
const formData = new FormData();
formData.append('image', fs.createReadStream('/path/to/your/pan.jpg'));

const headers = {
    'Authorization': 'Bearer your_token_here',
    ...formData.getHeaders()
};

axios.post(url, formData, { 
    headers,
    responseType: 'arraybuffer'  // Important for binary response
})
.then(response => {
    fs.writeFileSync('signature.png', response.data);
    console.log('Signature saved as signature.png');
})
.catch(error => console.error(error));
    `,
    powershell: `
$filePath = "/path/to/your/pan.jpg"
$headers = @{
    "Authorization" = "Bearer your_token_here"
}

$form = @{
    image = Get-Item -Path $filePath
}

Invoke-RestMethod -Uri "http://localhost:5000/api/v1/pan-signature-extraction" -Method Post -Headers $headers -Form $form -OutFile "signature.png"
Write-Host "Signature saved as signature.png"
    `
  }
};

module.exports = { panSignatureExtractionDoc }; 