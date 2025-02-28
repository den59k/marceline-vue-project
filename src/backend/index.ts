import 'dotenv/config'
import { createApp } from "./app"

const start = async () => {
  const app = await createApp({ bodyLimit: 128 * 1024, forceCloseConnections: import.meta.env.DEV })
  try {
    const port = parseInt(process.env.PORT ?? "3001")
    const time = Date.now()
    const address = await app.listen({ port, host: process.env.HOST ?? "0.0.0.0" })

    const launchTime = Math.floor((Date.now() - time) / 100) / 10
    console.info(`Server launched on ${address}. Launch time: ${launchTime}s`)

    if (import.meta.hot) {
      import.meta.hot.accept(() => {
        app.close()
      })
    }

  } catch(err) {
    console.error(err)
    process.exit(1)
  }
}

start()
