import { createApi } from '@convex-dev/better-auth'
import { createAuth } from '../../../shared/auth/auth'
import schema from './schema'

export const {
  create,
  deleteMany,
  deleteOne,
  findMany,
  findOne,
  updateMany,
  updateOne,

} = createApi(schema, createAuth)
