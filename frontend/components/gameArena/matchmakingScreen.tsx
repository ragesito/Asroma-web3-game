"use client";

import { useTranslation } from "react-i18next";
import Lottie from "lottie-react";
import loaderAnimation from "../../public/lotties/finding.json";

export default function MatchmakingScreen({
  onCancel,
  size = 400,
}: {
  onCancel: () => void;
  size?: number; 
}) {
  const { t } = useTranslation();
  return (
    <div className="fixed inset-0 bg-black/50  flex flex-col items-center justify-center text-white z-50 px-4 sm:px-6 md:px-10">
      {/* Lottie animation */}
      <div className="flex items-center justify-center">
        <Lottie
          animationData={loaderAnimation}
          loop={true}
          style={{ width: size, height: size }}
        />
      </div>

      {/* cancel button */}
      <button
        onClick={onCancel}
        className=" bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-white font-semibold transition"
      >
       {t("cancel")}
      </button>
    </div>
  );
}
