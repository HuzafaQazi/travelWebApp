const Pagination = ({ currentPage, totalPages, onPageChange, rowsPerPage }) => {
  const pageNumbers = [];
  const maxPageNumbersToShow = Math.min(rowsPerPage, 7); // Limit to a maximum of 7 for better UI

  if (totalPages > 1) {
    let startPage, endPage;

    if (totalPages <= maxPageNumbersToShow) {
      startPage = 1;
      endPage = totalPages;
    } else {
      // Calculate start and end pages
      const middlePage = Math.floor(maxPageNumbersToShow / 2);

      if (currentPage <= middlePage + 1) {
        startPage = 1;
        endPage = maxPageNumbersToShow - 1;
      } else if (currentPage >= totalPages - middlePage) {
        startPage = totalPages - maxPageNumbersToShow + 2;
        endPage = totalPages;
      } else {
        startPage = currentPage - middlePage;
        endPage = currentPage + middlePage;
      }
    }

    // Add first page
    pageNumbers.push(1);

    // Add ellipsis if needed
    if (startPage > 2) {
      pageNumbers.push("...");
    }

    // Add pages
    for (
      let i = Math.max(2, startPage);
      i <= Math.min(totalPages - 1, endPage);
      i++
    ) {
      pageNumbers.push(i);
    }

    // Add ellipsis if needed
    if (endPage < totalPages - 1) {
      pageNumbers.push("...");
    }

    // Add last page
    if (totalPages > 1) {
      pageNumbers.push(totalPages);
    }
  } else {
    pageNumbers.push(1);
  }

  return (
    <div className="flex justify-center mt-4">
      <button
        className="px-4 py-2 mx-1 bg-[#028fa3] text-white rounded disabled:bg-gray-300 text-xxs sm:text-sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1 || totalPages === 1}
      >
        Previous
      </button>

      {pageNumbers.map((page, index) =>
        page === "..." ? (
          <span key={index} className="px-2 text-[#028fa3]">
            ...
          </span>
        ) : (
          <button
            key={page}
            className={`px-4 py-2 mx-1 rounded text-xxs sm:text-sm ${
              page === currentPage
                ? "bg-[#028fa3] text-white"
                : "bg-gray-100 text-[#028fa3]"
            }`}
            onClick={() => onPageChange(page)}
          >
            {page}
          </button>
        )
      )}

      <button
        className="px-4 py-2 mx-1 bg-[#028fa3] text-white rounded disabled:bg-gray-300 text-xxs sm:text-sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages || totalPages === 1}
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
