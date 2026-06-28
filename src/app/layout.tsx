import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Centro Sportivo Roero — Nuota. Cresci. Vivi.",
  description:
    "Cinque piscine nel cuore del Roero e del Cuneese. Corsi di nuoto per ogni età, agonismo, acquagym e benessere in acqua.",
};

// Imposta il tema prima del paint per evitare il flash (FOUC).
const themeScript = `
(function(){try{var t=localStorage.getItem('csr-theme');if(t){document.documentElement.setAttribute('data-theme',t);}}catch(e){}})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it" data-theme="light" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700;800&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://unpkg.com/@phosphor-icons/web@2.1.1/src/regular/style.css"
        />
        <link
          rel="stylesheet"
          href="https://unpkg.com/@phosphor-icons/web@2.1.1/src/fill/style.css"
        />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
