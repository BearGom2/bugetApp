import SearchIcon from "../assets/search.png";

const Search = ({
  value,
  onChange,
  onClick,
}: {
  value: string;
  onChange: (v: string) => void;
  onClick?: () => void;
}) => {
  return (
    <div
      className="input flex justify-between"
      onKeyDown={(e) => {
        if (e.key === "Enter" && onClick) onClick();
      }}
    >
      <input
        type="text"
        placeholder="Search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <img src={SearchIcon} className="h-6 cursor-pointer" onClick={onClick} />
    </div>
  );
};

export default Search;
