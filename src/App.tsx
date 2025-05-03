import { useState, useRef } from 'react'
import { Stage, Layer, Image, Text } from 'react-konva'
import ImageUpload from './components/ImageUpload'
import { generateCaption } from './services/aiService'
import { uploadMeme } from './services/supabaseService'
import './App.css'
import './components/ImageUpload.css'

function App() {
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const [caption, setCaption] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const stageRef = useRef<any>(null)

  const handleImageUpload = (img: HTMLImageElement) => {
    setImage(img)
  }

  const handleGenerateCaption = async () => {
    if (!image) return
    setIsGenerating(true)
    try {
      const generatedCaption = await generateCaption(image.src)
      setCaption(generatedCaption)
    } catch (error) {
      console.error('Failed to generate caption:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownload = async () => {
    if (!stageRef.current || !image) return

    const dataURL = stageRef.current.toDataURL()
    try {
      await uploadMeme(dataURL, caption)
      const link = document.createElement('a')
      link.download = 'meme.png'
      link.href = dataURL
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Failed to save meme:', error)
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>AI Meme Generator</h1>
      </header>
      <main className="app-main">
        <div className="meme-editor">
          {!image ? (
            <ImageUpload onImageUpload={handleImageUpload} />
          ) : (
            <Stage width={500} height={500} ref={stageRef}>
              <Layer>
                <Image image={image} width={500} height={500} />
                {caption && (
                  <Text
                    text={caption}
                    x={20}
                    y={20}
                    width={460}
                    padding={10}
                    fill="white"
                    fontSize={24}
                    fontStyle="bold"
                    align="center"
                    stroke="black"
                    strokeWidth={2}
                  />
                )}
              </Layer>
            </Stage>
          )}
        </div>
        <div className="controls">
          {image && (
            <>
              <button 
                onClick={handleGenerateCaption} 
                disabled={isGenerating}
              >
                {isGenerating ? 'Generating...' : 'Generate Caption'}
              </button>
              {caption && (
                <button onClick={handleDownload}>
                  Download Meme
                </button>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}

export default App
