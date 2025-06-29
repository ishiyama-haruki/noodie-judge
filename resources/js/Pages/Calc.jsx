// 必要なモジュールをインポート
import { useRef, useState } from "react";

const Calc = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [nsfwResult, setNsfwResult] = useState(null);

  const imageInputRef = useRef(null);

  const BASE_URL = import.meta.env.VITE_APP_URL;
  const ENDPOINTS = {
    s3up: `${BASE_URL}/api/s3up`,
    nsfwCheck: `${BASE_URL}/api/nsfwCheck`,
    imageUpload: `${BASE_URL}/api/imageUpload`
  };

  // 画像アップロード時の処理
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setNsfwResult(null);
    }
  };

  // リセット時の処理
  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setNsfwResult(null);
    imageInputRef.current.value = ""
    console.log("キャンセル済み")
  };

  // メインの診断処理
  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setIsUploading(true);
    
      // S3にアップロード
      const formData = new FormData();
      formData.append("file", selectedFile);
    
      const s3Response = await fetch(ENDPOINTS.s3up, {
        method: 'POST',
        body: formData
      });
      
      const { s3Url, s3Key } = await s3Response.json();
      console.log("S3アップロード成功", s3Url);
      
      // NSFWチェック
      const nsfwResponse = await fetch(ENDPOINTS.nsfwCheck, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ s3Url }),
      });
      
      const nsfwData = await nsfwResponse.json();
      console.log("NSFW結果:", nsfwData);
      setNsfwResult(nsfwData);

      // Laravel DBに保存
      await fetch(ENDPOINTS.imageUpload, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          s3_key: s3Key,
          score: nsfwData.score * 100,
         }),
      })
      console.log("DB登録成功");
    
    } catch (error) {
      console.error("アップロードまたはNSFW判定失敗:", error);
      console.log(error.message)
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="p-4 mt-5 max-w-md mx-auto flex flex-col items-center">
      <h2 className="text-2xl text-black font-bold mb-2">画像のエロさ診断</h2>
      <label
        className="border-4 border-dotted border-black flex w-[300px] h-[300px] rounded-[12px] justify-center items-center overflow-hidden cursor-pointer"
      >
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="mb-2"
          hidden
        />
        {!previewUrl && (
          <span className="text-black">画像をアップロード</span>
        )}
        {previewUrl && (
          <img
            src={previewUrl}
            alt="プレビュー"
            className="w-full object-cover mb-2 rounded"
          />
        )}
      </label>

      <div className="mt-5 flex">
        <button
          onClick={handleUpload}
          disabled={!selectedFile || isUploading || nsfwResult}
          className="bg-blue-500 text-white px-4 py-2 rounded"
          // style={{ backgroundColor: "blue" }}
        >
          {isUploading ? '診断中...' : '診断'}
        </button>
        <button
          onClick={handleReset}
          disabled={!selectedFile}
          className="bg-gray-500 text-white px-4 py-2 rounded ml-2"
          // style={{ backgroundColor: "gray" }}
        >
          リセット
        </button>
      </div>

      {nsfwResult && (
        <p className="text-5xl font-bold mt-5" style={{color: "blue"}}>
          {(nsfwResult.score * 100).toFixed(2)}
        </p>
      )}
    </div>
  );
};

export default Calc;
