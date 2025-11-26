
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useDragControls, PanInfo } from 'framer-motion';
import { 
  Coffee, 
  Sparkles, 
  History, 
  ChevronRight, 
  ArrowLeft, 
  Plus, 
  MessageCircle,
  X as XIcon,
  Bean,
  Droplet,
  Sun,
  Flame,
  Flower,
  Check,
  MapPin,
  Mountain,
  Layers,
  Globe
} from 'lucide-react';
import { generateCoffeeBlend, chatWithBarista } from './services/geminiService';
import { AppScreen, FlavorProfile, CoffeeResult, HistoryEntry, ChatMessage, RadarData, Language } from './types';
import { Button } from './components/Button';

// --- TRANSLATIONS ---
const TRANSLATIONS = {
  en: {
    welcomeTitle: "Begin Your \nCoffee Journey",
    welcomeSubtitle: "Discover the perfect bean blend tailored to your mood and taste through an artistic exploration.",
    startBtn: "Start Exploring",
    flavorTitle: "Create Profile",
    flavorSub: "Drag 3 flavors to brew your cup",
    dropHint: "Drop flavors here",
    emptyCup: "Empty Cup",
    moreBtnPrefix: "",
    moreBtnSuffix: " more",
    continueBtn: "Continue",
    flavors: {
      berry: "Berry",
      citrus: "Citrus",
      floral: "Floral",
      sweet: "Sweet",
      chocolate: "Choco",
      nutty: "Nutty"
    },
    balanceTitle: "Adjust Balance",
    balanceSub: "Fine tune the character",
    heavy: "HEAVY BODY",
    light: "LIGHT BODY",
    deep: "DEEP",
    bright: "BRIGHT",
    revealBtn: "Reveal My Blend",
    brewing: "Brewing...",
    flavorRadar: "Flavor Profile",
    brewAnother: "Brew Another Cup",
    region: "Region",
    altitude: "Altitude",
    process: "Process",
    roast: "Roast",
    passportTitle: "Bean Passport",
    noHistory: "No discoveries yet.",
    latestInsight: "Latest Insight",
    insightText: "Your recent choices lean towards adventurous acidity. Consider trying washed Ethiopian beans next time.",
    askBarista: "Ask Barista",
    chatTitle: "Barista Chat",
    chatWelcome: "Hi! I'm your AI Barista. Ask me anything about coffee brewing or beans.",
    chatPlaceholder: "Ask about beans...",
    chatError: "Sorry, I'm having trouble brewing an answer right now."
  },
  zh: {
    welcomeTitle: "开启您的\n咖啡之旅",
    welcomeSubtitle: "通过艺术探索发现适合您心情和口味的完美咖啡豆。",
    startBtn: "开始探索",
    flavorTitle: "创建风味档案",
    flavorSub: "拖动3种风味到杯中",
    dropHint: "拖动风味到这里",
    emptyCup: "空杯",
    moreBtnPrefix: "还需 ",
    moreBtnSuffix: " 种",
    continueBtn: "继续",
    flavors: {
      berry: "浆果",
      citrus: "柑橘",
      floral: "花香",
      sweet: "甜感",
      chocolate: "巧克力",
      nutty: "坚果"
    },
    balanceTitle: "调整平衡",
    balanceSub: "微调咖啡性格",
    heavy: "醇厚",
    light: "清淡",
    deep: "深沉",
    bright: "明亮",
    revealBtn: "生成我的配方",
    brewing: "萃取中...",
    flavorRadar: "风味雷达",
    brewAnother: "再来一杯",
    region: "产区",
    altitude: "海拔",
    process: "处理法",
    roast: "烘焙度",
    passportTitle: "咖啡护照",
    noHistory: "暂无记录",
    latestInsight: "最新洞察",
    insightText: "您最近的选择倾向于明亮的酸度。下次不妨试试埃塞俄比亚的水洗豆。",
    askBarista: "咨询咖啡师",
    chatTitle: "咖啡师对话",
    chatWelcome: "您好！我是您的AI咖啡师。有关咖啡冲煮或豆子的问题都可以问我。",
    chatPlaceholder: "询问关于豆子的问题...",
    chatError: "抱歉，我现在无法回答。"
  }
};

// --- DATA ---
const AVAILABLE_FLAVORS: FlavorProfile[] = [
  { id: 'berry', color: 'bg-rose-300', icon: 'Droplet' },
  { id: 'citrus', color: 'bg-orange-300', icon: 'Sun' },
  { id: 'floral', color: 'bg-pink-200', icon: 'Flower' },
  { id: 'sweet', color: 'bg-amber-200', icon: 'Sparkles' },
  { id: 'chocolate', color: 'bg-[#5D4037] text-white', icon: 'Bean' },
  { id: 'nutty', color: 'bg-[#D7CCC8]', icon: 'Bean' },
];

// --- COMPONENTS ---

// 1. Welcome Screen
const WelcomeScreen: React.FC<{ onStart: () => void, text: typeof TRANSLATIONS['en'] }> = ({ onStart, text }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center h-full p-8 text-center"
    >
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="mb-8 relative"
      >
        <div className="absolute inset-0 bg-orange-200 blur-3xl opacity-30 rounded-full scale-150"></div>
        <Coffee size={80} className="text-orange-800 relative z-10" strokeWidth={1} />
      </motion.div>
      
      <h1 className="text-4xl md:text-5xl font-bold text-stone-800 mb-4 leading-tight whitespace-pre-line">
        {text.welcomeTitle}
      </h1>
      
      <p className="text-stone-500 mb-12 max-w-xs leading-relaxed">
        {text.welcomeSubtitle}
      </p>

      <Button onClick={onStart} className="text-lg px-8">
        {text.startBtn}
      </Button>
    </motion.div>
  );
};

// Particle effect component for splashes
const SplashParticles = ({ color }: { color: string }) => {
  return (
      <div className="absolute inset-0 pointer-events-none z-20 flex items-end justify-center pb-8">
         {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 1, y: 0, x: 0, scale: 0.4 }}
              animate={{ 
                opacity: 0, 
                y: -60 - Math.random() * 40, 
                x: (Math.random() - 0.5) * 80, 
                scale: 0 
              }}
              transition={{ duration: 0.6 + Math.random() * 0.4, ease: "easeOut" }}
              className={`absolute w-3 h-3 rounded-full ${color}`}
            />
         ))}
      </div>
  )
}

// 2. Flavor Drag & Drop Screen
const FlavorScreen: React.FC<{ 
  selectedFlavors: string[], 
  toggleFlavor: (id: string, isAdding: boolean) => void, 
  onNext: () => void,
  text: typeof TRANSLATIONS['en']
}> = ({ 
  selectedFlavors, 
  toggleFlavor, 
  onNext,
  text
}) => {
  const cupRef = useRef<HTMLDivElement>(null);
  const [dragActiveId, setDragActiveId] = useState<string | null>(null);
  const [isOverCup, setIsOverCup] = useState(false);
  const [showSplash, setShowSplash] = useState<{id: number, color: string} | null>(null);

  // Trigger splash when a flavor is added
  useEffect(() => {
    if (selectedFlavors.length > 0) {
      const lastFlavorId = selectedFlavors[selectedFlavors.length - 1];
      const flavor = AVAILABLE_FLAVORS.find(f => f.id === lastFlavorId);
      if (flavor) {
        const colorClass = flavor.color.split(' ')[0]; // Extract bg class
        setShowSplash({ id: Date.now(), color: colorClass });
        const timer = setTimeout(() => setShowSplash(null), 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [selectedFlavors.length]);

  const checkOverlap = (info: PanInfo) => {
    if (!cupRef.current) return false;
    const cupRect = cupRef.current.getBoundingClientRect();
    const point = info.point;
    return (
      point.x >= cupRect.left && 
      point.x <= cupRect.right && 
      point.y >= cupRect.top && 
      point.y <= cupRect.bottom
    );
  };

  const handleDrag = (event: any, info: PanInfo) => {
    const isOver = checkOverlap(info);
    if (isOver !== isOverCup) setIsOverCup(isOver);
  };

  const handleDragEnd = (event: any, info: PanInfo, flavor: FlavorProfile) => {
    setDragActiveId(null);
    setIsOverCup(false);
    
    if (checkOverlap(info)) {
      if (!selectedFlavors.includes(flavor.id) && selectedFlavors.length < 3) {
        toggleFlavor(flavor.id, true);
      }
    }
  };

  const getLiquidColor = () => {
    if (selectedFlavors.length === 0) return 'bg-stone-100';
    const lastId = selectedFlavors[selectedFlavors.length - 1];
    // Color mapping
    const map: Record<string, string> = {
      'chocolate': 'bg-[#5D4037]',
      'berry': 'bg-rose-400',
      'citrus': 'bg-orange-300',
      'nutty': 'bg-[#A1887F]',
      'sweet': 'bg-amber-300',
      'floral': 'bg-pink-300'
    };
    return map[lastId] || 'bg-amber-700';
  };

  const isFull = selectedFlavors.length >= 3;

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="flex flex-col h-full px-4 pt-2 pb-0 relative"
    >
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-orange-50/50 to-transparent pointer-events-none" />

      {/* Header */}
      <div className="text-center mb-2 relative z-10 shrink-0">
        <h2 className="text-xl md:text-2xl font-serif font-bold text-stone-800">{text.flavorTitle}</h2>
        <p className="text-stone-500 text-xs mt-1">{text.flavorSub}</p>
      </div>

      {/* Center: The Cup Interaction Area */}
      <div className="flex-1 flex flex-col items-center justify-center relative shrink-0 min-h-0 basis-auto">
        
        {/* The Cup */}
        <motion.div 
          ref={cupRef}
          className="relative w-32 h-40 md:w-40 md:h-48 transition-all duration-300" 
          animate={{ 
            scale: isOverCup ? 1.05 : (dragActiveId ? 1.02 : 1),
          }}
        >
          {/* Glow Effect when dragging over */}
          <AnimatePresence>
            {isOverCup && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute -inset-4 bg-orange-200/50 rounded-[3rem] blur-xl z-0"
              />
            )}
          </AnimatePresence>

          {/* Cup Handle */}
          <div className="absolute top-6 -right-6 md:-right-7 w-8 md:w-10 h-16 md:h-20 border-[5px] border-stone-200 rounded-r-3xl transition-colors duration-300" 
               style={{ borderColor: isOverCup ? '#fb923c' : '#e7e5e4' }} 
          />

          {/* Cup Body */}
          <div 
            className={`
              absolute inset-0 border-[5px] rounded-b-[2.5rem] rounded-t-lg overflow-hidden shadow-xl backdrop-blur-sm z-10 flex flex-col justify-end transition-colors duration-300
              ${isOverCup ? 'border-orange-300 bg-white/95' : 'border-stone-200 bg-white'}
            `}
          >
            
            {/* Liquid */}
            <motion.div 
              initial={false}
              animate={{ 
                height: `${(selectedFlavors.length / 3) * 100}%`,
              }}
              className={`w-full transition-colors duration-700 ease-in-out relative ${getLiquidColor()}`}
              style={{ minHeight: '0%' }}
            >
              {/* Liquid Wave Surface */}
              <div className="absolute -top-3 left-0 right-0 h-6 overflow-hidden">
                 <motion.div 
                   animate={{ x: ['-50%', '0%'] }}
                   transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                   className="w-[200%] h-full flex"
                 >
                    {/* SVG Wave shape repeated */}
                    <div className="w-1/2 h-full bg-white/30 rounded-[50%]" />
                    <div className="w-1/2 h-full bg-white/30 rounded-[50%]" />
                 </motion.div>
              </div>
              
              {/* Bubbles / Floating Icons in Liquid */}
              <div className="absolute inset-0 p-4 flex flex-wrap items-end justify-center content-end gap-2 overflow-hidden pb-8">
                 <AnimatePresence>
                   {selectedFlavors.map((id) => {
                     const f = AVAILABLE_FLAVORS.find(flav => flav.id === id);
                     return (
                       <motion.div
                        key={id}
                        initial={{ opacity: 0, y: 50, scale: 0 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0 }}
                        transition={{ type: "spring", stiffness: 200, damping: 15 }}
                        className="bg-white/90 p-1 rounded-full shadow-sm"
                       >
                          {f?.icon === 'Bean' && <Bean size={10} className="text-stone-800"/>}
                          {f?.icon === 'Sun' && <Sun size={10} className="text-stone-800"/>}
                          {f?.icon === 'Flower' && <Flower size={10} className="text-stone-800"/>}
                          {f?.icon === 'Flame' && <Flame size={10} className="text-stone-800"/>}
                          {f?.icon === 'Droplet' && <Droplet size={10} className="text-stone-800"/>}
                          {f?.icon === 'Sparkles' && <Sparkles size={10} className="text-stone-800"/>}
                       </motion.div>
                     )
                   })}
                 </AnimatePresence>
              </div>

              {/* Splash Effect */}
              <AnimatePresence>
                {showSplash && <SplashParticles color={showSplash.color} />}
              </AnimatePresence>
            </motion.div>

            {/* Empty State Hint */}
            {selectedFlavors.length === 0 && !isOverCup && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                className="absolute inset-0 flex items-center justify-center text-stone-300 pointer-events-none"
              >
                <span className="text-xs md:text-sm font-serif italic">{text.dropHint}</span>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Selected Flavors List */}
        <div className="mt-4 h-6 flex items-center justify-center">
             <AnimatePresence mode="wait">
                <motion.span 
                  key={selectedFlavors.length}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-stone-600 font-medium text-xs"
                >
                  {selectedFlavors.length === 0 
                    ? text.emptyCup
                    // @ts-ignore
                    : selectedFlavors.map(id => text.flavors[id] || id).join(" + ")
                  }
                </motion.span>
             </AnimatePresence>
        </div>
        
        {/* Count Indicator */}
        <div className="mt-1 flex gap-1">
           {[0, 1, 2].map(i => (
             <div 
                key={i} 
                className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${i < selectedFlavors.length ? 'bg-orange-500' : 'bg-stone-200'}`} 
             />
           ))}
        </div>
      </div>

      {/* Bottom: Draggable Flavor Grid */}
      <div className="mt-2 shrink-0 pb-20 md:pb-4">
        <div className="grid grid-cols-3 gap-y-1 gap-x-4 md:gap-x-6 justify-items-center max-w-[280px] mx-auto">
          {AVAILABLE_FLAVORS.map((flavor) => {
            const isSelected = selectedFlavors.includes(flavor.id);
            const isDisabled = !isSelected && isFull;
            // @ts-ignore
            const label = text.flavors[flavor.id] || flavor.id;

            return (
              <div key={flavor.id} className="relative w-14 h-14 md:w-16 md:h-16 flex flex-col items-center justify-center">
                 {/* Placeholder Circle (Stays behind) */}
                 <div className="absolute w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-dashed border-stone-200" />

                 {/* Draggable Circle */}
                 <motion.div
                    drag={!isDisabled && !isSelected}
                    dragSnapToOrigin={true}
                    dragMomentum={false} // Prevents flying off
                    dragElastic={0.1} // Resistance
                    onDragStart={() => setDragActiveId(flavor.id)}
                    onDrag={handleDrag}
                    onDragEnd={(e, info) => handleDragEnd(e, info, flavor)}
                    whileHover={!isDisabled && !isSelected ? { scale: 1.1, cursor: 'grab' } : {}}
                    whileDrag={{ scale: 1.2, zIndex: 50, cursor: 'grabbing' }}
                    onClick={() => {
                        if (isSelected) toggleFlavor(flavor.id, false); // Tap to remove
                    }}
                    className={`
                      w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center shadow-md relative z-10 transition-all duration-300
                      ${flavor.color}
                      ${isSelected ? 'opacity-0 scale-50 pointer-events-none' : 'opacity-100 scale-100'}
                      ${isDisabled ? 'opacity-40 grayscale cursor-not-allowed' : ''}
                    `}
                 >
                    {flavor.icon === 'Bean' && <Bean size={16} className={flavor.id === 'chocolate' ? 'text-white' : 'text-stone-700'}/>}
                    {flavor.icon === 'Sun' && <Sun size={16} className="text-stone-700"/>}
                    {flavor.icon === 'Flower' && <Flower size={16} className="text-stone-700"/>}
                    {flavor.icon === 'Flame' && <Flame size={16} className="text-stone-700"/>}
                    {flavor.icon === 'Droplet' && <Droplet size={16} className="text-stone-700"/>}
                    {flavor.icon === 'Sparkles' && <Sparkles size={16} className="text-stone-700"/>}
                 </motion.div>

                 {/* Checkmark when selected */}
                 {isSelected && (
                     <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute inset-0 flex items-center justify-center z-0 pt-6" 
                     >
                        <Check size={16} className="text-green-500 bg-white rounded-full p-0.5 shadow-sm" />
                     </motion.div>
                 )}

                 {/* Label */}
                 <span className={`text-[9px] md:text-[10px] mt-12 md:mt-14 absolute font-medium ${isSelected ? 'text-stone-300' : 'text-stone-600'} transition-colors whitespace-nowrap`}>
                    {label}
                 </span>
              </div>
            );
          })}
        </div>

        <div className="mt-2 flex justify-center">
           <Button 
            fullWidth={false}
            onClick={onNext} 
            disabled={!isFull}
            className={`transition-all duration-500 py-2 md:py-3 px-8 text-sm w-48 ${isFull ? "opacity-100 translate-y-0" : "opacity-50 translate-y-2"}`}
          >
            {isFull ? text.continueBtn : `${text.moreBtnPrefix}${3 - selectedFlavors.length}${text.moreBtnSuffix}`}
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

// 3. Balance / XY Pad Screen
const BalanceScreen: React.FC<{ 
  coordinates: {x: number, y: number}, 
  setCoordinates: (c: {x: number, y: number}) => void, 
  onGenerate: () => void,
  isLoading: boolean,
  text: typeof TRANSLATIONS['en']
}> = ({ 
  coordinates, 
  setCoordinates, 
  onGenerate,
  isLoading,
  text
}) => {
  const padRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleInteraction = (clientX: number, clientY: number) => {
    if (!padRef.current) return;
    const rect = padRef.current.getBoundingClientRect();
    
    let x = (clientX - rect.left) / rect.width; // 0 to 1
    let y = (clientY - rect.top) / rect.height; // 0 to 1

    // Clamp
    x = Math.max(0, Math.min(1, x));
    y = Math.max(0, Math.min(1, y));

    // Convert to -1 to 1 range for internal logic
    const finalX = (x * 2) - 1;
    const finalY = ((1 - y) * 2) - 1; // Invert Y so up is positive

    setCoordinates({ x: finalX, y: finalY });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }} 
      animate={{ opacity: 1, x: 0 }} 
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col h-full p-6 relative"
    >
      <div className="shrink-0 text-center mb-4">
        <h2 className="text-2xl font-bold text-stone-800">{text.balanceTitle}</h2>
        <p className="text-stone-500 text-xs">{text.balanceSub}</p>
      </div>

      <div className="flex-1 flex items-center justify-center relative min-h-0">
        {/* Labels */}
        <div className="absolute top-0 text-[10px] font-bold tracking-widest text-stone-400">{text.heavy}</div>
        <div className="absolute bottom-0 text-[10px] font-bold tracking-widest text-stone-400">{text.light}</div>
        <div className="absolute left-0 -rotate-90 text-[10px] font-bold tracking-widest text-stone-400">{text.deep}</div>
        <div className="absolute right-0 rotate-90 text-[10px] font-bold tracking-widest text-stone-400">{text.bright}</div>

        {/* Pad - Responsive Size with max-height constraint */}
        <div 
          ref={padRef}
          className="w-full max-w-[280px] aspect-square max-h-[50vh] bg-white rounded-3xl shadow-inner border border-stone-100 relative touch-none cursor-crosshair overflow-hidden mx-6"
          onPointerDown={(e) => {
            setIsDragging(true);
            handleInteraction(e.clientX, e.clientY);
          }}
          onPointerMove={(e) => {
            if(isDragging) handleInteraction(e.clientX, e.clientY);
          }}
          onPointerUp={() => setIsDragging(false)}
          onPointerLeave={() => setIsDragging(false)}
        >
          {/* Grid lines */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
            <div className="w-full h-px bg-stone-400"></div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
            <div className="h-full w-px bg-stone-400"></div>
          </div>

          {/* Cursor */}
          <motion.div 
            className="absolute w-10 h-10 bg-orange-500/20 backdrop-blur-md rounded-full border-2 border-orange-600 shadow-xl flex items-center justify-center"
            style={{
              left: `${((coordinates.x + 1) / 2) * 100}%`,
              top: `${(1 - (coordinates.y + 1) / 2) * 100}%`,
              x: '-50%',
              y: '-50%'
            }}
          >
             <div className="w-2.5 h-2.5 bg-orange-600 rounded-full"></div>
          </motion.div>
          
          {/* Dynamic background gradient based on position */}
          <div 
             className="absolute inset-0 pointer-events-none opacity-20 transition-colors duration-500"
             style={{
               background: `radial-gradient(circle at ${((coordinates.x + 1) / 2) * 100}% ${(1 - (coordinates.y + 1) / 2) * 100}%, rgba(249, 115, 22, 0.4), transparent 70%)`
             }}
          />
        </div>
      </div>

       <div className="pt-4 shrink-0 pb-16 md:pb-0">
         <Button 
          fullWidth 
          onClick={onGenerate} 
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <Sparkles className="animate-spin" size={18}/> {text.brewing}
            </span>
          ) : text.revealBtn}
        </Button>
      </div>
    </motion.div>
  );
};

// 4. Flavor Radar Hexagon
const FlavorRadar: React.FC<{ data: RadarData, text: typeof TRANSLATIONS['en'] }> = ({ data, text }) => {
  // Config
  const size = 200;
  const center = size / 2;
  const radius = 80; // Max radius
  
  // Data keys in order
  const metrics = [
    { key: 'sweetness', label: text.flavors.sweet },
    { key: 'acidity', label: text.flavors.citrus }, // Mapping simple terms
    { key: 'body', label: 'BODY' },
    { key: 'bitterness', label: 'BITTER' },
    { key: 'aroma', label: text.flavors.floral }, // Using floral as proxy for aroma label or generic
    { key: 'aftertaste', label: 'FINISH' },
  ];

  // Override labels with generic localized ones for the radar specifically if needed, 
  // or use the ones from flavors. Let's make it robust:
  const labels = [
    text.flavors.sweet,
    "ACID",
    "BODY",
    "BITTER",
    "AROMA",
    "FINISH"
  ];
  // Simple mapping for demo, in real app expand translations
  
  // Helper to get point coordinates
  const getPoint = (value: number, index: number, total: number) => {
    const angle = (Math.PI * 2 * index) / total - Math.PI / 2; // Start at top
    // Value 1-10 mapped to 0-radius
    const r = (value / 10) * radius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y };
  };

  // Generate path string for data
  const dataPath = metrics.map((m, i) => {
    // @ts-ignore
    const val = data[m.key] || 5;
    const p = getPoint(val, i, metrics.length);
    return `${p.x},${p.y}`;
  }).join(' ');

  // Generate background webs (levels 2, 4, 6, 8, 10)
  const webs = [2, 4, 6, 8, 10].map(level => {
    return metrics.map((_, i) => {
      const p = getPoint(level, i, metrics.length);
      return `${p.x},${p.y}`;
    }).join(' ');
  });

  return (
    <div className="w-full flex justify-center py-4">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
        {/* Background Grids */}
        {webs.map((points, i) => (
          <polygon 
            key={i} 
            points={points} 
            fill="none" 
            stroke="#e7e5e4" 
            strokeWidth="1" 
            className="opacity-50"
          />
        ))}
        
        {/* Axis Lines */}
        {metrics.map((_, i) => {
          const p = getPoint(10, i, metrics.length);
          return (
            <line 
              key={`axis-${i}`} 
              x1={center} 
              y1={center} 
              x2={p.x} 
              y2={p.y} 
              stroke="#e7e5e4" 
              strokeWidth="1" 
              strokeDasharray="4 2"
            />
          );
        })}

        {/* Data Polygon */}
        <motion.polygon
          initial={{ opacity: 0, scale: 0, transformOrigin: 'center' }}
          animate={{ opacity: 0.8, scale: 1 }}
          transition={{ duration: 1, type: 'spring' }}
          points={dataPath}
          fill="rgba(249, 115, 22, 0.4)"
          stroke="#ea580c"
          strokeWidth="2"
        />

        {/* Labels */}
        {metrics.map((m, i) => {
          // Push labels out a bit further than radius 10
          const p = getPoint(12.5, i, metrics.length); 
          return (
            <text 
              key={`label-${i}`} 
              x={p.x} 
              y={p.y} 
              textAnchor="middle" 
              dominantBaseline="middle" 
              className="text-[10px] font-bold uppercase fill-stone-500 tracking-wider"
            >
              {labels[i]}
            </text>
          );
        })}
      </svg>
    </div>
  );
};

// 5. Result Screen
const ResultScreen: React.FC<{ 
  result: CoffeeResult, 
  onRestart: () => void,
  text: typeof TRANSLATIONS['en']
}> = ({ result, onRestart, text }) => {
  if (!result) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="flex flex-col h-full overflow-y-auto pb-24 scrollbar-hide"
    >
      {/* Top Image / Pattern Header */}
      <div className="relative h-48 bg-stone-900 overflow-hidden shrink-0">
         <div className="absolute inset-0 bg-gradient-to-br from-orange-900/40 to-black/60 z-10" />
         {/* Abstract background blobs */}
         <div className="absolute -top-10 -right-10 w-64 h-64 bg-orange-600 rounded-full mix-blend-overlay blur-3xl opacity-60 animate-pulse" />
         <div className="absolute top-20 -left-10 w-48 h-48 bg-amber-500 rounded-full mix-blend-overlay blur-3xl opacity-50" />
         
         <div className="absolute bottom-4 left-6 z-20">
             <div className="flex items-center gap-2 mb-1">
                <MapPin size={14} className="text-orange-300" />
                <span className="text-orange-200 text-xs font-bold tracking-widest uppercase">
                  {result.origin}
                </span>
             </div>
             <h1 className="text-3xl font-serif font-bold text-white leading-tight max-w-[80%]">
               {result.title}
             </h1>
         </div>

         <div className="absolute top-6 right-6 z-20 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-3 py-1 flex items-center gap-1">
             <span className="text-white font-bold text-sm">{result.matchScore}%</span>
             <Sparkles size={12} className="text-yellow-300" />
         </div>
      </div>

      <div className="px-6 -mt-6 relative z-20">
        
        {/* Story Card */}
        <div className="bg-white rounded-2xl p-5 shadow-xl shadow-stone-200/50 mb-6">
           <p className="font-serif italic text-stone-600 leading-relaxed text-sm border-l-2 border-orange-300 pl-3">
             "{result.story}"
           </p>
        </div>

        {/* Flavor Radar */}
        <div className="mb-6">
           <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest text-center mb-2">{text.flavorRadar}</h3>
           {result.radarData && <FlavorRadar data={result.radarData} text={text} />}
        </div>

        {/* Tasting Notes */}
        <div className="mb-6">
           <div className="flex flex-wrap gap-2 justify-center">
             {result.tastingNotes.map((note, i) => (
               <span key={i} className="bg-stone-100 text-stone-700 border border-stone-200 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide">
                 {note}
               </span>
             ))}
           </div>
        </div>

        {/* Terroir & Details Grid */}
        <div className="grid grid-cols-2 gap-3 mb-8">
           {/* Region */}
           <div className="bg-stone-50 p-4 rounded-xl border border-stone-100">
              <div className="flex items-center gap-2 mb-2 text-stone-400">
                 <MapPin size={14} />
                 <span className="text-[10px] font-bold uppercase tracking-wider">{text.region}</span>
              </div>
              <p className="text-stone-800 font-serif font-medium text-sm">{result.region}</p>
           </div>

           {/* Altitude */}
           <div className="bg-stone-50 p-4 rounded-xl border border-stone-100">
              <div className="flex items-center gap-2 mb-2 text-stone-400">
                 <Mountain size={14} />
                 <span className="text-[10px] font-bold uppercase tracking-wider">{text.altitude}</span>
              </div>
              <p className="text-stone-800 font-serif font-medium text-sm">{result.altitude}</p>
           </div>

           {/* Process */}
           <div className="bg-stone-50 p-4 rounded-xl border border-stone-100">
              <div className="flex items-center gap-2 mb-2 text-stone-400">
                 <Layers size={14} />
                 <span className="text-[10px] font-bold uppercase tracking-wider">{text.process}</span>
              </div>
              <p className="text-stone-800 font-serif font-medium text-sm">{result.process}</p>
           </div>

           {/* Roast */}
           <div className="bg-stone-50 p-4 rounded-xl border border-stone-100">
              <div className="flex items-center gap-2 mb-2 text-stone-400">
                 <Flame size={14} />
                 <span className="text-[10px] font-bold uppercase tracking-wider">{text.roast}</span>
              </div>
              <p className="text-stone-800 font-serif font-medium text-sm">{result.roastLevel}</p>
           </div>
        </div>

        <Button onClick={onRestart} variant="secondary" fullWidth className="mb-4">
          {text.brewAnother}
        </Button>
      </div>
    </motion.div>
  );
};

// 5. Passport/History Screen
const PassportScreen: React.FC<{ history: HistoryEntry[], text: typeof TRANSLATIONS['en'] }> = ({ history, text }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="flex flex-col h-full p-6 pb-24" // Extra padding bottom
    >
      <h2 className="text-2xl font-serif font-bold text-stone-800 mb-6 text-center">{text.passportTitle}</h2>
      
      <div className="flex-1 overflow-y-auto pr-2">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-stone-400">
             <History size={48} className="mb-4 opacity-20"/>
             <p>{text.noHistory}</p>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-3">
             {history.map((entry, idx) => (
               <motion.div 
                  key={idx}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className="aspect-[4/5] rounded-2xl bg-white shadow-sm border border-stone-100 flex flex-col items-center justify-between p-2 relative overflow-hidden"
               >
                 <div className={`absolute inset-0 opacity-20 ${entry.moodColor} blur-xl scale-150`}></div>
                 <span className="text-[10px] text-stone-400 font-bold relative z-10">
                   {new Date(entry.date).getDate()}
                 </span>
                 <Bean size={20} className="text-stone-800 relative z-10" />
                 <div className="h-1 w-full bg-stone-100 rounded-full mt-1 overflow-hidden relative z-10">
                   <div className="h-full bg-orange-400 w-2/3"></div>
                 </div>
               </motion.div>
             ))}
             
             {/* Placeholders to fill grid like the image */}
             {Array.from({ length: Math.max(0, 12 - history.length) }).map((_, i) => (
                <div key={`p-${i}`} className="aspect-[4/5] rounded-2xl border border-dashed border-stone-200 flex items-center justify-center opacity-50">
                  <Plus size={16} className="text-stone-300"/>
                </div>
             ))}
          </div>
        )}

        {history.length > 0 && (
           <div className="mt-8 bg-white p-4 rounded-2xl shadow-sm border border-stone-100">
              <h3 className="font-serif font-bold text-lg mb-2">{text.latestInsight}</h3>
              <p className="text-sm text-stone-500 leading-relaxed">
                {text.insightText}
              </p>
           </div>
        )}
      </div>
    </motion.div>
  );
};

// 6. Chat Overlay
const ChatOverlay = ({ isOpen, onClose, text, language }: { isOpen: boolean, onClose: () => void, text: typeof TRANSLATIONS['en'], language: Language }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{ id: '1', role: 'model', text: text.chatWelcome }]);
    }
  }, [isOpen, text]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      const history = messages.map(m => ({ role: m.role, text: m.text }));
      const responseText = await chatWithBarista(history, userMsg.text, language);
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'model', text: responseText }]);
    } catch (e) {
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'model', text: text.chatError }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 0.5 }} 
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ y: '100%' }} 
            animate={{ y: 0 }} 
            exit={{ y: '100%' }}
            className="fixed inset-x-0 bottom-0 h-[85vh] bg-stone-50 z-50 rounded-t-[2rem] shadow-2xl flex flex-col overflow-hidden"
          >
            <div className="p-4 border-b border-stone-200 flex justify-between items-center bg-white">
              <h3 className="font-serif font-bold text-xl ml-2">{text.chatTitle}</h3>
              <button onClick={onClose} className="p-2 hover:bg-stone-100 rounded-full">
                <XIcon size={24} className="text-stone-500"/>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
              {messages.map(m => (
                <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`
                    max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed
                    ${m.role === 'user' 
                      ? 'bg-orange-600 text-white rounded-tr-sm' 
                      : 'bg-white border border-stone-200 text-stone-800 rounded-tl-sm shadow-sm'}
                  `}>
                    {m.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                   <div className="bg-stone-100 p-3 rounded-2xl rounded-tl-sm flex gap-1">
                      <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce delay-75"></div>
                      <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce delay-150"></div>
                   </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-white border-t border-stone-200 pb-8">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder={text.chatPlaceholder}
                  className="flex-1 bg-stone-100 rounded-full px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
                />
                <button 
                  onClick={handleSend}
                  disabled={!input.trim() || isTyping}
                  className="bg-orange-600 text-white p-3 rounded-full hover:bg-orange-700 disabled:opacity-50"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// --- MAIN APP COMPONENT ---

export default function App() {
  const [screen, setScreen] = useState<AppScreen>(AppScreen.WELCOME);
  const [selectedFlavors, setSelectedFlavors] = useState<string[]>([]);
  const [balance, setBalance] = useState({ x: 0, y: 0 }); // -1 to 1
  const [result, setResult] = useState<CoffeeResult | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [language, setLanguage] = useState<Language>('en');

  const text = TRANSLATIONS[language];

  // Initialize fake history
  useEffect(() => {
    setHistory([]);
  }, []);

  const toggleFlavor = (id: string, isAdding: boolean) => {
    if (isAdding) {
      if (!selectedFlavors.includes(id) && selectedFlavors.length < 3) {
        setSelectedFlavors(prev => [...prev, id]);
      }
    } else {
      setSelectedFlavors(prev => prev.filter(f => f !== id));
    }
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    const newResult = await generateCoffeeBlend(selectedFlavors, balance.x, balance.y, language);
    setResult(newResult);
    
    // Add to history
    const moodColor = balance.x > 0 ? 'bg-yellow-200' : 'bg-indigo-200';
    setHistory(prev => [{
      date: new Date().toISOString(),
      result: newResult,
      moodColor
    }, ...prev]);

    setIsLoading(false);
    setScreen(AppScreen.RESULT);
  };

  const handleRestart = () => {
    setSelectedFlavors([]);
    setBalance({ x: 0, y: 0 });
    setResult(null);
    setScreen(AppScreen.WELCOME);
  };

  // Navigation Logic for Back Button
  const goBack = () => {
    if (screen === AppScreen.FLAVOR_SELECT) setScreen(AppScreen.WELCOME);
    if (screen === AppScreen.BALANCE) setScreen(AppScreen.FLAVOR_SELECT);
    if (screen === AppScreen.RESULT) setScreen(AppScreen.BALANCE); // Or welcome
    if (screen === AppScreen.PASSPORT) setScreen(AppScreen.WELCOME);
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'zh' : 'en');
  };

  return (
    <div className="min-h-screen w-full bg-stone-50 flex items-center justify-center p-0 md:p-8">
      {/* Mobile Frame Container */}
      <div className="w-full h-screen md:h-[850px] md:max-w-[400px] bg-[#fdfcf8] md:rounded-[3rem] shadow-2xl relative overflow-hidden flex flex-col border-[8px] border-stone-900">
        
        {/* Dynamic Notch/Header Area */}
        <div className="absolute top-0 inset-x-0 h-14 z-20 flex justify-between items-center px-6 pt-4">
          
          {/* Left: Back Button or Spacer */}
          <div>
            {screen !== AppScreen.WELCOME && (
              <button onClick={goBack} className="p-2 rounded-full hover:bg-stone-100/50 text-stone-800 transition-colors bg-white/50 backdrop-blur-sm">
                <ArrowLeft size={20} />
              </button>
            )}
          </div>
          
          {/* Right: Language & Passport */}
          <div className="flex gap-2">
             {/* Language Toggle */}
             <button 
                onClick={toggleLanguage}
                className="flex items-center gap-1 text-stone-500 hover:text-stone-800 transition-colors bg-white/50 backdrop-blur-sm px-2 py-1 rounded-full text-[10px] font-bold tracking-wider"
             >
                <Globe size={14} />
                {language === 'en' ? 'EN' : '中'}
             </button>

             {screen !== AppScreen.PASSPORT && screen !== AppScreen.WELCOME && (
               <button onClick={() => setScreen(AppScreen.PASSPORT)} className="text-stone-400 hover:text-stone-800 transition-colors bg-white/50 backdrop-blur-sm p-2 rounded-full">
                  <History size={20} />
               </button>
             )}
             {screen === AppScreen.PASSPORT && (
               <button onClick={() => setScreen(AppScreen.WELCOME)} className="text-stone-400 hover:text-stone-800 transition-colors bg-white/50 backdrop-blur-sm p-2 rounded-full">
                  <XIcon size={20} />
               </button>
             )}
          </div>
        </div>

        {/* Content Area - Now scrollable if needed */}
        <div className="flex-1 relative pt-14 pb-20 overflow-y-auto scrollbar-hide">
          <AnimatePresence mode="wait">
            {screen === AppScreen.WELCOME && (
              <WelcomeScreen key="welcome" onStart={() => setScreen(AppScreen.FLAVOR_SELECT)} text={text} />
            )}
            {screen === AppScreen.FLAVOR_SELECT && (
              <FlavorScreen 
                key="flavor" 
                selectedFlavors={selectedFlavors}
                toggleFlavor={toggleFlavor}
                onNext={() => setScreen(AppScreen.BALANCE)}
                text={text}
              />
            )}
            {screen === AppScreen.BALANCE && (
              <BalanceScreen 
                key="balance" 
                coordinates={balance}
                setCoordinates={setBalance}
                onGenerate={handleGenerate}
                isLoading={isLoading}
                text={text}
              />
            )}
            {screen === AppScreen.RESULT && result && (
              <ResultScreen key="result" result={result} onRestart={handleRestart} text={text} />
            )}
            {screen === AppScreen.PASSPORT && (
              <PassportScreen key="passport" history={history} text={text} />
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Action Bar (Persistent chat button) */}
        <div className="absolute bottom-6 inset-x-0 flex justify-center z-20 pointer-events-none">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsChatOpen(true)}
            className="pointer-events-auto bg-stone-900 text-white px-5 py-2.5 rounded-full flex items-center gap-2 shadow-lg font-medium text-xs"
          >
            <MessageCircle size={16} />
            {text.askBarista}
          </motion.button>
        </div>

        <ChatOverlay 
          isOpen={isChatOpen} 
          onClose={() => setIsChatOpen(false)} 
          text={text} 
          language={language}
        />
      </div>
    </div>
  );
}