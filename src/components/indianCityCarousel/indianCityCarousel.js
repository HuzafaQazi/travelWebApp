import "bootstrap/dist/css/bootstrap.css";
import "keen-slider/keen-slider.min.css";
import { useKeenSlider } from "keen-slider/react";
import Image from "next/image";
import React, { useState } from "react";
import image5 from "../../images/Travel/blue-sky.jpg";
import image4 from "../../images/Travel/coffee.jpg";
import image1 from "../../images/Travel/hindu-temple-bali.jpg";
import image6 from "../../images/Travel/japan.jpg";
import image2 from "../../images/Travel/london-uk.jpg";
import image3 from "../../images/Travel/morocco.jpg";
import style from "./styles.module.css";

export default function CityCarousel() {
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const [loaded, setLoaded] = useState(false);
  const [sliderRef, instanceRef] = useKeenSlider({
    initial: 0,
    loop: true,
    mode: "free-snap",
    slides: {
      perView: 5,
      spacing: 40,
    },
    slideChanged(s) {
      setCurrentSlide(s.track.details.rel);
    },
    created() {
      setLoaded(true);
    },
  });
  return (
    <>
      <div className={style.indianCityCarousel}>
        <div className={style.gemsOfIndia}>Gems of India</div>
        <div ref={sliderRef} className={`keen-slider ${style.keenSlider}`}>
          <div className={`keen-slider__slide ${style.numberSlide1}`}>
            <div className={`${style.keenSlider1}`}>
              <Image
                src={image1}
                alt="iamge not found"
                className={style.keenSliderImage1}
              />
              <p className={style.indianCityName}>Kerala</p>
            </div>
          </div>
          <div className={`keen-slider__slide ${style.numberSlide1}`}>
            <div className={`${style.keenSlider1}`}>
              <Image
                src={image1}
                alt="iamge not found"
                className={style.keenSliderImage1}
              />
              <p className={style.indianCityName}>Sikkim</p>
            </div>
          </div>
          <div className={`keen-slider__slide ${style.numberSlide1}`}>
            <div className={`${style.keenSlider1}`}>
              <Image
                src={image3}
                alt="iamge not found"
                className={style.keenSliderImage1}
              />
              <p className={style.indianCityName}>Goa</p>
            </div>
          </div>
          <div className={`keen-slider__slide ${style.numberSlide1}`}>
            <div className={`${style.keenSlider1}`}>
              <Image
                src={image2}
                alt="iamge not found"
                className={style.keenSliderImage1}
              />
              <p className={style.indianCityName}>Kashmir</p>
            </div>
          </div>
          <div className={`keen-slider__slide ${style.numberSlide1}`}>
            <div className={`${style.keenSlider1}`}>
              <Image
                src={image4}
                alt="iamge not found"
                className={style.keenSliderImage1}
              />
              <p className={style.indianCityName}>Agra</p>
            </div>
          </div>
          <div className={`keen-slider__slide ${style.numberSlide1}`}>
            <div className={`${style.keenSlider1}`}>
              <Image
                src={image5}
                alt="iamge not found"
                className={style.keenSliderImage1}
              />
              <p className={style.indianCityName}>Manali</p>
            </div>
          </div>
          <div className={`keen-slider__slide ${style.numberSlide1}`}>
            <div className={`${style.keenSlider1}`}>
              <Image
                src={image6}
                alt="iamge not found"
                className={style.keenSliderImage1}
              />
              <p className={style.indianCityName}>Mysore</p>
            </div>
          </div>
          <div className={`keen-slider__slide ${style.numberSlide1}`}>
            <div className={`${style.keenSlider1}`}>
              <Image
                src={image1}
                alt="iamge not found"
                className={style.keenSliderImage1}
              />
              <p className={style.indianCityName}>Munnar</p>
            </div>
          </div>
          <div className={`keen-slider__slide ${style.numberSlide1}`}>
            <div className={`${style.keenSlider1}`}>
              <Image
                src={image3}
                alt="iamge not found"
                className={style.keenSliderImage1}
              />
              <p className={style.indianCityName}>Puducherry</p>
            </div>
          </div>
        </div>
        {loaded && instanceRef.current && (
          <>
            <Arrow
              left
              onClick={(e) =>
                e.stopPropagation() || instanceRef.current?.prev()
              }
              disabled={currentSlide === 0}
            />

            <Arrow
              onClick={(e) =>
                e.stopPropagation() || instanceRef.current?.next()
              }
              disabled={
                currentSlide ===
                instanceRef.current.track.details.slides.length - 1
              }
            />
          </>
        )}
        {loaded && instanceRef.current && (
          <div className={style.dots}>
            {[
              ...Array(
                instanceRef.current.track.details.slides.length
                //   3
              ).keys(),
            ].map((idx) => {
              return (
                <button
                  key={idx}
                  onClick={() => {
                    instanceRef.current?.moveToIdx(idx);
                  }}
                  className={"dot" + (currentSlide === idx ? " active" : "")}
                ></button>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

function Arrow(props) {
  const disabeld = props.disabled ? style.arrowDisabled : "";
  return (
    <svg
      onClick={props.onClick}
      className={`${style.arrow} ${
        props.left ? style.arrowLeft : style.arrowRight
      } ${disabeld}`}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
    >
      {props.left && (
        <path d="M16.67 0l2.83 2.829-9.339 9.175 9.339 9.167-2.83 2.829-12.17-11.996z" />
      )}
      {!props.left && (
        <path d="M5 3l3.057-3 11.943 12-11.943 12-3.057-3 9-9z" />
      )}
    </svg>
  );
}
