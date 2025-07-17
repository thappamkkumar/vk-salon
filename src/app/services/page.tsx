 
import { fetchServices } from '@/lib/fetch/getServices';
import ServiceList from '@/components/services/ServiceList';

export default async function  ServicesPage() {
	const services = await fetchServices(null, 'next');
	
  return (
		 
			<main className="pt-20"> 
				<ServiceList initialServicesData={services} />
			</main>
     
  );
}
