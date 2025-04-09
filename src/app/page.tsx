import { Logo } from '@/shared/components/ui/Logo';

export default function HomePage() {
  return (
    <section className="flex-1 flex flex-col items-center justify-center gap-6">
      <Logo size={256} />
      <h1 className="text-solid-foreground mb-2 !normal-case">
        Hi 👋, I&apos;m Aq!
      </h1>
    </section>
  );
}
