import React, { useState } from "react";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import DailyExpenseBar from "./DailyExpenseBar";
import type { Category, History } from "../../Types";
import { ChevronLeft, ChevronRight } from "lucide-react";
import CategorySunburst from "./CategorySunburst";
import { fetchCategories } from "../../service/categoryService";

interface Props {
  filteredHistories: History[];
}

const ChartSlider = ({ filteredHistories }: Props) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [sliderRef, instanceRef] = useKeenSlider({
    loop: true,
    mode: "snap",
    slides: { perView: 1 },
    slideChanged(slider) {
      setCurrentSlide(slider.track.details.rel);
    },
  });

  const slideCount = 2;

  return (
    <div className="relative w-full h-full">
      <div
        ref={sliderRef}
        className="keen-slider rounded-md overflow-hidden h-full"
      >
        <div className="keen-slider__slide number-slide1 p-2">
          <DailyExpenseBar filteredHistories={filteredHistories} />
        </div>
        <div className="keen-slider__slide number-slide2 p-2">
          <CategorySunburst filteredHistories={filteredHistories} />
        </div>
      </div>

      <button
        onClick={() => instanceRef.current?.prev()}
        className="absolute top-1/2 left-0 transform -translate-y-1/2 p-2"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={() => instanceRef.current?.next()}
        className="absolute top-1/2 right-0 transform -translate-y-1/2 p-2"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-2">
        {[...Array(slideCount)].map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full ${
              i === currentSlide ? "bg-black" : "bg-gray-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default ChartSlider;
