import { notFound } from "next/navigation";

const LabLayout = ({ children }: { children: React.ReactNode }) => {
  if (process.env.VERCEL_ENV === "production") {
    notFound();
  }

  return (
    <main lang="zh-TW" className="min-h-dvh bg-neutral-950 text-neutral-300">
      {children}
    </main>
  );
};

export default LabLayout;
