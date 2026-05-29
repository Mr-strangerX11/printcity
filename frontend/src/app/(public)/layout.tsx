import { Navbar } from '@/components/layout/Navbar';
import { CategoryBar } from '@/components/layout/CategoryBar';
import { Footer } from '@/components/layout/Footer';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <CategoryBar />
      <main>{children}</main>
      <Footer />
    </>
  );
}
