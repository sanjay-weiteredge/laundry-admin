import { useEffect, useMemo, useState } from 'react'
import { adminAPI } from '../../services/api'
import './Dashboard.css'

const SparkIcon = () => (
  <svg width="26" height="26" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M16 3L17.6 10.4L24 12L17.6 13.6L16 21L14.4 13.6L8 12L14.4 10.4L16 3Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M6 20L7 23L10 24L7 25L6 28L5 25L2 24L5 23L6 20Z"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M25 17L25.5 19L28 19.5L25.5 20L25 22L24.5 20L22 19.5L24.5 19L25 17Z"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const StoreNetworkIcon = () => (
  <svg width="26" height="26" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M5 14L6 6H26L27 14M4 14H28V27H4V14Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M12 27V18H20V27" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M4 14L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M28 14L23 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
)

const CustomerOrbitIcon = () => (
  <svg width="26" height="26" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="12" r="5" stroke="currentColor" strokeWidth="2" />
    <path
      d="M6 26C8 22 11.6 20 16 20C20.4 20 24 22 26 26"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M6 10C10 8 13.2 7 16 7C18.8 7 22 8 26 10"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
)

const PendingBadgeIcon = () => (
  <svg width="26" height="26" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M16 29L11 24H7C5.89543 24 5 23.1046 5 22V8C5 6.89543 5.89543 6 7 6H25C26.1046 6 27 6.89543 27 8V22C27 23.1046 26.1046 24 25 24H21L16 29Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M12 14H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M12 19H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
)

const CompletedLaurelIcon = () => (
  <svg width="26" height="26" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="16" r="6" stroke="currentColor" strokeWidth="2" />
    <path d="M13.5 16.5L15.3 18.3L19 13.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path
      d="M5 12C6.5 18 11 23 16 23C21 23 25.5 18 27 12"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M5 12C5 12 8 12 9 10C10 8 9 5 9 5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M27 12C27 12 24 12 23 10C22 8 23 5 23 5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
)

const ClockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
    <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
)

const MetricCard = ({ icon: Icon, title, value, accent = {}, span = 2 }) => {
  const mergedAccent = {
    cardBg: '#ffffff',
    iconBg: '#f3f4f6',
    iconColor: '#111827',
    textColor: '#111827',
    mutedColor: '#6b7280',
    shadow: '0 10px 30px rgba(15, 23, 42, 0.08)',
    ...accent,
  }

  return (
    <div
      className="dashboard-metric-card"
      style={{
        '--card-span': span,
        '--card-bg': mergedAccent.cardBg,
        '--card-icon-bg': mergedAccent.iconBg,
        '--card-icon-color': mergedAccent.iconColor,
        '--card-text-color': mergedAccent.textColor,
        '--card-muted-color': mergedAccent.mutedColor,
        '--card-shadow': mergedAccent.shadow,
      }}
    >
      <div className="dashboard-metric-card__icon">
        <Icon />
      </div>
      <div className="dashboard-metric-card__content">
        <p className="dashboard-metric-card__label">{title}</p>
        <h3 className="dashboard-metric-card__value">{value}</h3>
      </div>
    </div>
  )
}

const Dashboard = () => {
  const [metrics, setMetrics] = useState({
    totalOrders: 0,
    activeStores: 0,
    activeCustomers: 0,
    pendingOrders: 0,
    completed: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true

    const fetchMetrics = async () => {
      try {
        setLoading(true)
        setError(null)

        const [ordersRes, storesRes, usersRes] = await Promise.all([
          adminAPI.getOrders(),
          adminAPI.getStores(),
          adminAPI.getUsers(1, 1),
        ])

        if (!isMounted) return

        const orders = ordersRes?.data || []
        const stores = storesRes?.data || []
        const totalUsers =
          usersRes?.pagination?.totalItems ??
          (Array.isArray(usersRes?.data) ? usersRes.data.length : 0)

        const pendingOrders = orders.filter((order) => order.order_status === 'pending').length
        const completedOrders = orders.filter((order) => order.order_status === 'delivered').length

        setMetrics({
          totalOrders: orders.length,
          activeStores: stores.length,
          activeCustomers: totalUsers,
          pendingOrders,
          completed: completedOrders,
        })
      } catch (err) {
        console.error('Failed to load dashboard metrics', err)
        if (isMounted) {
          setError(err.message || 'Failed to load dashboard metrics')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchMetrics()

    return () => {
      isMounted = false
    }
  }, [])

  const metricCards = useMemo(
    () => [
      {
        icon: SparkIcon,
        title: 'Total Orders',
        key: 'totalOrders',
        span: 2,
        accent: {
          cardBg: '#ffffff',
          iconBg: '#fff1e6',
          iconColor: '#b3471c',
          textColor: '#331a0f',
          mutedColor: 'rgba(51, 26, 15, 0.75)',
        },
      },
      {
        icon: StoreNetworkIcon,
        title: 'Active Stores',
        key: 'activeStores',
        span: 2,
        accent: {
          cardBg: '#ffffff',
          iconBg: '#e5f4ff',
          iconColor: '#0f62a4',
          textColor: '#0d2842',
          mutedColor: 'rgba(13, 40, 66, 0.65)',
        },
      },
      {
        icon: CustomerOrbitIcon,
        title: 'Active Customers',
        key: 'activeCustomers',
        span: 2,
        accent: {
          cardBg: '#ffffff',
          iconBg: '#ede8ff',
          iconColor: '#5b2dd1',
          textColor: '#28104d',
          mutedColor: 'rgba(40, 16, 77, 0.65)',
        },
      },
      {
        icon: PendingBadgeIcon,
        title: 'Pending Orders',
        key: 'pendingOrders',
        span: 3,
        accent: {
          cardBg: '#ffffff',
          iconBg: '#fff1dc',
          iconColor: '#c0660a',
          textColor: '#3c2103',
          mutedColor: 'rgba(60, 33, 3, 0.7)',
        },
      },
      {
        icon: CompletedLaurelIcon,
        title: 'Completed',
        key: 'completed',
        span: 3,
        accent: {
          cardBg: '#ffffff',
          iconBg: '#d8ffe9',
          iconColor: '#168152',
          textColor: '#0d3925',
          mutedColor: 'rgba(13, 57, 37, 0.75)',
        },
      },
    ],
    []
  )

  const renderValue = (value) => {
    if (loading) return '...'
    const numericValue = Number(value)
    return Number.isNaN(numericValue) ? value : numericValue.toLocaleString()
  }

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

      {error && <div className="dashboard__error">{error}</div>}

      <div className="dashboard__metrics">
        {metricCards.map(({ icon, title, key, accent, span }) => (
          <MetricCard key={key} icon={icon} title={title} value={renderValue(metrics[key])} accent={accent} span={span} />
        ))}
      </div>

    </div>
  )
}

export default Dashboard
