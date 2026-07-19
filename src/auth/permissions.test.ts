import { describe, expect, it } from 'vitest'

import { KITCHEN_BOARD_PERMISSION, getRolePermissions, hasPermission } from './permissions'

describe('permissions', () => {
  it('grants kitchen-board access to baristas by exact permission', () => {
    expect(hasPermission('BARISTA', KITCHEN_BOARD_PERMISSION)).toBe(true)
  })

  it('does not grant kitchen-board access to regular users', () => {
    expect(hasPermission('USER', KITCHEN_BOARD_PERMISSION)).toBe(false)
  })

  it('matches wildcard permissions for managers and admins', () => {
    expect(hasPermission('MANAGER', KITCHEN_BOARD_PERMISSION)).toBe(true)
    expect(hasPermission('ADMIN', KITCHEN_BOARD_PERMISSION)).toBe(true)
  })

  it('uses explicit permissions when the session provides them', () => {
    expect(hasPermission('USER', KITCHEN_BOARD_PERMISSION, ['orders:*'])).toBe(true)
    expect(hasPermission('ADMIN', KITCHEN_BOARD_PERMISSION, ['orders:read'])).toBe(false)
  })

  it('normalizes role names before reading mapped permissions', () => {
    expect(getRolePermissions(' barista ')).toContain(KITCHEN_BOARD_PERMISSION)
  })
})
