

import AdminContactListWrapper from '@/components/admin/adminContact/AdminContactListWrapper';

import { fetchContact } from '@/lib/fetch/getContact';

export default async function ContactPage() {
	
	const contactData = await fetchContact( );
  
	return (
		 
			<section className="  pt-6 pb-20  ">
				<AdminContactListWrapper contact={contactData.contact}  />
			</section>
     
  );
}
