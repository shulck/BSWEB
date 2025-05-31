import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Modal } from '../ui/Modal';

interface EventContact {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
}

interface ContactsEditorProps {
  contacts: EventContact[];
  onChange: (contacts: EventContact[]) => void;
}

export const ContactsEditor: React.FC<ContactsEditorProps> = ({
  contacts,
  onChange
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editingContact, setEditingContact] = useState<EventContact | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'Other'
  });

  const roleOptions = [
    { value: 'Sound Engineer', label: 'Sound Engineer' },
    { value: 'Lighting Engineer', label: 'Lighting Engineer' },
    { value: 'Stage Manager', label: 'Stage Manager' },
    { value: 'Production Manager', label: 'Production Manager' },
    { value: 'Venue Staff', label: 'Venue Staff' },
    { value: 'Security', label: 'Security' },
    { value: 'Catering', label: 'Catering' },
    { value: 'Transport', label: 'Transport' },
    { value: 'Media', label: 'Media' },
    { value: 'Photographer', label: 'Photographer' },
    { value: 'Videographer', label: 'Videographer' },
    { value: 'Backstage', label: 'Backstage' },
    { value: 'Front of House', label: 'Front of House' },
    { value: 'Other', label: 'Other' }
  ];

  const openContactModal = (contact?: EventContact) => {
    if (contact) {
      setEditingContact(contact);
      setFormData({
        name: contact.name,
        email: contact.email,
        phone: contact.phone,
        role: contact.role
      });
    } else {
      setEditingContact(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        role: 'Other'
      });
    }
    setShowModal(true);
  };

  const saveContact = () => {
    if (!formData.name.trim()) return;

    const contact: EventContact = {
      id: editingContact?.id || `contact-${Date.now()}`,
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      role: formData.role
    };

    if (editingContact) {
      onChange(contacts.map(c => c.id === editingContact.id ? contact : c));
    } else {
      onChange([...contacts, contact]);
    }

    setShowModal(false);
  };

  const removeContact = (id: string) => {
    onChange(contacts.filter(c => c.id !== id));
  };

  return (
    <>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">Additional Contacts</span>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => openContactModal()}
          >
            + Add Contact
          </Button>
        </div>

        {contacts.length === 0 ? (
          <p className="text-sm text-gray-500 italic">No additional contacts</p>
        ) : (
          <div className="space-y-2">
            {contacts.map((contact) => (
              <div key={contact.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="font-medium text-sm">{contact.name}</div>
                  <div className="text-xs text-gray-600">{contact.role}</div>
                  {contact.email && (
                    <div className="text-xs text-gray-500">{contact.email}</div>
                  )}
                  {contact.phone && (
                    <div className="text-xs text-gray-500">{contact.phone}</div>
                  )}
                </div>
                <div className="flex space-x-1">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => openContactModal(contact)}
                  >
                    Edit
                  </Button>
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    onClick={() => removeContact(contact.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingContact ? 'Edit Contact' : 'Add Contact'}
      >
        <div className="space-y-4">
          <Input
            label="Name *"
            value={formData.name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Contact name"
          />

          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            placeholder="contact@example.com"
          />

          <Input
            label="Phone"
            type="tel"
            value={formData.phone}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            placeholder="+1234567890"
          />

          <Select
            label="Role"
            value={formData.role}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData(prev => ({ ...prev, role: e.target.value }))}
            options={roleOptions}
          />

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={saveContact}
              disabled={!formData.name.trim()}
            >
              {editingContact ? 'Update' : 'Add'} Contact
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};
