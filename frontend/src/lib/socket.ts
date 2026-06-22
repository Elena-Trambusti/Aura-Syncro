import { io, Socket } from 'socket.io-client'
import { resolveBackendUrl } from './backendUrl'

let socket: Socket | null = null

function getSocketUrl(): string | undefined {
  return resolveBackendUrl()
}

export function getSocket(): Socket {
  if (!socket) {
    socket = io(getSocketUrl() ?? '/', {
      auth: { token: localStorage.getItem('token') },
      autoConnect: false,
    })
  }
  return socket
}

export function connectSocket(token: string): void {
  const s = getSocket()
  s.auth = { token }
  s.connect()
}

export function disconnectSocket(): void {
  socket?.disconnect()
  socket = null
}
