import { ArrowLeft, Headphones, Mail, MessageCircle } from "lucide-react";
import Link from "next/link";

const channels = [
  {
    icon: MessageCircle,
    title: "Chat with us",
    detail: "Reach the IIBSO team on WhatsApp during store hours.",
    action: "+254 700 000 000",
    href: "#",
  },
  {
    icon: Mail,
    title: "Email support",
    detail: "Order or account questions answered within one business day.",
    action: "support@iibso.co.ke",
    href: "mailto:support@iibso.co.ke",
  },
  {
    icon: Headphones,
    title: "Order help line",
    detail: "For urgent help with a delivery or pickup order.",
    action: "+254 700 000 000",
    href: "#",
  },
];

export default function SupportPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container max-w-3xl space-y-8 px-4 py-8">
        <header>
          <Link
            href="/"
            className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Back to store
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            How can we help?
          </h1>
          <p className="mt-1 text-muted-foreground">
            Questions about an order, a delivery, or your account — we&apos;re
            here for you.
          </p>
        </header>

        <div className="grid gap-4 sm:grid-cols-3">
          {channels.map((channel) => (
            <Link
              key={channel.title}
              href={channel.href}
              className="group rounded-lg border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <channel.icon className="h-6 w-6 text-primary" />
              <h2 className="mt-3 font-bold text-foreground group-hover:text-primary transition-colors">
                {channel.title}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {channel.detail}
              </p>
              <p className="mt-3 text-sm font-semibold text-primary">
                {channel.action}
              </p>
            </Link>
          ))}
        </div>

        <div className="rounded-lg border border-border bg-card/50 p-6 text-center">
          <p className="text-sm font-semibold text-foreground">
            Tracking an order?
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Use the order ID from your confirmation to see live status.
          </p>
          <Link
            href="/track-order"
            className="mt-4 inline-flex rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Track my order
          </Link>
        </div>
      </div>
    </main>
  );
}
