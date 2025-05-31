import React from 'react';
import { UserModel } from '../../types';
import { Button } from '../ui/Button';

interface PendingMemberCardProps {
  member: UserModel;
  onApprove: (userId: string) => void;
  onReject: (userId: string) => void;
}

export const PendingMemberCard: React.FC<PendingMemberCardProps> = ({
  member,
  onApprove,
  onReject
}) => {
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">{member.name}</h3>
          <p className="text-sm text-gray-600">{member.email}</p>
          {member.phone && (
            <p className="text-sm text-gray-600">{member.phone}</p>
          )}
        </div>
        
        <div className="flex space-x-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => onApprove(member.id)}
          >
            Approve
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => onReject(member.id)}
          >
            Reject
          </Button>
        </div>
      </div>
    </div>
  );
};
