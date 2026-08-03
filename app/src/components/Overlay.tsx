import type { ReactNode } from "react";

interface OverlayProps {
  children: ReactNode;
}

const Overlay = ({children}: OverlayProps) => {
  return (
    <section className="flex flex-col max-w-6xl mx-auto px-6 py-16">
        {children}
    </section>
  )
}

export default Overlay