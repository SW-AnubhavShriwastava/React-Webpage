export const apis = [
    {
      title: 'Swaroop-Welcome',
      description: 'Trial API that returns a welcome message. Used for testing API integration, authentication, and credit system. Each call costs 1 credit.',
      category: 'trial'
    },
    {
      title: 'Document-Identification',
      description: 'Identifies the type of card, its side, and if the image is blurry or grayscale.',
      category: 'id_card'
    },
    {
      title: 'PAN-Signature-Extraction',
      description: 'Extracts the signature from a PAN card.',
      category: 'id_card'
    },
    {
      title: 'Picture-Extraction',
      description: 'Extracts the photo of the person from any document.',
      category: 'id_card'
    },
    {
      title: 'Internal-Verification',
      description: 'Verifies that the extracted information from cards complies with government guidelines to detect tampering.',
      category: 'id_card'
    },
    {
      title: 'Aadhaar-OCR',
      description: 'Extracts relevant data from the Aadhaar card.',
      category: 'id_card'
    },
    {
      title: 'PAN-OCR',
      description: 'Extracts relevant data from the PAN card.',
      category: 'id_card'
    },
    {
      title: 'Image-Quality-Analyzer',
      description: 'Analyzes image quality based on standard scores like BRISQUE and blurriness.',
      category: 'image_processing'
    },
    {
      title: 'Aadhaar-Demographic-Extraction',
      description: 'Extracts basic demographic details from Aadhaar images.',
      category: 'id_card'
    },
    {
      title: 'Aadhaar-Verification',
      description: 'Performs end-to-end Aadhaar verification using images of the Aadhaar card.',
      category: 'id_card'
    },
    {
      title: 'PAN-Verification',
      description: 'Performs end-to-end PAN verification using the image of the PAN card.',
      category: 'id_card'
    },
    {
      title: 'Compress-Extreme-Image',
      description: 'Compresses extremely large images (up to 1 GB or more) to 40 KB.',
      category: 'image_processing'
    },
    {
      title: 'Compress-Large-Image',
      description: 'Compresses large images (up to 500 MB) to 40 KB.',
      category: 'image_processing'
    },
    {
      title: 'Compress-Medium-Image',
      description: 'Compresses medium-sized images (up to 250 MB) to 40 KB.',
      category: 'image_processing'
    },
    {
      title: 'Compress-Small-Image',
      description: 'Compresses smaller images (up to 75 MB) to 40 KB.',
      category: 'image_processing'
    },
    {
      title: 'Compress-Nano-Image',
      description: 'Compresses very small images (up to 20 MB) to 40 KB.',
      category: 'image_processing'
    }
  ];