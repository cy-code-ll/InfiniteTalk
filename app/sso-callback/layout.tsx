export default function SSOCallbackLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          nav {
            display: none !important;
          }
          main {
            min-height: 100vh !important;
          }
        `
      }} />
      {children}
    </>
  );
}

