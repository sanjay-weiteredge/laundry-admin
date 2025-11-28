import { useEffect, useMemo, useState } from 'react';
import Table from '../../components/ui/Table';
import Pagination from '../../components/ui/Pagination';
import { adminAPI } from '../../services/api';
import './Orders.css';

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
    { key: 'orderId', header: 'orderId' },
    {
      key: 'serviceName',
      header: 'Service',
    },
    {
      key: 'storeName',
      header: 'store',
    },
    {
      key: 'pickupSlot',
      header: 'Pickup Window',
      render: (_, row) => formatPickupWindow(row.pickupSlot),
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
    // {
    //   key: 'actions',
    //   header: 'Actions',
    //   render: () => (
    //     <button type="button" className="icon-button" aria-label="More actions">
    //       <DotsIcon />
    //     </button>
    //   ),
    // },
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
          data={paginatedOrders}
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
    </section>
  );
};

export default Orders;
