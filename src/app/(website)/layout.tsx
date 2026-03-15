import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/layout/WhatsAppButton";
import InfluencerBanner from "@/components/layout/InfluencerBanner";
import TrackingScript from "@/components/layout/TrackingScript";

export default function WebsiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <InfluencerBanner />
      <Navbar />
      <main className="min-h-screen">{children}</main>
      <Footer />
      <WhatsAppButton />
      <TrackingScript />
    </>
  );
}
