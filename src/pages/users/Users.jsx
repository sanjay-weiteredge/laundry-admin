import { useEffect, useMemo, useState } from 'react';
import Table from '../../components/ui/Table';
import Pagination from '../../components/ui/Pagination';
import { adminAPI } from '../../services/api';
import { showConfirmAlert, showSuccessAlert, showErrorAlert } from '../../utils/alerts';
import './Users.css';

const DeleteIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ReportIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 33 33"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M16.094 8.03337L26.1929 25.4819H5.99502L16.094 8.03337ZM16.094 2.68213L1.34119 28.1642H30.8468L16.094 2.68213ZM17.4351 21.4584H14.7528V24.1407H17.4351V21.4584ZM17.4351 13.4114H14.7528V18.7761H17.4351V13.4114Z"
      fill="#676767"
    />
  </svg>
);

const Users = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingId, setDeletingId] = useState(null);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      if (!initialLoadComplete) {
        setLoading(true);
      }
      setError('');
      const response = await adminAPI.getUsers(1, 1000); // fetch plenty so pagination works client-side

      if (response.success && Array.isArray(response.data)) {
        setUsers(response.data);
      } else {
        setError('Unable to load users right now.');
      }
    } catch (err) {
      setError(err.message || 'Failed to load users.');
    } finally {
      setLoading(false);
      if (!initialLoadComplete) {
        setInitialLoadComplete(true);
      }
    }
  };

  const filteredCustomers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    // Sort users by ID ascending before applying filters
    const sortedUsers = [...users].sort((a, b) => {
      const idA = typeof a.id === 'number' ? a.id : Number(a.id) || 0;
      const idB = typeof b.id === 'number' ? b.id : Number(b.id) || 0;
      return idA - idB;
    });

    if (!term) return sortedUsers;

    return sortedUsers.filter((customer) =>
      ['name', 'email', 'phone_number'].some((field) =>
        (customer[field] || '').toLowerCase().includes(term)
      )
    );
  }, [searchTerm, users]);

  const tableData = useMemo(
    () =>
      filteredCustomers.map((customer) => ({
        id: customer.id,
        name: customer.name || '—',
        phone: customer.phone_number || '—',
        email: customer.email || '—',
        totalOrders: Number(customer.totalOrders) || 0,
      })),
    [filteredCustomers]
  );

  // Client-side pagination like Orders page
  const paginatedCustomers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return tableData.slice(startIndex, endIndex);
  }, [tableData, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(tableData.length / itemsPerPage) || 1;

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleDelete = async (userId, name = 'this user') => {
    const { isConfirmed } = await showConfirmAlert({
      title: `Delete ${name}?`,
      text: 'This action cannot be undone.',
      confirmButtonText: 'Yes, delete',
    });
    if (!isConfirmed) return;

    try {
      setDeletingId(userId);
      const response = await adminAPI.deleteUser(userId);
      if (response.success) {
        setUsers((prev) => prev.filter((u) => u.id !== userId));
        showSuccessAlert('User deleted', `${name} has been removed.`);
      } else {
        showErrorAlert('Unable to delete', response.message || 'Please try again.');
      }
    } catch (err) {
      showErrorAlert('Unable to delete', err.message || 'Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleReport = async (userId, name = 'this user') => {
    const { isConfirmed } = await showConfirmAlert({
      title: `Report ${name}?`,
      text: 'This will block the user from logging in.',
      confirmButtonText: 'Yes, report',
    });
    if (!isConfirmed) return;

    try {
      const response = await adminAPI.reportUser(userId);
      if (response.success) {
        showSuccessAlert('User reported', `${name} has been blocked from login.`);
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, action_button: true } : u))
        );
      } else {
        showErrorAlert('Unable to report', response.message || 'Please try again.');
      }
    } catch (err) {
      showErrorAlert('Unable to report', err.message || 'Please try again.');
    }
  };

  const columns = [
    { key: 'id', header: 'User ID', field: 'id' },
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
    {
      key: 'actions',
      header: 'Actions',
      render: (value, row) => (
        <div className="users-actions">
          <button
            type="button"
            className="users-action-btn users-action-btn--danger"
            onClick={() => handleDelete(row.id, row.name || 'this user')}
            disabled={deletingId === row.id}
            aria-label={`Delete ${row.name || 'user'}`}
          >
            <DeleteIcon />
          </button>
          <button
            type="button"
            className="users-action-btn users-action-btn--ghost"
            onClick={() => handleReport(row.id, row.name || 'this user')}
            aria-label={`Report ${row.name || 'user'}`}
          >
            <ReportIcon />
          </button>
        </div>
      ),
    },
  ];

  if (loading && !initialLoadComplete) {
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
              onClick={fetchUsers}
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
          {/* <p className="text-muted" style={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Customers
          </p> */}
          <p className="text-muted">Track customer contacts and recent order activity.</p>
        </div>
      </header>

      {users.length === 0 ? (
        <div className="users-empty">
          <p className="empty-state__title">No Customers Found</p>
          <p className="empty-state__subtitle">
            Customer accounts will appear here once they sign up or place an order.
          </p>
        </div>
      ) : (
        <div className="users-card">
          <div className="users-card__toolbar">
            <div className="users-card__search-wrapper">
              <input
                type="search"
                value={searchTerm}
                placeholder="Search customers..."
                aria-label="Search customers"
                className="users-card__search"
                onChange={(event) => {
                  setSearchTerm(event.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <span className="text-muted">
              Showing {filteredCustomers.length} of {users.length} customers
            </span>
          </div>

          <Table
            columns={columns}
            data={paginatedCustomers}
            striped
            emptyMessage="No customers found"
          />

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredCustomers.length}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            maxVisiblePages={2}
          />
        </div>
      )}
    </section>
  );
};

export default Users;
