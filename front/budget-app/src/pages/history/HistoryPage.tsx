import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ko } from "date-fns/locale";

import { type Option } from "../../Types";

import Table from "../../component/Table";
import Button from "../../component/Button";
import MultiSelect from "../../component/MultiSelect";
import Search from "../../component/Search";

import { useCategoryOptions } from "../../hooks/useCategoryOptions";
import { useWhoOptions } from "../../hooks/useWhoOptions";
import { createHistory } from "../../service/historyService";

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
  const [categories, setCategories] = useState<Option[]>([]);
  useCategoryOptions(setCategories);

  const [who, setWho] = useState<Option[]>([]);
  useWhoOptions(setWho);

  const [searchKeyword, setSearchKeyword] = useState<string>(
    query.searchKeyword
  );

  const { data: histories = [] } = useHistories();

  //todo 분리 및 취소내역 넘기기
  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = async (
    e
  ) => {
    const file = e.currentTarget.files?.[0];
    if (!file) return;

    const readAsArrayBuffer = (f: File) =>
      new Promise<ArrayBuffer>((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(reader.error);
        reader.onload = () => resolve(reader.result as ArrayBuffer);
        reader.readAsArrayBuffer(f);
      });

    try {
      const arrayBuffer = await readAsArrayBuffer(file);
      const wb = XLSX.read(arrayBuffer, { type: "array", cellDates: true });

      const userId = getUserId();
      if (userId == null) {
        toast.error("로그인 상태를 확인해주세요(사용자 ID 없음).");
        return;
      }

      // ===== 유틸 =====
      const normalizeHeader = (s: string) =>
        String(s ?? "")
          .replace(/\r?\n/g, " ")
          .replace(/\([^)]*\)/g, " ") // 괄호/단위 제거: (원), (KRW) 등
          .replace(/\s+/g, " ")
          .replace(/[./]/g, ".") // 구분자 통일
          .trim();

      const normalizeKey = (s: string) =>
        String(s ?? "")
          .replace(/\r?\n/g, " ")
          .replace(/\s+/g, " ")
          .trim();

      const excelSerialToDate = (n: number) => {
        const ms = (n - 25569) * 86400 * 1000; // 1900 기준
        const d = new Date(ms);
        return isNaN(d.getTime()) ? null : d;
      };

      const to24h = (h: number, isPM: boolean) =>
        isPM ? (h === 12 ? 12 : h + 12) : h === 12 ? 0 : h;

      const parseKoreanMeridiem = (s: string) => {
        const m = s.match(
          /(\d{4})[./-](\d{1,2})[./-](\d{1,2})\s*(오전|오후)\s*(\d{1,2}):(\d{2})/
        );
        if (!m) return null;
        const [, yy, mm, dd, mer, hh, mi] = m;
        const H = to24h(Number(hh), mer === "오후");
        const d = new Date(
          `${yy}-${String(mm).padStart(2, "0")}-${String(dd).padStart(
            2,
            "0"
          )}T${String(H).padStart(2, "0")}:${mi}:00`
        );
        return isNaN(d.getTime()) ? null : d;
      };

      const parseDateAny = (v: unknown): Date | null => {
        if (v == null) return null;
        if (v instanceof Date) return isNaN(v.getTime()) ? null : v;
        if (typeof v === "number") return excelSerialToDate(v);

        let s = String(v).trim();
        if (!s) return null;

        const mer = parseKoreanMeridiem(s);
        if (mer) return mer;

        // 요일/괄호 제거, 개행/다중공백 정리
        s = s
          .replace(/\([^)]+\)/g, " ")
          .replace(/\r?\n/g, " ")
          .replace(/\s+/g, " ")
          .trim();
        // "." 또는 "/" → "-"
        s = s.replace(/[./]/g, "-");
        // "YYYY-MM-DD HH:MM(:SS)" → ISO
        if (/^\d{4}-\d{1,2}-\d{1,2}\s+\d{1,2}:\d{2}(:\d{2})?$/.test(s))
          s = s.replace(" ", "T");
        if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(s)) s = `${s}T00:00:00`;

        const d = new Date(s);
        return isNaN(d.getTime()) ? null : d;
      };

      const stripToNumber = (raw: unknown) => {
        const s = String(raw ?? "");
        const parenNeg = /^\s*\(.+\)\s*$/.test(s); // (1,000) → -1000
        const cleaned = s.replace(/[^0-9.-]/g, ""); // eslint 경고 없는 버전
        const n = Number(cleaned);
        if (Number.isNaN(n)) return NaN;
        return parenNeg ? -Math.abs(n) : n;
      };

      const isEmptyRow = (obj: Record<string, unknown>) =>
        Object.values(obj).every((v) => String(v ?? "").trim() === "");

      const containsTotalWord = (obj: Record<string, unknown>) =>
        Object.values(obj).some((v) => /합계|총합/i.test(String(v)));

      const UNCLASSIFIED_CATEGORY_ID: number | null = (() => {
        const found = categories.find(
          (c) => String(c.label).trim() === "미분류"
        );
        const val = found?.value;
        if (val == null) return null;
        const num = Number(val);
        return Number.isNaN(num) ? null : num;
      })();

      // 후보 키(다양한 카드/은행 엑셀 대응)
      const FIELD_KEYS = {
        transactionDate: [
          "거래 일시",
          "승인 일시",
          "승인일시",
          "이용일시",
          "거래일시",
          "승인\n일시",
          "이용 일시",
          "승인일자",
          "이용일자",
          "거래일",
        ],
        history: [
          "적요",
          "가맹점명",
          "가맹점",
          "이용가맹점",
          "이용처",
          "가맹점/이용처",
          "사용처",
        ],
        amount: [
          "거래 금액",
          "승인금액",
          "승인 금액",
          "이용금액",
          "이용 금액",
          "금액",
        ],
        description: ["메모", "비고", "내용"],
        decision: ["구분", "승인구분", "이용구분", "매입구분"], // '취소' 포함 시 환불
        typeHint: ["거래 유형"], // 토스뱅크
      } as const;

      const pick = (
        raw: Record<string, unknown>,
        candidates: readonly string[]
      ) => {
        for (const c of candidates) {
          const hit = Object.keys(raw).find(
            (k) => normalizeKey(k) === normalizeKey(c)
          );
          if (hit) return raw[hit];
        }
        // 헤더가 단위 포함인 경우도 시도: 예) "이용금액(원)" → "이용금액"
        for (const c of candidates) {
          const hit = Object.keys(raw).find((k) =>
            normalizeKey(k).startsWith(normalizeKey(c))
          );
          if (hit) return raw[hit];
        }
        return undefined;
      };

      // ===== 모든 시트 순회하여 첫 번째 유효 테이블 추출 =====
      let records: Record<string, unknown>[] = [];
      const sheetNames = wb.SheetNames || [];
      for (const sn of sheetNames) {
        const sheet = wb.Sheets[sn];
        if (!sheet) continue;
        const table = XLSX.utils.sheet_to_json(sheet, {
          header: 1,
        }) as unknown[][];

        // 헤더 탐색
        const headerIndex = table.findIndex((row) => {
          if (!Array.isArray(row)) return false;
          const texts = row.map((v) => String(v ?? ""));
          const score = texts.reduce((acc, t) => {
            const x = normalizeHeader(t);
            if (
              /(일시|거래 일시|승인 ?일시|이용일시|이용 일시|승인일시|승인일자|이용일자)/.test(
                x
              )
            )
              acc++;
            if (/(가맹점|이용가맹점|이용처|적요|사용처)/.test(x)) acc++;
            if (/(승인금액|이용금액|거래 금액|금액)/.test(x)) acc++;
            return acc;
          }, 0);
          return score >= 2;
        });

        const headerRow =
          headerIndex >= 0
            ? (table[headerIndex] as unknown[])
            : (table.find((row) => Array.isArray(row) && row.length > 2) as
                | unknown[]
                | undefined);

        if (!headerRow) continue;

        const headers = headerRow.map((h) => normalizeHeader(String(h ?? "")));
        const rows = table.slice(
          headerIndex >= 0 ? headerIndex + 1 : table.indexOf(headerRow) + 1
        );

        const recs = rows
          .map((row) => {
            const obj: Record<string, unknown> = {};
            headers.forEach((h, i) => {
              obj[h] = row[i] ?? "";
            });
            return obj;
          })
          .filter((r) => !isEmptyRow(r))
          .filter((r) => !containsTotalWord(r));

        if (recs.length > 0) {
          records = recs;
          break; // 유효 데이터가 있는 첫 시트 채택
        }
      }

      if (records.length === 0) {
        toast.error(
          "업로드 가능한 표를 찾지 못했습니다. 파일 형식을 확인해주세요."
        );
        return;
      }

      // ===== 행 파싱 → createHistory =====
      let created = 0;
      const ops: Promise<unknown>[] = [];

      for (const raw of records) {
        const hasToss =
          pick(raw, ["거래 일시"]) != null && pick(raw, ["거래 유형"]) != null;
        const hasGenericCard =
          pick(raw, FIELD_KEYS.transactionDate) != null &&
          (pick(raw, ["가맹점명"]) != null ||
            pick(raw, ["가맹점"]) != null ||
            pick(raw, ["이용가맹점"]) != null ||
            pick(raw, ["이용처"]) != null ||
            pick(raw, ["가맹점/이용처"]) != null ||
            pick(raw, ["사용처"]) != null);

        let type: "expense" | "income" = "expense";
        let history = "";
        let amount = 0;
        let transactionDate: Date | null = null;
        let description = "";

        if (hasToss) {
          const transactionDateRaw = pick(raw, ["거래 일시"]);
          const typeRaw = pick(raw, ["거래 유형"]);
          const amountRaw = pick(raw, ["거래 금액"]);
          history = String(pick(raw, ["적요"]) ?? "").trim();
          description = String(pick(raw, FIELD_KEYS.description) ?? "").trim();

          type = String(typeRaw ?? "").includes("입금") ? "income" : "expense";
          transactionDate = parseDateAny(transactionDateRaw);
          const parsedAmt = stripToNumber(amountRaw);
          if (Number.isNaN(parsedAmt)) continue;
          amount =
            type === "income" ? Math.abs(parsedAmt) : -Math.abs(parsedAmt);
        } else if (hasGenericCard) {
          const transactionDateRaw = pick(raw, FIELD_KEYS.transactionDate);
          const decisionRaw = String(
            pick(raw, FIELD_KEYS.decision) ?? ""
          ).trim();
          const amountRaw = pick(raw, FIELD_KEYS.amount);
          history = String(
            pick(raw, ["가맹점명"]) ??
              pick(raw, ["가맹점"]) ??
              pick(raw, ["이용가맹점"]) ??
              pick(raw, ["이용처"]) ??
              pick(raw, ["가맹점/이용처"]) ??
              pick(raw, ["사용처"]) ??
              ""
          ).trim();
          description = String(pick(raw, FIELD_KEYS.description) ?? "").trim();

          transactionDate = parseDateAny(transactionDateRaw);
          const parsedAmt = stripToNumber(amountRaw);
          if (Number.isNaN(parsedAmt)) continue;

          const isCancel = /취소/.test(decisionRaw);
          type = isCancel ? "income" : "expense";
          amount = isCancel ? Math.abs(parsedAmt) : -Math.abs(parsedAmt);
        } else {
          continue; // 인식 불가 행
        }

        if (!transactionDate || !history || Number.isNaN(amount)) continue;

        ops.push(
          createHistory({
            userId: Number(userId), // 문자열이면 숫자로 변환
            type,
            transactionDate: transactionDate.toISOString(),
            history,
            categoryId: UNCLASSIFIED_CATEGORY_ID,
            amount,
            description,
            whoId: null,
          })
            .then(() => {
              created += 1;
            })
            .catch((err) => {
              console.error("행 저장 실패:", err, raw);
            })
        );
      }

      if (ops.length === 0) {
        toast.error(
          "업로드 가능한 내역을 찾지 못했습니다. 헤더/열 이름을 확인해주세요."
        );
        return;
      }

      await Promise.all(ops);
      await queryClient.invalidateQueries({ queryKey: ["histories"] });

      if (created > 0) {
        toast.success(`내역이 업로드되었습니다. (총 ${created}건)`);
      } else {
        toast.error("저장된 건이 없습니다. 파일 레이아웃을 확인해주세요.");
      }
    } catch (err) {
      console.error(err);
      toast.error("파일 처리 중 오류가 발생했습니다.");
    } finally {
      // 같은 파일 다시 선택 가능하도록 초기화
      e.currentTarget.value = "";
    }
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
