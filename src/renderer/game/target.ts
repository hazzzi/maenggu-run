import { type Position } from './types'
import { SPRITE_DISPLAY_SIZE } from './constants'
import { type MonitorInfo } from '../../shared/types'

export type Bounds = {
  readonly width: number
  readonly height: number
}

// 모니터 영역 (창 내부 좌표계로 변환된 상태)
export type MonitorRegion = {
  readonly x: number
  readonly y: number
  readonly width: number
  readonly height: number
}

// 캐시된 모니터 정보 (앱 시작 시 한 번 로드)
let cachedMonitors: MonitorRegion[] | null = null

export function setMonitorRegions(monitors: readonly MonitorInfo[], offsetX: number, offsetY: number): void {
  // 스크린 좌표 → 창 내부 좌표 변환
  cachedMonitors = monitors.map((m) => ({
    x: m.x - offsetX,
    y: m.y - offsetY,
    width: m.width,
    height: m.height,
  }))
}

export function getMonitorRegions(): readonly MonitorRegion[] {
  return cachedMonitors ?? []
}

// 위치가 어떤 모니터 안에 있는지 확인
export function isPositionInAnyMonitor(position: Position): boolean {
  const monitors = cachedMonitors
  if (!monitors || monitors.length === 0) {
    return true // 모니터 정보 없으면 항상 true (fallback)
  }
  
  return monitors.some((m) => 
    position.x >= m.x &&
    position.x + SPRITE_DISPLAY_SIZE <= m.x + m.width &&
    position.y >= m.y &&
    position.y + SPRITE_DISPLAY_SIZE <= m.y + m.height
  )
}

// 가장 가까운 모니터 영역으로 위치 조정
export function clampToNearestMonitor(position: Position): Position {
  const monitors = cachedMonitors
  if (!monitors || monitors.length === 0) {
    return position
  }
  
  // 이미 유효한 위치면 그대로 반환
  if (isPositionInAnyMonitor(position)) {
    return position
  }
  
  // 각 모니터까지의 거리 계산해서 가장 가까운 모니터로 clamp
  let closestMonitor = monitors[0]
  let minDistance = Infinity
  
  for (const m of monitors) {
    const clampedX = Math.max(m.x, Math.min(position.x, m.x + m.width - SPRITE_DISPLAY_SIZE))
    const clampedY = Math.max(m.y, Math.min(position.y, m.y + m.height - SPRITE_DISPLAY_SIZE))
    const distance = Math.abs(position.x - clampedX) + Math.abs(position.y - clampedY)
    
    if (distance < minDistance) {
      minDistance = distance
      closestMonitor = m
    }
  }
  
  return {
    x: Math.max(closestMonitor.x, Math.min(position.x, closestMonitor.x + closestMonitor.width - SPRITE_DISPLAY_SIZE)),
    y: Math.max(closestMonitor.y, Math.min(position.y, closestMonitor.y + closestMonitor.height - SPRITE_DISPLAY_SIZE)),
  }
}

// 유효한 모니터 영역 중 랜덤 위치 생성
export function generateRandomTarget(bounds: Bounds): Position {
  const monitors = cachedMonitors
  
  // 모니터 정보 없으면 기존 로직 사용
  if (!monitors || monitors.length === 0) {
    const maxX = bounds.width - SPRITE_DISPLAY_SIZE
    const maxY = bounds.height - SPRITE_DISPLAY_SIZE
    return {
      x: Math.floor(Math.random() * Math.max(0, maxX)),
      y: Math.floor(Math.random() * Math.max(0, maxY)),
    }
  }
  
  // 랜덤 모니터 선택
  const monitor = monitors[Math.floor(Math.random() * monitors.length)]
  
  // 해당 모니터 영역 내 랜덤 위치
  const maxX = monitor.width - SPRITE_DISPLAY_SIZE
  const maxY = monitor.height - SPRITE_DISPLAY_SIZE
  
  return {
    x: monitor.x + Math.floor(Math.random() * Math.max(0, maxX)),
    y: monitor.y + Math.floor(Math.random() * Math.max(0, maxY)),
  }
}

export function clampPositionToBounds(position: Position, bounds: Bounds): Position {
  // 모니터 정보 있으면 가장 가까운 모니터로 clamp
  const monitors = cachedMonitors
  if (monitors && monitors.length > 0) {
    return clampToNearestMonitor(position)
  }
  
  // fallback: 전체 bounds로 clamp
  const maxX = bounds.width - SPRITE_DISPLAY_SIZE
  const maxY = bounds.height - SPRITE_DISPLAY_SIZE

  return {
    x: Math.max(0, Math.min(position.x, maxX)),
    y: Math.max(0, Math.min(position.y, maxY)),
  }
}

export function isPositionInBounds(position: Position, bounds: Bounds): boolean {
  return (
    position.x >= 0 &&
    position.x <= bounds.width &&
    position.y >= 0 &&
    position.y <= bounds.height
  )
}

export function getWindowBounds(): Bounds {
  return {
    width: window.innerWidth,
    height: window.innerHeight,
  }
}
