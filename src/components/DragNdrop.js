import React, { useEffect, useState } from "react";
import { FileUploader } from "react-drag-drop-files";
import "./DragNdrop.css";

const fileTypes = ["JPG", "JPEG", "PNG"];

function DragNdrop({ onImagesChange, initialImages = [] }) {
  const [images, setImages] = useState([]);

  useEffect(() => {
    if (initialImages.length > 0){
      setImages(initialImages);
      onImagesChange(initialImages);
    }
  }, [initialImages])

  const handleChange = async (selectedFiles) => {
    let filesArray = [];

    if (selectedFiles instanceof FileList) {
      filesArray = Array.from(selectedFiles);
    } else if (Array.isArray(selectedFiles)) {
      filesArray = selectedFiles;
    } else {
      filesArray = [selectedFiles];
    }

    if (images.length + filesArray.length > 5) {
      alert("You can only upload up to 5 images.");
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

  const handleRemoveImage = (indexToRemove) => {
    const updatedImages = images.filter((_, index) => index !== indexToRemove);
    setImages(updatedImages);
    onImagesChange(updatedImages);
  };


  return (
    <div className="drag-n-drop-container">
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
            <div key={index} className="preview-box">
              <img
                src={base64}
                alt={`Preview ${index}`}
                className="preview-image"
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
                className="remove-icon"
                onClick={() => handleRemoveImage(index)}
              >
                <circle className="remove-icon-bg" cx="8" cy="8" r="8" />
                <path
                  className="remove-icon-x"
                  d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 
                    0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 
                    8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 
                    5.354a.5.5 0 0 1 0-.708z"
                />
              </svg>

            </div>
          ))

        )}
      </div>
      <div className="dropzone-wrapper">
        <FileUploader handleChange={handleChange} name="files" types={fileTypes} multiple>
          <div className="custom-dropzone">
            <i id="iconPic" className="bi bi-image-fill"></i>
            <p>
              Drag & Drop your Pictures Here or <span>Browse</span>
            </p>
          </div>
        </FileUploader>
      </div>

    </div>
  );
}

export default DragNdrop;
