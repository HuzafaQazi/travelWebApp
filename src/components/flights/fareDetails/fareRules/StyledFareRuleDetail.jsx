const StyledFareRuleDetail = ({ content }) => {
  const sections = content.split("\n\n");

  return (
    <div className="text-sm text-gray-700 space-y-4">
      {sections.map((section, index) => {
        if (section.includes(":")) {
          const [title, ...details] = section.split(":");
          return (
            <div key={index} className="border-b border-gray-200 pb-2">
              <h3 className="font-semibold text-gray-900 mb-1">
                {title.trim()}:
              </h3>
              <p className="text-gray-600">{details.join(":").trim()}</p>
            </div>
          );
        } else if (section.includes("|")) {
          const rows = section.split("\n");
          return (
            <table key={index} className="w-full border-collapse">
              <tbody>
                {rows.map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className={rowIndex % 2 === 0 ? "bg-gray-50" : "bg-white"}
                  >
                    {row.split("|").map((cell, cellIndex) => (
                      <td
                        key={cellIndex}
                        className="border border-gray-200 p-2"
                      >
                        {cell.trim()}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          );
        } else {
          return (
            <p key={index} className="text-gray-600">
              {section}
            </p>
          );
        }
      })}
    </div>
  );
};

export default StyledFareRuleDetail;
