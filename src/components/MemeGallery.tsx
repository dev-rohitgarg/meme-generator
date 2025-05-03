import { useState, useEffect } from 'react';
import { getMemes, deleteMeme, deleteAllMemes } from '../services/supabaseService';
import './MemeGallery.css';

interface Meme {
  id: string;
  image_url: string;
  caption: string;
  created_at: string;
}

const MemeGallery = () => {
  const [memes, setMemes] = useState<Meme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchMemes = async () => {
    setLoading(true);
    try {
      const data = await getMemes();
      setMemes(data);
    } catch (err) {
      setError('Failed to load memes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMemes();
  }, []);

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      await deleteMeme(id);
      await fetchMemes();
    } catch (err) {
      setError('Failed to delete meme');
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteAll = async () => {
    setDeleting(true);
    try {
      await deleteAllMemes();
      await fetchMemes();
    } catch (err) {
      setError('Failed to delete all memes');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <div className="loading">Loading memes...</div>;
  if (error) return <div className="error">{error}</div>;
  if (memes.length === 0) return <div className="no-memes">No memes yet. Create one!</div>;

  return (
    <div className="meme-gallery">
      <h2>Meme Gallery</h2>
      <button className="delete-all-btn" onClick={handleDeleteAll} disabled={deleting}>
        {deleting ? 'Deleting...' : 'Delete All'}
      </button>
      <div className="meme-grid">
        {memes.map((meme) => (
          <div key={meme.id} className="meme-card">
            <img src={meme.image_url} alt={meme.caption} />
            <p>{meme.caption}</p>
            <small>{new Date(meme.created_at).toLocaleDateString()}</small>
            <button className="delete-btn" onClick={() => handleDelete(meme.id)} disabled={deleting}>
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MemeGallery; 