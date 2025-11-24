import './Dashboard.css';


const OrdersIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15M9 5C9 6.10457 9.89543 7 11 7H13C14.1046 7 15 6.10457 15 5M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5M12 12H15M12 16H15M9 12H9.01M9 16H9.01"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
)

const RevenueIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M12 2V22M17 5H9.5C8.57174 5 7.6815 5.36875 7.02513 6.02513C6.36875 6.6815 6 7.57174 6 8.5C6 9.42826 6.36875 10.3185 7.02513 10.9749C7.6815 11.6312 8.57174 12 9.5 12H14.5C15.4283 12 16.3185 12.3687 16.9749 13.0251C17.6312 13.6815 18 14.5717 18 15.5C18 16.4283 17.6312 17.3185 16.9749 17.9749C16.3185 18.6312 15.4283 19 14.5 19H6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const StoresIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M3 21H21M5 21V7L13 2L21 7V21M9 9V21M15 9V21"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const UsersIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88M13 7C13 9.20914 11.2091 11 9 11C6.79086 11 5 9.20914 5 7C5 4.79086 6.79086 3 9 3C11.2091 3 13 4.79086 13 7Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const TrendingUpIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M23 6L13.5 15.5L8.5 10.5L1 18M23 6H17M23 6V12"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const ClockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
    <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
)

const dashboardData = {
  metrics: {
    totalOrders: 1247,
    totalRevenue: 28450.75,
    activeStores: 3,
    activeCustomers: 156,
    pendingOrders: 23,
    completedToday: 48,
  },
  orderStatus: {
    processing: 12,
    'pending pickup': 8,
    ready: 15,
    delivered: 1156,
    canceled: 3,
  },
  storePerformance: [
    { name: 'Downtown Wash', orders: 456, revenue: 12450.50, growth: 12.5 },
    { name: 'Uptown Dry Clean', orders: 398, revenue: 9850.25, growth: 8.3 },
    { name: 'Riverside Laundry Hub', orders: 393, revenue: 6150.00, growth: 15.2 },
  ],
}

const statusMeta = {
  processing: { label: 'Processing', tone: 'status-processing' },
  'pending pickup': { label: 'Pending', tone: 'status-pending' },
  ready: { label: 'Ready', tone: 'status-ready' },
  delivered: { label: 'Delivered', tone: 'status-delivered' },
  canceled: { label: 'Canceled', tone: 'status-canceled' },
}

const MetricCard = ({ icon: Icon, title, value, change, changeType = 'positive' }) => (
  <div className="dashboard-metric-card">
    <div className="dashboard-metric-card__icon">
      <Icon />
    </div>
    <div className="dashboard-metric-card__content">
      <p className="dashboard-metric-card__label">{title}</p>
      <h3 className="dashboard-metric-card__value">{value}</h3>
      {change && (
        <div className={`dashboard-metric-card__change dashboard-metric-card__change--${changeType}`}>
          <TrendingUpIcon />
          <span>{change}</span>
        </div>
      )}
    </div>
  </div>
)

const Dashboard = () => {
  return (
    <div className="dashboard">
      <div className="dashboard__header">
        <div>
          <p className="text-muted">Welcome back! Here's what's happening with your business today.</p>
        </div>
        <div className="dashboard__date">
          <ClockIcon />
          <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="dashboard__metrics">
        <MetricCard
          icon={OrdersIcon}
          title="Total Orders"
          value={dashboardData.metrics.totalOrders.toLocaleString()}
          change="+12.5% from last month"
        />
        <MetricCard
          icon={RevenueIcon}
          title="Total Revenue"
          value={`$${dashboardData.metrics.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          change="+8.2% from last month"
        />
        <MetricCard
          icon={StoresIcon}
          title="Active Stores"
          value={dashboardData.metrics.activeStores}
          change="All operational"
          changeType="neutral"
        />
        <MetricCard
          icon={UsersIcon}
          title="Active Customers"
          value={dashboardData.metrics.activeCustomers}
          change="+5 new this week"
        />
      </div>

      <div className="dashboard__grid">
        {/* Order Status Breakdown */}
        <div className="dashboard-card">
          <div className="dashboard-card__header">
            <h2 className="dashboard-card__title">Order Status</h2>
            <span className="dashboard-card__subtitle">Current distribution</span>
          </div>
          <div className="dashboard-status-list">
            {Object.entries(dashboardData.orderStatus).map(([status, count]) => {
              const meta = statusMeta[status]
              const total = Object.values(dashboardData.orderStatus).reduce((a, b) => a + b, 0)
              const percentage = ((count / total) * 100).toFixed(1)
              return (
                <div key={status} className="dashboard-status-item">
                  <div className="dashboard-status-item__header">
                    <span className={`status-badge ${meta?.tone || ''}`}>{meta?.label || status}</span>
                    <span className="dashboard-status-item__count">{count}</span>
                  </div>
                  <div className="dashboard-status-item__bar">
                    <div
                      className="dashboard-status-item__bar-fill"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="dashboard-status-item__percentage">{percentage}%</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Store Performance */}
        <div className="dashboard-card">
          <div className="dashboard-card__header">
            <h2 className="dashboard-card__title">Store Performance</h2>
            <span className="dashboard-card__subtitle">Top performers</span>
          </div>
          <div className="dashboard-stores">
            {dashboardData.storePerformance.map((store, index) => (
              <div key={index} className="dashboard-store-item">
                <div className="dashboard-store-item__header">
                  <h3 className="dashboard-store-item__name">{store.name}</h3>
                  <span className={`dashboard-store-item__growth dashboard-store-item__growth--positive`}>
                    +{store.growth}%
                  </span>
                </div>
                <div className="dashboard-store-item__stats">
                  <div className="dashboard-store-item__stat">
                    <span className="dashboard-store-item__stat-label">Orders</span>
                    <span className="dashboard-store-item__stat-value">{store.orders}</span>
                  </div>
                  <div className="dashboard-store-item__stat">
                    <span className="dashboard-store-item__stat-label">Revenue</span>
                    <span className="dashboard-store-item__stat-value">${store.revenue.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="dashboard__quick-stats">
        <div className="dashboard-quick-stat">
          <div className="dashboard-quick-stat__icon dashboard-quick-stat__icon--pending">
            <OrdersIcon />
          </div>
          <div className="dashboard-quick-stat__content">
            <span className="dashboard-quick-stat__value">{dashboardData.metrics.pendingOrders}</span>
            <span className="dashboard-quick-stat__label">Pending Orders</span>
          </div>
        </div>
        <div className="dashboard-quick-stat">
          <div className="dashboard-quick-stat__icon dashboard-quick-stat__icon--completed">
            <OrdersIcon />
          </div>
          <div className="dashboard-quick-stat__content">
            <span className="dashboard-quick-stat__value">{dashboardData.metrics.completedToday}</span>
            <span className="dashboard-quick-stat__label">Completed Today</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
