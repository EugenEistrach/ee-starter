import type { Subset } from 'better-auth/plugins/access'
import { createAccessControl } from 'better-auth/plugins/access'
import { adminAc, defaultStatements, memberAc, ownerAc } from 'better-auth/plugins/organization/access'
import { v } from 'convex/values'

const statement = {
  ...defaultStatements,
  todo: ['create', 'update', 'delete'],
} as const

export const ac = createAccessControl(statement)

const member = ac.newRole({

  todo: ['create', 'update'],
  ...memberAc.statements,
})

const admin = ac.newRole({
  todo: ['create', 'update', 'delete'],
  ...adminAc.statements,
})

const owner = ac.newRole({
  todo: ['create', 'update', 'delete'],
  ...ownerAc.statements,
})

export const roles = {
  member,
  admin,
  owner,
}
export function ensureExistingRole(role: string | null | undefined): asserts role is Role {
  if (!Object.keys(roles).includes(role as Role)) {
    throw new Error(`Invalid role: ${role}`)
  }
}

export type Permissions = Partial<Subset<
  keyof typeof ac.statements,
  typeof ac.statements
>>

export const Role = v.union(v.literal('member'), v.literal('admin'), v.literal('owner'))
// eslint-disable-next-line ts/no-redeclare
export type Role = typeof Role.type
