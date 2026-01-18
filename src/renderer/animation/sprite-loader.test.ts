import { describe, expect, it } from 'vitest'

import { getSpriteFrameUrls, getSpriteManifest } from './sprite-loader'

describe('sprite-loader', () => {
  it('returns manifest with expected frames', () => {
    const manifest = getSpriteManifest()
    expect(manifest.idle).toEqual(['idle/mangoo_defatult.png'])
    expect(manifest.walk).toEqual([
      'walk/mangoo_02.png',
      'walk/mangoo_03.png',
      'walk/mangoo_04.png',
    ])
    expect(manifest.eat).toEqual([
      'eat/mangoo_07.png',
      'eat/mangoo_08.png',
      'eat/mangoo_09.png',
      'eat/mangoo_10.png',
    ])
    expect(manifest.happy).toEqual(['happy/mangoo_13.png'])
  })

  it('builds sprite URLs with trailing slash handling', () => {
    expect(getSpriteFrameUrls('/')).toEqual({
      idle: ['/assets/idle/mangoo_defatult.png'],
      walk: [
        '/assets/walk/mangoo_02.png',
        '/assets/walk/mangoo_03.png',
        '/assets/walk/mangoo_04.png',
      ],
      eat: [
        '/assets/eat/mangoo_07.png',
        '/assets/eat/mangoo_08.png',
        '/assets/eat/mangoo_09.png',
        '/assets/eat/mangoo_10.png',
      ],
      happy: ['/assets/happy/mangoo_13.png'],
    })

    expect(getSpriteFrameUrls('/static')).toEqual({
      idle: ['/static/assets/idle/mangoo_defatult.png'],
      walk: [
        '/static/assets/walk/mangoo_02.png',
        '/static/assets/walk/mangoo_03.png',
        '/static/assets/walk/mangoo_04.png',
      ],
      eat: [
        '/static/assets/eat/mangoo_07.png',
        '/static/assets/eat/mangoo_08.png',
        '/static/assets/eat/mangoo_09.png',
        '/static/assets/eat/mangoo_10.png',
      ],
      happy: ['/static/assets/happy/mangoo_13.png'],
    })
  })
})
