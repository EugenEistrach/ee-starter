import resend from '@convex-dev/resend/convex.config'
import { defineApp } from 'convex/server'
import betterAuth from './components/betterAuth/convex.config'

const app = defineApp()
app.use(betterAuth)
app.use(resend)

export default app
