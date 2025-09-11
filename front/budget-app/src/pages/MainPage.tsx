import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ko } from "date-fns/locale";

import Button from "../component/Button";
import MultiSelect from "../component/MultiSelect";
import Search from "../component/Search";
import Table from "../component/Table";
import ChartSlider from "../component/charts/ChartSlider";

import { useCategoryOptions } from "../hooks/useCategoryOptions";
import { useWhoOptions } from "../hooks/useWhoOptions";
import { useFilterQuery } from "../hooks/useFilterQuery";

import { TABLE_TITLES } from "../constants/tableTitles";
import { calculateTableData } from "../utils/calculateTableData";
import { filterHistories } from "../utils/filterHistories";
import { fetchHistories } from "../service/historyService";

import type { Option, History } from "../Types";

const MainPage = () => {
  const navigate = useNavigate();

  const { query, updateFilterQuery } = useFilterQuery();

  const [categories, setCategories] = useState<Option[]>([]);
  const [whoOptions, setWhoOptions] = useState<Option[]>([]);
  const [searchKeyword, setSearchKeyword] = useState<string>(
    query.searchKeyword
  );
  useCategoryOptions(setCategories);
  useWhoOptions(setWhoOptions);

  const { data: histories = [] } = useQuery<History[]>({
    queryKey: ["histories"],
    queryFn: async () => {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      return await fetchHistories(user.id);
    },
  });

  const filteredHistories = useMemo(() => {
    return filterHistories({
      histories,
      startDate: query.startDate,
      endDate: query.endDate,
      selectedTypes: query.selectedTypes,
      selectedCategories: query.selectedCategories,
      selectedWho: query.selectedWho,
      searchKeyword: query.searchKeyword,
    });
  }, [histories, query]);

  const dataList = useMemo(
    () => calculateTableData(filteredHistories),
    [filteredHistories]
  );

  return (
    <div className="w-screen max-h-screen">
      <div className="mx-5 flex flex-col mt-5 pb-10">
        <div className="grid grid-cols-5 gap-5">
          <div className="bg-white w-full rounded-lg text-black border border-black text-center col-span-4 relative">
            <div className="keen-slider rounded-md overflow-hidden h-full">
              <ChartSlider filteredHistories={filteredHistories} />
            </div>
          </div>
          <div className="flex flex-col w-full gap-4">
            <Button
              text={"내역 관리"}
              onClick={() =>
                navigate({
                  pathname: "/history",
                  search: `?${new URLSearchParams(query.raw).toString()}`,
                })
              }
            />
            <Button
              text={"카테고리 관리"}
              onClick={() => navigate("/category")}
            />
            <Button
              text={"함께한 사람 관리"}
              onClick={() => navigate("/who")}
            />
            <DatePicker
              selectsRange
              startDate={query.startDate}
              endDate={query.endDate}
              onChange={(range) => updateFilterQuery("date", range)}
              className="input mt-5"
              locale={ko}
              dateFormat="yy년 MM월 dd일"
            />
            <MultiSelect
              options={[
                { label: "소득", value: "income" },
                { label: "지출", value: "expense" },
              ]}
              selected={query.selectedTypes}
              onChange={(values) => updateFilterQuery("type", values)}
              placeholder="Type"
            />
            <MultiSelect
              options={categories}
              selected={query.selectedCategories}
              onChange={(values) => updateFilterQuery("category", values)}
              placeholder="Category"
              disabled={
                query.selectedTypes.length === 1 &&
                query.selectedTypes[0] === "income"
              }
            />
            <MultiSelect
              options={whoOptions}
              selected={query.selectedWho}
              onChange={(values) => updateFilterQuery("who", values)}
              placeholder="Who"
            />
            <Search
              value={searchKeyword}
              onChange={(value) => setSearchKeyword(value)}
              onClick={() => updateFilterQuery("keyword", searchKeyword)}
            />
          </div>
        </div>
        <Table
          className="text-center mt-5"
          tableTitles={
            <tr>
              {TABLE_TITLES.map((title, index) => (
                <td key={index}>{title}</td>
              ))}
            </tr>
          }
          bodyDatas={dataList.map((datas) => (
            <tr key={datas[0]}>
              {datas.slice(1).map((data, i) => (
                <td key={i}>{data}</td>
              ))}
              <td
                className="cursor-pointer text-right"
                onClick={() =>
                  navigate(
                    `/history/edit/${datas[0]}?${new URLSearchParams(
                      query.raw
                    ).toString()}`
                  )
                }
              >
                •••
              </td>
            </tr>
          ))}
        />
      </div>
    </div>
  );
};

export default MainPage;
