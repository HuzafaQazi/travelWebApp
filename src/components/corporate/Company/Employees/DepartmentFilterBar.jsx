import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleLeft, faAngleRight } from "@fortawesome/free-solid-svg-icons";

const DepartmentFilterBar = ({
  scrollRef,
  departmentData,
  selectedEmployeeFilterDepartments,
  handleEmployeeDepartmentClickFilter,
}) => {
  const handleScrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -100, behavior: "smooth" });
    }
  };

  const handleScrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 100, behavior: "smooth" });
    }
  };

  return (
    <div className="flex w-3/5 sm:w-full items-center cursor-pointer">
      <FontAwesomeIcon
        icon={faAngleLeft}
        className="text-lg"
        onClick={handleScrollLeft}
      />
      <div
        ref={scrollRef}
        className="px-4 flex gap-2 sm:gap-10 max-w-3/5 md:max-w-screen-lg  overflow-scroll hide-scrollbar mr-2 ml-2"
      >
        {[
          "UNASSIGNED",
          ...(Array.isArray(departmentData?.departments)
            ? departmentData?.departments?.map((dept) => dept.departmentId)
            : []),
        ].map((item, index) => (
          <span
            key={index}
            data-department-id={item}
            onClick={() => handleEmployeeDepartmentClickFilter(item)}
            className={`text-nowrap text-sm font-medium cursor-pointer ${
              selectedEmployeeFilterDepartments.includes(item)
                ? "text-sm text-[#028FA3] bg-[#028FA317] rounded-xl p-2 pt-1 pb-1"
                : "text-sm text-[#171A19B2] bg-transparent p-2 pt-1 pb-1"
            }`}
          >
            {item === "UNASSIGNED"
              ? "Unassigned"
              : departmentData?.departments?.find(
                  (dept) => dept.departmentId === item
                )?.departmentName}
          </span>
        ))}
      </div>
      <FontAwesomeIcon
        icon={faAngleRight}
        className="text-lg cursor-pointer"
        onClick={handleScrollRight}
      />
    </div>
  );
};

export default DepartmentFilterBar;
