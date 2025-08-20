import { saveAs } from "file-saver";
// import { asBlob } from "html-docx-js-typescript";
import { toDocx, toHtml } from 'docshift';

async function DownloadDocx(htmlContent,fileName) {
  // const converted = await asBlob(htmlContent,{orientation:"portrait"});
  const converted = await toDocx(htmlContent)
  console.log(converted)

  // Optional: trigger browser download
  saveAs(converted, fileName);

  // Upload to Supabase
//   const { data, error } = await supabase.storage
//     .from("documents") // your Supabase storage bucket
//     .upload(`document-${Date.now()}.docx`, converted, {
//       contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
//       cacheControl: "3600",
//       upsert: false,
//     });

//   if (error) {
//     console.error("Upload error:", error.message);
//   } else {
//     console.log("File uploaded:", data);
//   }
  return {converted,fileName}
}

export default DownloadDocx;
