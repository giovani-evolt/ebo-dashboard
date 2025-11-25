import evoltLogo from "@/assets/logos/evolt-logo.webp";
import Image from "next/image";

export function Logo() {
  return (
    <div className="flex justify-center rounded-lg bg-gray-3 p-4 dark:bg-dark">
      <Image
        src={evoltLogo}
        alt="Evolt logo"
        role="presentation"
        quality={100}
        height={80}
        width={432}
        className="h-20 w-auto"
      />
    </div>
  );
}
