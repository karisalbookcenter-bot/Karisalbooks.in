export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="container flex h-16 items-center justify-between text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Bookery. All rights reserved.</p>
        <p>Built with Next.js &amp; Supabase</p>
      </div>
    </footer>
  );
}
