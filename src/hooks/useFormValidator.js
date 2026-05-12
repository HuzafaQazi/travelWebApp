import { useRef, useState, useCallback } from "react";
import SimpleReactValidator from "simple-react-validator";

const useFormValidator = (initialMessages = {}, initialRules = {}) => {
  const simpleValidator = useRef(
    new SimpleReactValidator({
      element: (message) => message,
      messages: {
        ...SimpleReactValidator.messages,
        ...initialMessages,
      },
      validators: {
        ...SimpleReactValidator.validators,
        ...initialRules,
      },
    })
  );

  const [validatorInstance, setValidatorInstance] = useState(
    simpleValidator.current
  );
  const [forceValidation, setForceValidation] = useState(false);

  const updateValidator = useCallback(
    (customMessages = {}, customRules = {}, forceMessages = false) => {
      simpleValidator.current = new SimpleReactValidator({
        element: (message) => message,
        messages: {
          ...SimpleReactValidator.messages,
          ...customMessages,
        },
        validators: {
          ...SimpleReactValidator.validators,
          ...customRules,
        },
      });
      if (forceMessages) {
        simpleValidator.current.showMessages();
      }
      setValidatorInstance(simpleValidator.current);
    },
    []
  );

  // Force validation check
  const forceValidatorUpdate = useCallback(() => {
    validatorInstance.showMessages();
    setForceValidation((prev) => !prev);
  }, [validatorInstance]);

  // Clear all validation messages
  const clearValidation = useCallback(() => {
    validatorInstance.hideMessages();
    setForceValidation((prev) => !prev);
  }, [validatorInstance]);

  // Utility function to validate a specific field
  const validateField = useCallback(
    (fieldName, value, validationRules) => {
      const isValid = validatorInstance.check(
        fieldName,
        value,
        validationRules
      );
      setForceValidation((prev) => !prev);
      return isValid;
    },
    [validatorInstance]
  );

  return [
    validatorInstance,
    updateValidator,
    forceValidatorUpdate,
    clearValidation,
    validateField,
    forceValidation,
  ];
};

export default useFormValidator;
