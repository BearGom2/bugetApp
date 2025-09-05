import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../component/Button";
import { createWho } from "../../service/whoService";
import { toast } from "react-toastify";

const WhoAddPage = () => {
  const navigate = useNavigate();
  const [names, setNames] = useState<string[]>([""]);

  const handleChange = (index: number, value: string) => {
    setNames((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  const handleAdd = () => {
    setNames((prev) => [...prev, ""]);
  };

  const handleDelete = (index: number) => {
    setNames((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!user?.id) return;

    const validNames = names.map((n) => n.trim()).filter(Boolean);
    if (validNames.length === 0) {
      toast.error("최소 한 명 이상의 이름을 입력해주세요.");
      return;
    }

    try {
      await Promise.all(validNames.map((name) => createWho(user.id, name)));
      toast.success("저장되었습니다.");
      navigate(-1);
    } catch (error) {
      console.error(error);
      toast.error("저장 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="w-screen max-h-screen">
      <div className="mx-5 mt-5">
        <div className="grid grid-cols-5 mt-5 gap-5">
          <Button
            text="저장하기"
            onClick={handleSave}
            className="col-start-5"
          />

          {names.map((name, i) => (
            <div
              key={i}
              className="flex justify-between items-center w-full input"
            >
              <input
                type="text"
                placeholder="이름 입력"
                value={name}
                onChange={(e) => handleChange(i, e.target.value)}
                className="w-full mr-2"
              />
              <button
                type="button"
                onClick={() => handleDelete(i)}
                className="text-red-500"
              >
                ❌
              </button>
            </div>
          ))}

          <Button text="항목 추가" onClick={handleAdd} />
        </div>
      </div>
    </div>
  );
};

export default WhoAddPage;
