import React, { useState, useEffect } from 'react';
import { useAppSelector } from '../hooks/redux';
import { ContactService } from '../services/contactService';
import { MainLayout } from '../components/layout/MainLayout';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { Contact } from '../types';

export const ContactsPage: React.FC = () => {
  const { currentUser } = useAppSelector((state) => state.user);
  
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEventTag, setSelectedEventTag] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    eventTag: '',
    eventType: ''
  });

  useEffect(() => {
    fetchContacts();
  }, [currentUser?.groupId, fetchContacts]);

  const fetchContacts = async () => {
    if (!currentUser?.groupId) return;
    
    setIsLoading(true);
    try {
      const fetchedContacts = await ContactService.fetchContacts(currentUser.groupId);
      setContacts(fetchedContacts);
    } catch (error) {
      console.error('Failed to fetch contacts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.groupId) return;

    try {
      const contactData: Omit<Contact, 'id'> = {
        ...formData,
        groupId: currentUser.groupId
      };

      if (editingContact) {
        await ContactService.updateContact(editingContact.id!, contactData);
      } else {
        await ContactService.addContact(contactData);
      }
      
      await fetchContacts();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Failed to save contact:', error);
    }
  };

  const handleEdit = (contact: Contact) => {
    setEditingContact(contact);
    setFormData({
      name: contact.name,
      email: contact.email,
      phone: contact.phone,
      role: contact.role,
      eventTag: contact.eventTag || '',
      eventType: contact.eventType || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (contactId: string) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      try {
        await ContactService.deleteContact(contactId);
        await fetchContacts();
      } catch (error) {
        console.error('Failed to delete contact:', error);
      }
    }
  };

  const resetForm = () => {
    setEditingContact(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: '',
      eventTag: '',
      eventType: ''
    });
  };

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.role.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesEvent = !selectedEventTag || contact.eventTag === selectedEventTag;
    
    return matchesSearch && matchesEvent;
  });

  const uniqueEventTags = ContactService.getUniqueEventTags(contacts);
  const roleOptions = [
    { value: '', label: 'Select role' },
    { value: 'Organizer', label: 'Organizer' },
    { value: 'Coordinator', label: 'Coordinator' },
    { value: 'Venue Manager', label: 'Venue Manager' },
    { value: 'Sound Engineer', label: 'Sound Engineer' },
    { value: 'Lighting Engineer', label: 'Lighting Engineer' },
    { value: 'Stage Manager', label: 'Stage Manager' },
    { value: 'Security', label: 'Security' },
    { value: 'Catering', label: 'Catering' },
    { value: 'Transport', label: 'Transport' },
    { value: 'Media', label: 'Media' },
    { value: 'Other', label: 'Other' }
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>
            <p className="text-gray-600">Manage your band's contact directory</p>
          </div>
          <Button onClick={() => setShowModal(true)}>
            Add Contact
          </Button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Search contacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            
            <Select
              value={selectedEventTag}
              onChange={(e) => setSelectedEventTag(e.target.value)}
              options={[
                { value: '', label: 'All events' },
                ...uniqueEventTags.map(tag => ({ value: tag, label: tag }))
              ]}
            />
          </div>
        </div>

        {/* Contacts Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {isLoading ? (
            <div className="p-6 text-center">Loading...</div>
          ) : filteredContacts.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              {contacts.length === 0 
                ? 'No contacts yet. Add your first contact to get started.'
                : 'No contacts match your current filters.'
              }
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Event
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredContacts.map((contact) => (
                    <tr key={contact.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {contact.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <a 
                          href={`mailto:${contact.email}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          {contact.email}
                        </a>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <a 
                          href={`tel:${contact.phone}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          {contact.phone}
                        </a>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {contact.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {contact.eventTag || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleEdit(contact)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(contact.id!)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Add/Edit Modal */}
        <Modal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            resetForm();
          }}
          title={editingContact ? 'Edit Contact' : 'Add New Contact'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Full name"
              required
            />

            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="email@example.com"
              required
            />

            <Input
              label="Phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="+1234567890"
              required
            />

            <Select
              label="Role"
              value={formData.role}
              onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
              options={roleOptions}
              required
            />

            <Input
              label="Event Tag (Optional)"
              value={formData.eventTag}
              onChange={(e) => setFormData(prev => ({ ...prev, eventTag: e.target.value }))}
              placeholder="Associated event name"
            />

            <Input
              label="Event Type (Optional)"
              value={formData.eventType}
              onChange={(e) => setFormData(prev => ({ ...prev, eventType: e.target.value }))}
              placeholder="Concert, Festival, etc."
            />

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editingContact ? 'Update' : 'Add'} Contact
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </MainLayout>
  );
};
