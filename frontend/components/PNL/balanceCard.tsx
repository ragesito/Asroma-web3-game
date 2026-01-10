export default function BalanceCard() {
  return (
    <div className="bg-black/60 border border-white/10 rounded-xl p-6 backdrop-blur-sm">
      <h3 className="text-sm text-gray-400 mb-4">Balance</h3>

      <div className="space-y-4">
        <div>
          <p className="text-xs text-gray-400">Total Value</p>
          <p className="text-xl font-semibold">$1.1</p>
        </div>

        <div>
          <p className="text-xs text-gray-400">Unrealized PNL</p>
          <p className="text-lg">$0</p>
        </div>

        <div>
          <p className="text-xs text-gray-400">Available Balance</p>
          <p className="text-lg">$0.77</p>
        </div>
      </div>
    </div>
  );
}
