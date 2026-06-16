import { Icons } from './Icon';

export default function SearchBar({ value, onChange }) {
  return (
    <div className="search">
      <Icons.search size={16} />
      <input
        placeholder="Search name, email, role…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {value && (
        <button className="search-clear" onClick={() => onChange('')} aria-label="Clear">
          <Icons.close size={14} />
        </button>
      )}
    </div>
  );
}
