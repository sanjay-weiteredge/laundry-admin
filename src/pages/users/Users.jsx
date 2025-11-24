import { useEffect, useMemo, useState } from 'react';
import Table from '../../components/ui/Table';
import { adminAPI } from '../../services/api';
import './Users.css';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1,
    totalItems: 0,
  });

  useEffect(() => {
    fetchUsers(1);
  }, []);

  const fetchUsers = async (pageToLoad = 1) => {
    try {
      setLoading(true);
      setError('');
      const response = await adminAPI.getUsers(pageToLoad, pagination.limit);

      if (response.success && Array.isArray(response.data)) {
        setUsers(response.data);
        setPagination((prev) => ({
          ...prev,
          ...(response.pagination || {}),
        }));
        setPage(response.pagination?.page || pageToLoad);
      } else {
        setError('Unable to load users right now.');
      }
    } catch (err) {
      setError(err.message || 'Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    if (!term) return users;

    return users.filter((customer) =>
      ['name', 'email', 'phone_number'].some((field) =>
        (customer[field] || '').toLowerCase().includes(term)
      )
    );
  }, [searchTerm, users]);

  const tableData = filteredCustomers.map((customer) => ({
    id: customer.id,
    name: customer.name || '—',
    phone: customer.phone_number || '—',
    email: customer.email || '—',
    totalOrders: Number(customer.totalOrders) || 0,
  }));

  const handlePageChange = (direction) => {
    const nextPage =
      direction === 'next' ? page + 1 : direction === 'prev' ? page - 1 : page;

    if (nextPage >= 1 && nextPage <= pagination.totalPages) {
      fetchUsers(nextPage);
    }
  };

  const columns = [
    { key: 'name', header: 'Customer Name', field: 'name' },
    { key: 'phone', header: 'Phone Number', field: 'phone' },
    {
      key: 'email',
      header: 'Email Address',
      render: (value, row) => (
        <a href={`mailto:${row.email}`} className="users-page__email">
          {row.email}
        </a>
      ),
    },
    {
      key: 'orders',
      header: 'Total Orders',
      render: (value, row) => <strong>{row.totalOrders}</strong>,
    },
  ];

  if (loading) {
    return (
      <section className="users-page">
        <div className="users-card">
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <p>Loading customers...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="users-page">
        <div className="users-card">
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>
            <button
              type="button"
              className="pagination-btn"
              onClick={() => fetchUsers(page)}
            >
              Retry
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="users-page">
      <header className="users-page__header">
        <div>
          <p className="text-muted" style={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Customers
          </p>
          <p className="text-muted">Track customer contacts and recent order activity.</p>
        </div>
      </header>

      <div className="users-card">
        <div className="users-card__toolbar">
          <div className="users-card__search-wrapper">
            <input
              type="search"
              value={searchTerm}
              placeholder="Search customers..."
              aria-label="Search customers"
              className="users-card__search"
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>
          <span className="text-muted">
            Showing {filteredCustomers.length} of {users.length} customers
          </span>
        </div>

        <Table
          columns={columns}
          data={tableData}
          striped
          emptyMessage="No customers found"
        />

        <div className="users-card__pagination">
          <button
            type="button"
            className="pagination-btn"
            onClick={() => handlePageChange('prev')}
            disabled={page <= 1}
          >
            Previous
          </button>
          <span className="text-muted">
            Page {page} of {pagination.totalPages}
          </span>
          <button
            type="button"
            className="pagination-btn"
            onClick={() => handlePageChange('next')}
            disabled={page >= pagination.totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </section>
  );
};

export default Users;
