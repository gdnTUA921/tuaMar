import React, { useState } from "react";
import "../assets/Terms.css";


const Terms = () => {
  const [activeIndex, setActiveIndex] = useState(null);
  const toggleTerms = (index) =>
    setActiveIndex(activeIndex === index ? null : index);


  const TermData = [
    {
      category: "1. General Terms",
      items: [
        {
          q: "1.1 Eligibility",
          a: "Only verified members of the Trinity University of Asia community — including students, faculty, and staff with an official @tua.edu.ph email address — are authorized to register and use the platform."
        },
        {
          q: "1.2 Account Registration",
          a: "Users must log in using their official TUA email via Google authentication. Unauthorized access, use of another person’s credentials, or multiple account creation is strictly prohibited."
        },
        {
          q: "1.3 Scope of Platform Use",
          a: (
            <>
              The TUA Marketplace is a campus-exclusive platform for posting, browsing, and arranging sales of goods and services within the TUA community.
              <ul>
                <li>All transactions are peer-to-peer (P2P) and conducted outside the platform (e.g., in-person meet-ups within campus).</li>
                <li>The system does not process or handle payments, shipping, or delivery.</li>
              </ul>
                The platform is intended solely for lawful and appropriate items as defined in the marketplace guidelines.
            </>
          )
        },
        {
          q: "1.4 Administrative Oversight",
          a: "An appointed TUA Marketplace Administrator manages reports, account verifications, and listings. The administrator reserves the right to remove listings or suspend accounts that violate these Terms."
        },
        {
          q: "1.5 Prohibited Activities",
          a: (
            <>
              <strong> Users may not:</strong>
              <ul>
                <li>Post, sell, or solicit illegal, stolen, or prohibited items (e.g., weapons, drugs, alcohol, counterfeit goods, or academic materials such as test papers).</li>
                <li>Misrepresent the condition, ownership, or authenticity of any item.</li>
                <li>Engage in harassment, spam, fraud, or any act that disrupts marketplace operations.</li>
                <li>Circumvent platform moderation or impersonate another user.</li>
              </ul>
                Violation of these rules may result in account suspension, reporting to university authorities, and possible disciplinary action under TUA policies.
            </>
          )
        },
      ]
    },
    {
      category: "2. Terms for Buyers",
      items: [
        {
          q: "2.1 Buying Responsibility",
         a: (
            <>
            <ul>
                <li>Buyers must carefully review item listings before proceeding with a transaction. </li>
                <li>Buyers are responsible for verifying the credibility of sellers by checking ratings, reviews, and in-app profiles. </li>
                <li>Buyers must conduct meet-ups within the university premises to ensure safety. </li>
            </ul>
            </>
         )
        },
        {
          q: "2.2 Payments and Transactions",
         a: (
            <>
            <ul>
                <li>All payments shall be made directly between buyer and seller. </li>
                <li>The TUA Marketplace is not liable for payment disputes, incomplete transactions, or product condition after sale. </li>
            </ul>
            </>
         )
        },
        {
          q: "2.3 Reporting and Feedback",
           a: (
            <>
            <ul>
                <li>
                    Buyers are encouraged to use the in-app Report feature to flag inappropriate listings or suspicious activity.
                </li>
                <li>Buyers may rate and review sellers based on transaction experience. Reviews must remain factual and respectful. </li>
            </ul>
            </>
           )
        },
        {
          q: "2.4 Liability Disclaimer",
          a: "The TUA Marketplace serves only as a digital facilitator. It does not guarantee product quality, condition, or seller reliability. TUA and its administrators are not liable for any loss, damage, or fraud resulting from transactions between users."
        },
      ]
    },
    {
      category: "3. Terms for Sellers",
      items: [
        {
          q: "3.1 Seller Eligibility and Conduct",
          a: (
            <>
            <ul>
                <li>Only verified TUA community members may post listings. </li>
                <li>Sellers must ensure that all listed items are owned legally and accurately described (condition, price, photos, and relevant details). </li>
                <li>Sellers may not post duplicate listings or use misleading images or information. </li>


            </ul>
            </>
          )
        },
        {
          q: "3.2 Prohibited Listings",
          a: (
            <>
              Sellers are strictly prohibited from selling:
              <ul>
                <li>Illegal, dangerous, or restricted goods (e.g., drugs, weapons, stolen items).</li>
                <li>University property or materials not personally owned.</li>
                <li>Academic documents such as exams, answer sheets, or restricted institutional content.</li>
                <li>Items that violate TUA’s Code of Conduct or Philippine law.</li>
   
              </ul>
             
            </>
          )
        },
        {
          q: "3.3 Meet-ups and Transactions",
          a: (
            <>
            <ul>
                <li>Sellers are encouraged to meet buyers inside the university grounds for safe exchanges. </li>
                <li>Sellers are responsible for maintaining good communication and fulfilling agreed terms of sale. </li>
            </ul>
            </>
          )
        },
        {
          q: "3.4 Listing Review and Removal",
          a: (
            <>
            <ul>
                <li>All listings are subject to review by the platform administrator. </li>
                <li>The administrator reserves the right to remove or reject listings that contain inappropriate, false, or prohibited content without prior notice. </li>
            </ul>
            </>
          )
        },
        {
          q: "3.5 Seller Accountability",
          a: "Repeated violations, false reporting, or misconduct (e.g., scamming, posting banned items) may lead to permanent suspension and disciplinary action under TUA policies."
        }
      ]
    },
    {
      category: "4. Privacy and Data Protection",
      items: [
        {
            q: "4.1 Data Collection and Use",
          a: (
            <>
            <ul>
                <li>User data (name, TUA email, department, listings, and messages) is stored securely and used only for marketplace operations. </li>
                <li>No financial information is collected or processed.</li>
                <li>The TUA Marketplace complies with the Data Privacy Act of 2012 and the university’s internal data protection policy. </li>
                <li>Users may request deletion of their data by contacting the Marketplace Administrator. </li>
            </ul>
            </>
          )
        },
       
      ]
    },
        {
        category: "5. Intellectual Property",
        items: [
        {
            q: "5.1 Platform Content Ownership",
            a: "All trademarks, logos, and system designs within the TUA Marketplace are owned by Trinity University of Asia. Users may not reproduce, modify, or redistribute any platform content without prior authorization."
        },
       
      ]
        },
        {
        category: "6. Limitation of Liability",
        items : [ {
            q: "6.1 No Warranties",
                   a: (
            <>
            TUA Marketplace and its developers shall not be held responsible for:
            <ul>
                <li>Any losses, damages, or disputes arising from user transactions. </li>
                <li>Any downtime, data loss, or technical malfunction.</li>
                <li> User misconduct or violation of these Terms. </li>
            </ul>
            </>
          )
        }]
 
        },
        {
            category: "7. Amendments to Terms",
            items: [{
                q: "7.1 Changes to Terms",
                a: "TUA Marketplace reserves the right to update or modify these Terms at any time. Continued use of the platform after any modification constitutes acceptance of the revised Terms."
            }]
           
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
        <h2 className="faq-subtitle">Terms and Conditions</h2>
        <p className="terms-subpara">By accessing or using this website (https://tuamarketplace.online
), you agree to comply with and be bound by these Terms and Conditions (“Terms”). These Terms govern your access to and use of the TUA Marketplace platform, whether as a Buyer, Seller, or both.</p>


        {TermData.map((section, sectionIndex) => (
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
                    onClick={() => toggleTerms(key)}
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


export default Terms;