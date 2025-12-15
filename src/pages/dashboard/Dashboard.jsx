import { useEffect, useMemo, useState } from 'react'
import Table from '../../components/ui/Table'
import { adminAPI } from '../../services/api'
import './Dashboard.css'

const statusMeta = {
  pending: { label: 'Pending', tone: 'status-pending' },
  confirmed: { label: 'Confirmed', tone: 'status-processing' },
  processing: { label: 'Processing', tone: 'status-processing' },
  picked_up: { label: 'Picked Up', tone: 'status-processing' },
  ready_for_delivery: { label: 'Ready for Delivery', tone: 'status-ready' },
  out_for_delivery: { label: 'Out for Delivery', tone: 'status-ready' },
  delivered: { label: 'Delivered', tone: 'status-delivered' },
  cancelled: { label: 'Canceled', tone: 'status-canceled' },
  canceled: { label: 'Canceled', tone: 'status-canceled' },
  completed: { label: 'Completed', tone: 'status-delivered' },
  ready: { label: 'Ready for Pickup', tone: 'status-ready' },
  'pending pickup': { label: 'Pending', tone: 'status-pending' },
}

const deriveServiceName = (order) => {
  if (order?.service?.name) {
    return order.service.name
  }

  const serviceNames = (order?.items || []).map((item) => item?.service?.name).filter(Boolean)

  if (serviceNames.length === 0) {
    return 'Unknown service'
  }

  if (serviceNames.length === 1) {
    return serviceNames[0]
  }

  return `${serviceNames[0]} +${serviceNames.length - 1}`
}

const SparkIcon = () => (
  <svg width="55" height="55" viewBox="0 0 55 55" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="55" height="55" rx="14" fill="#E8A070"/>
  <path d="M17.7425 30.7125C18.4137 34.0713 18.75 35.75 19.8587 36.8312C20.0646 37.0312 20.2854 37.2121 20.5212 37.3737C21.8 38.25 23.5125 38.25 26.9375 38.25H29.0662C32.49 38.25 34.2012 38.25 35.4787 37.375C35.7162 37.2117 35.9371 37.0304 36.1412 36.8312C37.2512 35.75 37.5875 34.0712 38.2587 30.7137C39.2225 25.8937 39.705 23.4838 38.595 21.7763C38.3939 21.4667 38.1591 21.1804 37.895 20.9225C36.4375 19.5 33.9812 19.5 29.0662 19.5H26.9375C22.02 19.5 19.5625 19.5 18.105 20.9225C17.8413 21.1804 17.6069 21.4668 17.4062 21.7763C16.2962 23.4838 16.7787 25.8937 17.7437 30.7137L17.7425 30.7125Z" stroke="white" stroke-width="1.875"/>
  <path d="M31.75 25.75C32.4404 25.75 33 25.1904 33 24.5C33 23.8096 32.4404 23.25 31.75 23.25C31.0596 23.25 30.5 23.8096 30.5 24.5C30.5 25.1904 31.0596 25.75 31.75 25.75Z" fill="white"/>
  <path d="M24.25 25.75C24.9404 25.75 25.5 25.1904 25.5 24.5C25.5 23.8096 24.9404 23.25 24.25 23.25C23.5596 23.25 23 23.8096 23 24.5C23 25.1904 23.5596 25.75 24.25 25.75Z" fill="white"/>
  <path d="M24.25 19.5V18.25C24.25 17.2554 24.6451 16.3016 25.3483 15.5983C26.0516 14.8951 27.0054 14.5 28 14.5C28.9946 14.5 29.9484 14.8951 30.6517 15.5983C31.3549 16.3016 31.75 17.2554 31.75 18.25V19.5" stroke="white" stroke-width="1.875" stroke-linecap="round"/>
  </svg>
  
)
const CancelIcon = () =>(
  <svg width="55" height="55" viewBox="0 0 55 55" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="55" height="55" rx="24" fill="#EF4444"/>
<path d="M28 28.75L31.625 32.375C31.8542 32.6042 32.1458 32.7188 32.5 32.7188C32.8542 32.7188 33.1458 32.6042 33.375 32.375C33.6042 32.1458 33.7188 31.8542 33.7188 31.5C33.7188 31.1458 33.6042 30.8542 33.375 30.625L29.75 27L33.375 23.375C33.6042 23.1458 33.7188 22.8542 33.7188 22.5C33.7188 22.1458 33.6042 21.8542 33.375 21.625C33.1458 21.3958 32.8542 21.2812 32.5 21.2812C32.1458 21.2813 31.8542 21.3958 31.625 21.625L28 25.25L24.375 21.625C24.1458 21.3958 23.8542 21.2812 23.5 21.2812C23.1458 21.2812 22.8542 21.3958 22.625 21.625C22.3958 21.8542 22.2813 22.1458 22.2813 22.5C22.2813 22.8542 22.3958 23.1458 22.625 23.375L26.25 27L22.625 30.625C22.3958 30.8542 22.2813 31.1458 22.2813 31.5C22.2813 31.8542 22.3958 32.1458 22.625 32.375C22.8542 32.6042 23.1458 32.7188 23.5 32.7188C23.8542 32.7188 24.1458 32.6042 24.375 32.375L28 28.75ZM28 39.5C26.2708 39.5 24.6458 39.1717 23.125 38.515C21.6042 37.8583 20.2813 36.9679 19.1563 35.8438C18.0313 34.7196 17.1408 33.3967 16.485 31.875C15.8292 30.3533 15.5008 28.7283 15.5 27C15.4992 25.2717 15.8275 23.6467 16.485 22.125C17.1425 20.6033 18.0329 19.2804 19.1563 18.1563C20.2796 17.0321 21.6025 16.1417 23.125 15.485C24.6475 14.8283 26.2725 14.5 28 14.5C29.7275 14.5 31.3525 14.8283 32.875 15.485C34.3975 16.1417 35.7204 17.0321 36.8438 18.1563C37.9671 19.2804 38.8579 20.6033 39.5163 22.125C40.1746 23.6467 40.5025 25.2717 40.5 27C40.4975 28.7283 40.1692 30.3533 39.515 31.875C38.8608 33.3967 37.9704 34.7196 36.8438 35.8438C35.7171 36.9679 34.3942 37.8587 32.875 38.5162C31.3558 39.1737 29.7308 39.5017 28 39.5ZM28 37C30.7917 37 33.1562 36.0312 35.0938 34.0938C37.0312 32.1562 38 29.7917 38 27C38 24.2083 37.0312 21.8437 35.0938 19.9062C33.1562 17.9687 30.7917 17 28 17C25.2083 17 22.8438 17.9687 20.9063 19.9062C18.9688 21.8437 18 24.2083 18 27C18 29.7917 18.9688 32.1562 20.9063 34.0938C22.8438 36.0312 25.2083 37 28 37Z" fill="white"/>
</svg>

)

const StoreNetworkIcon = () => (
  <svg width="55" height="55" viewBox="0 0 55 55" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="55" height="55" rx="24" fill="#8B5CF6"/>
  <path d="M31.7499 38.25V32C31.7499 31.6685 31.6182 31.3505 31.3838 31.1161C31.1494 30.8817 30.8315 30.75 30.4999 30.75H25.4999C25.1684 30.75 24.8505 30.8817 24.6161 31.1161C24.3816 31.3505 24.2499 31.6685 24.2499 32V38.25M35.2174 24.8875C34.9569 24.638 34.61 24.4988 34.2493 24.4988C33.8886 24.4988 33.5418 24.638 33.2812 24.8875C32.7 25.4419 31.9276 25.7512 31.1243 25.7512C30.3211 25.7512 29.5487 25.4419 28.9674 24.8875C28.7069 24.6384 28.3604 24.4994 27.9999 24.4994C27.6395 24.4994 27.293 24.6384 27.0324 24.8875C26.4511 25.4423 25.6785 25.7518 24.8749 25.7518C24.0714 25.7518 23.2987 25.4423 22.7174 24.8875C22.4569 24.638 22.11 24.4988 21.7493 24.4988C21.3886 24.4988 21.0418 24.638 20.7812 24.8875C20.2197 25.4233 19.479 25.731 18.7032 25.7507C17.9274 25.7704 17.172 25.5008 16.5841 24.9942C15.9961 24.4877 15.6177 23.7805 15.5224 23.0103C15.4272 22.2401 15.6219 21.462 16.0687 20.8275L19.6799 15.5975C19.9091 15.2594 20.2176 14.9826 20.5784 14.7912C20.9393 14.5999 21.3415 14.4999 21.7499 14.5H34.2499C34.6572 14.4998 35.0583 14.5992 35.4184 14.7894C35.7785 14.9795 36.0867 15.2548 36.3162 15.5913L39.9349 20.8313C40.3819 21.4663 40.5763 22.245 40.4805 23.0155C40.3846 23.7861 40.0053 24.4934 39.4164 24.9996C38.8275 25.5058 38.0713 25.7746 37.295 25.7536C36.5188 25.7327 35.7782 25.4235 35.2174 24.8863" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M18 25.6875V35.75C18 36.413 18.2634 37.0489 18.7322 37.5178C19.2011 37.9866 19.837 38.25 20.5 38.25H35.5C36.163 38.25 36.7989 37.9866 37.2678 37.5178C37.7366 37.0489 38 36.413 38 35.75V25.6875" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
  
)

const CustomerOrbitIcon = () => (
<svg width="55" height="55" viewBox="0 0 55 55" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="55" height="55" rx="24" fill="#3B82F6"/>
<path d="M19.875 22C19.875 21.1712 20.2042 20.3763 20.7903 19.7903C21.3763 19.2042 22.1712 18.875 23 18.875C23.8288 18.875 24.6237 19.2042 25.2097 19.7903C25.7958 20.3763 26.125 21.1712 26.125 22C26.125 22.8288 25.7958 23.6237 25.2097 24.2097C24.6237 24.7958 23.8288 25.125 23 25.125C22.1712 25.125 21.3763 24.7958 20.7903 24.2097C20.2042 23.6237 19.875 22.8288 19.875 22ZM23 17C21.6739 17 20.4021 17.5268 19.4645 18.4645C18.5268 19.4021 18 20.6739 18 22C18 23.3261 18.5268 24.5979 19.4645 25.5355C20.4021 26.4732 21.6739 27 23 27C24.3261 27 25.5979 26.4732 26.5355 25.5355C27.4732 24.5979 28 23.3261 28 22C28 20.6739 27.4732 19.4021 26.5355 18.4645C25.5979 17.5268 24.3261 17 23 17ZM32.375 23.25C32.375 22.7527 32.5725 22.2758 32.9242 21.9242C33.2758 21.5725 33.7527 21.375 34.25 21.375C34.7473 21.375 35.2242 21.5725 35.5758 21.9242C35.9275 22.2758 36.125 22.7527 36.125 23.25C36.125 23.7473 35.9275 24.2242 35.5758 24.5758C35.2242 24.9275 34.7473 25.125 34.25 25.125C33.7527 25.125 33.2758 24.9275 32.9242 24.5758C32.5725 24.2242 32.375 23.7473 32.375 23.25ZM34.25 19.5C33.2554 19.5 32.3016 19.8951 31.5983 20.5983C30.8951 21.3016 30.5 22.2554 30.5 23.25C30.5 24.2446 30.8951 25.1984 31.5983 25.9017C32.3016 26.6049 33.2554 27 34.25 27C35.2446 27 36.1984 26.6049 36.9017 25.9017C37.6049 25.1984 38 24.2446 38 23.25C38 22.2554 37.6049 21.3016 36.9017 20.5983C36.1984 19.8951 35.2446 19.5 34.25 19.5ZM30.81 35.7975C31.6887 36.1537 32.815 36.375 34.2512 36.375C37.1038 36.375 38.7338 35.5037 39.6225 34.4275C40.0538 33.905 40.2725 33.3775 40.385 32.9737C40.4494 32.7399 40.4884 32.4997 40.5012 32.2575V32.2238C40.5009 31.5015 40.2138 30.8089 39.7031 30.2981C39.1924 29.7874 38.4998 29.5003 37.7775 29.5H30.725C30.69 29.5 30.6558 29.5008 30.6225 29.5025C31.115 30.015 31.4725 30.6587 31.6425 31.375H37.7775C38.2425 31.375 38.62 31.7488 38.6262 32.2113L38.6225 32.2513C38.6175 32.2996 38.6021 32.3746 38.5763 32.4763C38.499 32.7542 38.3626 33.0122 38.1763 33.2325C37.7388 33.765 36.7113 34.5 34.2512 34.5C33.0262 34.5 32.1562 34.3175 31.5387 34.0688C31.4038 34.5688 31.1813 35.1725 30.81 35.7975ZM18.3125 29.5C17.5666 29.5 16.8512 29.7963 16.3238 30.3238C15.7963 30.8512 15.5 31.5666 15.5 32.3125V32.66C15.5013 32.7469 15.5072 32.8337 15.5175 32.92C15.6214 33.85 15.9557 34.7393 16.49 35.5075C17.5125 36.9675 19.465 38.25 23 38.25C26.535 38.25 28.4875 36.9688 29.51 35.5063C30.0443 34.7381 30.3786 33.8487 30.4825 32.9188C30.4913 32.8327 30.4972 32.7464 30.5 32.66V32.3125C30.5 31.5666 30.2037 30.8512 29.6762 30.3238C29.1488 29.7963 28.4334 29.5 27.6875 29.5H18.3125ZM17.375 32.6337V32.3125C17.375 32.0639 17.4738 31.8254 17.6496 31.6496C17.8254 31.4738 18.0639 31.375 18.3125 31.375H27.6875C27.9361 31.375 28.1746 31.4738 28.3504 31.6496C28.5262 31.8254 28.625 32.0639 28.625 32.3125V32.6337L28.6163 32.7337C28.5443 33.3437 28.3237 33.9266 27.9738 34.4312C27.3575 35.3125 26.0275 36.375 23 36.375C19.9725 36.375 18.6425 35.3125 18.025 34.4312C17.6755 33.9264 17.4553 33.3435 17.3837 32.7337L17.375 32.6337Z" fill="white"/>
</svg>

)

const PendingBadgeIcon = () => (
<svg width="55" height="55" viewBox="0 0 55 55" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="55" height="55" rx="24" fill="#F59E0B"/>
<path d="M16.75 27C16.75 28.4774 17.041 29.9403 17.6064 31.3052C18.1717 32.6701 19.0004 33.9103 20.045 34.955C21.0897 35.9996 22.3299 36.8283 23.6948 37.3936C25.0597 37.959 26.5226 38.25 28 38.25C29.4774 38.25 30.9403 37.959 32.3052 37.3936C33.6701 36.8283 34.9103 35.9996 35.955 34.955C36.9996 33.9103 37.8283 32.6701 38.3936 31.3052C38.959 29.9403 39.25 28.4774 39.25 27C39.25 24.0163 38.0647 21.1548 35.955 19.045C33.8452 16.9353 30.9837 15.75 28 15.75C25.0163 15.75 22.1548 16.9353 20.045 19.045C17.9353 21.1548 16.75 24.0163 16.75 27Z" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M28 20.75V27L31.75 30.75" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>

)

const CompletedLaurelIcon = () => (
  <svg width="55" height="55" viewBox="0 0 55 55" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="55" height="55" rx="24" fill="#10B981"/>
  <g clip-path="url(#clip0_3_207)">
  <path d="M34.8408 20.7158L36.1592 22.0342L25.1875 33.0059L19.8408 27.6592L21.1592 26.3408L25.1875 30.3691L34.8408 20.7158ZM28 12C29.377 12 30.7051 12.1758 31.9844 12.5273C33.2637 12.8789 34.46 13.3818 35.5732 14.0361C36.6865 14.6904 37.6973 15.4717 38.6055 16.3799C39.5137 17.2881 40.2949 18.3037 40.9492 19.4268C41.6035 20.5498 42.1064 21.7461 42.458 23.0156C42.8096 24.2852 42.9902 25.6133 43 27C43 28.377 42.8242 29.7051 42.4727 30.9844C42.1211 32.2637 41.6182 33.46 40.9639 34.5732C40.3096 35.6865 39.5283 36.6973 38.6201 37.6055C37.7119 38.5137 36.6963 39.2949 35.5732 39.9492C34.4502 40.6035 33.2539 41.1064 31.9844 41.458C30.7148 41.8096 29.3867 41.9902 28 42C26.623 42 25.2949 41.8242 24.0156 41.4727C22.7363 41.1211 21.54 40.6182 20.4268 39.9639C19.3135 39.3096 18.3027 38.5283 17.3945 37.6201C16.4863 36.7119 15.7051 35.6963 15.0508 34.5732C14.3965 33.4502 13.8936 32.2588 13.542 30.999C13.1904 29.7393 13.0098 28.4062 13 27C13 25.623 13.1758 24.2949 13.5273 23.0156C13.8789 21.7363 14.3818 20.54 15.0361 19.4268C15.6904 18.3135 16.4717 17.3027 17.3799 16.3945C18.2881 15.4863 19.3037 14.7051 20.4268 14.0508C21.5498 13.3965 22.7412 12.8936 24.001 12.542C25.2607 12.1904 26.5938 12.0098 28 12ZM28 40.125C29.2012 40.125 30.3584 39.9688 31.4717 39.6562C32.585 39.3438 33.6299 38.9043 34.6064 38.3379C35.583 37.7715 36.4717 37.083 37.2725 36.2725C38.0732 35.4619 38.7568 34.5781 39.3232 33.6211C39.8896 32.6641 40.334 31.6191 40.6562 30.4863C40.9785 29.3535 41.1348 28.1914 41.125 27C41.125 25.7988 40.9688 24.6416 40.6562 23.5283C40.3438 22.415 39.9043 21.3701 39.3379 20.3936C38.7715 19.417 38.083 18.5283 37.2725 17.7275C36.4619 16.9268 35.5781 16.2432 34.6211 15.6768C33.6641 15.1104 32.6191 14.666 31.4863 14.3438C30.3535 14.0215 29.1914 13.8652 28 13.875C26.7988 13.875 25.6416 14.0312 24.5283 14.3438C23.415 14.6562 22.3701 15.0957 21.3936 15.6621C20.417 16.2285 19.5283 16.917 18.7275 17.7275C17.9268 18.5381 17.2432 19.4219 16.6768 20.3789C16.1104 21.3359 15.666 22.3809 15.3438 23.5137C15.0215 24.6465 14.8652 25.8086 14.875 27C14.875 28.2012 15.0312 29.3584 15.3438 30.4717C15.6562 31.585 16.0957 32.6299 16.6621 33.6064C17.2285 34.583 17.917 35.4717 18.7275 36.2725C19.5381 37.0732 20.4219 37.7568 21.3789 38.3232C22.3359 38.8896 23.3809 39.334 24.5137 39.6562C25.6465 39.9785 26.8086 40.1348 28 40.125Z" fill="white"/>
  </g>
  <defs>
  <clipPath id="clip0_3_207">
  <rect width="30" height="30" fill="white" transform="translate(13 12)"/>
  </clipPath>
  </defs>
  </svg>
  
)

const ClockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
    <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
)

const MetricCard = ({ icon: Icon, title, value, accent = {}, change = '' }) => {
  const mergedAccent = {
    cardBg: '#ffffff',
    iconBg: '#f3f4f6',
    iconColor: '#111827',
    textColor: '#111827',
    mutedColor: '#6b7280',
    changeColor: '#1a8751',
    ...accent,
  }

  const isNegativeChange = typeof change === 'string' && change.trim().startsWith('-')

  return (
    <div
      className="dashboard-metric-card"
      style={{
        '--card-bg': mergedAccent.cardBg,
        '--card-icon-bg': mergedAccent.iconBg,
        '--card-icon-color': mergedAccent.iconColor,
        '--card-text-color': mergedAccent.textColor,
        '--card-muted-color': mergedAccent.mutedColor,
      }}
    >
      <div className="dashboard-metric-card__content">
        <p className="dashboard-metric-card__label">{title}</p>
        <h3 className="dashboard-metric-card__value">{value}</h3>
        <span
          className={`dashboard-metric-card__change ${isNegativeChange ? 'negative' : 'positive'}`}
          style={{
            color: isNegativeChange ? '#dc2626' : mergedAccent.changeColor,
          }}
        >
          {change}
        </span>
      </div>
      <div className="dashboard-metric-card__icon">
        <Icon />
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
    canceled: 0,
  })
  const [orders, setOrders] = useState([])
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

        const ordersData = ordersRes?.data || []
        const stores = storesRes?.data || []
        const totalUsers =
          usersRes?.pagination?.totalItems ??
          (Array.isArray(usersRes?.data) ? usersRes.data.length : 0)

        const normalizedOrders = ordersData.map((order) => {
          const status = String(order.order_status || order.status || 'pending').toLowerCase()
          return {
            id: order.id || order.orderId || order.order_id || '—',
            customer: order.customer?.name || order.customer_name || order.user?.name || '—',
            service: deriveServiceName(order),
            store: order.store?.name || order.store_name || 'Store',
            amount: order.total ?? order.total_amount ?? order.amount ?? 0,
            status,
            date: order.created_at || order.createdAt || order.order_date || order.date,
            raw: order,
          }
        })

        const pendingOrders = normalizedOrders.filter((order) => order.status === 'pending').length
        const completedOrders = normalizedOrders.filter((order) => order.status === 'delivered').length
        const canceledOrders = normalizedOrders.filter((order) => order.status === 'cancelled' || order.status === 'canceled').length

        setMetrics({
          totalOrders: normalizedOrders.length,
          activeStores: stores.length,
          activeCustomers: totalUsers,
          pendingOrders,
          completed: completedOrders,
          canceled: canceledOrders,
        })
        setOrders(normalizedOrders)
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
        accent: {
          cardBg: '#ffffff',
          iconBg: '#f4e6db',
          iconColor: '#c46a2e',
          textColor: '#1e1b18',
          mutedColor: '#8a735f',
        },
      },
      {
        icon: CompletedLaurelIcon,
        title: 'Completed',
        key: 'completed',
        accent: {
          cardBg: '#ffffff',
          iconBg: '#dff8eb',
          iconColor: '#0f9d58',
          textColor: '#143427',
          mutedColor: '#4b7a63',
        },
      },
      {
        icon: PendingBadgeIcon,
        title: 'Pending',
        key: 'pendingOrders',
        accent: {
          cardBg: '#ffffff',
          iconBg: '#f8e0b2',
          iconColor: '#c78100',
          textColor: '#46310c',
          mutedColor: '#8b6f2d',
        },
      },
      {
        icon: CancelIcon,
        title: 'Canceled',
        key: 'canceled',
        accent: {
          cardBg: '#ffffff',
          iconBg: '#ffe4e6',
          iconColor: '#d32f2f',
          textColor: '#4a0f14',
          mutedColor: '#a05b5f',
          changeColor: '#d32f2f',
        },
      },
      {
        icon: CustomerOrbitIcon,
        title: 'Total Users',
        key: 'activeCustomers',
        accent: {
          cardBg: '#ffffff',
          iconBg: '#e2e9ff',
          iconColor: '#2c5cd6',
          textColor: '#162654',
          mutedColor: '#5a6da6',
        },
      },
      {
        icon: StoreNetworkIcon,
        title: 'Total Stores',
        key: 'activeStores',
        accent: {
          cardBg: '#ffffff',
          iconBg: '#eae3ff',
          iconColor: '#6a3ccf',
          textColor: '#2b1a63',
          mutedColor: '#715fa5',
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

  const orderColumns = useMemo(
    () => [
      { key: 'id', header: 'Order ID' },
      { key: 'service', header: 'Service' },
      { key: 'store', header: 'Store' },
      {
        key: 'status',
        header: 'Status',
        render: (value) => (
          <span className={`status-badge ${statusMeta[String(value).toLowerCase()]?.tone || ''}`}>
            {statusMeta[String(value).toLowerCase()]?.label ||
              String(value || 'Pending').replaceAll('_', ' ')}
          </span>
        ),
      },
      {
        key: 'date',
        header: 'Date',
        render: (value) => (value ? new Date(value).toLocaleDateString() : '—'),
      },
    ],
    []
  )

  const recentOrders = useMemo(() => orders.slice(0, 3), [orders])

  return (
    <div className="dashboard-page">
      <div className="dashboard-page__header">
        <div>
          <h1>Dashboard</h1>
          <p>Welcome back! Here&apos;s an overview of your business.</p>
        </div>
        <div className="dashboard__date">
          <ClockIcon />
          <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      {error && <div className="dashboard__error">{error}</div>}

      <div className="dashboard__metrics">
        {metricCards.map(({ icon, title, key, accent, change }) => (
          <MetricCard key={key} icon={icon} title={title} value={renderValue(metrics[key])} accent={accent} change={""} />
        ))}
      </div>

      <div className="dashboard-section">
        <div className="dashboard-section__header">
          <h2>Recent Orders</h2>
        </div>
        <Table columns={orderColumns} data={recentOrders} hover bordered={false} />
      </div>
    </div>
  )
}

export default Dashboard
