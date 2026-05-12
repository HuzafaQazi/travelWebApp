import { useState } from "react";

const MultiInput = ({
  onAddTag,
  onDeleteTag,
  tags,
  maxTags,
  placeholder,
  readOnly = false,
}) => {
  const [inputValue, setInputValue] = useState("");

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !readOnly) {
      event.preventDefault();
      if (inputValue.trim() !== "" && tags.length < maxTags) {
        onAddTag(inputValue.trim());
        setInputValue("");
      }
    }
  };

  const renderTag = (tag, index) => {
    const tagText = typeof tag === "object" ? tag.text : tag;
    const tagKey = typeof tag === "object" ? tag.id : index;

    return (
      <div
        key={tagKey}
        className="flex items-center gap-2 px-3 py-1 self-center bg-[#028FA31A] rounded-full text-sm"
      >
        <span>
          {tagText}
          {index < tags.length - 1 && ", "}
        </span>
        {!readOnly && (
          <button
            type="button"
            onClick={() => onDeleteTag(index)}
            className="text-gray-600 hover:text-gray-900 focus:outline-none"
          >
            &times;
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-wrap gap-2">
      {tags.length > 0 ? (
        tags.map(renderTag)
      ) : (
        <span className="text-gray-500 text-sm">No approver assigned</span>
      )}
      {!readOnly && (
        <input
          type="text"
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 rounded-lg py-1 pl-3 pr-10 outline-none text-sm"
          style={{ padding: "2%" }}
          placeholder={placeholder}
        />
      )}
    </div>
  );
};

export default MultiInput;
