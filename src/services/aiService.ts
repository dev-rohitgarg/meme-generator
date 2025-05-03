import { HfInference } from '@huggingface/inference';

const hf = new HfInference(import.meta.env.VITE_HUGGINGFACE_API_KEY);

export const generateCaption = async (imageUrl: string): Promise<string> => {
  try {
    const response = await hf.imageToText({
      data: await fetch(imageUrl).then(r => r.blob()),
      model: 'nlpconnect/vit-gpt2-image-captioning',
    });
    return response.generated_text || 'No caption generated';
  } catch (error) {
    console.error('Error generating caption:', error);
    throw error;
  }
}; 