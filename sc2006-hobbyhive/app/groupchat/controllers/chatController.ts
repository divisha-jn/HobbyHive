import { fetchGroupChats, fetchHostIdByChatId, fetchMembers, leaveGroup, removeMember } from "../model/groupchatModel";
import { fetchMessages, sendMessage, subscribeToMessages } from "../model/messageModel";

export const ChatController = {
  // grps & user func
  fetchGroupChats,
  fetchHostIdByChatId,
  fetchMembers,
  leaveGroup,
  removeMember,

  // msgs
  fetchMessages,
  sendMessage,
  subscribeToMessages,
};
