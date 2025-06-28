// 必要なモジュールをインポート
import { useRef, useState } from "react";
import AWS from 'aws-sdk';

// AWS認証情報
AWS.config.update({
  region: import.meta.env.VITE_AWS_REGION,
  credentials: new AWS.Credentials({
    accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
    secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY,
  }),
});

const s3 = new AWS.S3();

const Calc = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [nsfwResult, setNsfwResult] = useState(null);

  const imageInputRef = useRef(null);

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

    const key = `${import.meta.env.VITE_AWS_S3_DIR}/${selectedFile.name}`;
    
    const params = {
      Bucket: import.meta.env.VITE_AWS_BUCKET_NAME,
      Key: key,
      Body: selectedFile,
      ContentType: selectedFile.type,
    };

    setIsUploading(true);

    try {
      // S3にアップロード
      await s3.upload(params).promise();
      const image_url = `https://${params.Bucket}.s3.${import.meta.env.VITE_AWS_REGION}.amazonaws.com/${key}`;

      // S3の画像パスを取得し、NSFWの計算を実行
      fetch(`/api/?url=${image_url}`)
        .then(response => response.json())
        .then(data => {
          // console.log(data)
          setNsfwResult(data)
        })
        .catch(error => {
          console.log("NSFW失敗:", error)
        })

    } catch (error) {
        console.error("S3アップロード失敗:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-2xl text-black font-bold mb-2">画像のエロス診断</h2>
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

      <div className="mt-5">
        <button
          onClick={handleUpload}
          disabled={!selectedFile || isUploading || nsfwResult}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          {isUploading ? '診断中...' : '診断'}
        </button>
        <button
          onClick={handleReset}
          disabled={!selectedFile}
          className="bg-gray-500 text-white px-4 py-2 rounded ml-2"
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
