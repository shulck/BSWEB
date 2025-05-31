import React from 'react';
import { UserModel, UserRole } from '../../types';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';

interface GroupMemberCardProps {
  member: UserModel;
  currentUserRole: UserRole;
  onRoleChange: (userId: string, newRole: UserRole) => void;
  onRemove: (userId: string) => void;
  isCurrentUser: boolean;
}

export const GroupMemberCard: React.FC<GroupMemberCardProps> = ({
  member,
  currentUserRole,
  onRoleChange,
  onRemove,
  isCurrentUser
}) => {
  const canManageRoles = currentUserRole === UserRole.ADMIN && !isCurrentUser;
  const canRemove = currentUserRole === UserRole.ADMIN && !isCurrentUser;

  const roleOptions = Object.values(UserRole).map(role => ({
    value: role,
    label: role
  }));

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN: return 'bg-red-100 text-red-800';
      case UserRole.MANAGER: return 'bg-blue-100 text-blue-800';
      case UserRole.MUSICIAN: return 'bg-green-100 text-green-800';
      case UserRole.MEMBER: return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-lg font-medium text-gray-900">
            {member.name}
            {isCurrentUser && (
              <span className="ml-2 text-sm text-blue-600">(You)</span>
            )}
          </h3>
          <p className="text-sm text-gray-600">{member.email}</p>
          {member.phone && (
            <p className="text-sm text-gray-600">{member.phone}</p>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2">
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(member.role)}`}>
              {member.role}
            </span>
            {member.isOnline && (
              <span className="w-3 h-3 bg-green-400 rounded-full"></span>
            )}
          </div>
        </div>
      </div>

      {canManageRoles && (
        <div className="space-y-2">
          <Select
            label="Role"
            value={member.role}
            onChange={(e) => onRoleChange(member.id, e.target.value as UserRole)}
            options={roleOptions}
          />
        </div>
      )}

      {canRemove && (
        <div className="mt-3 pt-3 border-t">
          <Button
            variant="danger"
            size="sm"
            onClick={() => onRemove(member.id)}
          >
            Remove from Group
          </Button>
        </div>
      )}

      {member.lastSeen && !member.isOnline && (
        <p className="text-xs text-gray-400 mt-2">
          Last seen: {new Date(member.lastSeen).toLocaleString()}
        </p>
      )}
    </div>
  );
};
