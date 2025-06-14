import React from "react";

interface PaginationProps {
  currentPage: string | number | any;
  totalPages: number;
  setPage: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, setPage }) => {
  const handlePageChange = (page: number) => {
    localStorage.setItem('page',page.toString())
    if (page >= 1 && page <= totalPages) {
      setPage(page);
    }
  };

  return (
    <nav aria-label="Page navigation">
      <ul className="pagination pagination-sm d-flex justify-content-center">
        <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
          <button className="page-link" onClick={() => handlePageChange(currentPage - 1)}>
            &lt;
          </button>
        </li>

        {Array.from({ length: totalPages }, (_, index) => (
          <li key={index} className={`page-item ${currentPage === index + 1 ? "active" : ""}`} style={{marginLeft:'1px'}}>
            <button className="page-link" onClick={() => handlePageChange(index + 1)}>
              {index + 1}
            </button>
          </li>
        ))}

        <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
          <button className="page-link" onClick={() => handlePageChange(currentPage + 1)}>
            &gt;
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Pagination;