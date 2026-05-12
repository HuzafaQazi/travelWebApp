import B2CHeader from "@/components/flights/B2cHeader/Header";
import Footer from "@/components/footer/footer";
import Gototopbutton from "@/components/gototopbutton/gototopbutton";
import walletImg from "../../../public/img/wallet.png";
import walletEmptyImg from "../../../public/img/walletempty.png";
import {
  getPaymentGateway,
  getPaymentSessionID,
} from "../../../utils/bookingAPI";
import { getTransactions as apiGetTransactions } from "@/utils/walletApis";
import { routeToPg } from "@/paymentGateways/pgRouting";
import {
  fetchAndUpdateUserDetails,
  getTabSpecificData,
  handleLogout,
} from "@/utils/axios/axios";
import "bootstrap/dist/css/bootstrap.min.css";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState, useRef, useCallback } from "react";
import { useSelector } from "react-redux";
import "react-calendar/dist/Calendar.css";
import style from "./styles.module.css";
import { Button, Spinner } from "react-bootstrap";
import { useUserType } from "@/hooks/useUserType";
import Header from "@/components/corporate/auth/Header";
import WalletProtectedRoute from "@/components/ProtectedRoutes/Qugo/WalletProtectedRoute";
import {
  selectCorporateWalletBalance,
  selectCorporateUserId,
} from "@/store/selectors/corporateSelectors";
import {
  selectB2CWalletBalance,
  selectB2CUserId,
} from "@/store/selectors/b2cSelectors";
import { refreshProfile } from "@/store/initializeB2CStore";
import showToast from "@/utils/toast";
import config from "@/config";
import axios from "@/utils/axios/axios";

export default function WalletDetails() {
  const userDetails = useSelector((state) => state?.user?.userInfo);

  const corporateWalletBalance = useSelector(selectCorporateWalletBalance);
  const b2cWalletBalance = useSelector(selectB2CWalletBalance);
  const b2cUserId = useSelector(selectB2CUserId);
  const corporateUserId = useSelector(selectCorporateUserId);

  const corporateUser = useUserType();

  // Get the correct wallet balance based on user type
  const walletBalance = corporateUser
    ? corporateWalletBalance
    : b2cWalletBalance;

  const userId = corporateUser ? corporateUserId : b2cUserId;

  const router = useRouter();
  const { fromPage } = router.query;

  // State for wallet data
  const [transactions, setTransactions] = useState([]);
  const [amount, setAmount] = useState("");
  const [pgResponse, setpgResponse] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreTransactions, setHasMoreTransactions] = useState(true);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [totalTransactions, setTotalTransactions] = useState(0);

  // Limits for pagination
  const INDIVIDUAL_LIMIT = 10;
  const CORPORATE_LIMIT = 10;

  // Ref for the scrollable container
  const tableContainerRef = useRef(null);

  // Fetch corporate transactions
  const fetchCorporateTransactions = useCallback(
    async (page = 1, append = false) => {
      setIsLoadingTransactions(true);

      try {
        console.log(`📞 Fetching corporate transactions page ${page}...`);
        const response = await axios.get(
          `${config.CORPORATE.USER_WALLET_TRANSACTIONS_LIST}?page=${page}&limit=${CORPORATE_LIMIT}`
        );

        if (response.data.status === "SUCCESS") {
          const newTransactions = response.data.data.transactions || [];
          const total = response.data.data.totalCount || 0;

          console.log(
            `✅ Corporate transactions fetched: ${newTransactions.length} items, total: ${total}`
          );

          setTotalTransactions(total);

          if (append) {
            setTransactions((prev) => [...prev, ...newTransactions]);
          } else {
            setTransactions(newTransactions);
          }

          // Check if there are more transactions to load
          const hasNextPage =
            response.data.data.pagination?.hasNextPage || false;
          setHasMoreTransactions(hasNextPage);
        }
      } catch (error) {
        console.error("❌ Error fetching corporate transactions:", error);
      } finally {
        setIsLoadingTransactions(false);
      }
    },
    [userDetails, CORPORATE_LIMIT]
  );

  // Fetch B2C transactions
  const fetchB2CTransactions = useCallback(
    async (page = 1, append = false) => {
      setIsLoadingTransactions(true);

      try {
        console.log(`📞 Fetching B2C transactions page ${page}...`);
        const resp = await apiGetTransactions(page, INDIVIDUAL_LIMIT);

        if (resp.status === "SUCCESS") {
          const newTransactions = resp.data.transactions || [];
          const total = resp.data.totalCount || 0;

          console.log(
            `✅ B2C transactions fetched: ${newTransactions.length} items, total: ${total}`
          );

          setTotalTransactions(total);

          if (append) {
            setTransactions((prev) => [...prev, ...newTransactions]);
          } else {
            setTransactions(newTransactions);
          }

          // Check if there are more transactions to load
          const hasNextPage = resp.data.pagination?.hasNextPage || false;
          setHasMoreTransactions(hasNextPage);
        }
      } catch (error) {
        console.error("❌ Error fetching B2C transactions:", error);
      } finally {
        setIsLoadingTransactions(false);
      }
    },
    [INDIVIDUAL_LIMIT]
  );

  // Fetch user transactions
  const fetchUserTransactions = useCallback(async () => {
    console.log(
      "🔄 Fetching transactions for user type:",
      corporateUser ? "Corporate" : "B2C"
    );

    setCurrentPage(1);
    if (corporateUser) {
      await fetchCorporateTransactions(1, false);
    } else {
      await fetchB2CTransactions(1, false);
    }
  }, [corporateUser, fetchCorporateTransactions, fetchB2CTransactions]);

  // Load more transactions (for pagination)
  const loadMoreTransactions = useCallback(async () => {
    if (!hasMoreTransactions || isLoadingTransactions) {
      console.log("⏳ Cannot load more:", {
        hasMoreTransactions,
        isLoadingTransactions,
      });
      return;
    }

    const nextPage = currentPage + 1;
    console.log(`📄 Loading more transactions, page: ${nextPage}`);
    setCurrentPage(nextPage);

    if (corporateUser) {
      await fetchCorporateTransactions(nextPage, true);
    } else {
      await fetchB2CTransactions(nextPage, true);
    }
  }, [
    currentPage,
    hasMoreTransactions,
    isLoadingTransactions,
    corporateUser,
    fetchCorporateTransactions,
    fetchB2CTransactions,
  ]);

  // Reset pagination when user type changes
  useEffect(() => {
    if (corporateUser !== null) {
      console.log(
        "🔄 User type determined:",
        corporateUser ? "Corporate" : "B2C"
      );
      setCurrentPage(1);
      setTransactions([]);
      setHasMoreTransactions(true);
      setTotalTransactions(0);
      fetchUserTransactions();
    }
  }, [corporateUser, fetchUserTransactions]);

  // Refresh wallet data on page load
  useEffect(() => {
    const refreshWalletData = async () => {
      try {
        console.log("🔄 Refreshing wallet data on page load...");

        if (corporateUser === null) {
          console.log("⏳ Waiting for user type determination...");
          return;
        }

        if (corporateUser) {
          console.log("🏢 Refreshing corporate user data...");
          await fetchAndUpdateUserDetails();
          console.log("✅ Corporate wallet data refreshed");
        } else {
          console.log("🛍️ Refreshing B2C user data...");
          await refreshProfile();
          console.log("✅ B2C wallet data refreshed");
        }
        await fetchUserTransactions();
      } catch (error) {
        console.error("❌ Error refreshing wallet data:", error);
      }
    };

    if (corporateUser !== null) {
      refreshWalletData();
    }
  }, [corporateUser]);

  // Get payment gateway
  useEffect(() => {
    const getpg = async () => {
      const resp = await getPaymentGateway();
      setpgResponse(resp);
    };
    getpg();
  }, []);

  // Infinite scroll handler
  const handleScroll = useCallback(() => {
    const container = tableContainerRef.current;
    if (!container || isLoadingTransactions || !hasMoreTransactions) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;

    // Load more when scrolled to 90% of the container
    if (scrollPercentage >= 0.9) {
      loadMoreTransactions();
    }
  }, [loadMoreTransactions, isLoadingTransactions, hasMoreTransactions]);

  // Attach scroll event listener
  useEffect(() => {
    const container = tableContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, [handleScroll]);

  const initiatePayment = async () => {
    console.log("Initiating payment for amount:", amount);
    if (!amount) {
      showToast("info", "Please enter amount");
      return;
    }
    setIsLoading(true);
    let companyId = null;
    if (corporateUser) {
      companyId = userDetails?.companyId || null;
    }
    try {
      if (pgResponse.status === "SUCCESS") {
        const payable = Math.round(
          parseFloat(amount) +
            parseFloat(amount) * (pgResponse.data.pgCharges / 100)
        );
        const mobile = getTabSpecificData("phoneNumber");

        const getPaymentSessionIDResp = await getPaymentSessionID(
          fromPage ?? "walletDetails",
          0,
          payable - amount,
          "WALLET_RECHARGE",
          userId,
          payable,
          mobile,
          pgResponse.data.pgCode,
          1,
          null // Pass companyId for corporate users
        );
        if (
          getPaymentSessionIDResp !== null &&
          getPaymentSessionIDResp.data.data.paymentSessionId !== ""
        ) {
          routeToPg(
            pgResponse.data.pgCode,
            getPaymentSessionIDResp.data.data.paymentSessionId,
            null,
            userId,
            3,
            "WALLET_RECHARGE",
            fromPage ?? "walletDetails"
          );
        }
      }
    } catch (error) {
      console.error("Payment initiation failed", error);
      // Handle any errors here
    } finally {
      setIsLoading(false); // Reset loading state after the process is done
    }
  };

  const handleAmount = async (e) => {
    setAmount(e.target.value);
  };

  const clearAmount = () => {
    setAmount("");
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const formattedDate = date.toLocaleDateString("en-US"); // Format as MM/DD/YYYY
    const formattedTime = date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    }); // Format as HH:MM AM/PM
    return `${formattedDate} ${formattedTime}`;
  };

  return (
    <>
      <WalletProtectedRoute>
        {corporateUser === null ? (
          // Show loading state while determining user type
          <div
            className="d-flex justify-content-center align-items-center"
            style={{ height: "100vh" }}
          >
            <Spinner animation="border" variant="primary" />
            <span className="ms-2">Loading wallet...</span>
          </div>
        ) : !corporateUser ? (
          <B2CHeader walletBalance={walletBalance} />
        ) : (
          <div style={{ backgroundColor: "#ffffff" }}>
            <Header walletBalance={walletBalance} />
          </div>
        )}

        {corporateUser !== null && (
          <div className={style.walletContainer}>
            <div className={style.walletContent}>
              {/* Your content here */}
              <div className={style.walletDetailsHeader}>Wallet Details</div>
              <div className={style.walletDetails}>
                <div className={style.walletBalanceContainer}>
                  <div className={style.walletBalance}>
                    Balance
                    <div className={style.amount}>
                      <div>
                        <Image
                          className={style.walletLogo}
                          src={walletImg}
                          alt="walletImg"
                        />
                      </div>
                      <span style={{ textWrap: "nowrap" }}>
                        Rs. {walletBalance}
                      </span>
                    </div>
                  </div>
                  <div className={style.addAmount}>
                    <div className={style.amountHeader}>
                      <span
                        style={{ textWrap: "nowwrap" }}
                        className={style.addAmount1}
                      >
                        Add amount to your wallet
                      </span>
                      <div className={style.inputHeader}>
                        <div className={style.inputContainer}>
                          <div className={style.input}>
                            <input
                              type="text"
                              placeholder="Enter amount"
                              className={style.amountInput}
                              value={amount}
                              inputMode="numeric"
                              pattern="[0-9]*"
                              onChange={handleAmount}
                              onInput={(e) => {
                                e.target.value = e.target.value
                                  .replace(/[^0-9]/g, "")
                                  .slice(0, 10);
                              }}
                              maxLength={8}
                            />
                            {amount && (
                              <span
                                className={style.close}
                                onClick={clearAmount}
                              >
                                x
                              </span>
                            )}
                          </div>
                          <div className={style.text}>
                            Additional {pgResponse?.data?.pgCharges}%
                            Transaction charges will apply
                          </div>
                        </div>
                      </div>
                    </div>
                    <Button
                      className={style.rechargeButton}
                      onClick={initiatePayment}
                      disabled={isLoading}
                    >
                      {isLoading ? "Processing..." : "Recharge Now"}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Table Section */}
              <div
                ref={tableContainerRef}
                style={{ maxHeight: "450px", overflowY: "auto" }}
              >
                {totalTransactions > 0 && (
                  <div className={style.transactionStats}>
                    Showing {transactions.length} of {totalTransactions}{" "}
                    transactions
                  </div>
                )}
                <table className={style.transactionTable}>
                  <thead className={style.transactionHeader}>
                    <tr className={style.transactionHeader1}>
                      <th>S.NO</th>
                      <th>Transaction Type</th>
                      <th>Amount</th>
                      <th>Balance</th>
                      <th>Category</th>
                      <th>ReferenceId</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  {transactions.length > 0 && (
                    <tbody>
                      {transactions.map((transaction, index) => (
                        <tr className={style.cellValue} key={transaction._id}>
                          <td style={{ padding: "8px" }}>{index + 1}</td>
                          <td style={{ padding: "8px" }}>
                            {transaction.transactionType}
                          </td>
                          <td style={{ padding: "8px" }}>
                            {transaction.amount}
                          </td>
                          <td style={{ padding: "8px" }}>
                            {transaction.balance}
                          </td>
                          <td style={{ padding: "8px" }}>
                            {transaction.category}
                          </td>
                          <td style={{ padding: "8px" }}>
                            {transaction.referenceId}
                          </td>
                          <td style={{ padding: "8px", textWrap: "nowrap" }}>
                            {formatDate(transaction.createdAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  )}
                </table>
                {/* Loading indicator for pagination */}
                {isLoadingTransactions && transactions.length > 0 && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      padding: "20px",
                    }}
                  >
                    <Spinner animation="border" size="sm" />
                    <span style={{ marginLeft: "10px" }}>
                      Loading more transactions...
                    </span>
                  </div>
                )}

                {/* No more data indicator */}
                {!hasMoreTransactions && transactions.length > 0 && (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "20px",
                      color: "#666",
                    }}
                  >
                    No more transactions to load
                  </div>
                )}

                {transactions.length === 0 && !isLoadingTransactions && (
                  <div style={{ margin: "auto", display: "flex" }}>
                    <div className={style.tableRow}>
                      <div colSpan="5" className={style.emptyWalletMessage}>
                        <div>
                          <Image
                            src={walletEmptyImg}
                            alt="walletImg"
                            className={style.walletImage}
                          />
                        </div>
                        <div className={style.nowallet}>
                          No wallet transactions to show
                        </div>
                        <div className={style.nowallettext}>
                          Your wallet transactions will appear here after
                          booking via wallet
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <Gototopbutton />
        <Footer />
      </WalletProtectedRoute>
    </>
  );
}
