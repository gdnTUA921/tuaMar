import React, { useEffect, useRef, useState } from "react";
import { FileUploader } from "react-drag-drop-files";
import "../assets/DragNdrop.css";

const fileTypes = ["JPG", "JPEG", "PNG"];

function DragNdrop({ onImagesChange, initialImages = [] }) {
  const [files, setFiles] = useState([]);
  const hasInitialized = useRef(false);

  useEffect(() => {
    
    if (initialImages.length > 0 && !hasInitialized.current) {
      
      // Store URLs directly, we'll handle them differently in the parent component
      setFiles(initialImages);
      onImagesChange(initialImages);
      hasInitialized.current = true;
    }
  }, [initialImages, onImagesChange]);

  const handleChange = (selectedFiles) => {
    let filesArray = [];

    if (selectedFiles instanceof FileList) {
      filesArray = Array.from(selectedFiles);
    } else if (Array.isArray(selectedFiles)) {
      filesArray = selectedFiles;
    } else {
      filesArray = [selectedFiles];
    }

    if (files.length + filesArray.length > 5) {
      alert("You can only upload up to 5 images.");
      return;
    }

    const updatedFiles = [...files, ...filesArray];
    setFiles(updatedFiles);
    onImagesChange(updatedFiles);
  };

  const handleRemoveImage = (indexToRemove) => {
    const updatedFiles = files.filter((_, index) => index !== indexToRemove);
    setFiles(updatedFiles);
    onImagesChange(updatedFiles);
  };

  const isFileObject = (item) => item instanceof File;
  const isUrl = (item) => typeof item === 'string' && item.startsWith('http');

  return (
    <div className="drag-n-drop-container">
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
          files.map((file, index) => {
            let previewSrc;
            let title;

            if (isFileObject(file)) {
              previewSrc = URL.createObjectURL(file);
              title = file.name;
            } else if (isUrl(file)) {
              previewSrc = file;
              title = `Existing Image ${index + 1}`;
            } else {
              console.error('Unknown file type:', file);
              return null;
            }

            return (
              <div key={index} className="preview-box">
                <img
                  src={previewSrc}
                  alt={`Preview ${index}`}
                  className="preview-image"
                  title={title}
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 16 16"
                  className="remove-icon"
                  onClick={() => handleRemoveImage(index)}
                  tabIndex={0}
                  role="button"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      handleRemoveImage(index);
                    }
                  }}
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
            );
          })
        )}
      </div>
      <div className="dropzone-wrapper">
        <FileUploader
          handleChange={handleChange}
          name="files"
          types={fileTypes}
          multiple
        >
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