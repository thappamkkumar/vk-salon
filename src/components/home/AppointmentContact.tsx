 
import {
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaInstagram,
  FaYoutube,
  FaFacebook,
} from 'react-icons/fa';
import { Contact } from '@/types/contact';

type ContactItemProps = {
  icon: React.ReactNode;
  label: string;
  content: string;
  href: string;
  isExternal?: boolean;
};

const ContactItem = ({
  icon,
  label,
  content,
  href,
  isExternal = false,
}: ContactItemProps) => (
  <div className="flex items-start gap-4">
    <div className=" bg-black text-white rounded-full">
			<a
          href={href}
          target={isExternal ? '_blank' : undefined}
          rel={isExternal ? 'noopener noreferrer' : undefined}
          className="p-3 block hover:underline"
        >
					{icon}
				</a>
			</div>
    <div>
      <strong className="text-lg font-bold text-black">
        <a
          href={href}
          target={isExternal ? '_blank' : undefined}
          rel={isExternal ? 'noopener noreferrer' : undefined}
          className="hover:underline"
        >
          {label}
        </a>
      </strong>
      <p>
        <a
          href={href}
          target={isExternal ? '_blank' : undefined}
          rel={isExternal ? 'noopener noreferrer' : undefined}
          className="text-black hover:underline break-words"
        >
          {content}
        </a>
      </p>
    </div>
  </div>
);

export default function AppointmentContact({ contact }: { contact: Contact }) {
 if(!contact)
 {
	return null;
 }
	
	return (
    <div className="space-y-6 w-full lg:w-[40%] pb-8 md:pb-0">
      <h2 className="text-4xl font-bold underline">Contact</h2>
      <div className="w-full max-w-[400px] space-y-6 overflow-hidden">
        <ContactItem
          icon={<FaMapMarkerAlt />}
          label="Address"
          content={contact.address}
          href={contact.address_url}
          isExternal
        />
        <ContactItem
          icon={<FaPhone />}
          label="Phone"
          content={contact.phone_number}
          href={`tel:${contact.phone_number}`}
        />
        <ContactItem
          icon={<FaEnvelope />}
          label="Email"
          content={contact.email}
          href={`mailto:${contact.email}`}
        />
        {/* Social media icons row */}
        <div className="flex gap-4 pt-4">
          <a
            href={contact.instagram_url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 bg-black text-2xl text-white rounded-full hover:bg-gray-800 transition"
            aria-label="Instagram"
          >
            <FaInstagram />
          </a>
          <a
            href={contact.youtube_url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 bg-black text-2xl text-white rounded-full hover:bg-gray-800 transition"
            aria-label="YouTube"
          >
            <FaYoutube />
          </a>
          <a
            href={contact.facebook_url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 bg-black text-2xl text-white rounded-full hover:bg-gray-800 transition"
            aria-label="Facebook"
          >
            <FaFacebook />
          </a>
        </div>
      </div>
    </div>
  );
}
