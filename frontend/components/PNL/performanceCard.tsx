export default function PerformanceCard() {
  return (
    <div className="bg-black/60 border border-white/10 rounded-xl p-6 col-span-2 backdrop-blur-sm">
      <h3 className="text-sm text-gray-400 mb-4">Performance</h3>

      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span>Unrealized PNL</span>
          <span className="text-red-400">-$97.05</span>
        </div>

        <div className="flex justify-between">
          <span>Realized PNL</span>
          <span className="text-red-400">-$148.93</span>
        </div>

        <div className="flex justify-between">
          <span>Total TXNS</span>
          <span className="text-green-400">99 / 50</span>
        </div>
      </div>

      {/* BARS */}
      <div className="mt-6 space-y-2 text-xs">
        <div className="flex justify-between"><span>&gt; 500%</span><span>1</span></div>
        <div className="flex justify-between"><span>200% - 500%</span><span>0</span></div>
        <div className="flex justify-between"><span>0% - 200%</span><span>22</span></div>
        <div className="flex justify-between"><span>0% - -50%</span><span>22</span></div>
        <div className="flex justify-between"><span>&lt; -50%</span><span>5</span></div>

        <div className="h-2 rounded-full overflow-hidden flex mt-2">
          <div className="bg-green-500 w-[40%]" />
          <div className="bg-pink-500 w-[60%]" />
        </div>
      </div>
    </div>
  );
}
