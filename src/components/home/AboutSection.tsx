 
export default function AboutSection() {
  return (
    <section className=" h-auto w-full block md:flex gap-4 	justify-between items-start py-18 px-2 md:px-5  lg:px-8 xl:px-15  md:scroll-mt-20 " id="about">
     
		 <div className="text-[10vw] sm:text-5xl  lg:text-6xl   xl:text-7xl py-8 md:py-2  tracking-wide   flex justify-center items-center font-[family-name:var(--font-lora)] md:sticky top-30 ">
				
				 <strong>Ab</strong>

					<span className="block   mt-2 mx-1   w-[7vw] h-[7vw] sm:w-8 sm:h-8  lg:w-10 lg:h-10 xl:w-11 xl:mt-3 xl:h-11 xl:mt-3         bg-[url('/vendor/images/img5.jpg')] bg-cover bg-center bg-no-repeat  rounded-full shadow-lg  " />

					<strong>ut</strong>
				
			</div>
			
			
			<div className="max-w-4xl px-4 md:px-4 xl:px-0 text-base md:text-lg leading-relaxed text-base">
        <p className="mb-4">
          At <strong>VK Hair</strong>, grooming is more than just a service - it's an experience. Founded in <strong>2014</strong> by master barber <strong>Bittu</strong>, our salon blends time-honored techniques with modern style to give each client a personalized, polished look.
        </p>
        <p className="mb-4">
          We specialize in everything from classic razor shaves and traditional fades to sharp, contemporary cuts. Whether you're walking in for a quick trim or booking a full grooming session, our team ensures you leave feeling refreshed, confident, and camera-ready.
        </p>
        <p className="mb-4">
          Our cozy, upscale atmosphere is designed to help you relax while our skilled barbers work their magic. With a commitment to quality, style, and service, VK Hair is your destination for precision, care, and consistency-every single time.
        </p>
        <p>
          Step in, sit back, and let us bring out the best version of you.
        </p>
      </div>
			
    </section>
  );
}
