import React, { useState } from 'react';
import { Contact } from '../../types';
import { ContactService } from '../../services/contactService';

interface ContactGroup {
  name: string;
  contacts: Contact[];
  count: number;
}

interface ContactGroupingProps {
  contacts: Contact[];
  groupBy: 'role' | 'eventType' | 'eventTag';
  onGroupChange: (groupBy: 'role' | 'eventType' | 'eventTag') => void;
  onContactClick: (contact: Contact) => void;
}

export const ContactGrouping: React.FC<ContactGroupingProps> = ({
  contacts,
  groupBy,
  onGroupChange,
  onContactClick
}) => {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const groups: ContactGroup[] = React.useMemo(() => {
    const grouped = contacts.reduce((acc, contact) => {
      let groupKey: string;
      
      switch (groupBy) {
        case 'role':
          groupKey = contact.role || 'Unassigned';
          break;
        case 'eventType':
          groupKey = contact.eventType || 'No Event Type';
          break;
        case 'eventTag':
          groupKey = contact.eventTag || 'No Event';
          break;
        default:
          groupKey = 'All';
      }

      if (!acc[groupKey]) {
        acc[groupKey] = [];
      }
      acc[groupKey].push(contact);
      return acc;
    }, {} as Record<string, Contact[]>);

    return Object.entries(grouped)
      .map(([name, contacts]) => ({
        name,
        contacts: contacts.sort((a, b) => a.name.localeCompare(b.name)),
        count: contacts.length
      }))
      .sort((a, b) => b.count - a.count);
  }, [contacts, groupBy]);

  const toggleGroup = (groupName: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupName)) {
      newExpanded.delete(groupName);
    } else {
      newExpanded.add(groupName);
    }
    setExpandedGroups(newExpanded);
  };

  const groupByOptions = [
    { value: 'role', label: 'Group by Role' },
    { value: 'eventType', label: 'Group by Event Type' },
    { value: 'eventTag', label: 'Group by Event' }
  ];

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      'Organizer': 'bg-blue-100 text-blue-800',
      'Coordinator': 'bg-green-100 text-green-800',
      'Venue Manager': 'bg-purple-100 text-purple-800',
      'Sound Engineer': 'bg-orange-100 text-orange-800',
      'Security': 'bg-red-100 text-red-800',
      'Other': 'bg-gray-100 text-gray-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">
          Contacts ({contacts.length})
        </h3>
        
        <select
          value={groupBy}
          onChange={(e) => onGroupChange(e.target.value as 'role' | 'eventType' | 'eventTag')}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {groupByOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-3">
        {groups.map((group) => (
          <div key={group.name} className="bg-white rounded-lg shadow border">
            <button
              onClick={() => toggleGroup(group.name)}
              className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <span className="text-lg font-medium text-gray-900">
                  {group.name}
                </span>
                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                  {group.count}
                </span>
              </div>
              
              <svg
                className={`w-5 h-5 text-gray-400 transition-transform ${
                  expandedGroups.has(group.name) ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {expandedGroups.has(group.name) && (
              <div className="border-t border-gray-200">
                <div className="p-4 space-y-3">
                  {group.contacts.map((contact) => (
                    <div
                      key={contact.id}
                      onClick={() => onContactClick(contact)}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h4 className="text-sm font-medium text-gray-900">
                            {contact.name}
                          </h4>
                          
                          {groupBy !== 'role' && (
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(contact.role)}`}>
                              {contact.role}
                            </span>
                          )}
                        </div>
                        
                        <div className="mt-1 space-y-1">
                          <p className="text-xs text-gray-600">{contact.email}</p>
                          {contact.phone && (
                            <p className="text-xs text-gray-600">{contact.phone}</p>
                          )}
                          
                          {groupBy === 'role' && contact.eventTag && (
                            <p className="text-xs text-blue-600">Event: {contact.eventTag}</p>
                          )}
                          
                          {groupBy === 'eventTag' && contact.eventType && (
                            <p className="text-xs text-purple-600">Type: {contact.eventType}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <a
                          href={`mailto:${contact.email}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-blue-600 hover:text-blue-800 text-xs"
                        >
                          Email
                        </a>
                        {contact.phone && (
                          <a
                            href={`tel:${contact.phone}`}
                            onClick={(e) => e.stopPropagation()}
                            className="text-green-600 hover:text-green-800 text-xs"
                          >
                            Call
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {groups.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No contacts to display
        </div>
      )}
    </div>
  );
};
