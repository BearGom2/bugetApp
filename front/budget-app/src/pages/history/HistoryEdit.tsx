import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useParams, useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ko } from "date-fns/locale";

import Select from "../../component/Select";
import Button from "../../component/Button";
import {
  getHistoryById,
  updateHistory,
  createHistory,
  deleteHistory,
} from "../../service/historyService";
import { useCategoryOptions } from "../../hooks/useCategoryOptions";
import { useWhoOptions } from "../../hooks/useWhoOptions";
import type { Option, History } from "../../Types";
import { getUserId } from "../../utils/getUserId";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

const HistoryEditPage = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [categoryOptions, setCategoryOptions] = useState<Option[]>([]);
  const [whoOptions, setWhoOptions] = useState<Option[]>([]);
  const [baseData, setBaseData] = useState<History | null>(null);
  const [splits, setSplits] = useState<
    {
      amount: number;
      category: string;
      description: string;
      who: string;
    }[]
  >([]);

  const { register, setValue, watch, handleSubmit } = useForm({});

  useCategoryOptions(setCategoryOptions);
  useWhoOptions(setWhoOptions);

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      const data = await getHistoryById(parseInt(id));
      setBaseData(data);
      setValue("transactionDate", new Date(data.transactionDate));
      setValue("history", data.history);
      setValue("type", data.type);
      setValue("amount", data.amount);
      setValue("category", String(data.category.id));
      setValue("description", data.description);
      setValue("who", String(data.who.id));
    };
    loadData();
  }, [id, setValue]);

  const handleAddSplit = () => {
    setSplits([
      ...splits,
      { amount: NaN, category: "", description: "", who: "" },
    ]);
  };

  const handleRemoveSplit = (index: number) => {
    const removed = splits[index].amount;
    setSplits(splits.filter((_, i) => i !== index));
    setValue("amount", Number(watch("amount")) + removed);
  };

  const handleSplitAmountChange = (index: number, value: number) => {
    const old = splits[index].amount || 0;
    const updated = [...splits];
    updated[index].amount = value;

    setSplits(updated);
    setValue("amount", watch("amount") - (value || 0) + old);
  };

  const onSubmit = async (data: any) => {
    if (!baseData) return;

    const userId = getUserId();

    await updateHistory(baseData.id, {
      transactionDate: data.transactionDate.toISOString(),
      history: data.history,
      type: data.type,
      amount: parseInt(data.amount),
      description: data.description || null,
      categoryId: parseInt(data.category),
      whoId: parseInt(data.who),
    });

    for (const s of splits) {
      if (s.amount)
        await createHistory({
          userId: userId,
          type: data.type,
          transactionDate: data.transactionDate.toISOString(),
          history: data.history,
          categoryId: s.category ? parseInt(s.category) : null,
          amount: s.amount,
          description: s.description || null,
          whoId: s.who ? parseInt(s.who) : null,
        });
    }

    navigate(-1);
    queryClient.invalidateQueries({ queryKey: ["histories"] });
    toast.success("내역이 수정되었습니다.");
  };

  const handleDelete = async () => {
    if (!baseData) return;
    await deleteHistory(baseData.id);
    navigate(-1);
  };

  return baseData ? (
    <div className="w-screen max-h-screen">
      <div className="mx-5 mt-5 pb-10">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-5 gap-5">
            <Button
              text="데이터 나누기"
              type="button"
              onClick={handleAddSplit}
            />
            <Button
              text="삭제"
              onClick={handleDelete}
              className="col-start-4"
            />
            <Button text="저장" type="submit" className="col-start-5" />

            <DatePicker
              selected={watch("transactionDate")}
              onChange={(date: Date | null) =>
                date && setValue("transactionDate", date)
              }
              locale={ko}
              dateFormat="yy년 MM월 dd일"
              className="input"
              customInput={
                <input className="input w-full cursor-pointer" readOnly />
              }
            />

            <input {...register("history")} className="input w-full" />
            <Select
              options={categoryOptions}
              selected={watch("category") || ""}
              onChange={(v) => setValue("category", v)}
              placeholder="카테고리"
            />
            <input
              type="number"
              {...register("amount")}
              className="input w-full"
            />
            <input
              {...register("description")}
              className="input w-full"
              placeholder="설명"
            />
            <Select
              options={whoOptions}
              selected={watch("who") || ""}
              onChange={(v) => setValue("who", v)}
              placeholder="함께한 사람"
            />
          </div>

          {splits.map((s, i) => (
            <div>
              <hr className="mt-5" />
              <div className="mt-5 grid grid-cols-5 gap-5">
                <input
                  type="number"
                  value={s.amount}
                  onChange={(e) =>
                    handleSplitAmountChange(i, parseInt(e.target.value))
                  }
                  className="input w-full"
                  placeholder="금액"
                />
                <Select
                  options={categoryOptions}
                  selected={s.category}
                  onChange={(v) => {
                    const updated = [...splits];
                    updated[i].category = v;
                    setSplits(updated);
                  }}
                  placeholder="카테고리"
                />
                <input
                  value={s.description}
                  onChange={(e) => {
                    const updated = [...splits];
                    updated[i].description = e.target.value;
                    setSplits(updated);
                  }}
                  className="input w-full"
                  placeholder="설명"
                />
                <Select
                  options={whoOptions}
                  selected={s.who}
                  onChange={(v) => {
                    const updated = [...splits];
                    updated[i].who = v;
                    setSplits(updated);
                  }}
                  placeholder="함께한 사람"
                />
                <Button
                  text="삭제하기"
                  type="button"
                  onClick={() => handleRemoveSplit(i)}
                />
              </div>
            </div>
          ))}
        </form>
      </div>
    </div>
  ) : null;
};

export default HistoryEditPage;
