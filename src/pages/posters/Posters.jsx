import { useEffect, useMemo, useState } from 'react';
import Modal from '../../components/ui/Modal';
import { adminAPI } from '../../services/api';

const Posters = () => {
  const [posters, setPosters] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // fetch existing posters on mount
    (async () => {
      try {
        const resp = await adminAPI.getPosters();
        if (resp && resp.success && Array.isArray(resp.data)) {
          setPosters(resp.data);
        }
      } catch (e) {
        // optionally handle error UI
        console.error('Failed to load posters', e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleOpenModal = () => {
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl('');
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    setSelectedFile(file || null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(file ? URL.createObjectURL(file) : '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;
    setIsSubmitting(true);
    try {
      const resp = await adminAPI.createPoster(selectedFile);
      if (resp && resp.success && resp.data) {
        setPosters((prev) => [resp.data, ...prev]);
        handleCloseModal();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    const prev = posters;
    setPosters((p) => p.filter((x) => x.id !== id));
    try {
      await adminAPI.deletePoster(id);
    } catch (e) {
      setPosters(prev);
      console.error('Failed to delete poster', e);
    }
  };

  const cards = useMemo(() => posters, [posters]);

  return (
    <section className="posters-page">
      <header className="pricing-page__header">
        <div>
          <p className="text-muted" style={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Posters
          </p>
        </div>
        {cards.length > 0 && (
          <button type="button" className="primary-btn" onClick={handleOpenModal}>
            + Add New Poster
          </button>
        )}
      </header>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>Loading posters...</div>
      ) : cards.length === 0 ? (
        <div className="empty-state">
          <p className="empty-state__title">No Posters Found</p>
          <p className="empty-state__subtitle">Start adding a poster image.</p>
          <button type="button" className="primary-btn empty-state__button" onClick={handleOpenModal}>
            + Add Poster
          </button>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 16,
          }}
        >
          {cards.map((p) => (
            <div
              key={p.id}
              style={{
                border: '1px solid #e5e7eb',
                borderRadius: 8,
                overflow: 'hidden',
                background: '#fff',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div style={{ width: '100%', height: 160, background: '#f9fafb' }}>
                <img
                  src={p.image_url}
                  alt={`Poster-${p.id}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div style={{ padding: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: '#6b7280' }}>
                  {new Date(p.created_at || p.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                </span>
                <button
                  type="button"
                  className="danger-btn"
                  onClick={() => handleDelete(p.id)}
                  aria-label="Delete poster"
                  title="Delete"
                  style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: 6, background: 'transparent', border: 'none' }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 6h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M10 11v6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                    <path d="M14 11v6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={'Add New Poster'}>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="modal-form__field">
            <label className="modal-form__label" htmlFor="posterImage">
              Poster Image <span className="required">*</span>
            </label>
            <input
              type="file"
              id="posterImage"
              accept="image/*"
              onChange={handleFileChange}
              className="modal-form__input"
              style={{ width: '100%', height: 44, padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 12, background: '#ffffff', cursor: 'pointer' }}
              required
              disabled={isSubmitting}
            />
          </div>
          {previewUrl && (
            <div style={{ marginTop: 8 }}>
              <img
                src={previewUrl}
                alt="Preview"
                style={{ width: '100%', maxHeight: 280, objectFit: 'contain', borderRadius: 8, border: '1px solid #e5e7eb' }}
              />
            </div>
          )}
          <div className="modal-form__actions">
            <button type="button" onClick={handleCloseModal} className="modal-form__cancel-btn" disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="modal-form__submit-btn" disabled={isSubmitting || !selectedFile}>
              {isSubmitting ? 'Adding...' : 'Add Poster'}
            </button>
          </div>
        </form>
      </Modal>
    </section>
  );
};

export default Posters;
