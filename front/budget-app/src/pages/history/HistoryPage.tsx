import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ko } from "date-fns/locale";

import Table from "../../component/Table";
import Button from "../../component/Button";
import MultiSelect from "../../component/MultiSelect";
import Search from "../../component/Search";

import { useCategoryOptions } from "../../hooks/useCategoryOptions";
import { useWhoOptions } from "../../hooks/useWhoOptions";
import { fetchHistories, createHistory } from "../../service/historyService";

import { TABLE_TITLES } from "../../constants/tableTitles";
import { filterHistories } from "../../utils/filterHistories";
import { calculateTableData } from "../../utils/calculateTableData";
import * as XLSX from "xlsx";
import { useHistories } from "../../hooks/useHistories";
import { getUserId } from "../../utils/getUserId";
import { useFilterQuery } from "../../hooks/useFilterQuery";

const HistoryPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { query, updateFilterQuery } = useFilterQuery();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const typeOptions = [
    { label: "소득", value: "income" },
    { label: "지출", value: "expense" },
  ];
  const [categories, setCategories] = useState<any[]>([]);
  useCategoryOptions(setCategories);

  const [who, setWho] = useState<any[]>([]);
  useWhoOptions(setWho);

  const [searchKeyword, setSearchKeyword] = useState<string>(
    query.searchKeyword
  );

  const { data: histories = [] } = useHistories();

  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = async (
    e
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const data = event.target?.result;
      const workbook = XLSX.read(data, { type: "binary", cellDates: true });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];

      const userId = getUserId();

      const headers = json.find(
        (row) => Array.isArray(row) && row.length > 2
      ) as string[];
      if (!headers) return;
      const rows = json.slice(json.indexOf(headers) + 1);

      const keyMapToss = {
        "거래 일시": "transactionDate",
        적요: "history",
        "거래 유형": "type",
        "거래 금액": "amount",
        메모: "description",
      };

      const keyMapCard = {
        "승인\n일시": "transactionDate",
        가맹점명: "history",
        승인금액: "amount",
      };

      const applyKeyMap = (
        raw: Record<string, any>,
        map: Record<string, string>
      ): Record<string, string> => {
        const result: Record<string, string> = {};
        for (const key in map) {
          result[map[key]] = (raw[key] || "").toString().trim();
        }
        return result;
      };

      const normalized = rows.map((row) => {
        const record: any = {};
        headers.forEach((h, i) => {
          record[h.trim()] = (row[i] || "").toString().trim();
        });
        return record;
      });

      for (const raw of normalized) {
        let type: "expense" | "income" = "expense";
        let history = "";
        let amount = 0;
        let transactionDate = new Date();
        let description = "";

        if (raw["거래 일시"] && raw["거래 유형"]) {
          const parsed = applyKeyMap(raw, keyMapToss);
          type = String(raw["거래 유형"]).includes("입금")
            ? "income"
            : "expense";
          history = parsed.history;
          description = parsed.description;
          transactionDate = new Date(parsed.transactionDate);
          amount = Number(parsed.amount.replace(/,/g, ""));
        } else if (raw["승인\n일시"] && raw["가맹점명"]) {
          const parsed = applyKeyMap(raw, keyMapCard);
          type = "expense";
          history = parsed.history;
          transactionDate = new Date(parsed.transactionDate.split("\n")[0]);
          amount = Number(-parsed.amount.replace(/,/g, ""));
        } else {
          continue;
        }

        if (!transactionDate || !history || !amount || isNaN(amount)) continue;

        await createHistory({
          userId: userId,
          type,
          transactionDate: transactionDate.toISOString(),
          history,
          categoryId:
            Number(
              categories.find((c) => c.label.trim() === "미분류")?.value
            ) ?? null,
          amount,
          description,
          whoId: null,
        });
      }

      queryClient.invalidateQueries({ queryKey: ["histories"] });
      toast.success("내역이 업로드되었습니다.");
    };

    reader.readAsBinaryString(file);
  };

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
    <div className="w-screen">
      <div className="mx-5 mt-5">
        <div className="grid grid-cols-5 gap-5">
          <input
            type="file"
            accept=".csv,.xls,.xlsx"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
          <Button
            text={"내역 파일 추가하기"}
            className="col-start-4"
            onClick={() => fileInputRef.current?.click()}
          />
          <Button
            text={"내역 직접 추가하기"}
            onClick={() =>
              navigate(`add?${new URLSearchParams(query.raw).toString()}`)
            }
          />

          <DatePicker
            startDate={query.startDate}
            endDate={query.endDate}
            onChange={(range) => updateFilterQuery("date", range)}
            selectsRange
            className="input"
            locale={ko}
            dateFormat="yy년 MM월 dd일"
          />
          <MultiSelect
            selected={query.selectedTypes}
            onChange={(values) => updateFilterQuery("type", values)}
            options={typeOptions}
            placeholder="Type"
          />
          <MultiSelect
            selected={query.selectedCategories}
            onChange={(values) => updateFilterQuery("category", values)}
            options={categories}
            placeholder="Category"
            disabled={
              query.selectedTypes.length === 1 &&
              query.selectedTypes[0] === "income"
            }
          />
          <MultiSelect
            selected={query.selectedWho}
            onChange={(values) => updateFilterQuery("who", values)}
            options={who}
            placeholder="Who"
          />
          <Search
            value={searchKeyword}
            onChange={(value) => setSearchKeyword(value)}
            onClick={() => updateFilterQuery("keyword", searchKeyword)}
          />
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
                    `edit/${datas[0]}?${new URLSearchParams(
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

export default HistoryPage;
