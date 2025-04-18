import React, { useState } from "react";
import { FileUploader } from "react-drag-drop-files";
import "./DragNdrop.css";

const fileTypes = ["JPG", "JPEG", "PNG"];

function DragNdrop({ onImagesChange }) {
  const [images, setImages] = useState([]);

  const handleChange = async (selectedFiles) => {
    let filesArray = [];

    if (selectedFiles instanceof FileList) {
      filesArray = Array.from(selectedFiles);
    } else if (Array.isArray(selectedFiles)) {
      filesArray = selectedFiles;
    } else {
      filesArray = [selectedFiles];
    }

    if (images.length + filesArray.length > 3) {
      alert("You can only upload up to 3 images.");
      return;
    }

    const newBase64Images = await Promise.all(
      filesArray.map((file) => convertToBase64(file))
    );

    const updatedImages = [...images, ...newBase64Images];
    setImages(updatedImages);

    // Send base64 images to parent component
    onImagesChange(updatedImages);
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  return (
    <div>
      <div className="preview-container">
        {images.length === 0 ? (
          <div className="blank-upload-container">
            {[1, 2, 3].map((_, index) => (
              <div key={index} className="blank-upload-box">
                No image uploaded
              </div>
            ))}
          </div>
        ) : (
          images.map((base64, index) => (
            <img
              key={index}
              src={base64}
              alt={`Preview ${index}`}
              className="preview-image"
            />
          ))
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
