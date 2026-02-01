import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Phone, Video, MoreVertical, User, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Message, Conversation, User as UserType } from '../../types';

interface ChatInterfaceProps {
  conversation: Conversation & {
    participants: UserType[];
    messages: (Message & { sender: UserType })[];
  };
  currentUserId: string;
  onSendMessage: (content: string, attachments?: File[]) => Promise<void>;
  onCall?: () => void;
  onVideoCall?: () => void;
  loading?: boolean;
  className?: string;
}

interface MessageBubbleProps {
  message: Message & { sender: UserType };
  isOwn: boolean;
  showAvatar?: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isOwn, showAvatar = true }) => {
  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('es-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(new Date(date));
  };

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
      {!isOwn && showAvatar && (
        <div className="flex-shrink-0 mr-2">
          <div className="w-8 h-8 bg-secondary-100 rounded-full flex items-center justify-center">
            <User size={16} className="text-secondary-600" />
          </div>
        </div>
      )}
      
      <div className={`max-w-xs sm:max-w-sm lg:max-w-md ${isOwn ? 'ml-auto' : 'mr-auto'}`}>
        <div
          className={`
            px-4 py-2 rounded-2xl
            ${isOwn 
              ? 'bg-primary-600 text-white ml-auto' 
              : 'bg-gray-100 text-gray-900'
            }
          `}
        >
          <p className="text-sm leading-relaxed break-words">{message.content}</p>
        </div>
        
        <div className={`flex items-center mt-1 space-x-1 text-xs text-gray-500 ${isOwn ? 'justify-end' : 'justify-start'}`}>
          <span>{formatTime(message.createdAt)}</span>
          {isOwn && (
            <div className="flex items-center">
              {message.read ? (
                <CheckCircle2 size={12} className="text-green-500" />
              ) : (
                <Clock size={12} className="text-gray-400" />
              )}
            </div>
          )}
        </div>
      </div>

      {isOwn && showAvatar && (
        <div className="flex-shrink-0 ml-2">
          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
            <User size={16} className="text-primary-600" />
          </div>
        </div>
      )}
    </div>
  );
};

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  conversation,
  currentUserId,
  onSendMessage,
  onCall,
  onVideoCall,
  loading = false,
  className = '',
}) => {
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const otherParticipant = conversation.participants.find(p => p.id !== currentUserId);

  useEffect(() => {
    scrollToBottom();
  }, [conversation.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (message.trim() || attachments.length > 0) {
      await onSendMessage(message.trim(), attachments);
      setMessage('');
      setAttachments([]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 100)}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [message]);

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-secondary-100 rounded-full flex items-center justify-center">
            <User size={20} className="text-secondary-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              {otherParticipant?.userType === 'worker' 
                ? `${(otherParticipant as any).profile?.firstName} ${(otherParticipant as any).profile?.lastName}`
                : (otherParticipant as any).profile?.companyName
              }
            </h3>
            <p className="text-sm text-gray-500">
              {otherParticipant?.userType === 'worker' ? 'Trabajador' : 'Contratista'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {onCall && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onCall}
              icon={<Phone size={18} />}
              className="p-2"
              aria-label="Llamar"
            />
          )}
          {onVideoCall && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onVideoCall}
              icon={<Video size={18} />}
              className="p-2"
              aria-label="Videollamada"
            />
          )}
          <Button
            variant="ghost"
            size="sm"
            icon={<MoreVertical size={18} />}
            className="p-2"
            aria-label="Más opciones"
          />
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {conversation.messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Send size={24} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Inicia la conversación
            </h3>
            <p className="text-gray-600 max-w-sm">
              Envía un mensaje para comenzar a discutir los detalles del trabajo con {
                otherParticipant?.userType === 'worker' 
                  ? (otherParticipant as any).profile?.firstName
                  : (otherParticipant as any).profile?.companyName
              }.
            </p>
          </div>
        ) : (
          <>
            {conversation.messages.map((msg, index) => {
              const isOwn = msg.senderId === currentUserId;
              const previousMessage = conversation.messages[index - 1];
              const showAvatar = !previousMessage || previousMessage.senderId !== msg.senderId;
              
              return (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  isOwn={isOwn}
                  showAvatar={showAvatar}
                />
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message Input */}
      <div className="border-t border-gray-200 bg-white p-4">
        {/* Attachments Preview */}
        {attachments.length > 0 && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-2">
              {attachments.map((file, index) => (
                <div key={index} className="flex items-center space-x-2 bg-gray-100 px-3 py-1 rounded-full">
                  <span className="text-sm text-gray-700 truncate max-w-32">
                    {file.name}
                  </span>
                  <button
                    onClick={() => removeAttachment(index)}
                    className="text-gray-500 hover:text-gray-700"
                    aria-label="Remover archivo"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-end space-x-3">
          {/* File Attachment Button */}
          <div className="flex-shrink-0">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,.pdf,.doc,.docx"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              icon={<Paperclip size={18} />}
              className="p-2"
              aria-label="Adjuntar archivo"
            />
          </div>

          {/* Message Input */}
          <div className="flex-1">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Escribe tu mensaje..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none min-h-[40px] max-h-[100px]"
              rows={1}
              disabled={loading}
              aria-label="Escribe tu mensaje"
            />
          </div>

          {/* Send Button */}
          <div className="flex-shrink-0">
            <Button
              onClick={handleSendMessage}
              disabled={(!message.trim() && attachments.length === 0) || loading}
              icon={<Send size={18} />}
              className="p-2"
              aria-label="Enviar mensaje"
            />
          </div>
        </div>

        <div className="mt-2 text-xs text-gray-500">
          Presiona Enter para enviar, Shift + Enter para nueva línea
        </div>
      </div>
    </div>
  );
};

// Conversation List Component for mobile sidebar
interface ConversationListProps {
  conversations: (Conversation & {
    otherParticipant: UserType;
  })[];
  currentConversationId?: string;
  onSelectConversation: (conversationId: string) => void;
  className?: string;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  currentConversationId,
  onSelectConversation,
  className = '',
}) => {
  const formatLastMessageTime = (date: Date) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffInHours = (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return new Intl.DateTimeFormat('es-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }).format(messageDate);
    } else {
      return new Intl.DateTimeFormat('es-US', {
        month: 'short',
        day: 'numeric',
      }).format(messageDate);
    }
  };

  return (
    <div className={`h-full overflow-y-auto ${className}`}>
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Mensajes</h2>
      </div>
      
      <div className="divide-y divide-gray-200">
        {conversations.map((conversation) => (
          <button
            key={conversation.id}
            onClick={() => onSelectConversation(conversation.id)}
            className={`
              w-full text-left p-4 hover:bg-gray-50 transition-colors
              ${currentConversationId === conversation.id ? 'bg-primary-50 border-r-2 border-primary-500' : ''}
            `}
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 relative">
                <div className="w-10 h-10 bg-secondary-100 rounded-full flex items-center justify-center">
                  <User size={18} className="text-secondary-600" />
                </div>
                {conversation.unreadCount > 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-semibold text-gray-900 truncate">
                    {conversation.otherParticipant.userType === 'worker' 
                      ? `${(conversation.otherParticipant as any).profile?.firstName} ${(conversation.otherParticipant as any).profile?.lastName}`
                      : (conversation.otherParticipant as any).profile?.companyName
                    }
                  </h3>
                  {conversation.lastMessage && (
                    <span className="text-xs text-gray-500 flex-shrink-0">
                      {formatLastMessageTime(conversation.lastMessage.createdAt)}
                    </span>
                  )}
                </div>
                
                {conversation.lastMessage && (
                  <p className="text-sm text-gray-600 truncate">
                    {conversation.lastMessage.content}
                  </p>
                )}
                
                <div className="flex items-center mt-1 space-x-2">
                  <span className="text-xs text-gray-500">
                    {conversation.otherParticipant.userType === 'worker' ? 'Trabajador' : 'Contratista'}
                  </span>
                  {(conversation.otherParticipant as any).profile?.verified && (
                    <CheckCircle2 size={12} className="text-green-500" />
                  )}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
      
      {conversations.length === 0 && (
        <div className="p-8 text-center">
          <Send size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Sin conversaciones
          </h3>
          <p className="text-gray-600">
            Tus conversaciones aparecerán aquí cuando comiences a enviar mensajes.
          </p>
        </div>
      )}
    </div>
  );
};