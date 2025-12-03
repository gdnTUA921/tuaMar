import React, { useState } from "react";
import "../assets/FAQ.css";

const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState(null);
  const toggleFAQ = (index) =>
    setActiveIndex(activeIndex === index ? null : index);

  const faqData = [
    {
      category: "General Questions",
      items: [
        {
          q: "What is TUA Marketplace?",
          a: "TUA Marketplace is Trinity University of Asia’s official web-based marketplace designed exclusively for students, faculty, and staff. It allows members of the TUA community to buy, sell, and trade items safely within the university network."
        },
        {
          q: "Who can use TUA Marketplace?",
          a: "Only verified members of the Trinity University of Asia community (students, faculty, and staff with a valid @tua.edu.ph email address) can access and use the platform."
        },
        {
          q: "How do I create an account?",
          a: (
            <>
              Accounts are <strong>registered by the system administrator.</strong> To request an account, email <b>tuamarketplace.support@gmail.com</b> with the following details and attachments:
              <ul>
                <li>Full name</li>
                <li>Student number</li>
                <li>Official TUA email address</li>
                <li>Copy of valid TUA ID</li>
                <li>Copy of Student Assessment Form (SAF) showing official enrollment</li>
              </ul>
              Once verified and approved, your account will be created, and you can log in using your <b>TUA Google account</b>.
            </>
          )
        },
        {
          q: "Is TUA Marketplace free to use?",
          a: "Yes. Creating listings, browsing items, and messaging sellers are all free services provided to TUA community members."
        },
        {
          q: "Is TUA Marketplace accessible 24/7?",
          a: "Yes. The marketplace is accessible 24/7, allowing users to browse and post items anytime. However, admin moderation of listings and reports is conducted only during official school hours."
        },
        {
          q: "How does TUA Marketplace ensure user safety?",
          a: "All accounts are verified through official TUA credentials, and listings are monitored by administrators. Users can also report inappropriate content or suspicious users through the built-in Report feature."
        }
      ]
    },
    {
      category: "For Buyers",
      items: [
        {
          q: "How do I browse items?",
          a: "After logging in, visit the Home or Browse Items section. You can filter results by category, condition, or price range and view detailed product descriptions and seller profiles."
        },
        {
          q: "How do I contact a seller?",
          a: "Click “Message Seller” on the item’s page to start a real-time chat using the In-App Messaging feature. You can discuss details or arrange a meet-up directly."
        },
        {
          q: "Are online payments supported?",
          a: "Currently, all transactions are done through in-person meet-ups between buyers and sellers. The platform does not process payments online."
        },
        {
          q: "Can I report a suspicious or fake listing?",
          a: "Yes. Each product page includes a Report Item button. Select a reason, describe the issue, and submit your report. The admin will review it immediately."
        },
        {
          q: "How do I know if a seller is trustworthy?",
          a: "You can check a seller’s ratings and reviews from previous buyers. Highly rated sellers usually indicate reliability and positive past transactions."
        }
      ]
    },
    {
      category: "For Sellers",
      items: [
        {
          q: "How do I post an item for sale?",
          a: "Go to the Sell Item section, fill out the item’s details (name, description, category, condition, price), and upload up to five images. Once submitted, your listing will be reviewed and published."
        },
        {
          q: "What items can I sell?",
          a: (
            <>
              You may sell <b>acceptable and school-related items</b>, such as:
              <ul>
                <li>Pre-loved uniforms, books, and school supplies</li>
                <li>Gadgets and electronics</li>
                <li>Collectibles and hobby items</li>
                <li>Food and beverages permitted by TUA policy</li>
                <li>Clothing, accessories, and dorm essentials</li>
              </ul>
              ⚠️ Prohibited items include illegal, dangerous, or university-banned products.
            </>
          )
        },
        {
          q: "How can I edit or delete a listing?",
          a: "From your Profile, go to My Listings to edit, mark as sold/reserved, or delete your item anytime."
        },
        {
          q: "How do I receive feedback from buyers?",
          a: "After a completed transaction, buyers can leave ratings and reviews on your profile. Higher ratings can help you attract more buyers."
        },
        {
          q: "What happens if my item gets reported?",
          a: "The admin will review the report. If the item violates the marketplace policies, it may be removed and your account could face a warning or suspension."
        }
      ]
    },
    {
      category: "Account & Security",
      items: [
        {
          q: "I forgot my password. What should I do?",
          a: "Since TUA Marketplace uses Google Authentication, password recovery is handled through Google’s own recovery system. If you forget your password, please use Google’s “Forgot Password” feature to reset your TUA email credentials."
        },
        {
          q: "How is my personal data protected?",
          a: "All user data is securely stored and managed in accordance with the Data Privacy Act of 2012. Only authorized TUA administrators can access system information."
        },
        {
          q: "Can non-TUA members access the marketplace?",
          a: "No. Access is strictly limited to verified TUA accounts. External users cannot register, browse, or post listings."
        },
        {
          q: "What should I do if I encounter a scam or inappropriate behavior?",
          a: "Immediately report the user or item using the Report User or Report Item buttons. The admin will take appropriate action after investigation."
        },
        {
          q: "Who manages the TUA Marketplace?",
          a: "The system is maintained by the College of Engineering and Information Sciences (CEIS) development team and monitored by assigned TUA administrators to ensure a safe and reliable trading environment."
        }
      ]
    }
  ];

  return (
    <div className="faq-page">
      <div className="faq-wrapper">
        {/* ✅ Updated Header */}
        <div className="faq-header">
          <img src="/tuamar.png" alt="TUA Logo" className="faq-logo" />
          <h1 className="faq-main-title">TUA Marketplace</h1>
        </div>
        <h2 className="faq-subtitle">Frequently Asked Questions (FAQs)</h2>

        {faqData.map((section, sectionIndex) => (
          <div key={sectionIndex} className="faq-section">
            <h3 className="faq-category">{section.category}</h3>
            {section.items.map((item, index) => {
              const key = `${sectionIndex}-${index}`;
              return (
                <div
                  key={key}
                  className={`faq-item ${activeIndex === key ? "active" : ""}`}
                >
                  <button
                    className="faq-question"
                    onClick={() => toggleFAQ(key)}
                  >
                    {item.q}
                    <span className="faq-icon">
                      {activeIndex === key ? "−" : "+"}
                    </span>
                  </button>
                  <div
                    className={`faq-answer ${
                      activeIndex === key ? "open" : ""
                    }`}
                  >
                    <p>{item.a}</p>
                  </div>
                </div>
              );
            })}
            <br/>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQ;
