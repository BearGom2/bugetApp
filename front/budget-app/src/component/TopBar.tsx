import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useFilterQuery } from "../hooks/useFilterQuery";

const TopBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { query, updateFilterQuery } = useFilterQuery();
  return (
    <div
      className={`w-screen px-5 bg-white border-b h-12 sticky top-0 justify-between items-center border-b-black bg-opacity-80 z-50 ${
        localStorage.getItem("user") ? "flex" : "hidden"
      }`}
    >
      <p
        className="text-left cursor-pointer"
        onClick={() => {
          location.pathname == "/history"
            ? navigate({
                pathname: "/main",
                search: `?${new URLSearchParams(query.raw).toString()}`,
              })
            : navigate(-1);
        }}
      >
        ←
      </p>
      <p
        className="text-right cursor-pointer"
        onClick={() => {
          localStorage.removeItem("user");
          navigate("/login");
        }}
      >
        Logout
      </p>
    </div>
  );
};

export default TopBar;
