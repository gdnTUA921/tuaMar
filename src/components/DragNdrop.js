import React, { useState } from "react";
import { FileUploader } from "react-drag-drop-files";
import "./DragNdrop.css";

const fileTypes = ["JPG", "JPEG", "PNG"];

function DragNdrop() {
  const [files, setFiles] = useState([]);

  const handleChange = (selectedFiles) => {
    
    let filesArray = [];

    if (selectedFiles instanceof FileList) {
      filesArray = Array.from(selectedFiles);
    } else if (Array.isArray(selectedFiles)) {
      filesArray = selectedFiles;
    } else {
      filesArray = [selectedFiles];
    }

    // Limit the number of files to 3
    if (files.length + filesArray.length <= 3) {
      setFiles((prevFiles) => [...prevFiles, ...filesArray]);
    } else {
      alert("You can only upload up to 3 images.");
    }
    
  };

  return (
    <div>
      <div className="preview-container">
        {files.length === 0 ? (
          <div className="blank-upload-container">
            {[1, 2, 3].map((_, index) => (
              <div key={index} className="blank-upload-box">
                No image uploaded
              </div>
            ))}
          </div>
        ) : (
          files.map((file, index) =>
            file instanceof File ? (
              <img
                key={index}
                src={URL.createObjectURL(file)}
                alt="Preview"
                className="preview-image"
              />
            ) : null
          )
        )}
      </div>
      <FileUploader handleChange={handleChange} name="files" types={fileTypes} multiple>
        <div className="custom-dropzone">
          <i id="iconPic" className="bi bi-image-fill"></i>
          <p>
            Drag & Drop your Pictures Here or <span>Browse</span>
          </p>
        </div>
      </FileUploader>
    </div>
  );
}

export default DragNdrop;
