 
import StyleList from '@/components/styles/StyleList';  
import { fetchStyle } from '@/lib/fetch/getStyles'; 
 
export default async function StylesPage() {

	const styleResponse = await fetchStyle(null, 'next');

  return (
	 
			 
			<main className="pt-20"> 
				<StyleList initialStyleData={styleResponse} />
			</main>
		 
  );
}
