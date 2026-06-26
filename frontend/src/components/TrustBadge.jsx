export default function TrustBadge({ trust }) {
  const safe = trust === 'safe'
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 10px',
      borderRadius: 8,
      fontSize: 11,
      fontWeight: 500,
      background: safe ? '#ECFDF5' : '#FFFBEB',
      color:      safe ? '#065F46' : '#92400E',
    }}>
      {safe ? 'Trusted' : 'Unverified'}
    </span>
  )
}
