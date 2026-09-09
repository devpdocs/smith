import { useEffect, useState } from 'react';
import {
  listAuditUsers,
  listUserConversations,
  listConversationMessages,
  type AuditMessage,
  type AuditConversationSummary,
  type AuditUser,
} from '../lib/api';

/** Props for the admin audit view (G3). */
export interface AuditViewProps {
  /** Base URL of apps/api (the externally exposed surface, Q2). */
  apiUrl: string;
  /** The caller's Strapi session access token (admin role gate by apps/api). */
  token: string;
}

/**
 * Admin audit view (wireframe 3; G3). Strictly read-only: lists users, then a
 * selected user's conversations with metadata, then that conversation's
 * messages. It consumes the role-gated apps/api audit endpoints (G1/G2), so a
 * non-admin caller is denied without data being disclosed (AC7/S5). No mutation
 * controls are rendered (Q4/AC6).
 */
export function AuditView({ apiUrl, token }: AuditViewProps) {
  const [users, setUsers] = useState<AuditUser[] | null>(null);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<
    AuditConversationSummary[] | null
  >(null);
  const [conversationsError, setConversationsError] = useState<string | null>(
    null,
  );
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);
  const [messages, setMessages] = useState<AuditMessage[] | null>(null);
  const [messagesError, setMessagesError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setUsers(null);
    setUsersError(null);
    async function load() {
      const result = await listAuditUsers(apiUrl, token);
      if (cancelled) return;
      if (!result.ok) {
        setUsers([]);
        setUsersError(
          result.status === 403
            ? 'Access denied — an admin account is required to view audit data.'
            : 'Could not load users. Is apps/api reachable?',
        );
        return;
      }
      setUsers(result.data);
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [apiUrl, token]);

  useEffect(() => {
    const userId = selectedUserId;
    if (!userId) return;
    let cancelled = false;
    setConversations(null);
    setConversationsError(null);
    setSelectedConversationId(null);
    setMessages(null);
    setMessagesError(null);
    async function load(targetUserId: string) {
      const result = await listUserConversations(apiUrl, token, targetUserId);
      if (cancelled) return;
      if (!result.ok) {
        setConversations([]);
        setConversationsError(
          result.status === 403
            ? 'Access denied — an admin account is required.'
            : 'Could not load this user’s conversations.',
        );
        return;
      }
      setConversations(result.data);
    }
    void load(userId);
    return () => {
      cancelled = true;
    };
  }, [apiUrl, token, selectedUserId]);

  useEffect(() => {
    const userId = selectedUserId;
    const conversationId = selectedConversationId;
    if (!userId || !conversationId) return;
    let cancelled = false;
    setMessages(null);
    setMessagesError(null);
    async function load(targetUserId: string, targetConversationId: string) {
      const result = await listConversationMessages(
        apiUrl,
        token,
        targetUserId,
        targetConversationId,
      );
      if (cancelled) return;
      if (!result.ok) {
        setMessages([]);
        setMessagesError(
          result.status === 403
            ? 'Access denied — an admin account is required.'
            : 'Could not load this conversation’s messages.',
        );
        return;
      }
      setMessages(result.data);
    }
    void load(userId, conversationId);
    return () => {
      cancelled = true;
    };
  }, [apiUrl, token, selectedUserId, selectedConversationId]);

  return (
    <div className="audit-layout">
      <aside className="audit-users">
        <h2>Audit — admin only</h2>
        {users === null && (
          <div aria-label="Loading users">
            <div className="skeleton" />
          </div>
        )}
        {usersError && (
          <p className="error" role="alert">
            {usersError}
          </p>
        )}
        {users?.map((user) => (
          <button
            key={user.id}
            type="button"
            className={
              String(user.id) === selectedUserId
                ? 'audit-user active'
                : 'audit-user'
            }
            aria-current={String(user.id) === selectedUserId ? 'true' : undefined}
            onClick={() => setSelectedUserId(String(user.id))}
          >
            {user.username}
          </button>
        ))}
      </aside>

      <aside className="audit-conversations">
        <h3>Conversations</h3>
        {!selectedUserId && <p className="muted">Select a user to view.</p>}
        {conversations === null && selectedUserId && (
          <div aria-label="Loading conversations">
            <div className="skeleton" />
          </div>
        )}
        {conversationsError && (
          <p className="error" role="alert">
            {conversationsError}
          </p>
        )}
        {conversations?.length === 0 && (
          <p className="empty">No conversations.</p>
        )}
        {conversations?.map((conversation) => (
          <button
            key={conversation.id}
            type="button"
            className={
              conversation.id === selectedConversationId
                ? 'audit-conv active'
                : 'audit-conv'
            }
            aria-current={conversation.id === selectedConversationId ? 'true' : undefined}
            onClick={() => setSelectedConversationId(conversation.id)}
          >
            <span className="conv-title">{conversation.title}</span>
            <span className="conv-meta">
              {conversation.messageCount} message
              {conversation.messageCount === 1 ? '' : 's'}
              {conversation.modelId ? ` · ${conversation.modelId}` : ''}
            </span>
          </button>
        ))}
      </aside>

      <section className="audit-reader">
        {!selectedConversationId && (
          <p className="muted">Select a conversation to read its messages.</p>
        )}
        {messages === null && selectedConversationId && (
          <div aria-label="Loading messages">
            <div className="skeleton" />
            <div className="skeleton" style={{ marginTop: '0.6rem' }} />
          </div>
        )}
        {messagesError && (
          <p className="error" role="alert">
            {messagesError}
          </p>
        )}
        {messages?.map((message) => (
          <div key={message.id} className={`message message-${message.role}`}>
            <span className="message-role">
              {message.role === 'user' ? 'User' : 'Assistant'}
            </span>
            <p>{message.content}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
