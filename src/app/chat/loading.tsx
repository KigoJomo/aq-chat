import { LoaderCircle } from "lucide-react";

export default function Loading() {
  return (
    <section className="w-full flex-1 flex flex-col items-center justify-center">
      <LoaderCircle size={96} className="animate-spin opacity-30" />
    </section>
  )
}