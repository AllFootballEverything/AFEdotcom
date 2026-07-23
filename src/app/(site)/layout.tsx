import { Footer } from "@/components/site/Footer";
import { Nav } from "@/components/site/Nav";
import { getViewer } from "@/lib/auth/viewer";
import { getSiteSettings } from "@/sanity/queries";
import { safeFetch } from "@/sanity/safe";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settings, viewer] = await Promise.all([
    safeFetch(getSiteSettings, null, "siteSettings"),
    getViewer(),
  ]);

  return (
    <>
      <Nav
        navCta={settings?.navCta}
        viewerName={viewer.name ?? viewer.username}
        isSignedIn={viewer.isSignedIn}
        showBookNow={settings?.showBookNowButton}
        showLogin={settings?.showLoginButton}
        showCart={settings?.showCartButton}
      />
      <main>{children}</main>
      <Footer settings={settings} />
    </>
  );
}
