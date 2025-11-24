import { useEffect, useMemo, useState } from 'react';
import Table from '../../components/ui/Table';
import { adminAPI } from '../../services/api';
import './Orders.css';

const DotsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="5" cy="12" r="2" fill="currentColor" />
    <circle cx="12" cy="12" r="2" fill="currentColor" />
    <circle cx="19" cy="12" r="2" fill="currentColor" />
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

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [storeFilter, setStoreFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
        setOrders(response.data || []);
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
      if (order.storeName) {
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
  };

  const formatDate = (value) => (value ? new Date(value).toLocaleString() : '—');
  const formatPickupWindow = (pickupSlot) => {
    if (!pickupSlot?.start) {
      return 'Not scheduled';
    }

    const start = new Date(pickupSlot.start).toLocaleString();
    const end = pickupSlot.end ? new Date(pickupSlot.end).toLocaleString() : 'TBD';
    return `${start} - ${end}`;
  };

  const columns = [
    { key: 'orderId', header: 'Order ID', field: 'orderId' },
    {
      key: 'serviceName',
      header: 'Service',
      render: (_, row) => row.serviceName || 'Unknown service',
    },
    {
      key: 'storeName',
      header: 'Store',
      render: (_, row) => row.storeName || 'Unknown store',
    },
    {
      key: 'pickupSlot',
      header: 'Pickup Window',
      render: (_, row) => formatPickupWindow(row.pickupSlot),
    },
    {
      key: 'status',
      header: 'Status',
      render: (value, row) => {
        const meta = statusMeta[row.status];
        return (
          <span className={`status-badge ${meta?.tone || ''}`}>
            {meta?.label || row.status || 'Unknown'}
          </span>
        );
      },
    },
    {
      key: 'createdAt',
      header: 'Placed',
      render: (_, row) => formatDate(row.createdAt),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: () => (
        <button type="button" className="icon-button" aria-label="More actions">
          <DotsIcon />
        </button>
      ),
    },
  ];

  return (
    <section className="orders-page">
      <header>
        <p className="text-muted">Review real-time activity across all stores.</p>
      </header>
      <div className="orders-card">
        <div className="orders-card__filters">
          <div className="orders-card__search">
            <input
              type="search"
              placeholder="Search by Order ID, Service or Store..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search orders"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
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
            onChange={(event) => setStoreFilter(event.target.value)}
            aria-label="Filter by store"
          >
            <option value="all">All Stores</option>
            {storeOptions.map((store) => (
              <option key={store} value={store}>
                {store}
              </option>
            ))}
          </select>
          {/* <button type="button" className="pagination-btn" onClick={handleReset}>
            Reset
          </button> */}
        </div>
        <div className="orders-card__header">
          <div>
            <strong>Latest updates across all locations</strong>
            {loading && <p className="text-muted small-text">Loading orders...</p>}
            {error && <p className="error-text">{error}</p>}
          </div>
        </div>
        <Table
          columns={columns}
          data={filteredOrders}
          striped
          emptyMessage={loading ? 'Fetching orders...' : 'No orders found'}
        />
        <div className="orders-card__pagination">
          <button type="button" className="pagination-btn" disabled>
            Previous
          </button>
          <span className="text-muted">Showing {filteredOrders.length} orders</span>
          <button type="button" className="pagination-btn" disabled>
            Next
          </button>
        </div>
      </div>
    </section>
  );
};

export default Orders;
