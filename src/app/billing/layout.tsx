import "@/styles/app.css";

export default function BillingCheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="fj-checkout-shell">
      <main className="fj-checkout-return">{children}</main>
    </div>
  );
}
