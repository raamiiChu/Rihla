import { notFound } from "next/navigation";

const LabLayout = ({ children }: { children: React.ReactNode }) => {
  if (process.env.VERCEL_ENV === "production") {
    notFound();
  }

  return (
    <main lang="zh-TW" className="min-h-dvh text-parchment/90">
      {children}
    </main>
  );
};

export default LabLayout;
