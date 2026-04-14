import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)] bg-[#D8D9F4]/20 p-6">
      <div className="w-full max-w-md bg-white rounded-[3rem] shadow-2xl overflow-hidden p-8 border border-navy/5">
        <SignUp 
          appearance={{
            elements: {
              formButtonPrimary: 'bg-navy hover:bg-[#405DFF] transition-all text-sm uppercase tracking-widest font-black',
              card: 'shadow-none border-none p-0',
              headerTitle: 'font-outfit font-black text-3xl uppercase tracking-tighter italic text-navy',
              headerSubtitle: 'font-bold text-navy/40 italic',
              footerActionLink: 'text-blue hover:text-navy transition-colors font-bold'
            }
          }}
        />
      </div>
    </div>
  );
}
