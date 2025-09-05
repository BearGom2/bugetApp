import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Button from "../../component/Button";
import {
  getCategoryById,
  updateCategory,
  createCategory,
  deleteCategory,
} from "../../service/categoryService";
import type { Category } from "../../Types";

const CategoryEditPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [name, setName] = useState("");
  const [subcategories, setSubcategories] = useState<Category[]>([]);
  const [deletedSubIds, setDeletedSubIds] = useState<number[]>([]);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      const category = await getCategoryById(Number(id));
      setName(category.name);
      setSubcategories(category.children || []);
    };
    load();
  }, [id]);

  const handleSubChange = (index: number, value: string) => {
    setSubcategories((prev) =>
      prev.map((sub, i) => (i === index ? { ...sub, name: value } : sub))
    );
  };

  const handleAddSub = () => {
    setSubcategories((prev) => [
      ...prev,
      { id: 0, name: "", parentId: Number(id) },
    ]);
  };

  const handleDeleteSub = (index: number) => {
    setSubcategories((prev) => {
      const target = prev[index];
      if (target.id !== 0) {
        setDeletedSubIds((ids) => [...ids, target.id]);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSave = async () => {
    if (!id) return;

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!user?.id) return;

    await updateCategory(Number(id), { name });

    const requests = subcategories.map((sub) =>
      sub.id === 0
        ? createCategory({
            userId: user.id,
            name: sub.name,
            parentId: Number(id),
          })
        : updateCategory(sub.id, { name: sub.name })
    );

    const deleteRequests = deletedSubIds.map((delId) => deleteCategory(delId));

    await Promise.all([...requests, ...deleteRequests]);

    navigate(-1);
  };

  const handleDeleteMain = async () => {
    if (!id) return;
    await deleteCategory(Number(id));
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
            text="삭제하기"
            className="col-start-4"
            onClick={handleDeleteMain}
          />
          <Button
            text="저장하기"
            onClick={handleSave}
            className="col-start-5"
          />

          {subcategories.map((sub, i) => (
            <div
              key={`${sub.id}-${i}`}
              className="flex justify-between w-full input"
            >
              <input
                type="text"
                placeholder="하위 카테고리 이름"
                value={sub.name}
                onChange={(e) => handleSubChange(i, e.target.value)}
                className="w-full mr-2"
              />
              <button
                type="button"
                onClick={() => handleDeleteSub(i)}
                className="text-red-500"
              >
                ❌
              </button>
            </div>
          ))}
          <Button text="하위 추가" onClick={handleAddSub} />
        </div>
      </div>
    </div>
  );
};

export default CategoryEditPage;
