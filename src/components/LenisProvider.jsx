"use client"; // This component needs to be a Client Component

import { ReactLenis } from "@studio-freight/react-lenis";
import React from "react";

function LenisProvider({ children }) {
  return (
    <ReactLenis root options={{ lerp: 0.1, duration: 1.5, smoothTouch: true }}>
      {children}
    </ReactLenis>
  );
}

export default LenisProvider;
