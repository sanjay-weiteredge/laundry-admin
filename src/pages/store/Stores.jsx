import { useCallback, useEffect, useMemo, useState } from 'react';
import Table from '../../components/ui/Table';
import Modal from '../../components/ui/Modal';
import Pagination from '../../components/ui/Pagination';
import { adminAPI } from '../../services/api';
import './Stores.css';
import { showConfirmAlert, showErrorAlert, showSuccessAlert } from '../../utils/alerts';

const EditIcon = () => (
  <svg width="16" height="16" viewBox="0 0 33 33" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M16.0939 4.02356H6.70576C5.99437 4.02356 5.31211 4.30616 4.80907 4.80919C4.30604 5.31223 4.02344 5.99449 4.02344 6.70589V25.4822C4.02344 26.1936 4.30604 26.8758 4.80907 27.3789C5.31211 27.8819 5.99437 28.1645 6.70576 28.1645H25.482C26.1934 28.1645 26.8757 27.8819 27.3787 27.3789C27.8818 26.8758 28.1644 26.1936 28.1644 25.4822V16.094" stroke="#676767" strokeWidth="2.68233" strokeLinecap="round" strokeLinejoin="round"/>
<path d="M24.6441 3.52055C25.1776 2.987 25.9012 2.68726 26.6558 2.68726C27.4103 2.68726 28.134 2.987 28.6675 3.52055C29.2011 4.0541 29.5008 4.77774 29.5008 5.53229C29.5008 6.28684 29.2011 7.01049 28.6675 7.54404L16.5796 19.6333C16.2612 19.9515 15.8678 20.1844 15.4356 20.3106L11.5825 21.4371C11.4671 21.4708 11.3447 21.4728 11.2283 21.443C11.1118 21.4132 11.0055 21.3526 10.9205 21.2676C10.8355 21.1826 10.7749 21.0763 10.7451 20.9598C10.7153 20.8434 10.7173 20.721 10.7509 20.6056L11.8775 16.7525C12.0043 16.3207 12.2377 15.9277 12.5562 15.6098L24.6441 3.52055Z" stroke="#676767" strokeWidth="2.68233" strokeLinecap="round" strokeLinejoin="round"/>
</svg>
  
);

const DeleteIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M3 6h18"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M10 11v6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M14 11v6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

const ViewIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const initialFormState = {
  name: '',
  email: '',
  phone: '',
  address: '',
  latitude: '',
  longitude: '',
  password: '',
  isActive: 'true',
};

const Stores = () => {
  const [stores, setStores] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [formData, setFormData] = useState(initialFormState);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [editingStore, setEditingStore] = useState(null);
  const [viewingStore, setViewingStore] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const formatCurrency = (value) => {
    try {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
      }).format(Number(value || 0));
    } catch {
      return `₹${Number(value || 0).toLocaleString('en-IN')}`;
    }
  };

  const formatDateTime = (value) => {
    if (!value) return '—';
    try {
      return new Date(value).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
    } catch {
      return String(value);
    }
  };

  const loadStores = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await adminAPI.getStores();
      setStores(response.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load stores');
      setStores([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStores();
  }, [loadStores]);

  const filteredStores = useMemo(() => {
    const term = search.trim().toLowerCase();
    const sortedStores = [...stores].sort((a, b) => {
      const idA = typeof a.id === 'number' ? a.id : Number(a.id) || 0;
      const idB = typeof b.id === 'number' ? b.id : Number(b.id) || 0;
      return idA - idB;
    });

    return sortedStores.filter((store) => {
      const storeStatus = store.is_active ? 'active' : 'inactive';
      const matchesText =
        !term ||
        store.name.toLowerCase().includes(term) ||
        store.address?.toLowerCase().includes(term) ||
        store.email?.toLowerCase().includes(term);
      const matchesStatus = statusFilter === 'all' || storeStatus === statusFilter;
      return matchesText && matchesStatus;
    });
  }, [search, statusFilter, stores]);

  // Paginate filtered stores
  const paginatedStores = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredStores.slice(startIndex, endIndex);
  }, [filteredStores, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredStores.length / itemsPerPage);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleOpenModal = () => {
    setEditingStore(null);
    setFormData(initialFormState);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingStore(null);
    setFormData(initialFormState);
    setFormError('');
  };

  const handleOpenView = (store) => {
    setViewingStore(store);
    setIsViewOpen(true);
  };

  const handleCloseView = () => {
    setIsViewOpen(false);
    setViewingStore(null);
  };

  const handleEditStore = (store) => {
    setEditingStore(store);
    setFormData({
      name: store.name || '',
      email: store.email || '',
      phone: store.phone || '',
      address: store.address || '',
      latitude:
        store.latitude === null || typeof store.latitude === 'undefined'
          ? ''
          : String(store.latitude),
      longitude:
        store.longitude === null || typeof store.longitude === 'undefined'
          ? ''
          : String(store.longitude),
      password: '',
      isActive: store.is_active ? 'true' : 'false',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const parseCoordinate = (value) => {
    if (value === '' || value === null || typeof value === 'undefined') {
      return null;
    }
    const parsed = parseFloat(value);
    return Number.isFinite(parsed) ? parsed : null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);

    try {
      const basePayload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        latitude: parseCoordinate(formData.latitude),
        longitude: parseCoordinate(formData.longitude),
        isActive: formData.isActive === 'true',
      };

      if (editingStore) {
        await adminAPI.updateStore(editingStore.id, basePayload);
        showSuccessAlert('Store updated', `${formData.name} has been updated.`);
      } else {
        await adminAPI.createStore({
          ...basePayload,
          password: formData.password,
        });
        showSuccessAlert('Store created', `${formData.name} has been added.`);
      }

      await loadStores();
      handleCloseModal();
    } catch (err) {
      setFormError(
        err.message || (editingStore ? 'Failed to update store' : 'Failed to create store')
      );
      showErrorAlert(
        editingStore ? 'Update failed' : 'Creation failed',
        err.message || 'Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteStore = async (storeId, storeName) => {
    const { isConfirmed } = await showConfirmAlert({
      title: `Delete ${storeName}?`,
      text: 'This action cannot be undone.',
      confirmButtonText: 'Yes, delete',
    });
    if (!isConfirmed) return;

    setDeletingId(storeId);
    try {
      await adminAPI.deleteStore(storeId);
      setStores((prev) => prev.filter((store) => store.id !== storeId));
      showSuccessAlert('Store deleted', `${storeName} has been removed.`);
    } catch (err) {
      setError(err.message || 'Failed to delete store');
      showErrorAlert('Delete failed', err.message || 'Unable to remove store.');
    } finally {
      setDeletingId(null);
    }
  };

  const columns = [
    { key: 'id', header: 'Store ID', field: 'id' },
    { key: 'name', header: 'Store Name', field: 'name' },
    { key: 'email', header: 'Email', field: 'email' },
    { key: 'phone', header: 'Phone', field: 'phone' },
    {
      key: 'address',
      header: 'Address',
      render: (_, row) => row.address || '—',
    },
    {
      key: 'status',
      header: 'Status',
      render: (_, row) => {
        const status = row.is_active ? 'active' : 'inactive';
        return (
          <span className={`status-pill status-pill--${status}`}>
            {row.is_active ? 'Active' : 'Inactive'}
          </span>
        );
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_, row) => (
        <div className="stores-actions">
          <button
            type="button"
            className="icon-button"
            aria-label="View store"
            onClick={() => handleOpenView(row)}
          >
            <ViewIcon />
          </button>
          <button
            type="button"
            className="icon-button"
            aria-label="Edit store"
            onClick={() => handleEditStore(row)}
          >
            <EditIcon />
          </button>
          <button
            type="button"
            className="icon-button icon-button--danger"
            aria-label="Delete store"
            onClick={() => handleDeleteStore(row.id, row.name)}
            disabled={deletingId === row.id}
          >
            <DeleteIcon />
          </button>
        </div>
      ),
    },
  ];

  return (
    <section className="stores-page">
      <header className="stores-page__header">
        <div>
          <p className="text-muted">Monitor each location's availability and contact details.</p>
        </div>
        {!loading && stores.length > 0 && (
          <button type="button" className="primary-btn" onClick={handleOpenModal}>
            + Add New Store
          </button>
        )}
      </header>

      {loading ? (
        <div className="stores-empty-wrapper">
          <p className="small-text text-muted">Loading stores...</p>
        </div>
      ) : stores.length === 0 ? (
        <div className="stores-empty-wrapper">
          <p className="empty-state__title">No Store Management Found</p>
          <p className="empty-state__subtitle">Start adding store</p>
          <button
            type="button"
            className="primary-btn empty-state__button"
            onClick={handleOpenModal}
          >
            + Add Store
          </button>
        </div>
      ) : (
        <div className="stores-card">
          <div className="stores-card__filters">
            <div className="stores-card__search">
              <input
                type="search"
                placeholder="Search by store name or location..."
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setCurrentPage(1);
                }}
                aria-label="Search stores"
              />
            </div>
            <div>
              <select
                value={statusFilter}
                onChange={(event) => {
                  setStatusFilter(event.target.value);
                  setCurrentPage(1);
                }}
                aria-label="Filter by status"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div>
            {loading && <p className="small-text text-muted">Loading stores...</p>}
            {error && <p className="error-text">{error}</p>}
          </div>
          <Table
            columns={columns}
            data={paginatedStores}
            striped
            size="sm"
            className="stores-table"
            emptyMessage={loading ? 'Fetching stores...' : 'No stores found'}
          />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredStores.length}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            maxVisiblePages={2}
          />
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingStore ? 'Edit Store' : 'Add New Store'}
        dialogClassName="stores-modal"
      >
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="modal-form__field">
            <label className="modal-form__label" htmlFor="storeName">
              Store Name <span className="required">*</span>
            </label>
            <input
              type="text"
              id="storeName"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="modal-form__input"
              placeholder="Enter store name"
              required
            />
          </div>
          <div className="modal-form__field">
            <label className="modal-form__label" htmlFor="storeLocation">
              Address <span className="required">*</span>
            </label>
            <input
              type="text"
              id="storeLocation"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              className="modal-form__input"
              placeholder="Enter store address"
              required
            />
          </div>
          <div className="modal-form__field">
            <label className="modal-form__label" htmlFor="storeContact">
              Phone <span className="required">*</span>
            </label>
            <input
              type="tel"
              id="storeContact"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="modal-form__input"
              placeholder="Enter contact number"
              required
            />
          </div>
          <div className="modal-form__field">
            <label className="modal-form__label" htmlFor="storeEmail">
              Email <span className="required">*</span>
            </label>
            <input
              type="email"
              id="storeEmail"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="modal-form__input"
              placeholder="Enter store email"
              required
            />
          </div>
          <div className="modal-form__field">
            <label className="modal-form__label" htmlFor="storeLatitude">
              Latitude <span className="required">*</span>
            </label>
            <input
              type="number"
              step="0.000001"
              id="storeLatitude"
              name="latitude"
              value={formData.latitude}
              onChange={handleInputChange}
              className="modal-form__input"
              placeholder="e.g. 37.774929"
              required
            />
          </div>
          <div className="modal-form__field">
            <label className="modal-form__label" htmlFor="storeLongitude">
              Longitude <span className="required">*</span>
            </label>
            <input
              type="number"
              step="0.000001"
              id="storeLongitude"
              name="longitude"
              value={formData.longitude}
              onChange={handleInputChange}
              className="modal-form__input"
              placeholder="e.g. -122.419418"
              required
            />
          </div>
          {!editingStore && (
            <div className="modal-form__field">
              <label className="modal-form__label" htmlFor="storePassword">
                Password <span className="required">*</span>
              </label>
              <input
                type="password"
                id="storePassword"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="modal-form__input"
                placeholder="Set initial password"
                required
              />
            </div>
          )}
          <div className="modal-form__field">
            <label className="modal-form__label" htmlFor="storeStatus">
              Status <span className="required">*</span>
            </label>
            <select
              id="storeStatus"
              name="isActive"
              value={formData.isActive}
              onChange={handleInputChange}
              className="modal-form__input"
              required
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
          {formError && <p className="error-text">{formError}</p>}
          <div className="modal-form__actions">
            <button
              type="button"
              onClick={handleCloseModal}
              className="modal-form__cancel-btn"
            >
              Cancel
            </button>
            <button type="submit" className="modal-form__submit-btn" disabled={isSubmitting}>
              {isSubmitting
                ? 'Saving...'
                : editingStore
                ? 'Save Changes'
                : 'Add Store'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isViewOpen}
        onClose={handleCloseView}
        title={'Store Details'}
        dialogClassName="stores-modal"
      >
        {viewingStore ? (
          <div className="store-view">
            <div className="store-view__details">
              <p><strong>Name:</strong> {viewingStore.name}</p>
              <p><strong>Email:</strong> {viewingStore.email || '—'}</p>
              <p><strong>Phone:</strong> {viewingStore.phone || '—'}</p>
              <p><strong>Status:</strong> {viewingStore.is_active ? 'Active' : 'Inactive'}</p>
              <p><strong>Created At:</strong> {formatDateTime(viewingStore.created_at)}</p>
              <p><strong>Address:</strong> {viewingStore.address || '—'}</p>
              <p><strong>Latitude:</strong> {viewingStore.latitude ?? '—'}</p>
              <p><strong>Longitude:</strong> {viewingStore.longitude ?? '—'}</p>
              <p><strong>Current Month Revenue:</strong> {formatCurrency(viewingStore?.revenue?.currentMonth)}</p>
              <p><strong>Last 90 Days Revenue:</strong> {formatCurrency(viewingStore?.revenue?.last90Days)}</p>
              <p><strong>Last Year Revenue:</strong> {formatCurrency(viewingStore?.revenue?.lastYear)}</p>
            </div>
          </div>
        ) : (
          <p className="small-text text-muted">No store selected.</p>
        )}
      </Modal>
    </section>
  );
};

export default Stores;