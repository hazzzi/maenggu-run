type SnackCounterProps = {
  readonly count: number
}

export function SnackCounter({ count }: SnackCounterProps): JSX.Element {
  return (
    <div
      style={{
        position: 'fixed',
        top: 16,
        left: 16,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 12px',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        borderRadius: 8,
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        fontFamily: 'monospace',
        pointerEvents: 'none',
        userSelect: 'none',
      }}
    >
      <span>🍖</span>
      <span>{count}</span>
    </div>
  )
}
