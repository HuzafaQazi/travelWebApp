import { useSelector } from "react-redux";
import { useUserPermissions } from "@/hooks/useUserPermissions";
import { faAngleRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const Counts = ({ handleRedirect }) => {
  const { userType, isApprover, isAdminApprover } = useUserPermissions();

  const counts = useSelector((state) => state?.approvals?.counts || {});

  const countsData = [];
  if (userType === 2 && !isApprover) {
    countsData.push({
      label: "Requests sent by you",
      count: counts["2"] || 0,
      requestType: "2",
    });
  } else if (userType === 2 && isApprover) {
    countsData.push(
      {
        label: "Requests sent by you",
        count: counts["2"] || 0,
        requestType: "2",
      },
      {
        label: "For you to Approve",
        count: counts["3"] || 0,
        requestType: "3",
      }
    );
  } else if (userType === 1) {
    countsData.push(
      {
        label: "Requests sent by All",
        count: counts["1"] || 0,
        requestType: "1",
      },
      {
        label: "Requests sent by you",
        count: counts["2"] || 0,
        requestType: "2",
      }
    );
    if (isAdminApprover) {
      countsData.push({
        label: "For you to Approve",
        count: counts["3"] || 0,
        requestType: "3",
      });
    }
  }

  return (
    <>
      <div className="p-2">
        <div className="flex justify-between gap-3 w-full overflow-x-scroll hide-scrollbar">
          {countsData.map((item, index) => (
            <button
              key={index}
              onClick={() => handleRedirect(item.requestType)}
              className="flex flex-col items-center sm:items-start justify-center text-center w-full text-nowrap py-4 px-2 bg-white border-1 border-[#028fa350] rounded-lg hover:shadow-[0_4px_4px_rgba(2,143,163,0.3)] transition-shadow duration-200"
            >
              <span className="text-base sm:text-3xl font-bold">
                {item.count}
              </span>
              <span className="text-sm sm:text-base text-gray-600 font-medium">
                {item.label} <FontAwesomeIcon icon={faAngleRight} />
              </span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

export default Counts;
