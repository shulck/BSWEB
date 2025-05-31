import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { createGroup, joinGroup, fetchGroup } from '../store/slices/groupsSlice';
import { MainLayout } from '../components/layout/MainLayout';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';

export const GroupsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { currentUser } = useAppSelector((state) => state.user);
  const { currentGroup, isLoading, error } = useAppSelector((state) => state.groups);
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [joinCode, setJoinCode] = useState('');

  useEffect(() => {
    if (currentUser?.groupId) {
      dispatch(fetchGroup(currentUser.groupId));
    }
  }, [dispatch, currentUser?.groupId]);

  const handleCreateGroup = async () => {
    if (!currentUser || !groupName.trim()) return;
    
    try {
      await dispatch(createGroup({ 
        name: groupName.trim(), 
        creatorId: currentUser.id 
      })).unwrap();
      setShowCreateModal(false);
      setGroupName('');
    } catch (error) {
      console.error('Failed to create group:', error);
    }
  };

  const handleJoinGroup = async () => {
    if (!currentUser || !joinCode.trim()) return;
    
    try {
      await dispatch(joinGroup({ 
        code: joinCode.trim().toUpperCase(), 
        userId: currentUser.id 
      })).unwrap();
      setShowJoinModal(false);
      setJoinCode('');
    } catch (error) {
      console.error('Failed to join group:', error);
    }
  };

  if (!currentUser) {
    return <MainLayout><div>Loading...</div></MainLayout>;
  }

  if (currentUser.groupId && currentGroup) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Your Group</h1>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Group Name</label>
                <p className="text-lg font-semibold">{currentGroup.name}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Invite Code</label>
                <p className="text-lg font-mono bg-gray-100 px-3 py-2 rounded">
                  {currentGroup.code}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Share this code with others to invite them to your group
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Members</label>
                <p className="text-gray-600">{currentGroup.members.length} members</p>
              </div>
              
              {currentGroup.pendingMembers.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Pending Members</label>
                  <p className="text-yellow-600">{currentGroup.pendingMembers.length} pending approval</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="text-center py-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Join a Group</h1>
          <p className="text-gray-600 mb-8">
            Create a new group or join an existing one to get started with BandSync
          </p>
          
          <div className="space-x-4">
            <Button onClick={() => setShowCreateModal(true)}>
              Create New Group
            </Button>
            <Button variant="secondary" onClick={() => setShowJoinModal(true)}>
              Join Existing Group
            </Button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Create Group Modal */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Create New Group"
        >
          <div className="space-y-4">
            <Input
              label="Group Name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Enter group name"
            />
            
            <div className="flex justify-end space-x-2">
              <Button
                variant="secondary"
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateGroup}
                loading={isLoading}
                disabled={!groupName.trim()}
              >
                Create Group
              </Button>
            </div>
          </div>
        </Modal>

        {/* Join Group Modal */}
        <Modal
          isOpen={showJoinModal}
          onClose={() => setShowJoinModal(false)}
          title="Join Group"
        >
          <div className="space-y-4">
            <Input
              label="Invite Code"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="Enter 6-character code"
              maxLength={6}
            />
            
            <div className="flex justify-end space-x-2">
              <Button
                variant="secondary"
                onClick={() => setShowJoinModal(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleJoinGroup}
                loading={isLoading}
                disabled={!joinCode.trim() || joinCode.length !== 6}
              >
                Join Group
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </MainLayout>
  );
};
