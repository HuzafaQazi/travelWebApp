import React from "react";
import AsyncSelect from "react-select/async";

const AsyncSelectInput = ({
  placeholder,
  value,
  onChange,
  loadOptions,
  instanceId,
  styles,
  className = "",
  isDisabled = false,
  defaultOptions = [],
  showIcon = true,
  iconType = "plane", // plane, hotel, car, bus, train, city, etc.
  customFormatting = false,
  labelField = "label",
  subtitleFields = [], // Array of fields to display as subtitle
  showClearButton = true, // New prop to control X button visibility
  formatSubtitle = null, // Custom function to format subtitle
  error = null, // New prop to display error state
}) => {
  const customStyles = {
    control: (base, state) => ({
      ...base,
      borderColor: error
        ? "#ef4444"
        : state.isFocused
          ? "#028fa3"
          : "#e2e8f0",
      boxShadow: error
        ? "0 0 0 1px #ef4444"
        : state.isFocused
          ? "0 0 0 1px #028fa3"
          : "none",
      "&:hover": {
        borderColor: error ? "#ef4444" : "#028fa3",
      },
      fontSize: "0.875rem",
      padding: "2px",
      paddingLeft: showIcon ? "32px" : "8px", // Add space for icon
      paddingRight: showClearButton && value ? "28px" : "8px", // Add extra padding for X button
      borderRadius: "0.75rem", // Match your other inputs
      height: "48px", // Match your other inputs height
      backgroundColor: "#f6f6f6", // Match your other inputs background
      ...(styles?.control ? styles.control(base, state) : {}),
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? "#e6f7f9"
        : state.isFocused
          ? "#f0f9fa"
          : "white",
      color: state.isSelected ? "#028fa3" : "#1f2937",
      fontSize: "0.875rem",
      cursor: "pointer",
      padding: customFormatting ? "10px 12px" : base.padding, // Add more padding for the custom content
      borderBottom: "1px solid #f3f4f6",
      "&:last-child": {
        borderBottom: "none",
      },
      "&:hover": {
        backgroundColor: "#f0f9fa",
      },
      ...(styles?.option ? styles.option(base, state) : {}),
    }),
    menu: (base) => ({
      ...base,
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
      borderRadius: "0.5rem",
      zIndex: 100,
      overflow: "hidden",
      ...(styles?.menu ? styles.menu(base) : {}),
    }),
    menuList: (base) => ({
      ...base,
      padding: "0.5rem 0",
      maxHeight: "250px",
      ...(styles?.menuList ? styles.menuList(base) : {}),
    }),
    valueContainer: (base) => ({
      ...base,
      fontSize: "1rem",
      fontWeight: "500", // medium weight to match your design
      color: "#000000", // Match your text color
      ...(styles?.valueContainer ? styles.valueContainer(base) : {}),
    }),
    placeholder: (base) => ({
      ...base,
      color: "#9ca3af", // Gray-400
      fontSize: "1rem",
      ...(styles?.placeholder ? styles.placeholder(base) : {}),
    }),
    noOptionsMessage: (base) => ({
      ...base,
      fontSize: "0.875rem",
      color: "#6b7280",
      padding: "12px",
      ...(styles?.noOptionsMessage ? styles.noOptionsMessage(base) : {}),
    }),
    loadingMessage: (base) => ({
      ...base,
      fontSize: "0.875rem",
      color: "#6b7280",
      padding: "12px",
      ...(styles?.loadingMessage ? styles.loadingMessage(base) : {}),
    }),
    // Needed to keep consistency with original styles
    ...(styles || {}),
  };

  // Icon rendering based on iconType
  const renderIcon = (type, size = 16) => {
    const iconProps = {
      xmlns: "http://www.w3.org/2000/svg",
      width: size,
      height: size,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      className: "text-gray-500",
    };

    switch (type) {
      case "plane":
        return (
          <svg {...iconProps}>
            <path d="M22 2L13.6 7 2 9l9 4 11-11z"></path>
            <path d="M16 8l-4 4"></path>
            <path d="M9 15.9l-2.5 2.1L2 22"></path>
          </svg>
        );
      case "hotel":
        return (
          <svg {...iconProps}>
            <path d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16"></path>
            <path d="M1 21h22"></path>
            <path d="M7 10.6h10"></path>
            <path d="M7 14.6h10"></path>
          </svg>
        );
      case "city":
        return (
          <svg {...iconProps}>
            <path d="M2 22h20"></path>
            <path d="M17 2H7l-5 8h20l-5-8z"></path>
            <path d="M14 22V8"></path>
            <path d="M10 22V8"></path>
            <path d="M4 22V12"></path>
            <path d="M20 22V12"></path>
          </svg>
        );
      case "car":
        return (
          <svg {...iconProps}>
            <path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a1 1 0 0 0-.8-.4H5.24a2 2 0 0 0-1.8 1.1l-.8 1.63A6 6 0 0 0 2 12.42V16h2"></path>
            <circle cx="6.5" cy="16.5" r="2.5"></circle>
            <circle cx="16.5" cy="16.5" r="2.5"></circle>
          </svg>
        );
      case "bus":
        return (
          <svg {...iconProps}>
            <rect x="3" y="6" width="18" height="12" rx="2" ry="2"></rect>
            <path d="M3 10h18"></path>
            <path d="M7 15h.01"></path>
            <path d="M17 15h.01"></path>
            <path d="M6 19v1"></path>
            <path d="M18 20v-1"></path>
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
          </svg>
        );
      case "train":
        return (
          <svg {...iconProps} className="text-[#028fa3]">
            <rect x="4" y="3" width="16" height="16" rx="2"></rect>
            <path d="M4 11h16"></path>
            <path d="M12 3v16"></path>
            <path d="M4 19L2 22"></path>
            <path d="M20 19l2 3"></path>
          </svg>
        );
      default:
        return null;
    }
  };

  // Get subtitle text from data object based on provided fields
  const getSubtitleText = (data) => {
    // If custom formatter is provided, use it
    if (formatSubtitle && typeof formatSubtitle === "function") {
      return formatSubtitle(data);
    }

    // Otherwise use the default field-based approach
    if (!subtitleFields || subtitleFields.length === 0) return null;

    const subtitleParts = subtitleFields
      .map((field) => {
        // Handle nested fields with dot notation
        if (field.includes(".")) {
          const parts = field.split(".");
          let value = data;
          for (const part of parts) {
            value = value?.[part];
            if (value === undefined) break;
          }
          return value;
        }
        return data[field];
      })
      .filter(Boolean);

    return subtitleParts.join(", ");
  };

  // Custom option component to display icon and formatted info
  const CustomOption = ({ innerProps, data, isSelected }) => {
    const mainLabel = data[labelField] || data.label;
    const subtitle = getSubtitleText(data);
    const showCode = data.locationCode
      ? ` (${data.locationCode})`
      : data.airportCode
        ? ` (${data.airportCode})`
        : "";

    // Determine which icon to use - use the icon type from the data if available
    const iconToUse = data.type === 1 ? "city" : iconType;

    return (
      <div
        {...innerProps}
        className={`flex items-start py-2 px-3 ${isSelected ? "bg-[#e6f7f9]" : ""} hover:bg-[#f0f9fa] transition-colors duration-150`}
      >
        {showIcon && (
          <div className="flex-shrink-0 mr-3 mt-1">{renderIcon(iconToUse)}</div>
        )}
        <div className="flex flex-col">
          <div className="font-medium text-[#171a19]">{mainLabel}{showCode}</div>
          {subtitle && (
            <div className="text-xs text-gray-600 mt-0.5">
              {subtitle}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Custom format for the selected value
  const formatOptionLabel = (option) => {
    const mainLabel = option[labelField] || option.label;
    const codeDisplay = option.locationCode
      ? ` (${option.locationCode})`
      : option.airportCode
        ? ` (${option.airportCode})`
        : "";

    if (!customFormatting) return option.label;

    // Determine which icon to use - use the icon type from the data if available
    const iconToUse = option.type === 1 ? "city" : iconType;

    return (
      <div className="flex items-center">
        {/* {showIcon && <div className="mr-2">{renderIcon(iconToUse, 16)}</div>} */}
        <span className="truncate">
          {mainLabel}
          {codeDisplay}
        </span>
      </div>
    );
  };

  // Custom NoOptionsMessage
  const NoOptionsMessage = props => {
    return (
      <div {...props.innerProps} className="p-3 text-sm text-gray-600 text-center">
        Type to search locations...
      </div>
    );
  };

  // Custom LoadingMessage
  const LoadingMessage = props => {
    return (
      <div {...props.innerProps} className="p-3 text-sm text-gray-600 text-center flex items-center justify-center">
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-[#028fa3]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Loading...
      </div>
    );
  };

  return (
    <div className="relative">
      {/* Input icon */}
      {showIcon && (
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10 pointer-events-none">
          {renderIcon(iconType, 18)}
        </div>
      )}

      <AsyncSelect
        cacheOptions
        defaultOptions={defaultOptions}
        value={value}
        onChange={onChange}
        loadOptions={loadOptions}
        placeholder={placeholder}
        instanceId={instanceId}
        className={`${className} ${error ? 'is-invalid' : ''}`}
        styles={customStyles}
        isDisabled={isDisabled}
        components={{
          ...(customFormatting ? { Option: CustomOption } : {}),
          ClearIndicator: () => null, // Hide the default clear indicator
          IndicatorSeparator: () => null, // Hide the separator
          DropdownIndicator: () => null,
          NoOptionsMessage,
          LoadingMessage
        }}
        formatOptionLabel={customFormatting ? formatOptionLabel : undefined}
        isClearable={false} // Use our custom clear button instead
      />

      {/* Custom clear button outside of the select component */}
      {!isDisabled && showClearButton && value && (
        <div
          className="absolute right-9 top-1/2 transform -translate-y-1/2 cursor-pointer p-1 rounded-full hover:bg-gray-200 z-10 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onChange(null);
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-gray-500"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </div>
      )}
    </div>
  );
};

export default AsyncSelectInput;