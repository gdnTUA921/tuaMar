import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebaseConfig';
import '../assets/Register.css';

function Register() {
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    department: '',
    schoolId: ''
  });
  const [schoolIdImage, setSchoolIdImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  const navigate = useNavigate();
  const MySwal = withReactContent(Swal);
  const ip = process.env.REACT_APP_LAPTOP_IP;

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSchoolIdImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // Upload to Firebase Storage
  const uploadSchoolIdToFirebase = async () => {
    if (!schoolIdImage) return null;

    try {
      // Create a unique filename
      const timestamp = Date.now();
      const filename = `school_ids/${timestamp}_${schoolIdImage.name}`;
      const storageRef = ref(storage, filename);

      // Upload the file
      await uploadBytes(storageRef, schoolIdImage);

      // Get the download URL
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading school ID to Firebase:', error);
      throw error;
    }
  };

    const handleSubmit = async (e) => {
    e.preventDefault();

    if (!schoolIdImage) {
        MySwal.fire({
        icon: 'error',
        title: 'Missing School ID',
        text: 'Please upload your school ID!',
        });
        return;
    }

    MySwal.fire({
        title: 'Uploading...',
        text: 'Please wait while we process your registration',
        allowOutsideClick: false,
        didOpen: () => {
        MySwal.showLoading();
        }
    });

    try {
        const formDataToSend = new FormData();
        formDataToSend.append("email", formData.email);
        formDataToSend.append("firstName", formData.firstName);
        formDataToSend.append("lastName", formData.lastName);
        formDataToSend.append("department", formData.department);
        formDataToSend.append("schoolId", formData.schoolId);
        formDataToSend.append("schoolIdImage", schoolIdImage);

        const response = await fetch(`${ip}/register.php`, {
        method: "POST",
        body: formDataToSend
        });

        const data = await response.json();
        MySwal.close();

        if (data.success) {
        MySwal.fire({
            icon: 'success',
            title: 'Registration Submitted',
            text: 'Your registration is pending admin approval.',
            confirmButtonColor: '#456a31'
        }).then(() => navigate('/login'));
        } else {
        MySwal.fire({
            icon: 'error',
            title: 'Registration Failed',
            text: data.message,
            confirmButtonColor: '#456a31'
        });
        }
    } catch (err) {
        MySwal.close();
        console.error(err);
        MySwal.fire({
        icon: 'error',
        title: 'Error',
        text: 'An error occurred.',
        });
    }
    };


  return (
    <div className="register-container">
      <div className="register-box">
        <h1>Register</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email (TUA Email)</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              pattern=".+@tua\.edu\.ph$"
              title="Please use your TUA email"
            />
          </div>

          <div className="form-group">
            <label>First Name</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Last Name</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Department</label>
            <input
              type="text"
              name="department"
              value={formData.department}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label>School ID Number</label>
            <input
              type="text"
              name="schoolId"
              value={formData.schoolId}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Upload School ID Picture</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              required
            />
            {previewUrl && (
              <img src={previewUrl} alt="School ID Preview" className="id-preview" />
            )}
          </div>

          <button type="submit" className="register-btn">Register</button>
        </form>

        <p className="login-link">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;