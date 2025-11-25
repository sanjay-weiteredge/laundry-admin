import { useState } from 'react';
import Table from '../../components/ui/Table';
import Modal from '../../components/ui/Modal';
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

const services = [
  { id: 1, name: 'Standard Wash & Fold', price: 1.75, lastUpdated: '2023-10-26' },
  { id: 2, name: 'Delicate Wash', price: 2.5, lastUpdated: '2023-10-26' },
  { id: 3, name: 'Dry Cleaning (per item)', price: 8.0, lastUpdated: '2023-10-25' },
  { id: 4, name: 'Ironing Service', price: 1.0, lastUpdated: '2023-10-24' },
];

const Pricing = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    lastUpdated: new Date().toISOString().split('T')[0], // Today's date as default
  });

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
      price: '',
      lastUpdated: new Date().toISOString().split('T')[0],
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Add service creation logic here
    console.log('New service data:', formData);
    // For now, just close the modal
    handleCloseModal();
  };

  const columns = [
    { key: 'name', header: 'Service Name', field: 'name' },
    {
      key: 'price',
      header: 'Price',
      render: (value, row) => `$${row.price.toFixed(2)}`,
    },
    { key: 'lastUpdated', header: 'Last Updated', field: 'lastUpdated' },
    {
      key: 'actions',
      header: 'Actions',
      render: () => (
        <button type="button" className="icon-button" aria-label="Edit">
          <EditIcon />
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

      <div className="pricing-card">
        <div className="pricing-card__header">
          <span className="pricing-card__icon">
            <DotsIcon />
          </span>
          <div>
            <p className="text-muted" style={{ marginBottom: 4 }}>
              Current Services
            </p>
            <strong>Latest prices & updates</strong>
          </div>
        </div>
        <Table
          columns={columns}
          data={services}
          striped
          emptyMessage="No services found"
        />
        <div className="table-pagination">
          <span className="text-muted">Showing 1-8 of 56 services</span>
          <div className="table-pagination__buttons">
            <button type="button" className="pagination-btn">
              Previous
            </button>
            <button type="button" className="pagination-btn">
              1
            </button>
            <button type="button" className="pagination-btn">
              2
            </button>
            <button type="button" className="pagination-btn">
              Next
            </button>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Add New Service"
      >
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
            />
          </div>
          <div className="modal-form__field">
            <label className="modal-form__label" htmlFor="servicePrice">
              Price ($) <span className="required">*</span>
            </label>
            <input
              type="number"
              id="servicePrice"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              className="modal-form__input"
              placeholder="0.00"
              min="0"
              step="0.01"
              required
            />
          </div>
          <div className="modal-form__field">
            <label className="modal-form__label" htmlFor="serviceLastUpdated">
              Last Updated <span className="required">*</span>
            </label>
            <input
              type="date"
              id="serviceLastUpdated"
              name="lastUpdated"
              value={formData.lastUpdated}
              onChange={handleInputChange}
              className="modal-form__input"
              required
            />
          </div>
          <div className="modal-form__actions">
            <button
              type="button"
              onClick={handleCloseModal}
              className="modal-form__cancel-btn"
            >
              Cancel
            </button>
            <button type="submit" className="modal-form__submit-btn">
              Add Service
            </button>
          </div>
        </form>
      </Modal>
    </section>
  );
};

export default Pricing;

