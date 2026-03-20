import { useState } from 'react';
import { useScrollReveal } from '../hooks/useScrollReveal';

const giftItems = [
  { id: 1, name: "Coffee Machine", brand: "De'Longhi", description: "Espresso & cappuccino machine for our morning rituals together.", image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&q=80", shopUrl: "https://www.tokopedia.com/search?st=product&q=delonghi+coffee+machine", price: "Rp 2.500.000 – 5.000.000", tag: "Kitchen" },
  { id: 2, name: "Air Fryer", brand: "Philips", description: "For healthy home-cooked meals in our new kitchen.", image: "https://images.unsplash.com/photo-1585515320310-259814833e62?w=400&q=80", shopUrl: "https://www.tokopedia.com/search?st=product&q=philips+air+fryer", price: "Rp 800.000 – 1.500.000", tag: "Kitchen" },
  { id: 3, name: "Bed Linen Set", brand: "Premium Cotton", description: "Soft luxury linen set for our bedroom sanctuary.", image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400&q=80", shopUrl: "https://www.tokopedia.com/search?st=product&q=bed+linen+set+premium", price: "Rp 500.000 – 1.200.000", tag: "Home" },
  { id: 4, name: "Home Décor Set", brand: "Ceramic & Wood", description: "Beautiful decorative pieces to warm up our new home.", image: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=400&q=80", shopUrl: "https://www.tokopedia.com/search?st=product&q=home+decor+set+aesthetic", price: "Rp 300.000 – 800.000", tag: "Home" },
  { id: 5, name: "Travel Voucher", brand: "Traveloka", description: "Help us create memories on our honeymoon adventure.", image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&q=80", shopUrl: "https://www.traveloka.com/en-id/promotion", price: "Any amount", tag: "Experience" },
  { id: 6, name: "Spa Experience", brand: "Luxury Wellness", description: "A relaxing couple spa day to celebrate our new chapter.", image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400&q=80", shopUrl: "https://www.tokopedia.com/search?st=product&q=voucher+spa+couple+jakarta", price: "Rp 500.000 – 2.000.000", tag: "Experience" }
];

const GiftRegistry = () => {
  useScrollReveal();
  
  const [copiedBank, setCopiedBank] = useState('');
  const [selectedGift, setSelectedGift] = useState(null);
  const [hoveredGiftId, setHoveredGiftId] = useState(null);

  const copyAccount = (number, bankId) => {
    const text = number.replace(/\s/g, '');
    navigator.clipboard.writeText(text).then(() => {
      setCopiedBank(bankId);
      setTimeout(() => setCopiedBank(''), 2000);
    });
  };

  const handleGiftClick = (item) => {
    if (window.innerWidth > 767) {
      window.open(item.shopUrl, '_blank');
    } else {
      setSelectedGift(item);
      document.body.style.overflow = 'hidden';
    }
  };

  const closeBottomSheet = () => {
    setSelectedGift(null);
    document.body.style.overflow = '';
  };

  return (
    <>
      <section className="pb-[100px] bg-ivory relative pt-12">
        <div className="max-w-[900px] mx-auto px-6 relative z-10">
          
          <div className="text-center mb-[60px] flex flex-col items-center justify-center obs-hide obs-up">
            <h2 className="font-script text-[clamp(48px,7vw,80px)] text-maroon leading-none mb-4 font-normal">Wedding Gift</h2>
            <p className="font-sans font-light text-[14px] text-charcoal/60 italic max-w-md mx-auto">
              Your presence is our greatest gift. But if you wish to bless us further:
            </p>
          </div>

          {/* PART 1: Bank Transfer */}
          <div className="mb-16 obs-hide obs-up" style={{ animationDelay: '100ms' }}>
            <p className="text-center font-sans font-light text-[10px] text-gold tracking-[0.3em] uppercase mb-6">Bank Transfer</p>
            <div className="flex flex-wrap gap-6 justify-center">
              
              {/* BCA Card */}
              <div className="bg-white border border-gold/30 rounded p-[28px_32px] min-w-[240px] relative flex flex-col items-start">
                <svg className="w-4 h-4 text-gold absolute top-2 left-2" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M 4,24 L 4,4 L 24,4"/><path d="M 8,20 L 8,8 L 20,8"/></svg>
                <svg className="w-4 h-4 text-gold absolute top-2 right-2 rotate-90" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M 4,24 L 4,4 L 24,4"/><path d="M 8,20 L 8,8 L 20,8"/></svg>
                <svg className="w-4 h-4 text-gold absolute bottom-2 left-2 -rotate-90" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M 4,24 L 4,4 L 24,4"/><path d="M 8,20 L 8,8 L 20,8"/></svg>
                <svg className="w-4 h-4 text-gold absolute bottom-2 right-2 rotate-180" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M 4,24 L 4,4 L 24,4"/><path d="M 8,20 L 8,8 L 20,8"/></svg>
                
                <p className="font-sans font-normal text-[11px] text-maroon tracking-[0.15em] uppercase mb-1">BCA</p>
                <p className="font-serif text-[22px] text-charcoal tracking-[0.05em] mb-1">1234 5678 90</p>
                <p className="font-sans font-light text-[12px] text-charcoal/60 mb-4">Benjamin &amp; Angelin</p>
                <button 
                  onClick={() => copyAccount("1234 5678 90", "bca")}
                  className={`font-sans font-light text-[10px] tracking-[0.15em] uppercase transition-colors cursor-pointer rounded-sm p-[6px_16px] border
                    ${copiedBank === 'bca' 
                      ? 'text-maroon border-maroon bg-transparent' 
                      : 'text-gold border-gold/40 hover:bg-gold/10'}`}
                >
                  {copiedBank === 'bca' ? 'COPIED ✓' : 'Copy Number'}
                </button>
              </div>

              {/* Mandiri Card */}
              <div className="bg-white border border-gold/30 rounded p-[28px_32px] min-w-[240px] relative flex flex-col items-start">
                <svg className="w-4 h-4 text-gold absolute top-2 left-2" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M 4,24 L 4,4 L 24,4"/><path d="M 8,20 L 8,8 L 20,8"/></svg>
                <svg className="w-4 h-4 text-gold absolute top-2 right-2 rotate-90" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M 4,24 L 4,4 L 24,4"/><path d="M 8,20 L 8,8 L 20,8"/></svg>
                <svg className="w-4 h-4 text-gold absolute bottom-2 left-2 -rotate-90" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M 4,24 L 4,4 L 24,4"/><path d="M 8,20 L 8,8 L 20,8"/></svg>
                <svg className="w-4 h-4 text-gold absolute bottom-2 right-2 rotate-180" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M 4,24 L 4,4 L 24,4"/><path d="M 8,20 L 8,8 L 20,8"/></svg>
                
                <p className="font-sans font-normal text-[11px] text-maroon tracking-[0.15em] uppercase mb-1">Mandiri</p>
                <p className="font-serif text-[22px] text-charcoal tracking-[0.05em] mb-1">0987 6543 21</p>
                <p className="font-sans font-light text-[12px] text-charcoal/60 mb-4">Benjamin &amp; Angelin</p>
                <button 
                  onClick={() => copyAccount("0987 6543 21", "mandiri")}
                  className={`font-sans font-light text-[10px] tracking-[0.15em] uppercase transition-colors cursor-pointer rounded-sm p-[6px_16px] border
                    ${copiedBank === 'mandiri' 
                      ? 'text-maroon border-maroon bg-transparent' 
                      : 'text-gold border-gold/40 hover:bg-gold/10'}`}
                >
                  {copiedBank === 'mandiri' ? 'COPIED ✓' : 'Copy Number'}
                </button>
              </div>
            </div>
          </div>

          {/* PART 2: Gift Registry */}
          <div className="mt-[60px]">
            <p className="text-center font-sans font-light text-[10px] text-gold tracking-[0.3em] uppercase mb-2">Gift Registry</p>
            <h3 className="font-serif italic text-[28px] text-maroon text-center mb-10">Things We'd Love</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {giftItems.map((item) => (
                <div 
                  key={item.id}
                  className="gift-card group"
                  onClick={() => handleGiftClick(item)}
                  onMouseEnter={() => setHoveredGiftId(item.id)}
                  onMouseLeave={() => setHoveredGiftId(null)}
                  style={{
                    background: 'white', border: '1px solid rgba(201,168,76,0.25)', 
                    borderRadius: '6px', overflow: 'hidden', cursor: 'pointer', 
                    position: 'relative', transition: 'all 0.35s cubic-bezier(0.16,1,0.3,1)',
                    transform: hoveredGiftId === item.id && window.innerWidth > 767 ? 'translateY(-8px)' : '',
                    boxShadow: hoveredGiftId === item.id && window.innerWidth > 767 ? '0 20px 60px rgba(61,5,16,0.18)' : '',
                    borderColor: hoveredGiftId === item.id && window.innerWidth > 767 ? 'rgba(201,168,76,0.7)' : 'rgba(201,168,76,0.25)'
                  }}
                >
                  {/* Tag badge */}
                  <div className="absolute top-3 right-3 z-[2] bg-maroon/85 text-ivory font-sans text-[9px] tracking-[0.15em] uppercase px-2.5 py-1 backdrop-blur-sm rounded-sm">
                    {item.tag}
                  </div>
                  
                  {/* Image area */}
                  <div className="h-[180px] overflow-hidden relative bg-gradient-to-br from-[#3d0510] to-maroon">
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className={`w-full h-full object-cover transition-transform duration-500 block ${
                        hoveredGiftId === item.id && window.innerWidth > 767 ? 'scale-[1.08]' : ''
                      }`}
                      onError={(e) => e.target.style.display = 'none'}
                    />
                  </div>
                  
                  {/* Content */}
                  <div className="p-5 relative">
                    <p className="font-sans font-light text-[10px] text-gold tracking-[0.15em] uppercase mb-1">
                      {item.brand}
                    </p>
                    <h3 className="font-serif italic text-[22px] text-maroon mb-2 font-normal">
                      {item.name}
                    </h3>
                    <p className="font-sans font-light text-[12px] text-charcoal/65 leading-[1.7] mb-2">
                      {item.description}
                    </p>
                    <p className="font-sans font-light text-[11px] text-charcoal/45 mb-4">
                      {item.price}
                    </p>
                    <button className="font-sans text-[10px] tracking-[0.15em] text-gold bg-transparent border border-gold/40 px-5 py-2 cursor-pointer rounded-sm transition-all duration-300 group-hover:bg-gold/10">
                      View on Shop →
                    </button>
                  </div>
                  
                  {/* Hover tooltip (desktop only) */}
                  <div 
                    className="gift-tooltip hidden md:block absolute bottom-[calc(100%+12px)] left-1/2 -translate-x-1/2 w-[220px] bg-[#1a0a08]/95 border border-gold/30 rounded-lg p-3.5 backdrop-blur-md shadow-[0_20px_60px_rgba(0,0,0,0.4)] z-[1000] pointer-events-none text-center transition-all duration-250 ease-out"
                    style={{
                      opacity: hoveredGiftId === item.id ? 1 : 0,
                      transform: `translateX(-50%) ${hoveredGiftId === item.id ? 'translateY(0)' : 'translateY(8px)'}`
                    }}
                  >
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded border border-gold/20 block mx-auto mb-2.5"
                      onError={(e) => e.target.style.display = 'none'}
                    />
                    <p className="font-serif italic text-[16px] text-ivory mb-1">
                      {item.name}
                    </p>
                    <p className="font-sans text-[10px] text-gold tracking-[0.1em] mb-1.5">
                      {item.brand}
                    </p>
                    <p className="font-sans text-[11px] text-ivory/60 mb-2">
                      {item.price}
                    </p>
                    <p className="font-sans text-[9px] text-gold/70 tracking-[0.1em] m-0">
                      Click to view on shop
                    </p>
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-[#1a0a08]/95"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="font-sans font-light text-[12px] text-charcoal/45 text-center mt-12 obs-hide obs-up">
            For inquiries: +62 812-3456-7890
          </p>
        </div>
      </section>

      {/* Gift Bottom Sheet */}
      <div 
        id="gift-overlay" 
        className={`fixed inset-0 bg-black/50 z-[9997] transition-opacity duration-400 ${
          selectedGift ? 'opacity-100 block' : 'opacity-0 hidden'
        }`}
        onClick={closeBottomSheet}
      ></div>

      <div 
        id="gift-bottomsheet"
        className={`fixed bottom-0 left-0 right-0 bg-[#1a0a08]/97 rounded-t-2xl p-6 z-[9998] transition-transform duration-400 ease-out ${
          selectedGift ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="w-10 h-1 bg-gold/30 rounded-full mx-auto mb-5"></div>
        
        {selectedGift && (
          <>
            <img 
              src={selectedGift.image} 
              alt={selectedGift.name}
              className="w-[100px] h-[100px] object-cover rounded-lg block mx-auto mb-4 border border-gold/20"
              onError={(e) => e.target.style.display = 'none'}
            />
            
            <p className="font-serif italic text-2xl text-ivory text-center m-0 mb-1.5">
              {selectedGift.name}
            </p>
            <p className="font-sans text-[10px] text-gold tracking-[0.15em] text-center uppercase m-0 mb-3">
              {selectedGift.brand}
            </p>
            <p className="font-sans text-[13px] text-ivory/70 text-center leading-[1.7] m-0 mb-2">
              {selectedGift.description}
            </p>
            <p className="font-sans text-[12px] text-ivory/50 text-center m-0 mb-6">
              {selectedGift.price}
            </p>
            
            <div className="flex gap-3">
              <button 
                onClick={() => window.open(selectedGift.shopUrl, '_blank')}
                className="flex-1 bg-gold text-charcoal font-sans text-[11px] tracking-[0.15em] uppercase p-3.5 border-none rounded cursor-pointer"
              >
                View on Shop
              </button>
              <button 
                onClick={closeBottomSheet}
                className="flex-1 bg-transparent border border-gold/30 text-ivory font-sans text-[11px] tracking-[0.15em] uppercase p-3.5 rounded cursor-pointer"
              >
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default GiftRegistry;
