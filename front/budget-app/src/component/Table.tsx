import React from "react";

type Props = {
  tableTitles: React.ReactNode;
  bodyDatas: React.ReactNode[];
  className?: string;
};

const Table = ({ className, tableTitles, bodyDatas }: Props) => {
  return (
    <div className={`w-full rounded-lg border border-black ${className}`}>
      <table className="w-full divide-y divide-gray-500">
        <thead>{tableTitles}</thead>
        <tbody>{bodyDatas.map((data) => data)}</tbody>
      </table>
    </div>
  );
};

export default Table;
