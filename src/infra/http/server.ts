import { env } from '@/env'
import { bootstrap } from './app'

async function main() {
  const app = await bootstrap()

  app
    .listen({ port: env.PORT, host: '0.0.0.0' })
    .then(() => console.log('HTTP server running!'))
}

main().catch((err) => {
  console.error('Error during bootstrap:', err)
})
