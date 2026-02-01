import { useEffect, useRef, useCallback, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { useSelector } from 'react-redux'
import { RootState } from '../store/store'

interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  message_type: string
  created_at: string
}

interface TypingUser {
  userId: string
  conversationId: string
}

export function useSocket() {
  const socketRef = useRef<Socket | null>(null)
  const { token } = useSelector((state: RootState) => state.auth)
  const [isConnected, setIsConnected] = useState(false)
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set())
  const [typingUsers, setTypingUsers] = useState<Map<string, Set<string>>>(new Map())

  useEffect(() => {
    if (!token) return

    // Connect to socket server
    socketRef.current = io('http://localhost:3001', {
      auth: { token },
      transports: ['websocket', 'polling'],
    })

    const socket = socketRef.current

    socket.on('connect', () => {
      console.log('Socket connected')
      setIsConnected(true)
    })

    socket.on('disconnect', () => {
      console.log('Socket disconnected')
      setIsConnected(false)
    })

    socket.on('user:online', ({ userId }: { userId: string }) => {
      setOnlineUsers(prev => new Set(prev).add(userId))
    })

    socket.on('user:offline', ({ userId }: { userId: string }) => {
      setOnlineUsers(prev => {
        const next = new Set(prev)
        next.delete(userId)
        return next
      })
    })

    socket.on('typing:start', ({ userId, conversationId }: TypingUser) => {
      setTypingUsers(prev => {
        const next = new Map(prev)
        if (!next.has(conversationId)) {
          next.set(conversationId, new Set())
        }
        next.get(conversationId)!.add(userId)
        return next
      })
    })

    socket.on('typing:stop', ({ userId, conversationId }: TypingUser) => {
      setTypingUsers(prev => {
        const next = new Map(prev)
        if (next.has(conversationId)) {
          next.get(conversationId)!.delete(userId)
        }
        return next
      })
    })

    return () => {
      socket.disconnect()
    }
  }, [token])

  const joinConversation = useCallback((conversationId: string) => {
    socketRef.current?.emit('conversation:join', conversationId)
  }, [])

  const leaveConversation = useCallback((conversationId: string) => {
    socketRef.current?.emit('conversation:leave', conversationId)
  }, [])

  const sendMessage = useCallback((conversationId: string, content: string) => {
    socketRef.current?.emit('message:send', { conversationId, content })
  }, [])

  const startTyping = useCallback((conversationId: string) => {
    socketRef.current?.emit('typing:start', conversationId)
  }, [])

  const stopTyping = useCallback((conversationId: string) => {
    socketRef.current?.emit('typing:stop', conversationId)
  }, [])

  const markAsRead = useCallback((conversationId: string, messageId: string) => {
    socketRef.current?.emit('message:read', { conversationId, messageId })
  }, [])

  const onNewMessage = useCallback((callback: (data: { message: Message; conversationId: string }) => void) => {
    socketRef.current?.on('message:new', callback)
    return () => {
      socketRef.current?.off('message:new', callback)
    }
  }, [])

  return {
    isConnected,
    onlineUsers,
    typingUsers,
    joinConversation,
    leaveConversation,
    sendMessage,
    startTyping,
    stopTyping,
    markAsRead,
    onNewMessage,
  }
}
