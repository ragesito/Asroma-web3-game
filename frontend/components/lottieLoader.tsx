"use client";

import Lottie from "lottie-react";
import loaderAnimation from "../public/lotties/loadinv1.json";

export default function LottieLoader({ size = 400 }) {
  return (
    <div className="flex items-center justify-center">
      <Lottie
        animationData={loaderAnimation}
        loop={true}
        style={{ width: size, height: size }}
      />
    </div>
  );
}
