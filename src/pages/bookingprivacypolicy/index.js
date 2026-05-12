const PrivacyPage = () => {
  const brandName = "WeynGo";
  const supportEmail = "support@weyngo.com";

  const sectionStyle = {
    background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
    minHeight: "100vh",
    padding: "48px 16px",
    color: "#0f172a",
    fontFamily:
      "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  };

  const wrapperStyle = {
    maxWidth: "980px",
    margin: "0 auto",
  };

  const heroStyle = {
    background:
      "linear-gradient(135deg, rgba(15,23,42,1) 0%, rgba(30,41,59,1) 100%)",
    color: "white",
    borderRadius: "24px",
    padding: "32px",
    boxShadow: "0 24px 60px rgba(15, 23, 42, 0.18)",
    marginBottom: "24px",
  };

  const cardStyle = {
    background: "#ffffff",
    borderRadius: "20px",
    padding: "28px",
    boxShadow: "0 12px 30px rgba(15, 23, 42, 0.08)",
    border: "1px solid rgba(148, 163, 184, 0.18)",
    marginBottom: "18px",
  };

  const titleStyle = {
    fontSize: "2rem",
    fontWeight: 800,
    margin: 0,
    letterSpacing: "-0.03em",
  };

  const subtitleStyle = {
    marginTop: "10px",
    marginBottom: 0,
    opacity: 0.88,
    lineHeight: 1.7,
    fontSize: "1rem",
  };

  const sectionTitleStyle = {
    fontSize: "1.15rem",
    fontWeight: 800,
    marginBottom: "12px",
    color: "#0f172a",
    letterSpacing: "-0.02em",
  };

  const paragraphStyle = {
    lineHeight: 1.85,
    color: "#334155",
    marginBottom: "14px",
    fontSize: "0.98rem",
  };

  const listStyle = {
    paddingLeft: "20px",
    marginBottom: 0,
    color: "#334155",
    lineHeight: 1.8,
  };

  const sections = [
    {
      title: "Privacy Policy",
      paragraphs: [
        "Privacy is important to us. This Privacy Policy explains how we collect, use, disclose, and protect your personal information when you use WeynGo’s website, app, and services.",
        "Personal information means information that can be linked to a specific individual, such as name, address, contact number, email address, credit/debit/bank account details, and IP address.",
        "We do not sell or rent your personal information to third parties.",
      ],
    },
    {
      title: "What Information Do We Collect?",
      paragraphs: [
        "Personal data means any information about an individual from which that person can be identified, such as addresses, date of birth, password, and payment information. It does not include data where the identity has been removed or otherwise anonymized.",
        "We collect your personally identifiable information including but not limited to your name, email address, contact number, and IP address in the following circumstances:",
      ],
      bullets: [
        "When you make a reservation, or opt for a package from our website or app or through the aid of our customer service team.",
        "When you register with us, request information about holiday packages, subscribe to our newsletters, share your experience, send us queries, or register for promotions.",
        "When you engage with us in any online or offline event or express interest on any page hosted by us on a third-party platform or location or voluntarily provide your details for our promotions.",
        "While you can browse certain sections of our website or app prior to registering, certain activities such as placing an order require mandatory registration. We may use your contact information for sending offers based on your previous orders and interests, payment reminder notices, travel vouchers, and updates on the travel sector through our newsletters. You may unsubscribe at any time through the facility in the email message you receive.",
      ],
    },
    {
      title: "How We Use Personal Data",
      paragraphs: [
        "We use personal information to provide the services that you request.",
        "As a member, you may also occasionally receive updates from us about fare sales in your area, special offers, travel inspirations, and other noteworthy items. You can opt out of such communications.",
        "We may use your personal information to resolve disputes, troubleshoot problems, promote a safe service, collect fees owed to us, support customer interests, inform you about offers, customize your experience, detect fraud and other criminal activity, enforce our terms, conduct research and analysis, perform periodic audits, and contact you with important information or notices.",
      ],
    },
    {
      title: "Marketing Promotions",
      paragraphs: [
        "Marketing promotions, research, and programs help us identify your preferences, develop programs, and improve user experience.",
        "We may sponsor promotions to give our users the opportunity to win travel and travel-related prizes.",
        "Personal information collected for such activities may include contact information and survey responses. We use such information to notify contest winners and improve promotions and products.",
      ],
    },
    {
      title: "Automatic Logging of Session Data",
      paragraphs: [
        "We automatically log generic information about your computer’s connection to the Internet, which we call session data. This data is anonymous and not linked to any personal information.",
        "Session data may include IP address, operating system, browser software, and the activities conducted by the user while on our site.",
        "We use this data to analyze traffic, improve navigation, diagnose server issues, and administer our systems more effectively.",
      ],
    },
    {
      title: "Cookies",
      paragraphs: [
        "Cookies are small pieces of information stored by your browser on your computer’s hard drive.",
        "Cookies cannot run programs, plant viruses, or harvest your personal information. They are commonly used across the Internet to improve user experience.",
        "We do not collect personally identifiable information through cookies, and none is passed to third parties through this process.",
        "Cookies may be used to keep you logged in, personalize your experience, and measure the effectiveness of advertising. You can block cookies through your browser settings, though some features may not work properly if cookies are disabled.",
      ],
    },
    {
      title: "With Whom Is Your Personal Information Shared?",
      paragraphs: [
        "When you reserve or purchase travel services through us, we must provide certain personal information to the airline, hotel, car-rental agency, travel agency, or other involved third party to enable the successful fulfilment of your travel arrangements.",
        "We do not sell or rent individual customer names or other personal information to third parties.",
        "We may provide anonymous statistical information in aggregate form to suppliers, advertisers, affiliates, and other business partners for analysis and service improvement.",
        "Occasionally, we may hire a third party to act on our behalf for projects such as market research surveys and contest-entry processing. Such third parties are bound by confidentiality agreements and may use the information only for the specific project.",
      ],
    },
    {
      title: "How Long We Keep Your Personal Data",
      paragraphs: [
        "We retain your personal data only for as long as necessary to fulfil the purposes for which it was collected, including legal, accounting, or statutory reporting requirements.",
        "To determine the appropriate retention period, we consider the amount, nature, and sensitivity of the data, the potential risk of harm from unauthorized use or disclosure, the purposes of processing, and applicable legal requirements.",
        "We may retain certain information after your account is closed if required to fulfil legal obligations, maintain security, prevent fraud and abuse, or defend and enforce our rights.",
      ],
    },
    {
      title: "How You Can Opt Out of Promotional Communications",
      paragraphs: [
        "A member or promotion/sweepstakes entrant, upon consent, may occasionally receive email and SMS updates from us about fare sales, special deals, newsletters, new services, and other important offerings.",
        "If you do not wish to receive such communication, please click the unsubscribe link or follow the instructions in each email message, or send us an email.",
        "We reserve the right to limit membership to those who will accept emails, and members will be notified via email prior to any actions taken.",
      ],
    },
    {
      title: "Security Measures",
      paragraphs: [
        "Our website and app have stringent security measures in place to protect against loss, misuse, and alteration of information under our control.",
        "Whenever you change or access your account information, we use a secure server. This means all personal information you provide is transmitted using SSL encryption.",
        "Once your information is in our possession, we adhere to strict security guidelines to protect it against unauthorized access.",
        "As soon as you declare the intent to avail any service offered by us on the website or app, control may transfer to a specified and authentic payment gateway that processes your credit card, debit card, or other banking information.",
      ],
    },
    {
      title: "Other Information You Should Know",
      paragraphs: [
        "Our site contains links to other websites. When you click on one of these links, you are entering another website for which we have no responsibility.",
        "You are solely responsible for maintaining the secrecy of your passwords and should be careful whenever you are online.",
        `We may disclose site member information if required by law, court order, or government or law enforcement authority, or if we believe disclosure is necessary to protect the rights or property of ${brandName}, its affiliates, associates, employees, directors, or officers, or to bring legal action against someone causing interference with our rights or properties.`,
      ],
    },
    {
      title: "Your Rights and Personal Information",
      paragraphs: [
        `If you wish to correct any of your personal information or want us to delete your information, please write to ${supportEmail}.`,
        "We review our Privacy Policy from time to time and may make periodic changes in connection with that review.",
        "You may wish to bookmark this page and review it periodically to ensure you have the latest version.",
        "Regardless of later updates, we will abide by the privacy practices described to you in this Privacy Policy at the time you provided us with your personal information.",
        `You may always submit concerns regarding our privacy statement or privacy practices via email to ${supportEmail}. Please reference the privacy policy in your subject line.`,
      ],
    },
  ];

  return (
    <div style={sectionStyle}>
      <div style={wrapperStyle}>
        <header style={heroStyle}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              padding: "8px 14px",
              borderRadius: "999px",
              background: "rgba(255,255,255,0.08)",
              marginBottom: "18px",
              fontSize: "0.9rem",
              fontWeight: 600,
            }}
          >
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: "#60a5fa",
                display: "inline-block",
              }}
            />
            Privacy Information
          </div>

          <h1 style={titleStyle}>Privacy Policy</h1>
          <p style={subtitleStyle}>
            We value your privacy and aim to keep this policy clear, respectful,
            and easy to understand. This page explains what we collect, how we
            use it, and the choices available to you.
          </p>
        </header>

        <div
          style={{
            ...cardStyle,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "16px",
          }}
        >
          <div>
            <div
              style={{ fontSize: "0.82rem", color: "#64748b", marginBottom: 6 }}
            >
              Brand
            </div>
            <div style={{ fontWeight: 800, fontSize: "1.05rem" }}>
              {brandName}
            </div>
          </div>
          <div>
            <div
              style={{ fontSize: "0.82rem", color: "#64748b", marginBottom: 6 }}
            >
              Support
            </div>
            <div style={{ fontWeight: 700, fontSize: "1.05rem" }}>
              {supportEmail}
            </div>
          </div>
          <div>
            <div
              style={{ fontSize: "0.82rem", color: "#64748b", marginBottom: 6 }}
            >
              Policy Type
            </div>
            <div style={{ fontWeight: 700, fontSize: "1.05rem" }}>
              Privacy Policy
            </div>
          </div>
        </div>

        {sections.map((section, index) => (
          <section key={index} style={cardStyle}>
            <h2 style={sectionTitleStyle}>{section.title}</h2>

            {section.paragraphs?.map((text, i) => (
              <p key={i} style={paragraphStyle}>
                {text}
              </p>
            ))}

            {section.bullets?.length ? (
              <ul style={listStyle}>
                {section.bullets.map((item, i) => (
                  <li key={i} style={{ marginBottom: "10px" }}>
                    {item}
                  </li>
                ))}
              </ul>
            ) : null}
          </section>
        ))}

        <footer
          style={{
            ...cardStyle,
            textAlign: "center",
            marginBottom: 0,
            background:
              "linear-gradient(135deg, rgba(15,23,42,1) 0%, rgba(30,41,59,1) 100%)",
            color: "white",
            border: "none",
          }}
        >
          <div
            style={{ fontSize: "1.05rem", fontWeight: 800, marginBottom: 8 }}
          >
            {brandName}
          </div>
          <div style={{ opacity: 0.9, lineHeight: 1.8 }}>
            Your privacy matters to us.
            <br />
            Contact us at{" "}
            <a
              href={`mailto:${supportEmail}`}
              style={{
                color: "#93c5fd",
                textDecoration: "none",
                fontWeight: 700,
              }}
            >
              {supportEmail}
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default PrivacyPage;
