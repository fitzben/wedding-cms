import { useScrollReveal } from '../hooks/useScrollReveal';

const Gallery = () => {
  useScrollReveal();

  return (
    <section className="pb-[100px] bg-offwhite relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20 obs-hide obs-up flex justify-center">
          <h2 className="font-serif text-5xl tracking-tight text-maroon italic font-normal obs-hide obs-letter-spacing">
            Moments
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4 auto-rows-[250px] md:auto-rows-[400px]">
          {/* Item 1 */}
          <div 
            className="col-span-2 row-span-2 overflow-hidden relative cursor-pointer group obs-hide obs-scale" 
            style={{ animationDelay: '0ms' }}
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-[#1A1A1A] via-[#3a0813] to-[#4a0611] transition-transform duration-[2000ms] group-hover:scale-[1.04]"></div>
            <div className="absolute inset-0 bg-maroon/0 group-hover:bg-maroon/20 transition-colors duration-500 z-10 pointer-events-none"></div>
          </div>
          
          {/* Item 2 */}
          <div 
            className="overflow-hidden relative cursor-pointer group obs-hide obs-scale" 
            style={{ animationDelay: '80ms' }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#2a2a2a] via-[#4a0611] to-[#1A1A1A] transition-transform duration-[2000ms] group-hover:scale-[1.04]"></div>
            <div className="absolute inset-0 bg-maroon/0 group-hover:bg-maroon/20 transition-colors duration-500 z-10 pointer-events-none"></div>
          </div>
          
          {/* Item 3 */}
          <div 
            className="overflow-hidden relative cursor-pointer group obs-hide obs-scale" 
            style={{ animationDelay: '160ms' }}
          >
            <div className="absolute inset-0 bg-gradient-to-tl from-[#1A1A1A] via-[#4a0611] to-[#2a2a2a] transition-transform duration-[2000ms] group-hover:scale-[1.04]"></div>
            <div className="absolute inset-0 bg-maroon/0 group-hover:bg-maroon/20 transition-colors duration-500 z-10 pointer-events-none"></div>
          </div>
          
          {/* Item 4 */}
          <div 
            className="overflow-hidden relative cursor-pointer group obs-hide obs-scale" 
            style={{ animationDelay: '240ms' }}
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-[#4a0611] via-[#1A1A1A] to-[#3a0813] transition-transform duration-[2000ms] group-hover:scale-[1.04]"></div>
            <div className="absolute inset-0 bg-maroon/0 group-hover:bg-maroon/20 transition-colors duration-500 z-10 pointer-events-none"></div>
          </div>
          
          {/* Item 5 */}
          <div 
            className="col-span-2 overflow-hidden relative cursor-pointer group obs-hide obs-scale" 
            style={{ animationDelay: '320ms' }}
          >
            <div className="absolute inset-0 bg-gradient-to-bl from-[#1A1A1A] via-[#3a0813] to-[#4a0611] transition-transform duration-[2000ms] group-hover:scale-[1.04]"></div>
            <div className="absolute inset-0 bg-maroon/0 group-hover:bg-maroon/20 transition-colors duration-500 z-10 pointer-events-none"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Gallery;
