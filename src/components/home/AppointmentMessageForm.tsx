'use client';

import { useState } from 'react';
import { useContextState } from '@/context/contextState';

const AppointmentMessageForm = () => {
  const { setUploading, setMessageBox } = useContextState();

  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    message: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validate = () => {
    if (!formData.fullName || !formData.phoneNumber || !formData.message) {
      setMessageBox({
        message: 'All fields are required.',
        type: 'error',
      });
      return false;
    }

    if (!/^\d{10,}$/.test(formData.phoneNumber)) {
      setMessageBox({
        message: 'Phone number must have minimum 10 digits.',
        type: 'error',
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      setUploading(true);

      const payload = new FormData();
      payload.append('fullName', formData.fullName);
      payload.append('phoneNumber', formData.phoneNumber);
      payload.append('message', formData.message);

      const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/appointment`, {
        method: 'POST',
        body: payload,
      });

      const data = await res.json();

      if (!res.ok || !data.status) {
        throw new Error(data.message || 'Failed to send message');
      }

      setMessageBox({
        message: 'Appointment message sent successfully!',
        type: 'success',
      });

      setFormData({ fullName: '', phoneNumber: '', message: '' });

    } catch (error) {
      setMessageBox({
        message: `Failed to send appointment message. ${error}`,
        type: 'error',
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto shadow-lg rounded-lg border border-gray-200 overflow-hidden bg-[url('/vendor/images/bg-image-2.jpg')] bg-cover bg-[position:center_top]">
      <div className="w-full p-4 lg:p-6 space-y-4 bg-white/90">
        <h2 className="text-2xl font-bold text-center">Book an Appointment</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="fullName"
            placeholder="Full Name"
            value={formData.fullName}
            onChange={handleChange}
            className="w-full p-2 border-2 border-gray-400 rounded cursor-pointer"
          />

          <input
            type="tel"
            name="phoneNumber"
            placeholder="Phone Number"
            value={formData.phoneNumber}
            onChange={handleChange}
            className="w-full p-2 border-2 border-gray-400 rounded cursor-pointer"
          />

          <textarea
            name="message"
            placeholder="Your message..."
            value={formData.message}
            onChange={handleChange}
            rows={4}
            className="w-full p-2 border-2 border-gray-400 rounded cursor-pointer" 
          />

          <button
            type="submit"
            className="w-full bg-black text-white p-2 rounded hover:bg-gray-800 cursor-pointer"
          >
            Book Now
          </button>
        </form>
      </div>
    </div>
  );
};

export default AppointmentMessageForm;
