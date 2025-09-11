import { useEffect, useState } from "react";
import { ResponsiveSunburst } from "@nivo/sunburst";
import type { Category, History } from "../../Types";
import { formatSunburstData } from "../../utils/formatSunburstData";
import { fetchCategories } from "../../service/categoryService";
import { getUserId } from "../../utils/getUserId";

interface CategorySunburstProps {
  filteredHistories: History[];
}

const CategorySunburst = ({ filteredHistories }: CategorySunburstProps) => {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const loadCategories = async () => {
      const data = await fetchCategories(getUserId());
      setCategories(data);
    };
    loadCategories();
  }, []);

  if (categories.length === 0) {
    return <p className="text-center mt-5">카테고리 불러오는 중...</p>;
  }

  const chartData = formatSunburstData(filteredHistories, categories);

  return (
    <ResponsiveSunburst
      data={chartData}
      animate
      arcLabelsSkipAngle={12}
      arcLabelsTextColor={{
        from: "color",
        modifiers: [["darker", 3]],
      }}
      borderColor={{
        from: "color",
        modifiers: [["darker", 0.6]],
      }}
      enableArcLabels
      id="name"
      onClick={() => {}}
      transitionMode="pushIn"
      margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
      value="loc"
      cornerRadius={2}
      borderWidth={1}
      colors={{ scheme: "nivo" }}
      childColor={{ from: "color" }}
      motionConfig="gentle"
      isInteractive={true}
    />
  );
};

export default CategorySunburst;
