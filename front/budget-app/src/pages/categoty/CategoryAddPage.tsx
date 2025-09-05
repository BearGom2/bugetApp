import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../component/Button";
import { createCategory } from "../../service/categoryService";

const CategoryAddPage = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [subcategories, setSubcategories] = useState<string[]>([""]);

  const handleSubChange = (index: number, value: string) => {
    const updated = [...subcategories];
    updated[index] = value;
    setSubcategories(updated);
  };

  const handleAddSub = () => {
    setSubcategories([...subcategories, ""]);
  };

  const handleDeleteSub = (index: number) => {
    const updated = [...subcategories];
    updated.splice(index, 1);
    setSubcategories(updated);
  };

  const handleSave = async () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!name.trim()) return;
    const parent = await createCategory({
      userId: user.id,
      name,
      parentId: null,
    });
    for (const sub of subcategories) {
      if (!sub.trim()) continue;
      await createCategory({ userId: user.id, name: sub, parentId: parent.id });
    }
    navigate(-1);
  };

  return (
    <div className="w-screen max-h-screen">
      <div className="mx-5 mt-5">
        <div className="grid grid-cols-5 mt-5 gap-5">
          <input
            type="text"
            className="input col-span-1"
            placeholder="대목록 이름"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Button
            text="저장하기"
            onClick={handleSave}
            className="col-start-5"
          />
          {subcategories.map((sub, i) => (
            <div className="flex justify-between w-full input">
              <input
                key={i}
                type="text"
                placeholder="하위 카테고리 이름"
                value={sub}
                onChange={(e) => handleSubChange(i, e.target.value)}
              />
              <div
                onClick={() => handleDeleteSub(i)}
                className="w-fit cursor-pointer"
              >
                ❌
              </div>
            </div>
          ))}

          <Button text="하위 추가" onClick={handleAddSub} />
        </div>
      </div>
    </div>
  );
};

export default CategoryAddPage;
