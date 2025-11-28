import { useCallback, useEffect, useMemo, useState } from 'react';
import Table from '../../components/ui/Table';
import Modal from '../../components/ui/Modal';
import Pagination from '../../components/ui/Pagination';
import { adminAPI } from '../../services/api';
import './Stores.css';
import { showConfirmAlert, showErrorAlert, showSuccessAlert } from '../../utils/alerts';

const EditIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M12.0727 5.34314L15.6574 1.75736C16.4385 0.976311 17.7048 0.976311 18.4859 1.75736L22.2701 5.5416C23.0511 6.32265 23.0511 7.58898 22.2701 8.37003L18.6843 11.9558M12.0727 5.34314L1.93801 15.4779C1.56548 15.8504 1.33374 16.3523 1.27818 16.8886L1 19.5317C0.913414 20.3629 1.59705 21.0465 2.42834 20.96L5.07137 20.6818C5.60772 20.6263 6.10958 20.3945 6.48211 20.022L16.6168 9.8873M12.0727 5.34314L16.6168 9.8873"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
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
  const [formData, setFormData] = useState(initialFormState);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [editingStore, setEditingStore] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

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
    return stores.filter((store) => {
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

  const formatDate = (value) =>
    value ? new Date(value).toLocaleDateString() : '—';

  const columns = [
    { key: 'name', header: 'Store Name', field: 'name' },
    { key: 'email', header: 'Email', field: 'email' },
    { key: 'phone', header: 'Phone', field: 'phone' },
    {
      key: 'address',
      header: 'Address',
      render: (_, row) => row.address || '—',
    },
    {
      key: 'created_at',
      header: 'Added On',
      render: (_, row) => formatDate(row.created_at),
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
        <button type="button" className="primary-btn" onClick={handleOpenModal}>
          + Add New Store
        </button>
      </header>

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
          <p className="text-muted">Current Stores</p>
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
        />
      </div>

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
    </section>
  );
};

export default Stores;
