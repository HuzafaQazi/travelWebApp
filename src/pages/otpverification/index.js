import rectangletop from "../../images/rectangletop.png";
import rectanglemiddle from "../../images/rectanglemiddle.png";
import rectanglebottom from "../../images/rectanglebottom.png";
import Image from "next/image";
import { useState } from "react";
// import OTPInput from "./OTPinput";
import style from "../login/styles.module.css";
// import VerifyOTPForm from "@/components/VerifyOTPForm/VerifyOTPForm";
import OTPInput from "react-otp-input";

// const [otp, setOtp] = useState(['-', '-', '-', '-', '-', '-']);
// const [otpVal, setOtpVal] = useState('');


export default function MobileVerification() {
  const [otp, setOtp] = useState("");

  return (
    <>
      <div className={style.imagediv}>
        <Image
          className={style.tbimagestyle}
          src={rectangletop}
          alt="Image not found"
        />
        <div className={style.middleimagestyle}>
          <Image
            className={style.imagestyle}
            src={rectanglemiddle}
            alt="Image not found"
          />
          <div className={style.imagetext}>
            Signup / Login to
            <span className={style.titlestyle}>
              {" "}
              Customise packages for you!
            </span>
          </div>
        </div>
        <Image
          className={style.tbimagestyle}
          src={rectanglebottom}
          alt="Image not found"
        />
      </div>
      <div className={style.mobileverificationdiv}>
        <p className={style.title}>Mobile Verification</p>
        <p className={style.titledescription}>
          We have sent an OTP on your mobile +91 9041 234 843
        </p>
        <p className={style.otptext}>One Time Password (OTP)</p>
        
        

        <OTPInput
          value={otp}
          onChange={setOtp}
          numInputs={6}
          renderSeparator={<span className={style.otpSeparator}>{}</span>}
          renderInput={(props) => <input {...props} />}
          containerStyle={{ width: '50px' }}
        />
        
        <p className={style.resendotp}>
          Didn&apos;t recieve the OTP?{" "}
          <span className="title-description"> Recieve OTP via call </span>
        </p>
        <button className={style.loginbutton}>Verify</button>
      </div>
    </>
  );
}
