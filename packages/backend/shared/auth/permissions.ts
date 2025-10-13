import type { Subset } from 'better-auth/plugins/access'
import { createAccessControl } from 'better-auth/plugins/access'
import { adminAc, defaultStatements, memberAc, ownerAc } from 'better-auth/plugins/organization/access'

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

export type Permissions = Partial<Subset<
  keyof typeof ac.statements,
  typeof ac.statements
>>

export type Role = keyof typeof roles
