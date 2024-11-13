import { useRef, useState, useEffect, memo } from "react";
import {
  StackedCarousel,
  ResponsiveContainer,
} from "react-stacked-center-carousel";

const data = [
  { cover: "./map1.svg", title: "Dunkirk" },
  { cover: "./map1.svg", title: "Dunkirk" },
  { cover: "./map1.svg", title: "Dunkirk" },
  { cover: "./map1.svg", title: "Dunkirk" },
  { cover: "./map1.svg", title: "Dunkirk" },
];

export function ResponsiveCarousel() {
  const ref = useRef({});
  const [settings, setSettings] = useState({
    visibleSlides: 5,
    slideHeight: 330,
    slideWidth: 500,
  });

  useEffect(() => {
    const updateSettings = () => {
      const width = window.innerWidth;
      if (width <= 480) {
        setSettings({
          visibleSlides: 1,
          slideHeight: 200,
          slideWidth: width * 0.85,
        });
      } else if (width <= 768) {
        setSettings({
          visibleSlides: 1,
          slideHeight: 295,
          slideWidth: width * 0.85,
        });
      } else if (width <= 1024) {
        setSettings({
          visibleSlides: 3,
          slideHeight: 320,
          slideWidth: width / 1.7,
        });
      } else if (width <= 1440) {
        setSettings({
          visibleSlides: 3,
          slideHeight: 320,
          slideWidth: width / 2,
        });
      } else {
        setSettings({ visibleSlides: 5, slideHeight: 320, slideWidth: 500 });
      }
    };

    updateSettings();
    window.addEventListener("resize", updateSettings);
    return () => window.removeEventListener("resize", updateSettings);
  }, []);

  return (
    <div style={{ width: "100%", position: "relative", height: "100%"}} className="flex items-center">
      <ResponsiveContainer
        carouselRef={ref}
        render={(parentWidth, carouselRef) => (
          <StackedCarousel
            ref={carouselRef}
            data={data}
            carouselWidth={parentWidth}
            slideWidth={settings.slideWidth}
            slideComponent={(props) => (
              <Card {...props} height={settings.slideHeight} />
            )}
            maxVisibleSlide={settings.visibleSlides}
            currentVisibleSlide={settings.visibleSlides}
            useGrabCursor={true}
          />
        )}
      />
    </div>
  );
}

const Card = memo(
  function ({ data, dataIndex, height }) {
    const { cover } = data[dataIndex];

    return (
      <div style={{ width: "100%", height }}>
        <img
          style={{
            height: "100%",
            width: "100%",
            objectFit: "cover",
          }}
          draggable={false}
          src={cover}
          alt="carousel-slide"
        />
      </div>
    );
  },
  (prevProps, nextProps) =>
    prevProps.dataIndex === nextProps.dataIndex &&
    prevProps.height === nextProps.height
);
