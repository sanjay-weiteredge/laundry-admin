import { useState, useEffect, useMemo } from 'react';
import Table from '../../components/ui/Table';
import Modal from '../../components/ui/Modal';
import Pagination from '../../components/ui/Pagination';
import { adminAPI } from '../../services/api';
import './Service.css';

const DotsIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="5" cy="5" r="2" fill="currentColor" />
    <circle cx="12" cy="5" r="2" fill="currentColor" />
    <circle cx="19" cy="5" r="2" fill="currentColor" />
    <circle cx="5" cy="12" r="2" fill="currentColor" />
    <circle cx="12" cy="12" r="2" fill="currentColor" />
    <circle cx="19" cy="12" r="2" fill="currentColor" />
    <circle cx="5" cy="19" r="2" fill="currentColor" />
    <circle cx="12" cy="19" r="2" fill="currentColor" />
    <circle cx="19" cy="19" r="2" fill="currentColor" />
  </svg>
);

const DeleteIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const Pricing = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [formData, setFormData] = useState({
    name: '',
    image: '',
    description: '',
  });

  // Fetch services on component mount
  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminAPI.getAllServices();
      if (response.success) {
        setServices(response.data || []);
      } else {
        setError(response.message || 'Failed to fetch services');
      }
    } catch (err) {
      setError(err.message || 'Error loading services');
      console.error('Error fetching services:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    // Reset form when closing
    setFormData({
      name: '',
      image: '',
      description: '',
    });
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);
      const response = await adminAPI.createService(formData);
      if (response.success) {
        handleCloseModal();
        setCurrentPage(1); // Reset to first page
        fetchServices(); // Refresh the list
      } else {
        setError(response.message || 'Failed to create service');
      }
    } catch (err) {
      setError(err.message || 'Error creating service');
      console.error('Error creating service:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this service?')) {
      return;
    }

    try {
      setError(null);
      const response = await adminAPI.deleteService(id);
      if (response.success) {
        // If we deleted the last item on the current page, go back a page
        const remainingItems = services.length - 1;
        const maxPage = Math.ceil(remainingItems / itemsPerPage);
        if (currentPage > maxPage && maxPage > 0) {
          setCurrentPage(maxPage);
        }
        fetchServices(); // Refresh the list
      } else {
        setError(response.message || 'Failed to delete service');
      }
    } catch (err) {
      setError(err.message || 'Error deleting service');
      console.error('Error deleting service:', err);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Paginate services
  const paginatedServices = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return services.slice(startIndex, endIndex);
  }, [services, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(services.length / itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const columns = [
    { key: 'name', header: 'Service Name', field: 'name' },
    {
      key: 'image',
      header: 'Image URL',
      render: (value, row) => (
        <a href={row.image} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>
          View Image
        </a>
      ),
    },
    {
      key: 'description',
      header: 'Description',
      render: (value, row) => (
        <span style={{ maxWidth: '300px', display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {row.description || 'N/A'}
        </span>
      ),
    },
    {
      key: 'created_at',
      header: 'Created At',
      render: (value, row) => formatDate(row.created_at),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (value, row) => (
        <button
          type="button"
          className="icon-button"
          aria-label="Delete"
          onClick={() => handleDelete(row.id)}
        >
          <DeleteIcon />
        </button>
      ),
    },
  ];

  return (
    <section className="pricing-page">
      <div className="pricing-page__header">
        <div>
          <p className="text-muted" style={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Services
          </p>
        </div>
        <button type="button" className="primary-btn" onClick={handleOpenModal}>
          + Add New Service
        </button>
      </div>

      {error && !isModalOpen && (
        <div style={{ 
          padding: '12px 16px', 
          backgroundColor: '#fee', 
          color: '#c33', 
          borderRadius: '8px', 
          marginBottom: '16px' 
        }}>
          {error}
        </div>
      )}

      <div className="pricing-card">
        <div className="pricing-card__header">
          <span className="pricing-card__icon">
            <DotsIcon />
          </span>
          <div>
            <p className="text-muted" style={{ marginBottom: 4 }}>
              Current Services
            </p>
            <strong>All available services</strong>
          </div>
        </div>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
            Loading services...
          </div>
        ) : (
          <>
            <Table
              columns={columns}
              data={paginatedServices}
              striped
              emptyMessage="No services found"
            />
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={services.length}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Add New Service"
      >
        {error && isModalOpen && (
          <div style={{ 
            padding: '12px 16px', 
            backgroundColor: '#fee', 
            color: '#c33', 
            borderRadius: '8px', 
            marginBottom: '16px' 
          }}>
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="modal-form__field">
            <label className="modal-form__label" htmlFor="serviceName">
              Service Name <span className="required">*</span>
            </label>
            <input
              type="text"
              id="serviceName"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="modal-form__input"
              placeholder="Enter service name"
              required
              disabled={submitting}
            />
          </div>
          <div className="modal-form__field">
            <label className="modal-form__label" htmlFor="serviceImage">
              Image URL <span className="required">*</span>
            </label>
            <input
              type="url"
              id="serviceImage"
              name="image"
              value={formData.image}
              onChange={handleInputChange}
              className="modal-form__input"
              placeholder="https://example.com/image.jpg"
              required
              disabled={submitting}
            />
          </div>
          <div className="modal-form__field">
            <label className="modal-form__label" htmlFor="serviceDescription">
              Description
            </label>
            <textarea
              id="serviceDescription"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="modal-form__input"
              placeholder="Enter service description (optional)"
              rows="4"
              disabled={submitting}
            />
          </div>
          <div className="modal-form__actions">
            <button
              type="button"
              onClick={handleCloseModal}
              className="modal-form__cancel-btn"
              disabled={submitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="modal-form__submit-btn"
              disabled={submitting}
            >
              {submitting ? 'Adding...' : 'Add Service'}
            </button>
          </div>
        </form>
      </Modal>
    </section>
  );
};

export default Pricing;

