'use client';

import { useState } from 'react';
import { FaEdit } from 'react-icons/fa';
import AdminContactEditForm from './AdminContactEditForm';
import { Contact } from '@/types/contact';
import { useContextState } from '@/context/contextState';

interface Props {
  contact: Contact;
}

export default function AdminContactListWrapper({ contact }: Props) {
  const { setUploading, setMessageBox } = useContextState();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Contact>(contact);

  const handleSave = (updatedContact: Contact) => {
    setFormData(updatedContact);
    setIsEditing(false);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto   bg-white rounded-xl shadow-[5px_5px_10px_-3px_rgba(0,0,0,0.6)] space-y-6  ">
      <h1 className="text-3xl font-bold text-gray-800">📇 Admin Contact Info</h1>

      <div className="space-y-4">
        {!isEditing ? (
          <div className="text-gray-700 space-y-2">
            <p><strong>Phone:</strong> {formData.phone_number}</p>
            <p><strong>Email:</strong> {formData.email}</p>
            <p><strong>Address:</strong> {formData.address}</p>
            <p>
              <strong>Address URL:</strong>{' '}
              <a
                href={formData.address_url}
                className="text-blue-600 underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {formData.address_url}
              </a>
            </p>
            <p>
              <strong>Instagram:</strong>{' '}
              <a
                href={formData.instagram_url}
                className="text-blue-600 underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {formData.instagram_url}
              </a>
            </p>
            <p>
              <strong>YouTube:</strong>{' '}
              <a
                href={formData.youtube_url}
                className="text-blue-600 underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {formData.youtube_url}
              </a>
            </p>
            <p>
              <strong>Facebook:</strong>{' '}
              <a
                href={formData.facebook_url}
                className="text-blue-600 underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {formData.facebook_url}
              </a>
            </p>

            <button
              onClick={() => setIsEditing(true)}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition cursor-pointer"
            >
              <FaEdit />
              Edit
            </button>
          </div>
        ) : (
          <AdminContactEditForm
            contact={formData}
            onCancel={() => setIsEditing(false)}
            onSave={handleSave}
          />
        )}
      </div>
    </div>
  );
}
