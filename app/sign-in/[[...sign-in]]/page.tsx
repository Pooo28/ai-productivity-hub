import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-80px)] bg-[#D8D9F4]/20 p-6">
      <SignIn 
        appearance={{
          elements: {
            formButtonPrimary: 'bg-navy hover:bg-[#405DFF] transition-all text-sm uppercase tracking-widest font-black',
            card: 'shadow-2xl border border-navy/5 rounded-[3rem] p-8',
            headerTitle: 'font-outfit font-black text-3xl uppercase tracking-tighter italic text-navy',
            headerSubtitle: 'font-bold text-navy/40 italic',
            footerActionLink: 'text-blue hover:text-navy transition-colors font-bold'
          }
        }}
      />
    </div>
  );
}
