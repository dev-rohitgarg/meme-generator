import { useState, useRef } from 'react'
import { Stage, Layer, Image, Text } from 'react-konva'
import ImageUpload from './components/ImageUpload'
import MemeGallery from './components/MemeGallery'
import { generateCaption } from './services/aiService'
import { uploadMeme } from './services/supabaseService'
import './App.css'
import './components/ImageUpload.css'

function App() {
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const [caption, setCaption] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fontSize, setFontSize] = useState(24)
  const [fontColor, setFontColor] = useState('#ffffff')
  const [captionX, setCaptionX] = useState(20)
  const [captionY, setCaptionY] = useState(20)
  const [lastMemeUrl, setLastMemeUrl] = useState<string | null>(null)
  const stageRef = useRef<any>(null)

  const handleImageUpload = (img: HTMLImageElement) => {
    setImage(img)
    setError(null)
    setCaption('')
    setLastMemeUrl(null)
  }

  const handleGenerateCaption = async () => {
    if (!image) return
    setIsGenerating(true)
    setError(null)
    try {
      const generatedCaption = await generateCaption(image.src)
      setCaption(generatedCaption)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to generate caption')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownload = async () => {
    if (!stageRef.current || !image) return
    const dataURL = stageRef.current.toDataURL()
    try {
      await uploadMeme(dataURL, caption)
      setLastMemeUrl(dataURL)
      const link = document.createElement('a')
      link.download = 'meme.png'
      link.href = dataURL
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      setError('Failed to save meme')
    }
  }

  const handleCopyLink = async () => {
    if (lastMemeUrl) {
      try {
        await navigator.clipboard.writeText(lastMemeUrl)
        alert('Image link copied to clipboard!')
      } catch {
        alert('Failed to copy image link.')
      }
    }
  }

  const handleShare = (platform: string) => {
    if (!lastMemeUrl) return
    const text = encodeURIComponent('Check out this meme I made!')
    const url = encodeURIComponent(window.location.href)
    if (platform === 'whatsapp') {
      window.open(`https://wa.me/?text=${text}%20${url}`)
    } else if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`)
    } else if (platform === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`)
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>AI Meme Generator</h1>
      </header>
      <main className="app-main">
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        <div className="meme-editor">
          {!image ? (
            <ImageUpload onImageUpload={handleImageUpload} />
          ) : (
            <>
              <Stage width={500} height={500} ref={stageRef}>
                <Layer>
                  <Image image={image} width={500} height={500} />
                  {caption && (
                    <Text
                      text={caption}
                      x={captionX}
                      y={captionY}
                      width={460}
                      padding={10}
                      fill={fontColor}
                      fontSize={fontSize}
                      fontStyle="bold"
                      align="center"
                      stroke="black"
                      strokeWidth={2}
                    />
                  )}
                </Layer>
              </Stage>
              {caption && (
                <>
                  <input
                    className="caption-input"
                    type="text"
                    value={caption}
                    onChange={e => setCaption(e.target.value)}
                    placeholder="Edit your caption"
                    style={{ marginTop: '1rem', width: '100%', fontSize: '1.1rem', padding: '0.5rem' }}
                  />
                  <div className="caption-controls" style={{ marginTop: '1rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
                    <label>
                      Font Size:
                      <input
                        type="range"
                        min={12}
                        max={64}
                        value={fontSize}
                        onChange={e => setFontSize(Number(e.target.value))}
                        style={{ marginLeft: '0.5rem' }}
                      />
                      <span style={{ marginLeft: '0.5rem' }}>{fontSize}px</span>
                    </label>
                    <label>
                      Font Color:
                      <input
                        type="color"
                        value={fontColor}
                        onChange={e => setFontColor(e.target.value)}
                        style={{ marginLeft: '0.5rem', width: '2rem', height: '2rem', border: 'none', background: 'none' }}
                      />
                    </label>
                    <label>
                      X Position:
                      <input
                        type="range"
                        min={0}
                        max={400}
                        value={captionX}
                        onChange={e => setCaptionX(Number(e.target.value))}
                        style={{ marginLeft: '0.5rem' }}
                      />
                      <span style={{ marginLeft: '0.5rem' }}>{captionX}</span>
                    </label>
                    <label>
                      Y Position:
                      <input
                        type="range"
                        min={0}
                        max={450}
                        value={captionY}
                        onChange={e => setCaptionY(Number(e.target.value))}
                        style={{ marginLeft: '0.5rem' }}
                      />
                      <span style={{ marginLeft: '0.5rem' }}>{captionY}</span>
                    </label>
                  </div>
                </>
              )}
            </>
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
        {lastMemeUrl && (
          <div className="share-buttons" style={{ margin: '1.5rem 0', display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button onClick={() => handleShare('whatsapp')} className="share-btn whatsapp">Share on WhatsApp</button>
            <button onClick={() => handleShare('twitter')} className="share-btn twitter">Share on Twitter</button>
            <button onClick={() => handleShare('facebook')} className="share-btn facebook">Share on Facebook</button>
            <button onClick={handleCopyLink} className="share-btn copy">Copy Meme Image Link</button>
          </div>
        )}
        <MemeGallery />
      </main>
    </div>
  )
}

export default App
