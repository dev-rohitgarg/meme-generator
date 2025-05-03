// import { HfInference } from '@huggingface/inference';

// const hf = new HfInference(import.meta.env.VITE_HUGGINGFACE_API_KEY);

export const generateCaption = async (imageUrl: string): Promise<string> => {
  try {
    const apiKey = import.meta.env.VITE_HUGGINGFACE_API_KEY;
    if (!apiKey) throw new Error('Hugging Face API key is missing');

    // Fetch the image as a blob
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image: ${imageResponse.statusText}`);
    }
    const imageBlob = await imageResponse.blob();

    // Prepare the request to Hugging Face Inference API
    const response = await fetch('https://api-inference.huggingface.co/models/nlpconnect/vit-gpt2-image-captioning', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        // 'Content-Type' is not set for FormData
      },
      body: imageBlob,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Hugging Face API error: ${errorText}`);
    }

    const result = await response.json();
    // The result is usually an array of objects with 'generated_text'
    if (Array.isArray(result) && result[0]?.generated_text) {
      return result[0].generated_text;
    }
    throw new Error('No caption generated');
  } catch (error) {
    console.error('Detailed error in generateCaption:', error);
    throw new Error(`Failed to generate caption: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}; 