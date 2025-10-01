import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ko } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import type { Option } from "../../Types";
import { useCategoryOptions } from "../../hooks/useCategoryOptions";
import { useWhoOptions } from "../../hooks/useWhoOptions";
import Select from "../../component/Select";
import Button from "../../component/Button";
import { createHistory } from "../../service/historyService";
import { useQueryClient } from "@tanstack/react-query";

const TYPE_OPTIONS: Option[] = [
  { label: "수입", value: "income" },
  { label: "지출", value: "expense" },
];

const schema = z.object({
  type: z.enum(["income", "expense"]),
  transactionDate: z.date({ required_error: "날짜를 선택해주세요." }),
  history: z.string().min(1, "항목명을 입력해주세요."),
  amount: z
    .string()
    .min(1, "금액을 입력해주세요.")
    .refine((val) => !isNaN(Number(val)), "숫자만 입력해주세요."),
  category: z.string().optional(),
  description: z.string().optional(),
  who: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const HistoryAddPage = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: "expense",
    },
  });

  const [categoryOptions, setCategoryOptions] = useState<Option[]>([]);
  const [whoOptions, setWhoOptions] = useState<Option[]>([]);

  const transactionDate = watch("transactionDate");

  useCategoryOptions(setCategoryOptions);
  useWhoOptions(setWhoOptions);

  const onSubmit = async (data: FormValues) => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (!user?.id) return;

      await createHistory({
        userId: user.id,
        type: data.type,
        transactionDate: data.transactionDate.toISOString(),
        history: data.history,
        categoryId: data.category ? Number(data.category) : null,
        amount:
          data.type === "expense" ? -Number(data.amount) : Number(data.amount),
        description: data.description?.trim() || null,
        whoId: data.who ? Number(data.who) : null,
      });
      queryClient.invalidateQueries({ queryKey: ["histories"] });
      toast.success("거래 내역이 추가되었습니다.");
      navigate(-1);
    } catch (err) {
      toast.error("저장 중 오류가 발생했습니다.");
      console.error(err);
    }
  };

  return (
    <div className="w-screen max-h-screen">
      <div className="mx-5 mt-5">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-5 mt-5 gap-5"
        >
          <Button text="저장" type="submit" className="col-start-5" />
          <div>
            <Select
              options={TYPE_OPTIONS}
              selected={watch("type")}
              onChange={(v) => setValue("type", v as "income" | "expense")}
              placeholder="수입/지출 선택"
            />
            {errors.type && (
              <p className="text-red-500 text-sm">{errors.type.message}</p>
            )}
          </div>
          <div>
            <DatePicker
              selected={transactionDate}
              onChange={(date: Date | null) => {
                if (date) setValue("transactionDate", date);
              }}
              locale={ko}
              dateFormat="yy년 MM월 dd일"
              className="input"
              placeholderText="날짜 선택"
            />
            {errors.transactionDate && (
              <p className="text-red-500 text-sm">
                {errors.transactionDate.message}
              </p>
            )}
          </div>
          <div>
            <input
              type="text"
              {...register("history")}
              placeholder="거래 항목명"
              className="input w-full"
            />
            {errors.history && (
              <p className="text-red-500 text-sm">{errors.history.message}</p>
            )}
          </div>
          <div>
            <input
              type="number"
              {...register("amount")}
              placeholder="금액"
              className="input w-full"
            />
            {errors.amount && (
              <p className="text-red-500 text-sm">{errors.amount.message}</p>
            )}
          </div>

          <Select
            options={categoryOptions}
            selected={watch("category") || ""}
            onChange={(v) => setValue("category", v)}
            placeholder="카테고리 선택"
          />

          <input
            type="text"
            {...register("description")}
            placeholder="설명"
            className="input w-full"
          />

          <Select
            options={whoOptions}
            selected={watch("who") || ""}
            onChange={(v) => setValue("who", v)}
            placeholder="함께한 사람"
          />
        </form>
      </div>
    </div>
  );
};

export default HistoryAddPage;
