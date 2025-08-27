import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatMessage, MessageType } from './chat-message.entity';
import { User } from '../users/user.entity';

@Injectable()
export class ChatMessagesService {
  constructor(
    @InjectRepository(ChatMessage)
    private chatMessagesRepository: Repository<ChatMessage>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async saveMessage(
    content: string,
    senderId: string,
    room?: string,
    recipientId?: string,
    type: MessageType = MessageType.TEXT,
  ): Promise<ChatMessage> {
    const sender = await this.usersRepository.findOne({
      where: { id: senderId },
    });

    const message = this.chatMessagesRepository.create({
      content,
      sender,
      senderId,
      room,
      recipientId,
      type,
    });

    return this.chatMessagesRepository.save(message);
  }

  async getRoomMessages(room: string, limit = 50): Promise<ChatMessage[]> {
    return this.chatMessagesRepository.find({
      where: { room },
      relations: ['sender'],
      order: { createdAt: 'ASC' },
      take: limit,
    });
  }

  async getPrivateMessages(
    userId1: string,
    userId2: string,
    limit = 50,
  ): Promise<ChatMessage[]> {
    return this.chatMessagesRepository.find({
      where: [
        { senderId: userId1, recipientId: userId2 },
        { senderId: userId2, recipientId: userId1 },
      ],
      relations: ['sender'],
      order: { createdAt: 'ASC' },
      take: limit,
    });
  }

  async markMessagesAsRead(
    senderId: string,
    recipientId: string,
  ): Promise<void> {
    await this.chatMessagesRepository.update(
      { senderId, recipientId, isRead: false },
      { isRead: true },
    );
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.chatMessagesRepository.count({
      where: { recipientId: userId, isRead: false },
    });
  }

  async deleteMessage(messageId: string, userId: string): Promise<void> {
    const message = await this.chatMessagesRepository.findOne({
      where: { id: messageId },
    });

    if (message && message.senderId === userId) {
      await this.chatMessagesRepository.remove(message);
    }
  }
}
