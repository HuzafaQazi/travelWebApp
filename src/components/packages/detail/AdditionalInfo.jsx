import { faXmarkCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState, useEffect } from "react";

const AdditionalInfo = ({ additional_information }) => {
  const [isModalOpen, setModalOpen] = useState(false);

  const openModal = () => {
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "visible";
    }

    return () => {
      document.body.style.overflow = "visible";
    };
  }, [isModalOpen]);

  if (!additional_information) {
    return null;
  }

  const previewContent = additional_information.substring(0, 100) + "...";

  return (
    <>
      <div>
        <div className="w-[95%] h-auto ml-[2.5%] mt-[7%] p-[3%] border border-white rounded-[6px] shadow-[2px_1px_7px_0_rgba(2,143,163,0.24)] md:w-[90%] md:ml-[5%] md:mt-[5%] md:shadow-[7px_4px_20px_0_rgba(2,143,163,0.52)]">
          <div className="w-[100%] h-auto border-1 border-[#028fa380] p-[3%] md:p-[2%] md:w-[100%] rounded-2xl ">
            <div className="text-[#028fa3] font-bold text-lg md:text-xl md:font-semibold ">
              Additional Information
            </div>
            <div className="flex justify-between items-center mt-2">
              <div
                className="text-sm md:text-base text-[#000000] font-medium"
                dangerouslySetInnerHTML={{ __html: previewContent }}
              />

              <div
                className="text-sm md:text-base text-[#028fa3] font-medium cursor-pointer hover:underline transition duration-300"
                onClick={openModal}
              >
                Read More
              </div>
            </div>

            {isModalOpen && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white w-[95%] rounded-lg shadow-lg md:w-[80%] lg:w-[70%] relative max-h-[90vh] flex flex-col">
                  <div className="bg-[#028fa3] text-white py-4 px-6 rounded-t-lg flex justify-between items-center">
                    <h2 className="text-xl md:text-2xl font-bold">
                      Additional Information
                    </h2>
                    <button
                      className="text-white hover:text-gray-200 transition duration-300"
                      onClick={closeModal}
                    >
                      <FontAwesomeIcon
                        icon={faXmarkCircle}
                        className="text-2xl"
                      />
                    </button>
                  </div>

                  <div className="p-6 overflow-y-auto flex-grow scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-[#028fa3] scrollbar-track-gray-100">
                    <div
                      className="additional-info-content"
                      dangerouslySetInnerHTML={{
                        __html: additional_information,
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <style jsx global>{`
        .additional-info-content {
          color: #333;
          font-size: 16px;
          line-height: 1.8;
          font-family: "Arial", sans-serif;
        }
        .additional-info-content h2 {
          color: #028fa3;
          font-size: 24px;
          font-weight: bold;
          margin-top: 28px;
          margin-bottom: 16px;
          border-bottom: 2px solid #e0f2f7;
          padding-bottom: 8px;
        }
        .additional-info-content h3 {
          color: #028fa3;
          font-size: 20px;
          font-weight: bold;
          margin-top: 24px;
          margin-bottom: 12px;
        }
        .additional-info-content p {
          margin-bottom: 16px;
        }
        .additional-info-content ul,
        .additional-info-content ol {
          margin-bottom: 16px;
          padding-left: 24px;
        }
        .additional-info-content li {
          margin-bottom: 8px;
          position: relative;
        }
        .additional-info-content ul li::before {
          content: "•";
          color: #028fa3;
          font-weight: bold;
          display: inline-block;
          width: 1em;
          margin-left: -1em;
        }
        .additional-info-content ol {
          counter-reset: item;
        }
        .additional-info-content ol li {
          counter-increment: item;
        }
        .additional-info-content ol li::before {
          content: counter(item) ".";
          color: #028fa3;
          font-weight: bold;
          display: inline-block;
          width: 1.5em;
          margin-left: -1.5em;
        }
        .additional-info-content strong {
          font-weight: 600;
          color: #028fa3;
        }
        .additional-info-content em {
          font-style: italic;
        }
        .additional-info-content a {
          color: #028fa3;
          text-decoration: underline;
          transition: color 0.3s ease;
        }
        .additional-info-content a:hover {
          color: #025f6d;
        }
      `}</style>
    </>
  );
};

export default AdditionalInfo;
