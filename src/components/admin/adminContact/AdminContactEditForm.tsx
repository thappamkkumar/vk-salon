'use client';

import { useState } from 'react';
import { FaSave, FaTimes } from 'react-icons/fa';
import { Contact } from '@/types/contact';
import { useContextState } from '@/context/contextState';

interface Props {
  contact: Contact;
  onCancel: () => void;
  onSave: (updated: Contact) => void;
}

export default function AdminContactEditForm({ contact, onCancel, onSave }: Props) {
  const { setUploading, setMessageBox } = useContextState();
  const [formData, setFormData] = useState<Contact>(contact);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  function validateForm(data: Contact) {
    if (!data.address?.trim()) return 'Address is required.';
    if (!data.phone_number || !/^\d{10,15}$/.test(data.phone_number))
      return 'Phone number must be 10 to 15 digits.';
    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
      return 'Email is invalid.';
    try {
      if (!data.address_url) return 'Address URL is required.';
      new URL(data.address_url);
    } catch {
      return 'Address URL is invalid.';
    }
    return null;
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const validationError = validateForm(formData);
    if (validationError) {
      setMessageBox({ message: validationError, type: 'error' });
      return;
    }

    setUploading(true);

    try {
      const form = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          form.append(key, value);
        }
      });

      const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/contact`, {
        method: 'PUT',
        body: form,
      });

      if (!res.ok) {
        setMessageBox({ message: 'Failed to update contact.', type: 'error' });
        return;
      }

      const rdata = await res.json();
      setMessageBox({ message: 'Contact updated successfully.', type: 'success' });
      onSave(formData);
    } catch (error) {
      console.error(error);
      setMessageBox({ message: 'Error updating contact.', type: 'error' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {[
        { label: 'Address', name: 'address' },
        { label: 'Phone', name: 'phone_number' },
        { label: 'Email', name: 'email' },
        { label: 'Instagram URL', name: 'instagram_url' },
        { label: 'YouTube URL', name: 'youtube_url' },
        { label: 'Facebook URL', name: 'facebook_url' },
        { label: 'Address URL', name: 'address_url' },
      ].map(({ label, name }) => (
        <div key={name}>
          <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
          <input
            type="text"
            name={name}
            value={(formData as any)[name] || ''}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
      ))}

      <div className="flex gap-3 mt-4">
        <button
          type="submit"
          className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition"
        >
          <FaSave /> Save
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition"
        >
          <FaTimes /> Cancel
        </button>
      </div>
    </form>
  );
}
