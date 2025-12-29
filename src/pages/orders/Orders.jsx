import { useEffect, useMemo, useState } from 'react';
import Table from '../../components/ui/Table';
import Pagination from '../../components/ui/Pagination';
import Modal from '../../components/ui/Modal';
import { adminAPI } from '../../services/api';
import './Orders.css';

const EyeIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 5C7 5 2.73 8.11 1 12C2.73 15.89 7 19 12 19C17 19 21.27 15.89 23 12C21.27 8.11 17 5 12 5Z"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const statusMeta = {
  pending: { label: 'Pending', tone: 'status-pending' },
  confirmed: { label: 'Confirmed', tone: 'status-processing' },
  processing: { label: 'Processing', tone: 'status-processing' },
  picked_up: { label: 'Picked Up', tone: 'status-processing' },
  ready_for_delivery: { label: 'Ready for Delivery', tone: 'status-ready' },
  out_for_delivery: { label: 'Out for Delivery', tone: 'status-ready' },
  delivered: { label: 'Delivered', tone: 'status-delivered' },
  cancelled: { label: 'Canceled', tone: 'status-canceled' },
  ready: { label: 'Ready for Pickup', tone: 'status-ready' },
  'pending pickup': { label: 'Pending', tone: 'status-pending' },
};

const deriveServiceName = (order) => {
  if (order?.service?.name) {
    return order.service.name;
  }

  const serviceNames = (order?.items || [])
    .map((item) => item?.service?.name)
    .filter(Boolean);

  if (serviceNames.length === 0) {
    return 'Unknown service';
  }

  if (serviceNames.length === 1) {
    return serviceNames[0];
  }

  return `${serviceNames[0]} +${serviceNames.length - 1}`;
};

const mapOrderRecord = (order) => ({
  orderId: String(order.id ?? ''),
  serviceName: deriveServiceName(order),
  storeName: order.store?.name || 'Unknown store',
  pickupSlot: {
    start: order.pickup_scheduled_at || order.pickupSlot?.start || null,
    end: order.pickup_slot_end || order.pickupSlot?.end || null,
  },
  status: order.order_status || order.status || 'unknown',
  raw: order,
});

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [storeFilter, setStoreFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const itemsPerPage = 5;

  useEffect(() => {
    let isMounted = true;

    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await adminAPI.getOrders();
        if (!isMounted) {
          return;
        }
        const normalizedOrders = (response.data || []).map(mapOrderRecord);
        setOrders(normalizedOrders);
      } catch (err) {
        if (!isMounted) {
          return;
        }
        setError(err.message || 'Failed to fetch orders');
        setOrders([]);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchOrders();

    return () => {
      isMounted = false;
    };
  }, []);

  const storeOptions = useMemo(() => {
    const uniqueStores = new Set();
    orders.forEach((order) => {
      if (order.storeName && order.storeName !== 'Unknown store') {
        uniqueStores.add(order.storeName);
      }
    });
    return Array.from(uniqueStores);
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const text = search.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesText =
        !text ||
        order.orderId?.toLowerCase().includes(text) ||
        order.serviceName?.toLowerCase().includes(text) ||
        order.storeName?.toLowerCase().includes(text);
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      const matchesStore = storeFilter === 'all' || order.storeName === storeFilter;
      return matchesText && matchesStatus && matchesStore;
    });
  }, [search, statusFilter, storeFilter, orders]);

  const handleReset = () => {
    setSearch('');
    setStatusFilter('all');
    setStoreFilter('all');
    setCurrentPage(1);
  };

  // Paginate filtered orders
  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredOrders.slice(startIndex, endIndex);
  }, [filteredOrders, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const formatDate = (value, options) => {
    if (!value) return '—';
    return new Date(value).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
      ...options,
    });
  };

  const formatCurrency = (value) => {
    const amount = Number(value) || 0;
    return `₹${amount.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const handleViewOrder = (row) => {
    setSelectedOrder(row.raw || row);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  const columns = [
    { key: 'serial', header: 'ORDERID' },
    {
      key: 'serviceName',
      header: 'Service',
    },
    {
      key: 'storeName',
      header: 'store',
    },
    {
      key: 'status',
      header: 'Status',
      render: (_, row) => {
        const meta = statusMeta[row.status];
        return (
          <span className={`status-badge ${meta?.tone || ''}`}>
            {meta?.label || row.status || 'Unknown'}
          </span>
        );
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_, row) => (
        <button
          type="button"
          className="icon-button"
          aria-label="View order details"
          onClick={() => handleViewOrder(row)}
        >
          <EyeIcon />
        </button>
      ),
    },
  ];

  const paginatedOrdersWithSerial = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return paginatedOrders.map((order, index) => ({
      ...order,
      serial: startIndex + index + 1,
    }));
  }, [paginatedOrders, currentPage, itemsPerPage]);

  return (
    <section className="orders-page">
      <header>
        <p className="text-muted">Review real-time activity across all stores.</p>
      </header>

      {loading && orders.length === 0 ? (
        <div className="orders-empty">
          <p className="text-muted small-text">Loading orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="orders-empty">
          <p className="empty-state__title">No Orders Yet</p>
          <p className="empty-state__subtitle">New customer orders will appear here.</p>
        </div>
      ) : (
        <div className="orders-card">
          <div className="orders-card__filters">
            <div className="orders-card__search">
              <input
                type="search"
                placeholder="Search by Order ID, Service or Store..."
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setCurrentPage(1);
                }}
                aria-label="Search orders"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value);
                setCurrentPage(1);
              }}
              aria-label="Filter by status"
            >
              <option value="all">All Statuses</option>
              {Object.keys(statusMeta).map((status) => (
                <option key={status} value={status}>
                  {statusMeta[status].label}
                </option>
              ))}
            </select>
            <select
              value={storeFilter}
              onChange={(event) => {
                setStoreFilter(event.target.value);
                setCurrentPage(1);
              }}
              aria-label="Filter by store"
            >
              <option value="all">All Stores</option>
              {storeOptions.map((store) => (
                <option key={store} value={store}>
                  {store}
                </option>
              ))}
            </select>
          </div>
          <div className="orders-card__header">
            <div>
              {error && <p className="error-text">{error}</p>}
            </div>
          </div>
          <Table
            columns={columns}
            data={paginatedOrdersWithSerial}
            striped
            emptyMessage={loading ? 'Fetching orders...' : 'No orders found'}
          />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredOrders.length}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            maxVisiblePages={2}
          />
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={`Order Details${selectedOrder ? ` #${selectedOrder.id}` : ''}`}
      >
        {selectedOrder && (
          <div className="order-details-modal">
            <p>
              <strong>Service:</strong> {deriveServiceName(selectedOrder)}
            </p>
            <p>
              <strong>Store:</strong> {selectedOrder.store?.name || 'Unknown store'}
            </p>
            <p>
              <strong>Status:</strong>{' '}
              {statusMeta[selectedOrder.order_status || selectedOrder.status]?.label ||
                selectedOrder.status ||
                'Unknown'}
            </p>
            {/* <p>
              <strong>Created At:</strong> {formatDate(selectedOrder.created_at)}
            </p> */}
            {(() => {
              let pickupContent;
              if (selectedOrder.is_walk_in) {
                pickupContent = (
                  <p>
                    <strong>Pickup:</strong> {formatDate(selectedOrder.created_at)}
                  </p>
                );
              } else {
                const start = selectedOrder.pickup_scheduled_at ? new Date(selectedOrder.pickup_scheduled_at) : null;
                const end = selectedOrder.pickup_slot_end ? new Date(selectedOrder.pickup_slot_end) : null;
                let slot = 'Not Scheduled';

                if (start && end) {
                  const startStr = formatDate(start);
                  if (start.toDateString() === end.toDateString()) {
                    slot = `${startStr} - ${end.toLocaleTimeString('en-IN', { timeStyle: 'short' })}`;
                  } else {
                    slot = `${startStr} - ${formatDate(end)}`;
                  }
                } else if (start) {
                  slot = formatDate(start);
                }

                pickupContent = (
                  <p>
                    <strong>Pickup:</strong> {slot}
                  </p>
                );
              }
              return pickupContent;
            })()}
            <p>
              <strong>Express Order:</strong> {selectedOrder.is_express ? 'Yes' : 'No'}
            </p>
            <p>
              <strong>Walk-In Order:</strong> {selectedOrder.is_walk_in ? 'Yes' : 'No'}
            </p>
            {selectedOrder.order_status === 'delivered' && selectedOrder.delivered_at && (
              <p>
                <strong>Delivered At:</strong> {formatDate(selectedOrder.delivered_at)}
              </p>
            )}
            {(() => {
              const totalAmount = selectedOrder.items?.reduce((sum, item) => sum + parseFloat(item.total_amount || 0), 0);
              if (totalAmount > 0) {
                return (
                  <p>
                    <strong>Total Amount:</strong> {formatCurrency(totalAmount)}
                  </p>
                );
              }
              return null;
            })()}
          </div>
        )}
      </Modal>
    </section>
  );
};

export default Orders;
