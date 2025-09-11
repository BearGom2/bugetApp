import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { fetchCategories } from "../../service/categoryService";
import { buildCategoryTree } from "../../utils/buildCategoryTree";
import type { Category } from "../../Types";
import Table from "../../component/Table";
import Button from "../../component/Button";

const CategoryPage = () => {
  const navigate = useNavigate();

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      return await fetchCategories(user.id);
    },
  });

  return (
    <div className="w-screen">
      <div className="mx-5 mt-5">
        <div className="grid grid-cols-5 gap-5">
          <Button
            text={"카테고리 추가하기"}
            onClick={() => navigate("add")}
            className="col-start-5"
          />
        </div>

        <Table
          className="text-left mt-5"
          tableTitles={
            <tr>
              <td>카테고리</td>
              <td></td>
            </tr>
          }
          bodyDatas={buildCategoryTree(categories).map((category) => (
            <tr key={category.id}>
              <td style={{ paddingLeft: `${category.depth * 2 + 1.5}rem` }}>
                {category.name}
              </td>
              <td className="text-right">
                {!category.depth && (
                  <span
                    className="cursor-pointer"
                    onClick={() => navigate(`edit/${category.id}`)}
                  >
                    •••
                  </span>
                )}
              </td>
            </tr>
          ))}
        />
      </div>
    </div>
  );
};

export default CategoryPage;
