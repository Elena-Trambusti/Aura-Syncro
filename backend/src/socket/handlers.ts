import { Server, Socket } from 'socket.io'
import { requireSocketRole, verifySocketToken } from '../middleware/auth'

export function setupSocketHandlers(io: Server): void {
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token
    if (!token || typeof token !== 'string') {
      next(new Error('Token mancante'))
      return
    }
    const session = await verifySocketToken(token)
    if (!session) {
      next(new Error('Token non valido'))
      return
    }
    socket.data.userId = session.userId
    socket.data.restaurantId = session.restaurantId
    socket.data.role = session.role
    next()
  })

  io.on('connection', (socket: Socket) => {
    const { restaurantId, userId } = socket.data
    socket.join(restaurantId)
    console.log(`👤 Utente ${userId} connesso al ristorante ${restaurantId}`)

    socket.on('disconnect', () => {
      console.log(`👤 Utente ${userId} disconnesso`)
    })

    socket.on('table:update_position', (data: { id: string; posX: number; posY: number }) => {
      if (!requireSocketRole(socket.data.role, 'OWNER', 'MANAGER')) return
      socket.to(restaurantId).emit('table:position_changed', data)
    })

    socket.on('kitchen:item_ready', (data: { orderId: string; itemId: string }) => {
      if (!requireSocketRole(socket.data.role, 'OWNER', 'MANAGER', 'CHEF')) return
      io.to(restaurantId).emit('kitchen:item_ready', data)
    })
  })
}
