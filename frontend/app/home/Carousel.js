import { useRef, memo } from "react";
import { StackedCarousel, ResponsiveContainer} from "react-stacked-center-carousel";

const data = [
  { cover: "./map1.svg", title: "Dunkirk" },
  { cover: "./map2.svg", title: "Dunkirk" },
  { cover: "./map1.svg", title: "Dunkirk" },
  { cover: "./map1.svg", title: "Dunkirk" },
  { cover: "./map1.svg", title: "Dunkirk" },
];

export function ResponsiveCarousel() {
  const ref = useRef({});

  return (
    <div style={{ width: "100%", position: "relative" }}>
      {/* ResponsiveContainer will have the same width as its parent element */}
      <ResponsiveContainer
        carouselRef={ref}
        render={(parentWidth, carouselRef) => {
          let currentVisibleSlide = 5;
          if (parentWidth <= 1440) currentVisibleSlide = 3;
          else if (parentWidth <= 1080) currentVisibleSlide = 1;

          return (
            <StackedCarousel
              ref={carouselRef}
              data={data}
              carouselWidth={parentWidth}
              slideWidth={500}
              slideComponent={Card}
              maxVisibleSlide={5}
              currentVisibleSlide={currentVisibleSlide}
              useGrabCursor={true}
            />
          );
        }}
      />
    </div>
  );
}

// Very important to memoize your component!!!
const Card = memo(
  function (props) {
    const { data, dataIndex } = props;
    const { cover } = data[dataIndex];

    return (
      <div style={{ width: "100%", height: 300 }}>
        <img
          style={{
            height: "100%",
            width: "100%",
            objectFit: "cover",
            borderRadius: 10,
          }}
          draggable={false}
          src={cover}
          alt="carousel-slide"
        />
      </div>
    );
  },
  function (prevProps, nextProps) {
    return prevProps.dataIndex === nextProps.dataIndex;
  }
);