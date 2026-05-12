import Image from "next/image";
import "bootstrap/dist/css/bootstrap.css";
import style from "./styles.module.css";
import React, { useState } from "react";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import image1 from "../../images/Travel/hindu-temple-bali.jpg";

export default function OffersCarousel() {
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const [loaded, setLoaded] = useState(false);
  const [sliderRef, instanceRef] = useKeenSlider({
    initial: 0,
    loop: true,
    mode: "free-snap",
    slides: {
      perView: 3,
      spacing: 30,
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
      <div className={style.offersCarousel}>
        <div className={style.promotions}>Promotions for you</div>
        <div ref={sliderRef} className={`keen-slider ${style.keenSlider}`}>
          <div className="keen-slider__slide number-slide1">
            <div className={`${style.keenSlider1}`}>
              <Image
                src={image1}
                alt="iamge not found"
                className={style.keenSliderImage1}
              />
              <p className={style.sliderPromotionsText}>
                Get 20% Off on 3, 4, 5 hotels
              </p>
              <div className={`${style.couponCodeDiv} container`}>
                <p className={style.couponCodeId}>ICIC67494</p>
                <p className={style.couponCode}>Coupon Code</p>
              </div>
            </div>
          </div>
          <div className="keen-slider__slide number-slide1">
            <div className={`${style.keenSlider1}`}>
              <Image
                src={image1}
                alt="iamge not found"
                className={style.keenSliderImage1}
              />
              <p className={style.sliderPromotionsText}>
                Get 20% Off on 3, 4, 5 hotels
              </p>
              <div className={`${style.couponCodeDiv} container`}>
                <p className={style.couponCodeId}>ICIC67494</p>
                <p className={style.couponCode}>Coupon Code</p>
              </div>
            </div>
          </div>
          <div className="keen-slider__slide number-slide1">
            <div className={`${style.keenSlider1}`}>
              <Image
                src={image1}
                alt="iamge not found"
                className={style.keenSliderImage1}
              />
              <p className={style.sliderPromotionsText}>
                Get 20% Off on 3, 4, 5 hotels
              </p>
              <div className={`${style.couponCodeDiv} container`}>
                <p className={style.couponCodeId}>ICIC67494</p>
                <p className={style.couponCode}>Coupon Code</p>
              </div>
            </div>
          </div>
          <div className="keen-slider__slide number-slide1">
            <div className={`${style.keenSlider1}`}>
              <Image
                src={image1}
                alt="iamge not found"
                className={style.keenSliderImage1}
              />
              <p className={style.sliderPromotionsText}>
                Get 20% Off on 3, 4, 5 hotels
              </p>
              <div className={`${style.couponCodeDiv} container`}>
                <p className={style.couponCodeId}>ICIC67494</p>
                <p className={style.couponCode}>Coupon Code</p>
              </div>
            </div>
          </div>
          <div className="keen-slider__slide number-slide1">
            <div className={`${style.keenSlider1}`}>
              <Image
                src={image1}
                alt="iamge not found"
                className={style.keenSliderImage1}
              />
              <p className={style.sliderPromotionsText}>
                Get 20% Off on 3, 4, 5 hotels
              </p>
              <div className={`${style.couponCodeDiv} container`}>
                <p className={style.couponCodeId}>ICIC67494</p>
                <p className={style.couponCode}>Coupon Code</p>
              </div>
            </div>
          </div>
          <div className="keen-slider__slide number-slide1">
            <div className={`${style.keenSlider1}`}>
              <Image
                src={image1}
                alt="iamge not found"
                className={style.keenSliderImage1}
              />
              <p className={style.sliderPromotionsText}>
                Get 20% Off on 3, 4, 5 hotels
              </p>
              <div className={`${style.couponCodeDiv} container`}>
                <p className={style.couponCodeId}>ICIC67494</p>
                <p className={style.couponCode}>Coupon Code</p>
              </div>
            </div>
          </div>
          <div className="keen-slider__slide number-slide1">
            <div className={`${style.keenSlider1}`}>
              <Image
                src={image1}
                alt="iamge not found"
                className={style.keenSliderImage1}
              />
              <p className={style.sliderPromotionsText}>
                Get 20% Off on 3, 4, 5 hotels
              </p>
              <div className={`${style.couponCodeDiv} container`}>
                <p className={style.couponCodeId}>ICIC67494</p>
                <p className={style.couponCode}>Coupon Code</p>
              </div>
            </div>
          </div>
        </div>
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
