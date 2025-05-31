import React, { useState, useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchGroup, approveUser, rejectUser } from '../store/slices/groupsSlice';
import { GroupService } from '../services/groupService';
import { UserService } from '../services/userService';
import { MainLayout } from '../components/layout/MainLayout';
import { GroupMemberCard } from '../components/groups/GroupMemberCard';
import { PendingMemberCard } from '../components/groups/PendingMemberCard';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { UserModel, UserRole } from '../types';

export const GroupManagePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { currentUser } = useAppSelector((state) => state.user);
  const { currentGroup } = useAppSelector((state) => state.groups);
  
  const [members, setMembers] = useState<UserModel[]>([]);
  const [pendingMembers, setPendingMembers] = useState<UserModel[]>([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');

  const fetchMembersData = useCallback(async () => {
    if (!currentGroup) return;
    
    try {
      const allMembers = await Promise.all([
        ...currentGroup.members.map(id => UserService.fetchUserById(id)),
        ...currentGroup.pendingMembers.map(id => UserService.fetchUserById(id))
      ]);
      
      setMembers(allMembers.filter((_, index) => index < currentGroup.members.length));
      setPendingMembers(allMembers.filter((_, index) => index >= currentGroup.members.length));
    } catch (error) {
      console.error('Failed to fetch members:', error);
    }
  }, [currentGroup]);

  useEffect(() => {
    if (currentUser?.groupId) {
      dispatch(fetchGroup(currentUser.groupId));
    }
  }, [dispatch, currentUser?.groupId]);

  useEffect(() => {
    if (currentGroup) {
      setNewGroupName(currentGroup.name);
      fetchMembersData();
    }
  }, [currentGroup, fetchMembersData]);

  const handleApprove = async (userId: string) => {
    if (!currentGroup?.id) return;
    
    try {
      await dispatch(approveUser({ groupId: currentGroup.id, userId })).unwrap();
      await fetchMembersData();
    } catch (error) {
      console.error('Failed to approve user:', error);
    }
  };

  const handleReject = async (userId: string) => {
    if (!currentGroup?.id) return;
    
    try {
      await dispatch(rejectUser({ groupId: currentGroup.id, userId })).unwrap();
      await fetchMembersData();
    } catch (error) {
      console.error('Failed to reject user:', error);
    }
  };

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      await GroupService.changeUserRole(userId, newRole);
      await fetchMembersData();
    } catch (error) {
      console.error('Failed to change role:', error);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!currentGroup?.id || !window.confirm('Are you sure you want to remove this member?')) return;
    
    try {
      await GroupService.removeUser(currentGroup.id, userId);
      await fetchMembersData();
    } catch (error) {
      console.error('Failed to remove member:', error);
    }
  };

  const handleUpdateGroupName = async () => {
    if (!currentGroup?.id || !newGroupName.trim()) return;
    
    try {
      await GroupService.updateGroupName(currentGroup.id, newGroupName.trim());
      dispatch(fetchGroup(currentGroup.id));
      setShowEditModal(false);
    } catch (error) {
      console.error('Failed to update group name:', error);
    }
  };

  const handleRegenerateCode = async () => {
    if (!currentGroup?.id || !window.confirm('This will invalidate the current invite code. Continue?')) return;
    
    try {
      await GroupService.regenerateCode(currentGroup.id);
      dispatch(fetchGroup(currentGroup.id));
    } catch (error) {
      console.error('Failed to regenerate code:', error);
    }
  };

  if (!currentUser || currentUser.role !== UserRole.ADMIN) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <p className="text-gray-500">You don't have permission to access this page.</p>
        </div>
      </MainLayout>
    );
  }

  if (!currentGroup) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <p className="text-gray-500">Loading group information...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Group Management</h1>
            <p className="text-gray-600">Manage your group settings and members</p>
          </div>
          <Button onClick={() => setShowEditModal(true)}>
            Edit Group
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Group Name</h3>
              <p className="text-lg font-semibold">{currentGroup.name}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Invite Code</h3>
              <div className="flex items-center space-x-2">
                <p className="text-lg font-mono bg-gray-100 px-3 py-1 rounded">
                  {currentGroup.code}
                </p>
                <Button size="sm" onClick={handleRegenerateCode}>
                  Regenerate
                </Button>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Total Members</h3>
              <p className="text-lg font-semibold">{members.length}</p>
            </div>
          </div>
        </div>

        {pendingMembers.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Pending Approvals ({pendingMembers.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingMembers.map((member) => (
                <PendingMemberCard
                  key={member.id}
                  member={member}
                  onApprove={handleApprove}
                  onReject={handleReject}
                />
              ))}
            </div>
          </div>
        )}

        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Group Members ({members.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {members.map((member) => (
              <GroupMemberCard
                key={member.id}
                member={member}
                currentUserRole={currentUser.role}
                onRoleChange={handleRoleChange}
                onRemove={handleRemoveMember}
                isCurrentUser={member.id === currentUser.id}
              />
            ))}
          </div>
        </div>

        <Modal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          title="Edit Group Settings"
        >
          <div className="space-y-4">
            <Input
              label="Group Name"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="Enter group name"
            />
            
            <div className="flex justify-end space-x-2">
              <Button
                variant="secondary"
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateGroupName}
                disabled={!newGroupName.trim() || newGroupName === currentGroup.name}
              >
                Update Group
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </MainLayout>
  );
};
