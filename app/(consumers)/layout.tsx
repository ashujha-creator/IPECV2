import Header from "@/components/MenuBuilder/Header";
import NavbarServer from "@/components/MenuBuilder/NavbarServer";

export default function consumerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex-1">
      <Header />
      <NavbarServer />
      {children}
    </main>
  );
}
