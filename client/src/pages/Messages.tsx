import { useState, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../store/store'
import { useSocket } from '../hooks/useSocket'

interface Conversation {
  id: string
  title: string | null
  lastMessage?: string
  lastMessageAt?: string
  unreadCount?: number
  participants: Array<{
    user_id: string
    first_name: string
    last_name: string
  }>
}

interface Message {
  id: string
  sender_id: string
  content: string
  message_type: string
  created_at: string
  sender?: {
    first_name: string
    last_name: string
  }
}

export default function Messages() {
  const { user, token } = useSelector((state: RootState) => state.auth)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const {
    isConnected,
    onlineUsers,
    typingUsers,
    joinConversation,
    leaveConversation,
    sendMessage,
    startTyping,
    stopTyping,
    onNewMessage,
  } = useSocket()

  // Fetch conversations
  useEffect(() => {
    if (!token) return

    fetch('/api/v1/messages/conversations', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        if (data.data?.conversations) {
          setConversations(data.data.conversations)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [token])

  // Handle new messages
  useEffect(() => {
    const unsubscribe = onNewMessage(({ message, conversationId }) => {
      if (selectedConversation?.id === conversationId) {
        setMessages(prev => [...prev, message])
      }
      // Update conversation list
      setConversations(prev =>
        prev.map(c =>
          c.id === conversationId
            ? { ...c, lastMessage: message.content, lastMessageAt: message.created_at }
            : c
        )
      )
    })
    return unsubscribe
  }, [onNewMessage, selectedConversation])

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Load messages when conversation selected
  useEffect(() => {
    if (!selectedConversation || !token) return

    joinConversation(selectedConversation.id)

    fetch(`/api/v1/messages/conversations/${selectedConversation.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        if (data.data?.messages) {
          setMessages(data.data.messages)
        }
      })

    return () => {
      leaveConversation(selectedConversation.id)
    }
  }, [selectedConversation, token, joinConversation, leaveConversation])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedConversation) return

    sendMessage(selectedConversation.id, newMessage.trim())
    setNewMessage('')
    stopTyping(selectedConversation.id)
  }

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value)
    if (selectedConversation) {
      if (e.target.value) {
        startTyping(selectedConversation.id)
      } else {
        stopTyping(selectedConversation.id)
      }
    }
  }

  const getOtherParticipant = (conversation: Conversation) => {
    return conversation.participants.find(p => p.user_id !== user?.id)
  }

  const isTyping = selectedConversation
    ? typingUsers.get(selectedConversation.id)?.size > 0
    : false

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-yellow-50 text-yellow-800 p-4 rounded-lg">
          Please <a href="/login" className="text-primary-600 underline">login</a> to view messages.
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm text-gray-500">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden" style={{ height: 'calc(100vh - 250px)' }}>
        <div className="flex h-full">
          {/* Conversation List */}
          <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">Loading...</div>
            ) : conversations.length === 0 ? (
              <div className="p-4 text-center text-gray-500">No conversations yet</div>
            ) : (
              conversations.map(conversation => {
                const other = getOtherParticipant(conversation)
                const isSelected = selectedConversation?.id === conversation.id
                const isOnline = other ? onlineUsers.has(other.user_id) : false

                return (
                  <div
                    key={conversation.id}
                    onClick={() => setSelectedConversation(conversation)}
                    className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                      isSelected ? 'bg-primary-50' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-medium">
                          {other?.first_name?.[0]}{other?.last_name?.[0]}
                        </div>
                        {isOnline && (
                          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">
                          {conversation.title || `${other?.first_name} ${other?.last_name}`}
                        </div>
                        {conversation.lastMessage && (
                          <div className="text-sm text-gray-500 truncate">
                            {conversation.lastMessage}
                          </div>
                        )}
                      </div>
                      {conversation.unreadCount > 0 && (
                        <span className="bg-primary-600 text-white text-xs px-2 py-1 rounded-full">
                          {conversation.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Message Area */}
          <div className="flex-1 flex flex-col">
            {selectedConversation ? (
              <>
                {/* Header */}
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-medium">
                      {getOtherParticipant(selectedConversation)?.first_name?.[0]}
                      {getOtherParticipant(selectedConversation)?.last_name?.[0]}
                    </div>
                    <div>
                      <div className="font-medium">
                        {selectedConversation.title ||
                          `${getOtherParticipant(selectedConversation)?.first_name} ${getOtherParticipant(selectedConversation)?.last_name}`}
                      </div>
                      {isTyping && (
                        <div className="text-sm text-gray-500">typing...</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map(message => {
                    const isMine = message.sender_id === user.id
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] px-4 py-2 rounded-2xl ${
                            isMine
                              ? 'bg-primary-600 text-white rounded-br-md'
                              : 'bg-gray-100 text-gray-900 rounded-bl-md'
                          }`}
                        >
                          <p>{message.content}</p>
                          <p className={`text-xs mt-1 ${isMine ? 'text-primary-200' : 'text-gray-500'}`}>
                            {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={handleTyping}
                      placeholder="Type a message..."
                      className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim()}
                      className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-full disabled:opacity-50"
                    >
                      Send
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                Select a conversation to start chatting
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
