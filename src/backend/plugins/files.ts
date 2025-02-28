import fp from 'fastify-plugin'
import { PrismaClient } from '@prisma/client'
import { FastifyInstance } from 'fastify'

const plugin = (fastify: FastifyInstance) => {

  /** Делает JOIN к таблице File, даже если поле не связано напрямую с таблицей */
  const attachImages = async <T extends object, K extends keyof T>(arr: T | T[], key: K, targetKey: string) => {
    const ids = []
    const _arr = Array.isArray(arr)? arr: [arr]
    for (let item of _arr) {
      if (Array.isArray(item[key])) {
        if (item[key].length === 0) {
          delete item[key];
          (item as any)[targetKey] = [] as any
          continue
        }
        ids.push(...item[key])
      } else {
        if (!item[key]) {
          delete item[key];
          (item as any)[targetKey] = null as any
          continue
        }
        ids.push(item[key])
      }
    }
    
    if (ids.length === 0) return
    
    const files = await fastify.prisma.file.findMany({
      select: { id: true, src: true },
      where: { id: { in: ids } }
    })
    for (let file of files) {
      file.src = file.src.startsWith("http")? file.src: process.env.PUBLIC_URL + file.src
    }
    const map = new Map(files.map((item: any) => [ item.id, item ]))

    for (let item of _arr) {
      if (!item[key]) continue
      if (Array.isArray(item[key])) {
        (item as any)[targetKey] = item[key].map(fileId => map.get(fileId)) as any
      } else {
        (item as any)[targetKey] = map.get(item[key] as string) as any ?? null
      }

      if (targetKey !== key) {
        delete item[key]
      }
    }
  }

  return {
    attachImages
  }
}

export default fp(async (fastify: FastifyInstance) => {
  fastify.decorate("files", plugin(fastify))
}, { name: "files" })

declare module 'fastify' {
  interface FastifyInstance {
    files: ReturnType<typeof plugin>
  }
}