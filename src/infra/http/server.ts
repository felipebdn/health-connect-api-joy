import { env } from '@/env'
import { bootstrap } from './app'

async function main() {
  const app = await bootstrap()

  app.listen({ port: env.PORT }).then(() => {
    console.log(`Server is running on port ${env.PORT}`)
  })
}

main().catch((err) => {
  console.error('Error during bootstrap:', err)
})
