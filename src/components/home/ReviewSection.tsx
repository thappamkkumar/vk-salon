// app/components/home/ReviewSection.tsx
 
import ReviewCarousel from './ReviewCarousel';
import {  Review } from '@/types/reviews';


 

export default async function ReviewSection({
  reviews,
}: {
  reviews: Review[];
})  {
  
   

    if (reviews.length === 0) {
        return null
       
    }

    return (
      <section className=" h-auto w-full py-18 px-4 md:px-5 lg:px-8 xl:px-15  " id="reviews">
        <h2 className="text-[10vw] sm:text-5xl      xl:text-6xl  font-bold mb-10 text-center">What Our Clients Say</h2>
        <ReviewCarousel reviews={reviews} />
      </section>
    );
   
}
