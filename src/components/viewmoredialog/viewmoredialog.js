import HotelImageCarousel from "@/components/hotelimagecarousel/hotelimagecarousel";
import parse from "html-react-parser";
import GridView from "../gridview/gridview";
import style from "./styles.module.css";

export default function ViewMoreDialog(props) {
  const description = props.hotelInfo?.description || "";

  return (
    <div>
      <div className={style.parentdialog}>
        <div className={style.promotions}>{props.hotelInfo?.hotelName}</div>
        <HotelImageCarousel hotelPictures={props.hotelInfo?.hotelPictures} />
        <div className={style.textpadding}>
          <h5>About</h5>
          <hr className={style.lineStyle} />
          <h4 className={style.heading}>Description</h4>
          <p className={style.content}>{parse(description)}</p>
          <h4 className={style.heading}>Address</h4>
          <p className={style.content}>{props.hotelInfo?.address}</p>
          <h4 className={style.highlights}>Property Highlights</h4>
          <GridView facilitesData={props.hotelInfo?.hotelFacilities} />
        </div>
      </div>
    </div>
  );
}
