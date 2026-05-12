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
      title: "Terms of Use",
      paragraphs: [
        `The information, data and material contained in this website has been prepared solely for the purpose of providing information about ${brandName} and its partners and the services that they offer. We try to ensure that the information contained on this website is accurate and up to date. However, you should always verify the information before acting on it.`,
      ],
    },
    {
      title: "Use of the Website",
      paragraphs: [
        "You warrant that you are at least 18 years of age and possess the legal authority to enter into this agreement and to use the website in accordance with these Terms of Use.",
        "If you are using this website and/or making travel reservations or bookings for another person, you agree to inform that person about the Terms & Conditions that apply to the travel reservations and bookings you have made on their behalf, including all rules and restrictions applicable thereto.",
        "You agree to be financially responsible for all of your use of the website, as well as for use of your account by others. You are responsible for any bookings and travel reservations made by persons under your direction or control.",
        "You also warrant that all information supplied by you or on your behalf, or by members of your household, is true, current, complete and accurate. Furthermore, you confirm that the traveller is not an unaccompanied minor.",
      ],
    },
    {
      title: "Your Holiday Contract",
      paragraphs: [
        "When a booking is made, the lead name on the booking guarantees that he or she has the authority to accept and does accept on behalf of the party the terms of these booking conditions.",
        "After we receive your booking and all appropriate payments, if the arrangements you wish to book are available, we will issue a confirmation invoice. A binding agreement will come into existence between us when we dispatch this invoice to the lead name or your Tour Operator / Travel Agent.",
        "It is important to check the details on your invoice when you receive it, or if booking late at the time of booking, that all the details are exactly as you requested. In the event of any discrepancy, please contact us or your Tour Operator / Travel Agent immediately as it may not be possible to make changes later.",
      ],
    },
    {
      title: "Website Accuracy",
      bullets: [
        "Although WeynGo makes every effort to ensure the accuracy of the website information and pricing, errors may occasionally occur.",
        "You must therefore ensure you check the price and all other details of your chosen arrangements with us at the time of booking.",
      ],
    },
    {
      title: "Passports, Visas, Health Requirements and Travel Documents",
      bullets: [
        "It is your responsibility to ensure that you are in possession of all necessary travel and health documents before departure.",
        "A full and valid passport is required for destinations we feature, including children, and visas may be required for overseas destinations.",
        "Requirements may change and you must check the up-to-date position in good time before departure.",
        `By availing our services, you agree that ${brandName} can only help you apply for the visa and is not responsible for any issues that may occur during this application including, but not limited to, delay, clarification or rejection by the embassy.`,
        "Insurance: We consider adequate travel insurance to be essential. Please read the policy and take it with you on holiday. It is your responsibility to ensure that the insurance cover you purchase is suitable and adequate for your particular needs.",
        `${brandName} cannot be held responsible for denied entry if a guest is unable to provide details to authorities of insurance or denial of entry for any reason. If you choose to travel without adequate insurance coverage, we will not be liable for any of your losses howsoever arising, which would have been covered had you purchased adequate insurance.`,
      ],
    },
    {
      title: "Paying for Your Holiday",
      bullets: [
        "In order to confirm your chosen arrangements, you may either pay a partial amount as chosen by the Tour Operator or pay in full.",
        "If you choose to pay a partial sum, the remainder of the amount should be paid within 3 days of paying the partial amount.",
        "Paying any of these amounts secures the specific types of airline tickets, tours, land transport etc., and this will be confirmed to you at the time of booking.",
        "If we do not receive this balance in full and on time, we reserve the right to treat your booking as cancelled by you, in which case the cancellation charges set out in the applicable clause will become payable.",
        "Cancellation fees, processing and booking amendment fees, as well as insurance premiums, are due immediately after invoicing by WeynGo.",
        "The travel documents will be sent to the customer within 14 days after receipt of final payment at WeynGo.",
        "If the booking is made less than 30 days before arrival, the entire travel price is due immediately upon receipt of the written travel confirmation.",
        "We accept payment by credit card, debit card, internet banking and transfers to our bank accounts.",
      ],
    },
    {
      title: "Convenience Fees",
      bullets: [
        "Convenience fees are applicable for all payments made after the date of booking, except for transfers into our bank account.",
        "We reserve the right to withdraw waivers for convenience fees on payments made on the day of booking.",
        "Credit Card Fraud Contingency: If you do not supply the correct credit or debit card billing address and/or cardholder information, the issue of your tickets may be delayed and the overall cost may increase.",
        "We reserve the right to cancel your holiday if payment is declined or if you have supplied incorrect credit card information.",
        "We also reserve the right to do random checks in order to minimize credit card fraud. As a result, before issuing tickets we may require you to provide us with a fax or postal copy of proof of address, a copy of your credit card and a recent statement.",
      ],
    },
    {
      title: "Your Holiday Price",
      bullets: [
        "WeynGo endeavors to ensure that the most up to date and correct prices are shown on our website.",
        "WeynGo reserves the right to raise or lower prices at any time.",
        "Occasionally, an incorrect price may be shown due to an error.",
        "When WeynGo becomes aware of any such error, we will endeavour to notify you at the time of booking or as soon as reasonably possible.",
        "We reserve the right to cancel the booking if you do not wish to accept the price which is actually applicable to the holiday.",
      ],
    },
    {
      title: "If You Change Your Booking",
      bullets: [
        "If, after our confirmation invoice has been issued, you wish to change your travel arrangements in any way, we will do our utmost to make these changes, but it may not always be possible.",
        "Any request for changes must be from the lead name on the booking or your Tour Operator through WeynGo.",
        "You should be aware that these costs could increase the closer to the departure date that changes are made.",
        "Only one change of departure date per booking may be permitted.",
        "Any change in departure date will be treated as a cancellation and full cancellation charges will apply.",
        "Note: Certain arrangements may not be amended after they have been confirmed and any alteration could incur a cancellation charge of up to 100% of that part of the arrangements.",
        "In some cases, any changes made may mean you having to pay for the cancelled arrangements and purchasing new ones at full cost.",
      ],
    },
    {
      title: "If You Cancel Your Holiday",
      bullets: [
        "You, or any member of your party, may cancel your travel arrangements at any time.",
        "Written notification by mail, fax or email from the lead name on the booking or your Tour Operator on your behalf must be received at our offices.",
        "If the reason for your cancellation is covered under the terms of your insurance policy, you may be able to reclaim these charges from your insurance company.",
        "Our cancellation charges are a percentage of the total holiday cost and are based on how many days before your departure we receive your cancellation notice.",
        "Please note that any amendment charges are non-refundable.",
        "If only some members of your party cancel, we will recalculate the holiday cost for the remaining travellers.",
      ],
    },
    {
      title: "If We Change or Cancel Your Holiday",
      paragraphs: [
        "Our Tour Operators begin planning the arrangements we offer many days in advance and so we reserve the right to make changes to and correct errors in holiday details both before and after bookings have been confirmed.",
        "We must also reserve the right to cancel confirmed bookings at any time.",
        "Most changes are minor but occasionally, we may have to make a Major Change.",
        "If we have to make a Major Change or cancel, we will tell you as soon as possible and, if there is time to do so before departure, we will offer you the choice of the following options:",
      ],
      bullets: [
        "For Major Changes: accepting the changed arrangements, or",
        "Purchasing alternative arrangements from us, of a similar standard to those originally booked if available. If the chosen alternative is less expensive than your original one, we will refund the difference; if it is more expensive, we will ask you to pay the difference.",
      ],
    },
    {
      title: "Mode and Duration of Refund(s)",
      bullets: [
        "Refunds once initiated from our systems are usually released within 3–4 working days, but can take up to 21 working days to hit your account.",
        "Refund will be initiated only to the original mode of payment.",
        "In cases where refund is not possible to the original mode of payment, refund may be done to the buyer’s banking account, wherein we will need to do verification (KYC) and proof of ownership of account.",
        "The timeline of the verification can vary from 7–15 working days.",
        "All PayPal refunds, after 60 days of transaction, will be done only to the PayPal linked email ID used to make the initial payment.",
        "Exceptions will be handled from case to case basis, but we do not entertain cross-currency refunds.",
      ],
    },
    {
      title: "Flights",
      paragraphs: [
        "We are not always in a position at the time of booking to confirm the carrier(s), aircraft type and flight timings which will be used in connection with your flight.",
        "The carrier(s), flight timings and types of aircraft shown in this website and detailed on your confirmation invoice are for guidance only and are subject to alteration and confirmation.",
        "The latest timings will be shown on your tickets which will be dispatched to you approximately two weeks before departure.",
        "You must accordingly check your tickets very carefully immediately on receipt to ensure you have the correct flight times.",
        "It is possible that flight times may be changed even after tickets have been dispatched; we will contact you as soon as possible if this occurs.",
        "Any change in the identity of the carrier(s), flight timings, and/or aircraft type will not entitle you to cancel or change to other arrangements without paying our normal charges.",
        "This website is our responsibility, as your tour operator. It is not issued on behalf of, and does not commit the airlines mentioned herein or any airline whose services are used in the course of your travel arrangements.",
      ],
    },
    {
      title: "Behaviour",
      bullets: [
        "When you book a holiday with WeynGo you accept responsibility for the proper conduct for yourself and your party whilst on holiday.",
        "If we or any other person in authority is of the reasonable opinion that you or any member of your party is behaving in such a way as to cause or be likely to cause danger or upset to any other person or damage to property, we will be entitled to terminate the holiday of the person(s) concerned.",
        "The person(s) concerned will be required to leave the accommodation or other service and we will have no further responsibility to them including any return travel arrangements.",
        "No refunds will be made and we will not pay any expenses or costs incurred as a result of the termination.",
        "You will be responsible for making full payment for any damage or loss caused by you or any member of your party during your time away.",
        "Payment must be paid direct at the time to the service supplier concerned failing which, you will be responsible for meeting any claims subsequently made against us as a result of your actions.",
      ],
    },
    {
      title: `If You Have A Complaint`,
      bullets: [
        `In the event that you have any reason to complain or experience any problems with your holiday arrangements whilst away, you must immediately inform the representative of the Tour Operator, WeynGo and the supplier of the service(s) in question and complete a report form whilst in resort.`,
        `Most problems or complaints can be resolved while you are away; however, if you remain dissatisfied, please call us or write to ${supportEmail} within 7 days of your return giving your booking reference and full details of your complaint and all other relevant information.`,
        "Please keep your letter concise and to the point. This will assist us to quickly identify your concerns and speed up our response to you.",
      ],
    },
    {
      title: "Our Liability To You",
      paragraphs: [
        "In respect of Packages, we promise that your holiday arrangements will be made, performed or provided with reasonable skill and care.",
        "This means that we will accept responsibility if, for example, your contracted arrangements are not provided as promised or prove deficient as a result of the failure of ourselves or our employees to use reasonable skill and care in making, performing or providing your arrangements.",
        "However, we shall not be responsible for any errors which occur due to any systematic issues or fluctuation in prices or availability of flights, hotels, cars or our service providers. In such cases, we would be able to provide you a full refund.",
        "In respect of other arrangements, we promise to use reasonable skill and care in the performance of our contractual obligations, subject to and in accordance with these Booking Conditions.",
        "Our contractual obligations consist of using our reasonable skill and care in making your booking and arranging your accommodation, car hire or flight, as well as using our reasonable skill and care in choosing our suppliers.",
      ],
      bullets: [
        "We will not be responsible for any injury, illness, death, loss, damage, expense, cost or other claim of any description whatsoever which results from the act(s) and/or omission(s) of the person(s) affected or any member(s) of their party.",
        "We will also not be responsible where the act(s) and/or omission(s) are of a third party not connected with the provision of your arrangements and which were unforeseeable or unavoidable.",
        "Except as specifically set out in these conditions, we will not accept any further or different liability than the Package Travel, Package Tours and Package Holidays Regulations impose.",
        "It is your responsibility to show that reasonable skill and care has not been used if you wish to make a claim against us.",
      ],
    },
    {
      title: "Data Protection / Privacy",
      paragraphs: [
        "In order to process your booking and meet your requirements, we must pass your personal details on to the relevant suppliers of your travel arrangements.",
        "We would also like to hold your information, including any email address, where collected by us, for our own future marketing purposes.",
        `For full details of our data protection and privacy policy, and an explanation of how your personal details will be used by us, please refer to our privacy policy. You may also contact us at ${supportEmail}.`,
      ],
    },
    {
      title: "Special Requests and Medical Problems",
      paragraphs: [
        "If you wish to make a special request, you must do so at the time of booking.",
        "We will try to pass any reasonable requests on to the relevant supplier but we cannot guarantee that requests will be met.",
        "The fact that a special request has been noted on your confirmation invoice or any other documentation or that it has been passed on to the supplier is not confirmation that the request will be met.",
        "Failure to meet any special request will not be a breach of contract on our part unless the request has been specifically confirmed.",
      ],
      bullets: [
        "We are happy to advise and assist you in choosing a suitable holiday.",
        "As some of the accommodation and resorts featured may lack even the simplest facilities, such as ramps for wheelchairs or lifts, it is important that, when booking, you advise us of any disabilities and special requirements to make sure the holiday meets your specific needs.",
        "If we reasonably feel unable to properly accommodate the particular needs of the person(s) concerned, we will not confirm the booking or, if full details are not given at the time of booking, cancel when we become aware of these details.",
        `For further assistance, please call our Customer Care team or email ${supportEmail}.`,
      ],
    },
    {
      title: "General Limitation of Liability",
      bullets: [
        "To the maximum extent permitted by law, in no event shall WeynGo be liable to any person or entity for any direct, indirect, incidental, special, exemplary, compensatory, consequential, or punitive damages or any damages whatsoever.",
        "This includes, but is not limited to, loss of production, loss of profit, loss of revenue, loss of contract, loss of or damage to goodwill or reputation, inconvenience, stress, distress, loss of claim, business interruption, data or other intangible losses.",
        "The limitations of liability in this Agreement shall apply regardless of the form of action, whether based on contract, tort, negligence, strict liability or otherwise.",
        "A force majeure event is any event beyond the control of WeynGo and can include natural disasters, weather conditions, fire, nuclear incident, electromagnetic pulse, terrorist act, riots, war, arson attacks, insurgency, rebellion, armed hostilities of any kind, labor disputes, lockouts, strikes, shortages, government actions or restraints, pilferage, bankruptcy, machinery breakdown, network or system interruptions, internet or communications breakdown, quarantine, epidemic, pandemic and similar events.",
        "WeynGo has no liability and will make no refund in the event of any delay, cancellation, overbooking, strike, force majeure or other causes beyond direct control, and has no responsibility for any additional expenses, omissions, delays, re-routing or acts of any government or authority.",
      ],
    },
    {
      title: "Prohibited Activities",
      bullets: [
        "The content and information on this website, including price and availability of travel services, as well as the infrastructure used to provide such content and information, is proprietary to us or our suppliers and providers.",
        "While you may make limited copies of your travel itinerary and related documents for travel or service reservations booked through this website, you agree not to otherwise modify, copy, distribute, transmit, display, perform, reproduce, publish, license, create derivative works from, transfer, or sell or re-sell any information, software, products, or services obtained from or through this website.",
        "Additionally, you agree not to make any speculative, false, or fraudulent reservation; access or copy content using automated means without express written permission; bypass access controls; overload our infrastructure; attempt unauthorized access; manipulate identifiers; or use the site in a manner that damages or interferes with our services or reputation.",
        "If your booking or account shows signs of fraud, abuse or suspicious activity, we may cancel associated reservations and close associated accounts.",
      ],
    },
    {
      title: "Jurisdiction and Applicable Law",
      paragraphs: [
        "These Terms & Conditions and any agreement to which they apply are governed in all respects by the laws of the courts in Bangalore, India, without regard to conflicts of law principles.",
        "All guest claims must be submitted in writing and received by WeynGo no later than sixty (60) days after the completion of the vacation.",
        "Guest claims not submitted and received within this time shall be deemed waived and barred.",
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
            Legal Information
          </div>

          <h1 style={titleStyle}>Terms and Conditions</h1>
          <p style={subtitleStyle}>
            Welcome to {brandName}. These terms describe how our travel
            services, bookings, refunds, and support work. We have designed this
            page to be easier to read while keeping the original meaning intact.
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
              Page Type
            </div>
            <div style={{ fontWeight: 700, fontSize: "1.05rem" }}>
              Booking Terms
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
            Travel made simple, transparent, and beautifully organized.
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
