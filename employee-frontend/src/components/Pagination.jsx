import { Icons } from './Icon';

export default function Pagination({ page, totalPages, pageSize, rangeStart, rangeEnd, total, onPage, onPageSize }) {
  return (
    <div className="pagination">
      <div className="page-size">
        <span>Rows per page</span>
        <div className="select-wrap mini">
          <select value={pageSize} onChange={(e) => onPageSize(Number(e.target.value))}>
            {[10, 25, 50].map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
          <Icons.chevronDown size={13} />
        </div>
      </div>
      <div className="page-controls">
        <span className="page-range">{rangeStart}–{rangeEnd} of {total}</span>
        <div className="page-btns">
          <button className="icon-btn sm" disabled={page <= 1} onClick={() => onPage(page - 1)} aria-label="Previous">
            <Icons.chevronLeft size={16} />
          </button>
          <button className="icon-btn sm" disabled={page >= totalPages} onClick={() => onPage(page + 1)} aria-label="Next">
            <Icons.chevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
