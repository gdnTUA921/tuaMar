import React, { useState } from "react";
import { FileUploader } from "react-drag-drop-files";
import "./Reviewimg.css";

const fileTypes = ["JPG", "JPEG", "PNG"];

function Reviewimg() {
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
      <FileUploader handleChange={handleChange} name="files" types={fileTypes} multiple>
        <div className="custom-dropzone">
          <i id="iconPic" className="bi bi-image-fill"></i>
          <p className="dragtitle">
            Drag & Drop your Pictures Here or <span>Optional</span>
          </p>
        </div>
      </FileUploader>
    </div>
  );
}

export default Reviewimg;