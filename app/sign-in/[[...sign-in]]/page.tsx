import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-lavender-glow pt-32 pb-20 px-6">
      <SignIn 
        appearance={{
          elements: {
            rootBox: 'shadow-2xl rounded-[3rem] overflow-hidden border border-white/50',
            card: 'bg-white/80 backdrop-blur-xl border-none shadow-none p-10',
            formButtonPrimary: 'bg-navy hover:bg-blue transition-all text-sm uppercase tracking-widest font-black py-4 rounded-2xl',
            headerTitle: 'font-outfit font-black text-4xl uppercase tracking-tighter italic text-navy mb-2',
            headerSubtitle: 'font-bold text-navy/40 italic text-base',
            footerActionLink: 'text-blue hover:text-navy transition-colors font-bold',
            identityPreviewText: 'font-bold text-navy/60',
            formFieldLabel: 'font-black uppercase tracking-widest text-[10px] text-navy/50 mb-2'
          }
        }}
      />
    </div>
  );
}
