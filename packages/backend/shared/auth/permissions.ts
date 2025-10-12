import type { Subset } from 'better-auth/plugins/access'
import { adminAc, defaultStatements } from 'better-auth/plugins'
import { createAccessControl } from 'better-auth/plugins/access'

const statement = {
  ...defaultStatements,
  todo: ['create', 'update', 'delete'],
} as const

export const ac = createAccessControl(statement)

export const member = ac.newRole({
  todo: ['create', 'update'],
})

export const admin = ac.newRole({
  todo: ['create', 'update', 'delete'],
  ...adminAc.statements,
})

export const owner = ac.newRole({
  todo: ['create', 'update', 'delete'],
})

export type Permissions = Partial<Subset<
  keyof typeof ac.statements,
  typeof ac.statements
>>
