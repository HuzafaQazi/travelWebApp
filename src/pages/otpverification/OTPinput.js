import { useState, useRef } from 'react';
import style from '../login/styles.module.css';

const OTPInput = ({ length = 6, onChange }) => {
  const [values, setValues] = useState(Array(length).fill(''));
  const inputRefs = useRef([]);

  const handleChange = (e, index) => {
    const { value } = e.target;
    const newValues = [...values];
    newValues[index] = value;

    setValues(newValues);

    if (onChange) {
      onChange(newValues.join(''));
    }

    // Move to the next input field
    if (value && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !values[index] && inputRefs.current[index - 1]) {
      // Move to the previous input field when Backspace is pressed and current field is empty
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    const pastedData = e.clipboardData.getData('text/plain');
    const newValues = Array(length).fill('').map((_, i) => pastedData[i] || '');
    setValues(newValues);

    if (onChange) {
      onChange(newValues.join(''));
    }
  };

  return (
    <div>
      {values.map((value, index) => (
        <input
          key={index}
          type="text"
          maxLength={1}
          value={value}
          className={style.otpinput}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={handlePaste}
          ref={(el) => (inputRefs.current[index] = el)}
        />
      ))}
    </div>
  );
};

export default OTPInput;