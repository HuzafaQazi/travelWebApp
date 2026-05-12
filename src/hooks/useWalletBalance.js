import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { getWalletBalance, getTransactions } from "@/utils/walletApis";
import { useUserType } from "@/hooks/useUserType";
import axios, { getTabSpecificData } from "@/utils/axios/axios";
import config from "@/config";
import { isCorporateUser } from "@/utils/common";

export const useWalletBalance = (corporateUserParam = null) => {
  const userDetails = useSelector((state) => state?.user?.userInfo);

  const hookCorporateUser = useUserType();

  // Use the parameter if provided, otherwise use the hook's corporate user
  const corporateUser =
    corporateUserParam !== null ? corporateUserParam : hookCorporateUser;

  const [walletBalance, setWalletBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [isUserTypeDetermined, setIsUserTypeDetermined] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreTransactions, setHasMoreTransactions] = useState(true);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [totalTransactions, setTotalTransactions] = useState(0);

  // Default limits for different user types
  const INDIVIDUAL_LIMIT = 10;
  const CORPORATE_LIMIT = 10;

  // Determine user type
  useEffect(() => {
    if (corporateUser !== null) {
      setIsUserTypeDetermined(true);
      console.log(
        "✅ User type determined:",
        corporateUser ? "Corporate" : "B2C"
      );
    } else {
      console.log("⏳ User type not determined yet");
    }
  }, [corporateUser]);

  // Fetch corporate balance
  const fetchCorporateBalance = useCallback(async () => {
    if (!userDetails) {
      console.log("⚠️ No user details for corporate balance");
      return;
    }

    const { companyId } = userDetails;
    const isWalletAllowed =
      userDetails?.loggedInDetails?.configuration?.walletAllowed;

    // 🔒 Only make API call if wallet is allowed
    if (!isWalletAllowed) {
      console.log("Wallet not allowed — skipping corporate balance API call");
      return;
    }

    try {
      console.log("📞 Fetching corporate balance...");
      const response = await axios.get(
        `${config.CORPORATE.USER_WALLET_BALANCE}`
      );
      if (response.data.status === "SUCCESS") {
        console.log(
          "✅ Corporate balance fetched:",
          response.data.data.balance
        );
        setWalletBalance(response.data.data.balance);
      }
    } catch (error) {
      console.error("❌ Error fetching corporate balance:", error);
    }
  }, [userDetails]);

  // Fetch individual balance
  const fetchIndividualBalance = useCallback(async () => {
    // Don't proceed if user type is not determined or if user is corporate
    if (corporateUser) {
      console.log("Skipping individual balance - user is corporate");
      return;
    }

    const userId = getTabSpecificData("userID")?.replace(/"/g, "");
    if (!userId) {
      console.log("⚠️ No user ID for individual balance");
      return;
    }

    try {
      console.log("📞 Fetching B2C balance...");
      const resp = await getWalletBalance(userId);
      if (resp.status === "SUCCESS") {
        console.log("✅ B2C balance fetched:", resp.data.balance);
        setWalletBalance(resp.data.balance);
      }
    } catch (error) {
      console.error("❌ Error fetching B2C balance:", error);
    }
  }, [corporateUser]);

  // Fetch wallet balance
  const fetchBalance = useCallback(async () => {
    // Only proceed if user type is determined
    if (!isUserTypeDetermined) {
      console.log("⏳ Skipping fetchBalance - user type not determined");
      return;
    }

    console.log(
      "🔄 Fetching balance for user type:",
      corporateUser ? "Corporate" : "B2C"
    );

    if (corporateUser) {
      await fetchCorporateBalance();
    } else {
      await fetchIndividualBalance();
    }
  }, [
    corporateUser,
    isUserTypeDetermined,
    fetchCorporateBalance,
    fetchIndividualBalance,
  ]);

  // Fetch corporate transactions
  const fetchCorporateTransactions = useCallback(
    async (page = 1, append = false) => {
      if (!userDetails) {
        console.log("⚠️ No user details for corporate transactions");
        return;
      }

      const { userId, companyId } = userDetails;
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

          // Check if there are more transactions to load using pagination info
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

  // Fetch individual transactions with pagination
  const fetchIndividualTransactions = useCallback(
    async (page = 1, append = false) => {
      // Don't proceed if user is corporate
      if (corporateUser) {
        console.log("Skipping individual transactions - user is corporate");
        return;
      }

      const userId = getTabSpecificData("userID")?.replace(/"/g, "");
      if (!userId) {
        console.log("⚠️ No user ID for individual transactions");
        return;
      }

      setIsLoadingTransactions(true);

      try {
        console.log(`📞 Fetching B2C transactions page ${page}...`);
        const resp = await getTransactions(userId, page, INDIVIDUAL_LIMIT);

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

          // Check if there are more transactions to load using pagination info
          const hasNextPage = resp.data.pagination?.hasNextPage || false;
          setHasMoreTransactions(hasNextPage);
        }
      } catch (error) {
        console.error("❌ Error fetching B2C transactions:", error);
      } finally {
        setIsLoadingTransactions(false);
      }
    },
    [INDIVIDUAL_LIMIT, corporateUser]
  );

  // Fetch user transactions
  const fetchUserTransactions = useCallback(async () => {
    // Only proceed if user type is determined
    if (!isUserTypeDetermined) {
      console.log(
        "⏳ Skipping fetchUserTransactions - user type not determined"
      );
      return;
    }

    console.log(
      "🔄 Fetching transactions for user type:",
      corporateUser ? "Corporate" : "B2C"
    );

    setCurrentPage(1);
    if (corporateUser) {
      await fetchCorporateTransactions(1, false);
    } else {
      await fetchIndividualTransactions(1, false);
    }
  }, [
    corporateUser,
    isUserTypeDetermined,
    fetchCorporateTransactions,
    fetchIndividualTransactions,
  ]);

  // Load more transactions (for pagination)
  const loadMoreTransactions = useCallback(async () => {
    if (
      !hasMoreTransactions ||
      isLoadingTransactions ||
      !isUserTypeDetermined
    ) {
      console.log("⏳ Cannot load more:", {
        hasMoreTransactions,
        isLoadingTransactions,
        isUserTypeDetermined,
      });
      return;
    }

    const nextPage = currentPage + 1;
    console.log(`📄 Loading more transactions, page: ${nextPage}`);
    setCurrentPage(nextPage);

    if (corporateUser) {
      await fetchCorporateTransactions(nextPage, true);
    } else {
      await fetchIndividualTransactions(nextPage, true);
    }
  }, [
    currentPage,
    hasMoreTransactions,
    isLoadingTransactions,
    corporateUser,
    isUserTypeDetermined,
    fetchCorporateTransactions,
    fetchIndividualTransactions,
  ]);

  // Reset pagination when user type changes
  useEffect(() => {
    console.log("🔄 User type changed, resetting transactions");
    setCurrentPage(1);
    setTransactions([]);
    setHasMoreTransactions(true);
    setTotalTransactions(0);
  }, [corporateUser]);

  // Initial fetch when user type is determined
  useEffect(() => {
    if (isUserTypeDetermined) {
      console.log("🚀 Initial fetch - user type determined");
      fetchBalance();
      fetchUserTransactions();
    }
  }, [isUserTypeDetermined, fetchBalance, fetchUserTransactions]);

  return {
    walletBalance,
    transactions,
    fetchBalance,
    fetchUserTransactions,
    loadMoreTransactions,
    hasMoreTransactions,
    isLoadingTransactions,
    totalTransactions,
    currentPage,
    isUserTypeDetermined,
    corporateUser,
  };
};
