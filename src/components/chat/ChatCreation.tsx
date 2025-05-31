import React, { useState, useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { createGroupChat } from '../../store/slices/chatsSlice';
import { UserService } from '../../services/userService';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { UserModel } from '../../types';

interface ChatCreationProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChatCreation: React.FC<ChatCreationProps> = ({ isOpen, onClose }) => {
  const dispatch = useAppDispatch();
  const { currentUser } = useAppSelector((state) => state.user);
  const { isLoading } = useAppSelector((state) => state.chats);
  
  const [chatName, setChatName] = useState('');
  const [groupMembers, setGroupMembers] = useState<UserModel[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  const fetchGroupMembers = useCallback(async () => {
    if (!currentUser?.groupId) return;
    
    try {
      const members = await UserService.fetchGroupMembers(currentUser.groupId);
      const otherMembers = members.filter(member => member.id !== currentUser.id);
      setGroupMembers(otherMembers);
    } catch (error) {
      console.error('Failed to fetch group members:', error);
    }
  }, [currentUser?.groupId, currentUser?.id]);

  useEffect(() => {
    if (isOpen && currentUser?.groupId) {
      fetchGroupMembers();
    }
  }, [isOpen, currentUser?.groupId, fetchGroupMembers]);

  const handleCreateGroupChat = async () => {
    if (!currentUser || !chatName.trim() || selectedMembers.length === 0) return;

    const participantIds = [currentUser.id, ...selectedMembers];
    
    try {
      await dispatch(createGroupChat({
        name: chatName.trim(),
        participantIds,
        adminId: currentUser.id
      })).unwrap();
      
      setChatName('');
      setSelectedMembers([]);
      onClose();
    } catch (error) {
      console.error('Failed to create group chat:', error);
    }
  };

  const handleMemberToggle = (memberId: string) => {
    setSelectedMembers(prev => 
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Group Chat">
      <div className="space-y-4">
        <Input
          label="Chat Name"
          value={chatName}
          onChange={(e) => setChatName(e.target.value)}
          placeholder="Enter chat name"
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Members
          </label>
          <div className="max-h-40 overflow-y-auto space-y-2">
            {groupMembers.map(member => (
              <label key={member.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedMembers.includes(member.id)}
                  onChange={() => handleMemberToggle(member.id)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">{member.name}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleCreateGroupChat}
            loading={isLoading}
            disabled={!chatName.trim() || selectedMembers.length === 0}
          >
            Create Chat
          </Button>
        </div>
      </div>
    </Modal>
  );
};
