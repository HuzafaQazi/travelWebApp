import { faCheck, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const PackageInclusion = ({ inclusions = [], exclusions = [] }) => {
  return (
    <>
      {(inclusions.length > 0 || exclusions.length > 0) && (
        <div>
          <div className="w-[95%] h-auto ml-[2.5%] mt-[7%] p-[3%] border border-white rounded-[6px] shadow-[2px_1px_7px_0_rgba(2,143,163,0.24)] md:w-[90%] md:ml-[5%] md:mt-[5%] md:shadow-[7px_4px_20px_0_rgba(2,143,163,0.52)]">
            <div className="text-[#028fa3] text-base md:text-xl font-semibold border-b border-[#D9D9D980] p-2">
              What{"'"}s inside the package?
            </div>

            <div className="flex mt-2">
              {/* Inclusions Section */}
              <div className="flex flex-col w-[50%] p-3">
                <div className="text-[#000000] text-sm md:text-lg font-medium mb-2">
                  Inclusions
                </div>

                {inclusions.length > 0 ? (
                  inclusions.map((inclusion, index) => (
                    <div
                      key={index}
                      className="text-[#000000] text-xs md:text-base font-base mb-1"
                    >
                      <FontAwesomeIcon
                        icon={faCheck}
                        className="text-[#418C12] mr-2"
                      />
                      <span>{inclusion}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-[#000000] text-xs md:text-base font-base">
                    <span>No inclusions available.</span>
                  </div>
                )}
              </div>

              <div className="border-r border-[#D9D9D980]"></div>

              {/* Exclusions Section */}
              <div className="flex flex-col w-[50%] p-3">
                <div className="text-[#000000] text-sm md:text-lg font-medium mb-2">
                  Exclusions
                </div>

                {exclusions.length > 0 ? (
                  exclusions.map((exclusion, index) => (
                    <div
                      key={index}
                      className="text-[#000000] text-xs md:text-base font-base mb-1"
                    >
                      <FontAwesomeIcon
                        icon={faXmark}
                        className="text-[#E53944] mr-2"
                      />
                      <span>{exclusion}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-[#000000] text-xs md:text-base font-base">
                    <span>No exclusions available.</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PackageInclusion;
