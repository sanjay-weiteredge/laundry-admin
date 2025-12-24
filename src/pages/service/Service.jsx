import { useState, useEffect, useMemo } from 'react';
import Table from '../../components/ui/Table';
import Modal from '../../components/ui/Modal';
import Pagination from '../../components/ui/Pagination';
import { adminAPI } from '../../services/api';
import './Service.css';
import { showConfirmAlert, showErrorAlert, showSuccessAlert } from '../../utils/alerts';

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

const EditIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const Pricing = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [togglingId, setTogglingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [formData, setFormData] = useState({
    name: '',
    image: '',
    description: '',
    price: '',
    vendor: false,
    user: false,
  });
  const [imageFile, setImageFile] = useState(null);

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
      // Provide more user-friendly error messages
      if (err.status === 500) {
        setError('Unable to connect to the server. Please check your connection and try again.');
      } else {
        setError(err.message || 'Error loading services');
      }
      console.error('Error fetching services:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleOpenModal = (service = null) => {
    if (service) {
      setEditingService(service);
      setFormData({
        name: service.name || '',
        image: service.image || '',
        description: service.description || '',
        price: service.price || '',
        vendor: Boolean(service.vendor),
        user: Boolean(service.user),
      });
      setImageFile(null);
    } else {
      setEditingService(null);
      setFormData({
        name: '',
        image: '',
        description: '',
        price: '',
        vendor: false,
        user: false,
      });
      setImageFile(null);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingService(null);
    setFormData({
      name: '',
      image: '',
      description: '',
      price: '',
      vendor: false,
      user: false,
    });
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);
      
      const submitData = {
        ...formData,
        price: formData.price === '' || formData.price === null || formData.price === undefined 
          ? '' 
          : parseFloat(formData.price) || 0,
        vendor: Boolean(formData.vendor),
        user: Boolean(formData.user),
      };
      
      let response;
      const shouldUseFormData = !editingService || !!imageFile;
      if (editingService && editingService.id) {
        if (shouldUseFormData) {
          const fd = new FormData();
          fd.append('name', formData.name);
          fd.append('description', formData.description);
          fd.append('price', String(formData.price));
          fd.append('vendor', formData.vendor ? 'true' : 'false');
          fd.append('user', formData.user ? 'true' : 'false');
          if (imageFile) {
            fd.append('image', imageFile);
          }
          response = await adminAPI.updateService(editingService.id, fd);
        } else {
          response = await adminAPI.updateService(editingService.id, submitData);
        }
        if (response.success) {
          handleCloseModal();
          fetchServices(); 
          showSuccessAlert('Service updated', `${formData.name} has been updated.`);
        } else {
          setError(response.message || 'Failed to update service');
          showErrorAlert('Unable to update service', response.message || 'Please try again.');
        }
      } else {
        if (!imageFile) {
          setError('Please select an image file to upload.');
          showErrorAlert('Image required', 'Please choose an image file for this service.');
          return;
        }
        const fd = new FormData();
        fd.append('name', formData.name);
        fd.append('description', formData.description);
        fd.append('price', String(formData.price));
        fd.append('vendor', formData.vendor ? 'true' : 'false');
        fd.append('user', formData.user ? 'true' : 'false');
        fd.append('image', imageFile);
        response = await adminAPI.createService(fd);
        if (response.success) {
          handleCloseModal();
          setCurrentPage(1); 
          fetchServices(); 
          showSuccessAlert('Service added', `${formData.name} is now available.`);
        } else {
          setError(response.message || 'Failed to create service');
          showErrorAlert('Unable to add service', response.message || 'Please try again.');
        }
      }
    } catch (err) {
      setError(err.message || `Error ${editingService ? 'updating' : 'creating'} service`);
      console.error(`Error ${editingService ? 'updating' : 'creating'} service:`, err);
      showErrorAlert(`Unable to ${editingService ? 'update' : 'add'} service`, err.message || 'Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, serviceName = 'this service') => {
    const { isConfirmed } = await showConfirmAlert({
      title: `Delete ${serviceName}?`,
      text: 'This action cannot be undone.',
      confirmButtonText: 'Yes, delete',
    });
    if (!isConfirmed) return;

    try {
      setError(null);
      const response = await adminAPI.deleteService(id);
      if (response.success) {
        const remainingItems = services.length - 1;
        const maxPage = Math.ceil(remainingItems / itemsPerPage);
        if (currentPage > maxPage && maxPage > 0) {
          setCurrentPage(maxPage);
        }
        fetchServices(); 
        showSuccessAlert('Service deleted', `${serviceName} has been removed.`);
      } else {
        setError(response.message || 'Failed to delete service');
        showErrorAlert('Unable to delete', response.message || 'Please try again.');
      }
    } catch (err) {
      setError(err.message || 'Error deleting service');
      console.error('Error deleting service:', err);
      showErrorAlert('Unable to delete', err.message || 'Please try again.');
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
  const paginatedServices = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return services.slice(startIndex, endIndex);
  }, [services, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(services.length / itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleToggleFlag = async (service, field) => {
    const nextValue = !Boolean(service[field]);
    const previousServices = services;
    // optimistic update
    setServices((prev) =>
      prev.map((item) =>
        item.id === service.id ? { ...item, [field]: nextValue } : item
      )
    );
    setTogglingId(service.id);
    try {
      const response = await adminAPI.updateService(service.id, { [field]: nextValue });
      if (!response.success) {
        setServices(previousServices);
        showErrorAlert('Unable to update', response.message || 'Please try again.');
      }
    } catch (err) {
      setServices(previousServices);
      showErrorAlert('Unable to update', err.message || 'Please try again.');
    } finally {
      setTogglingId(null);
    }
  };

  const columns = [
    { key: 'name', header: 'Service', field: 'name' },
    {
      key: 'image',
      header: 'Image',
      render: (value, row) => (
        <a href={row.image} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>
          View Image
        </a>
      ),
    },
    {
      key: 'price',
      header: 'Price',
      render: (value, row) => (
        <span>₹{parseFloat(row.price || 0).toFixed(2)}</span>
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
      key: 'vendor',
      header: 'Vendor',
      render: (value, row) => (
        <input
          type="checkbox"
          checked={Boolean(row.vendor)}
          onChange={() => handleToggleFlag(row, 'vendor')}
          disabled={togglingId === row.id || submitting}
          aria-label={row.vendor ? 'Vendor enabled' : 'Vendor disabled'}
          style={{ width: 16, height: 16, cursor: 'pointer' }}
        />
      ),
    },
    {
      key: 'user',
      header: 'User',
      render: (value, row) => (
        <input
          type="checkbox"
          checked={Boolean(row.user)}
          onChange={() => handleToggleFlag(row, 'user')}
          disabled={togglingId === row.id || submitting}
          aria-label={row.user ? 'User enabled' : 'User disabled'}
          style={{ width: 16, height: 16, cursor: 'pointer' }}
        />
      ),
    },
    // {
    //   key: 'created_at',
    //   header: 'Created At',
    //   render: (value, row) => formatDate(row.created_at),
    // },
    {
      key: 'actions',
      header: 'Actions',
      render: (value, row) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            className="icon-button"
            aria-label="Edit"
            onClick={() => handleOpenModal(row)}
            style={{ color: 'var(--color-primary)' }}
          >
            <EditIcon />
          </button>
          <button
            type="button"
            className="icon-button"
            aria-label="Delete"
            onClick={() => handleDelete(row.id, row.name)}
          >
            <DeleteIcon />
          </button>
        </div>
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
        {!loading && services.length > 0 && (
          <button type="button" className="primary-btn" onClick={handleOpenModal}>
            + Add New Service
          </button>
        )}
      </div>

      {error && !isModalOpen && (
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: '#fee',
            color: '#c33',
            borderRadius: '8px',
            marginBottom: '16px',
          }}
        >
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
          Loading services...
        </div>
      ) : services.length === 0 ? (
        <div className="empty-state">
          <p className="empty-state__title">No Services Found</p>
          <p className="empty-state__subtitle">Start adding a service to manage pricing.</p>
          <button
            type="button"
            className="primary-btn empty-state__button"
            onClick={() => handleOpenModal()}
          >
            + Add Service
          </button>
        </div>
      ) : (
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
            maxVisiblePages={2}
          />
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingService ? 'Edit Service' : 'Add New Service'}
        dialogClassName="service-modal"
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
        <form onSubmit={handleSubmit} className="modal-form service-modal-form">
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
              Image <span className="required">{editingService ? '' : '*'}</span>
            </label>
            <input
              type="file"
              id="serviceImage"
              name="image"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files && e.target.files[0] ? e.target.files[0] : null)}
              className="modal-form__input"
              required={!editingService}
              disabled={submitting}
            />
          </div>
          <div className="modal-form__field">
            <label className="modal-form__label" htmlFor="servicePrice">
              Price (₹) <span className="required">*</span>
            </label>
            <input
              type="number"
              id="servicePrice"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              className="modal-form__input"
              placeholder="0.00"
              step="0.01"
              min="0"
              required
              disabled={submitting}
            />
          </div>
          <div className="modal-form__field visibility-field">
            <label className="modal-form__label">
              Visibility
            </label>
            <div className="visibility-field__options">
              <label className="visibility-field__option">
                <input
                  type="checkbox"
                  name="vendor"
                  checked={formData.vendor}
                  onChange={handleInputChange}
                  disabled={submitting}
                />
                <span>Vendor</span>
              </label>
              <label className="visibility-field__option">
                <input
                  type="checkbox"
                  name="user"
                  checked={formData.user}
                  onChange={handleInputChange}
                  disabled={submitting}
                />
                <span>User</span>
              </label>
            </div>
          </div>
          <div className="modal-form__field modal-form__field--full">
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
              {submitting 
                ? (editingService ? 'Updating...' : 'Adding...') 
                : (editingService ? 'Update Service' : 'Add Service')
              }
            </button>
          </div>
        </form>
      </Modal>
    </section>
  );
};

export default Pricing;

