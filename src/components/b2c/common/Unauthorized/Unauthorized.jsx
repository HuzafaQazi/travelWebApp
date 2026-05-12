import Image from "next/image";
import { useRouter } from "next/router";

const B2CUnauthorized = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-orange-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white shadow-lg rounded-lg overflow-hidden border-t-8 border-red-500">
        <div className="p-8 text-center">
          <div className="text-8xl font-extrabold text-red-500 mb-4">403</div>
          <h1 className="text-4xl font-extrabold text-gray-800 mb-2">
            Access Denied
          </h1>
          <p className="text-gray-600 mb-6">
            Sorry, you need to be logged in to access this page. Please sign in
            to continue.
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => router.back()}
              className="bg-gray-100 text-gray-700 font-semibold px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Go Back
            </button>
            <button
              onClick={() => router.push("/")}
              className="bg-[#ff6b35] text-white font-semibold px-6 py-2 rounded-lg hover:bg-[#e55a2b] transition-colors"
            >
              Go to Home
            </button>
          </div>
        </div>
        <div className="relative w-full h-64 overflow-hidden">
          <Image
            src="/img/corporate/unauthorized.jpg"
            alt="Unauthorized"
            layout="fill"
            objectFit="cover"
            className="rounded-b-lg"
          />
        </div>
      </div>
    </div>
  );
};

export default B2CUnauthorized;
