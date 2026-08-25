import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-center">
      <h2 className="text-2xl font-bold text-foreground">पेज फेला परेन (Page Not Found)</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        तपाईंले खोज्नुभएको पृष्ठ फेला परेन।
      </p>
      <Link
        href="/"
        className="mt-4 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-90 transition-opacity"
      >
        गृहपृष्ठमा फर्कनुहोस् (Go Home)
      </Link>
    </div>
  );
}
