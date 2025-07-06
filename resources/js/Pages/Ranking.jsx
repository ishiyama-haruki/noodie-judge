export default function Ranking({ items }) {
  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold mb-4 text-center">ランキング</h2>
      <a
        href="/"
        className="mb-3 text-blue-600 hover:text-blue-800 underline cursor-pointer block text-center"
      >
        計算画面へ
      </a>
      <div className="space-y-4">
        {items.map((item, i) => {
          const rank = i + 1;

          // 1~3位の装飾クラス
          let rankClass = "";
          if (rank === 1) rankClass = "bg-yellow-300 border-yellow-400";
          else if (rank === 2) rankClass = "bg-gray-300 border-gray-400";
          else if (rank === 3) rankClass = "bg-orange-300 border-orange-400";

          return (
            <div
              key={i}
              className={`border rounded shadow p-2 flex items-center gap-4 ${rankClass}`}
            >
              <div className="text-xl font-bold w-14 text-center">
                {rank}位
              </div>
              <img
                src={item.s3_url}
                alt=""
                className="w-32 h-32 object-contain rounded"
              />
              <p className="text-xl font-bold text-blue-600 flex-1">
                スコア: {item.score.toFixed(2)}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
