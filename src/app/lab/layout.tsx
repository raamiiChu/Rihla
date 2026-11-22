import { notFound } from "next/navigation";
import { useLabLocale } from "./_i18n";

const LabLayout = ({ children }: { children: React.ReactNode }) => {
  if (process.env.VERCEL_ENV === "production") {
    notFound();
  }

  const locale = useLabLocale();

  return (
    // Both lab locales are left-to-right; set it explicitly so the lab never
    // inherits dir="rtl" from <html> if the site adds Arabic.
    <main lang={locale} dir="ltr" className="min-h-dvh text-parchment/90">
      {children}
    </main>
  );
};

export default LabLayout;
