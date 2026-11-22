import { notFound } from "next/navigation";
import { useLocale } from "next-intl";

const LabLayout = ({ children }: { children: React.ReactNode }) => {
  if (process.env.VERCEL_ENV === "production") {
    notFound();
  }

  const locale = useLocale();

  return (
    <main lang={locale} className="min-h-dvh text-parchment/90">
      {children}
    </main>
  );
};

export default LabLayout;
