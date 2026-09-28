import { useState, useEffect } from "react";
import Modal from "@/components/corporate/modal/Modal";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import { formatPrice } from "@/utils/common";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { useUserPermissions } from "@/hooks/useUserPermissions";

const WalletPaymentModal = ({
  isOpen,
  onClose,
  onProceed,
  totalAmount,
  travelCategory,
  bookingId,
  companyId,
}) => {
  const { walletBalance } = useWalletBalance();
  const { userType } = useUserPermissions();
  const [walletSelected, setWalletSelected] = useState(false);
  const [payableAmount, setPayableAmount] = useState(totalAmount);
  const [walletDeduction, setWalletDeduction] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    calculatePayableAmount();
  }, [walletSelected]);

  const calculatePayableAmount = () => {
    if (walletSelected && walletBalance) {
      if (walletBalance >= totalAmount) {
        setPayableAmount(0);
        setWalletDeduction(totalAmount);
      } else {
        setPayableAmount(totalAmount - walletBalance);
        setWalletDeduction(walletBalance);
      }
    } else {
      setPayableAmount(totalAmount);
      setWalletDeduction(0);
    }
  };

  const handleWalletToggle = () => {
    setWalletSelected((prev) => !prev);
  };

  const handleProceed = async () => {
    setLoading(true);
    await onProceed(payableAmount, walletDeduction);
    setLoading(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Proceed to Payment"
      actions={
        <>
          <button
            className="bg-gray-500 text-white p-2 px-4 rounded-lg hover:bg-gray-700 transition-colors duration-300"
            onClick={onClose}
          >
            Cancel
          </button>
          {payableAmount === 0 ? (
            <button
              className={`p-2 px-4 rounded-lg text-white transition-colors duration-300 bg-[#155EEF] ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              onClick={handleProceed}
              disabled={loading}
            >
              {loading ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                  Processing...
                </>
              ) : (
                <>Proceed to Book</>
              )}
            </button>
          ) : (
            <button
              className={`p-2 px-4 rounded-lg text-white transition-colors duration-300 bg-[#155EEF] ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              onClick={handleProceed}
              disabled={loading}
            >
              {loading ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                  Processing...
                </>
              ) : (
                <>Proceed to Pay | Rs {formatPrice(payableAmount)}</>
              )}
            </button>
          )}
        </>
      }
    >
      <div className="p-4">
        <div className="mb-4">
          <span className="text-lg font-semibold">Total Amount:</span> Rs{" "}
          {formatPrice(totalAmount)}
        </div>
        {walletBalance > 0 && (
          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={walletSelected}
                onChange={handleWalletToggle}
                className="form-checkbox h-5 w-5 text-[#155EEF]"
              />
              <span className="ml-2 text-sm">
                Use wallet balance (Available: Rs{" "}
                {userType == 1 ? formatPrice(walletBalance) : "***"})
              </span>
            </label>
          </div>
        )}
        {walletSelected && (
          <div className="mb-4">
            <span className="text-sm">
              Wallet Deduction: Rs {formatPrice(walletDeduction)}
            </span>
          </div>
        )}
        <div>
          <span className="text-lg font-semibold">Payable Amount:</span> Rs{" "}
          {formatPrice(payableAmount)}
        </div>
      </div>
    </Modal>
  );
};

export default WalletPaymentModal;
