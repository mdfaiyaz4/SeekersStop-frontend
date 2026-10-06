import Button from './Button.jsx'

function getVisiblePages(currentPage, totalPages) {
  if (totalPages <= 5) return Array.from({ length: totalPages }, (_, index) => index)
  const start = Math.max(0, Math.min(currentPage - 1, totalPages - 3))
  const pages = new Set([0, totalPages - 1, start, start + 1, start + 2])
  return [...pages].sort((first, second) => first - second)
}

export default function Pagination({ currentPage, totalPages, onPageChange, label = 'Pages' }) {
  if (totalPages <= 1) return null
  const pages = getVisiblePages(currentPage, totalPages)

  return (
    <nav className="pagination" aria-label={label}>
      <Button type="button" variant="secondary" size="small" disabled={currentPage <= 0} onClick={() => onPageChange(currentPage - 1)}>
        <span aria-hidden="true">← </span><span className="pagination__wide-label">Previous</span>
      </Button>
      <div className="pagination__pages">
        {pages.map((page, index) => (
          <span className="pagination__page-wrap" key={page}>
            {index > 0 && page - pages[index - 1] > 1 && <span className="pagination__ellipsis" aria-hidden="true">…</span>}
            <Button type="button" variant={page === currentPage ? 'primary' : 'secondary'} size="small" aria-current={page === currentPage ? 'page' : undefined} aria-label={`Page ${page + 1}`} onClick={() => onPageChange(page)}>{page + 1}</Button>
          </span>
        ))}
      </div>
      <Button type="button" variant="secondary" size="small" disabled={currentPage >= totalPages - 1} onClick={() => onPageChange(currentPage + 1)}>
        <span className="pagination__wide-label">Next</span><span aria-hidden="true"> →</span>
      </Button>
      <span className="pagination__current">Page {currentPage + 1} of {totalPages}</span>
    </nav>
  )
}
