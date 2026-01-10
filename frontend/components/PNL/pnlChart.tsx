export default function PnlChart() {
  return (
    <div className="bg-black/60 border border-white/10 rounded-xl p-6 h-[300px] relative backdrop-blur-sm">
      <h2 className="text-sm text-gray-300 mb-4">Realized PNL</h2>

      {/* FAKE CHART */}
      <div className="absolute inset-0 flex items-center justify-center text-gray-500">
        Chart placeholder (TradingView / Recharts)
      </div>
    </div>
  );
}
