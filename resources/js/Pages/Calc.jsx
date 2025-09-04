// 必要なモジュールをインポート
import { useRef, useState } from "react";

const Calc = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [nsfwResult, setNsfwResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

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
    setErrorMessage("");
    imageInputRef.current.value = ""
  };

  // 画像のリサイズ処理
  const resizeImage = (file, maxWidth, maxHeight) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
  
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          let { width, height } = img;
  
          // 縦横比を維持しつつサイズを制限
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = width * ratio;
            height = height * ratio;
          }
  
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
  
          canvas.toBlob((blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Blob生成失敗'));
            }
          }, file.type, 0.8); // 品質90%
        };
        img.onerror = (err) => reject(err);
        img.src = event.target.result;
      };
  
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

  // メインの診断処理
  const handleUpload = async () => {
    if (!selectedFile) return;
  
    setErrorMessage("");  // エラーをリセット
    try {
      setIsUploading(true);
  
      // リサイズ
      const resizedBlob = await resizeImage(selectedFile, 1024, 1024);
      const resizedSizeKB = (resizedBlob.size / 1024).toFixed(2);
      console.log(`リサイズ後ファイルサイズ: ${resizedSizeKB} KB`);
  
      const formData = new FormData();
      formData.append("file", resizedBlob, selectedFile.name);
  
      // S3アップロード
      const s3Response = await fetch(ENDPOINTS.s3up, {
        method: 'POST',
        body: formData
      });
  
      if (!s3Response.ok) {
        const errData = await s3Response.json().catch(() => ({}));
        throw new Error(errData.error || "画像登録に失敗しました");
      }
  
      const { s3Url, s3Key } = await s3Response.json();
  
      // NSFWチェック
      const nsfwResponse = await fetch(ENDPOINTS.nsfwCheck, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ s3Url }),
      });
  
      if (!nsfwResponse.ok) {
        const errData = await nsfwResponse.json().catch(() => ({}));
        throw new Error(errData.error || "スコア計算に失敗しました");
      }
  
      const nsfwData = await nsfwResponse.json();
      console.log("NSFW結果:", nsfwData);
      setNsfwResult(nsfwData);
  
      // DB保存
      await fetch(ENDPOINTS.imageUpload, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          s3_key: s3Key,
          score: nsfwData.score * 100,
        }),
      });
  
      console.log("DB登録成功");
  
    } catch (error) {
      console.error(error);
      setErrorMessage(error.message || "エラーが発生しました。");
    } finally {
      setIsUploading(false);
    }
  };
  

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
          <div className="text-center">
            <p className="text-black">画像をアップロード</p>
            <p className="text-black">※明らかに卑猥な画像は削除されます</p>
          </div>
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
      {errorMessage && (
        <div className="mt-4 text-red-600 text-center">
          {errorMessage}
        </div>
      )}

      {nsfwResult && (
        <p className="text-5xl font-bold mt-5" style={{color: "blue"}}>
          {(nsfwResult.score * 100).toFixed(2)}
        </p>
      )}

      <a
        href="/ranking"
        className="mt-6 text-blue-600 hover:text-blue-800 underline cursor-pointer"
      >
        ランキングはこちら
      </a>
    </div>
  );
};

export default Calc;
