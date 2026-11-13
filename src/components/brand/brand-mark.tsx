import Image from "next/image";
import { cn } from "@/lib/utils/cn";
export function BrandMark({ compact = false, className }: { compact?: boolean; className?: string }) {
  if (compact) return <Image src="/brand/icon.png" alt="Smart Learn" width={1254} height={1254} sizes="44px" className={cn("h-11 w-11 object-contain", className)} />;
  return <span className={cn("brand-wordmark relative inline-block shrink-0", className)}>
    <Image src="/brand/horizontal-light.png" alt="Smart Learn · Academic Intelligence" width={1448} height={1086} sizes="228px" className="h-full w-full object-cover dark:hidden" />
    <Image src="/brand/horizontal-dark.png" alt="Smart Learn · Academic Intelligence" width={1448} height={1086} sizes="228px" className="hidden h-full w-full object-cover dark:block" />
  </span>;
}
